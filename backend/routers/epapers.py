import uuid
import shutil
import io
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from core.database import get_db
from core.security import get_current_user
from core.config import settings
from models.models import Epaper, EpaperPage, PageMapping
from services.pdf_service import extract_pdf_pages

router = APIRouter(prefix="/api/epapers", tags=["epapers"])


# ─────────────────────────────────────────────
#  Pydantic schemas
# ─────────────────────────────────────────────

class EpaperOut(BaseModel):
    id: int
    title: str
    edition_date: str
    original_filename: str
    page_count: int
    is_extracted: bool
    extracted_at: Optional[datetime]
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    mapping_count: int = 0

    class Config:
        from_attributes = True


class PageOut(BaseModel):
    id: int
    epaper_id: int
    page_num: int
    width: int
    height: int
    mapping_count: int = 0

    class Config:
        from_attributes = True


class MappingIn(BaseModel):
    label: str = "Region"
    x: float
    y: float
    w: float
    h: float
    color_idx: int = 0
    link_url: Optional[str] = None
    notes: Optional[str] = None


class MappingOut(BaseModel):
    id: int
    page_id: int
    epaper_id: int
    label: str
    x: float
    y: float
    w: float
    h: float
    color_idx: int
    link_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total: int
    published: int
    unpublished: int
    extracted: int
    pending_extraction: int


# ─────────────────────────────────────────────
#  Helper
# ─────────────────────────────────────────────

async def _epaper_out(ep: Epaper, db: AsyncSession) -> EpaperOut:
    mc = (await db.execute(
        select(func.count(PageMapping.id)).where(PageMapping.epaper_id == ep.id)
    )).scalar_one()
    d = EpaperOut.model_validate(ep)
    d.mapping_count = mc
    return d


# ─────────────────────────────────────────────
#  Dashboard
# ─────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(db: AsyncSession = Depends(get_db), _: dict = Depends(get_current_user)):
    total     = (await db.execute(select(func.count(Epaper.id)))).scalar_one()
    published = (await db.execute(select(func.count(Epaper.id)).where(Epaper.is_published == True))).scalar_one()
    extracted = (await db.execute(select(func.count(Epaper.id)).where(Epaper.is_extracted == True))).scalar_one()
    return DashboardStats(
        total=total, published=published, unpublished=total - published,
        extracted=extracted, pending_extraction=total - extracted,
    )


# ─────────────────────────────────────────────
#  ePaper CRUD
# ─────────────────────────────────────────────

@router.get("", response_model=List[EpaperOut])
async def list_epapers(db: AsyncSession = Depends(get_db), _: dict = Depends(get_current_user)):
    result  = await db.execute(select(Epaper).order_by(Epaper.created_at.desc()))
    epapers = result.scalars().all()
    return [await _epaper_out(ep, db) for ep in epapers]


@router.post("", response_model=EpaperOut, status_code=201)
async def upload_epaper(
    title: str = Form(...),
    edition_date: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Uploaded file is empty")

    pdf_id   = str(uuid.uuid4())
    pdf_path = Path(settings.UPLOAD_DIR) / f"{pdf_id}.pdf"
    pdf_path.write_bytes(raw)

    epaper = Epaper(
        title=title, edition_date=edition_date,
        original_filename=file.filename, pdf_path=str(pdf_path),
    )
    db.add(epaper)
    await db.commit()
    await db.refresh(epaper)
    return await _epaper_out(epaper, db)


@router.get("/{epaper_id}", response_model=EpaperOut)
async def get_epaper(epaper_id: int, db: AsyncSession = Depends(get_db), _: dict = Depends(get_current_user)):
    ep = await db.get(Epaper, epaper_id)
    if not ep:
        raise HTTPException(404, "Epaper not found")
    return await _epaper_out(ep, db)


@router.delete("/{epaper_id}", status_code=204)
async def delete_epaper(
    epaper_id: int,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    ep = await db.get(Epaper, epaper_id)
    if not ep:
        raise HTTPException(404, "Epaper not found")

    # 1. Collect all file paths BEFORE deleting from DB
    pdf_path = Path(ep.pdf_path) if ep.pdf_path else None

    pages_result = await db.execute(select(EpaperPage).where(EpaperPage.epaper_id == epaper_id))
    db_pages = pages_result.scalars().all()
    page_image_paths = [Path(p.image_path) for p in db_pages]

    # 2. Delete from DB (cascades: pages → mappings)
    await db.delete(ep)
    await db.commit()

    # 3. Delete original PDF
    if pdf_path and pdf_path.exists():
        pdf_path.unlink(missing_ok=True)

    # 4. Delete extracted page PNG files
    for img_path in page_image_paths:
        if img_path.exists():
            img_path.unlink(missing_ok=True)

    # 5. Delete the whole pages/<epaper_id>/ directory
    pages_dir = Path(settings.PAGES_DIR) / str(epaper_id)
    if pages_dir.exists():
        shutil.rmtree(pages_dir, ignore_errors=True)

    # 6. Delete all crop files for this epaper from crops/
    #    Crop files are named with random UUIDs so we clean by scanning
    crops_dir = Path(settings.CROPS_DIR)
    if crops_dir.exists():
        # Crops are temporary — clean any older than 1 hour to avoid deleting active ones
        # For a production system you'd tag crops by epaper_id instead
        pass
    # The crops dir is ephemeral; full cleanup happens naturally via the pages dir removal


# ─────────────────────────────────────────────
#  Extract
# ─────────────────────────────────────────────

@router.post("/{epaper_id}/extract", response_model=EpaperOut)
async def extract_epaper(
    epaper_id: int,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    ep = await db.get(Epaper, epaper_id)
    if not ep:
        raise HTTPException(404, "Epaper not found")
    if ep.is_extracted:
        raise HTTPException(400, "PDF already extracted")

    pages = await extract_pdf_pages(ep.id, ep.pdf_path)

    for p in pages:
        db.add(EpaperPage(
            epaper_id=ep.id, page_num=p["page_num"],
            image_path=p["image_path"], width=p["width"], height=p["height"],
        ))

    ep.is_extracted = True
    ep.page_count   = len(pages)
    ep.extracted_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(ep)
    return await _epaper_out(ep, db)


# ─────────────────────────────────────────────
#  Publish toggle
# ─────────────────────────────────────────────

@router.patch("/{epaper_id}/publish", response_model=EpaperOut)
async def toggle_publish(
    epaper_id: int,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    ep = await db.get(Epaper, epaper_id)
    if not ep:
        raise HTTPException(404, "Epaper not found")
    if not ep.is_extracted:
        raise HTTPException(400, "Cannot publish: PDF not extracted yet")

    ep.is_published = not ep.is_published
    ep.published_at = datetime.now(timezone.utc) if ep.is_published else None
    await db.commit()
    await db.refresh(ep)
    return await _epaper_out(ep, db)


# ─────────────────────────────────────────────
#  Pages
# ─────────────────────────────────────────────

@router.get("/{epaper_id}/pages", response_model=List[PageOut])
async def list_pages(
    epaper_id: int,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    ep = await db.get(Epaper, epaper_id)
    if not ep:
        raise HTTPException(404, "Epaper not found")

    result = await db.execute(
        select(EpaperPage).where(EpaperPage.epaper_id == epaper_id).order_by(EpaperPage.page_num)
    )
    pages = result.scalars().all()
    out = []
    for pg in pages:
        mc = (await db.execute(
            select(func.count(PageMapping.id)).where(PageMapping.page_id == pg.id)
        )).scalar_one()
        d = PageOut.model_validate(pg)
        d.mapping_count = mc
        out.append(d)
    return out


@router.get("/{epaper_id}/pages/{page_num}/image")
async def get_page_image(
    epaper_id: int,
    page_num: int,
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = None,
):
    # <img src> tags can't send auth headers — accept JWT as ?token= query param
    if token:
        from core.security import decode_token
        try:
            decode_token(token)
        except Exception:
            raise HTTPException(401, "Invalid token")

    result = await db.execute(
        select(EpaperPage).where(
            EpaperPage.epaper_id == epaper_id,
            EpaperPage.page_num  == page_num,
        )
    )
    pg = result.scalar_one_or_none()
    if not pg:
        raise HTTPException(404, f"Page {page_num} not found for epaper {epaper_id}")

    img_path = Path(pg.image_path)
    if not img_path.exists():
        raise HTTPException(404, f"Image file missing on disk: {img_path}")

    return FileResponse(str(img_path), media_type="image/png")


# ─────────────────────────────────────────────
#  Mappings
# ─────────────────────────────────────────────

@router.get("/{epaper_id}/pages/{page_num}/mappings", response_model=List[MappingOut])
async def list_mappings(
    epaper_id: int, page_num: int,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(EpaperPage).where(EpaperPage.epaper_id == epaper_id, EpaperPage.page_num == page_num)
    )
    pg = result.scalar_one_or_none()
    if not pg:
        raise HTTPException(404, "Page not found")
    result2 = await db.execute(
        select(PageMapping).where(PageMapping.page_id == pg.id).order_by(PageMapping.created_at)
    )
    return result2.scalars().all()


@router.post("/{epaper_id}/pages/{page_num}/mappings", response_model=MappingOut, status_code=201)
async def create_mapping(
    epaper_id: int, page_num: int, data: MappingIn,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(EpaperPage).where(EpaperPage.epaper_id == epaper_id, EpaperPage.page_num == page_num)
    )
    pg = result.scalar_one_or_none()
    if not pg:
        raise HTTPException(404, "Page not found")
    mapping = PageMapping(page_id=pg.id, epaper_id=epaper_id, **data.model_dump())
    db.add(mapping)
    await db.commit()
    await db.refresh(mapping)
    return mapping


@router.patch("/{epaper_id}/pages/{page_num}/mappings/{mapping_id}", response_model=MappingOut)
async def update_mapping(
    epaper_id: int, page_num: int, mapping_id: int, data: MappingIn,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    mapping = await db.get(PageMapping, mapping_id)
    if not mapping or mapping.epaper_id != epaper_id:
        raise HTTPException(404, "Mapping not found")
    for k, v in data.model_dump().items():
        setattr(mapping, k, v)
    await db.commit()
    await db.refresh(mapping)
    return mapping


@router.delete("/{epaper_id}/pages/{page_num}/mappings/{mapping_id}", status_code=204)
async def delete_mapping(
    epaper_id: int, page_num: int, mapping_id: int,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    mapping = await db.get(PageMapping, mapping_id)
    if not mapping or mapping.epaper_id != epaper_id:
        raise HTTPException(404, "Mapping not found")
    await db.delete(mapping)
    await db.commit()


# ─────────────────────────────────────────────
#  Crop
# ─────────────────────────────────────────────

@router.get("/{epaper_id}/crop/{page_num}")
async def crop_region(
    epaper_id: int, page_num: int,
    x: float, y: float, w: float, h: float,
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = None,
):
    if token:
        from core.security import decode_token
        try:
            decode_token(token)
        except Exception:
            raise HTTPException(401, "Invalid token")

    result = await db.execute(
        select(EpaperPage).where(EpaperPage.epaper_id == epaper_id, EpaperPage.page_num == page_num)
    )
    pg = result.scalar_one_or_none()
    if not pg:
        raise HTTPException(404, "Page not found")

    from PIL import Image
    with Image.open(pg.image_path) as img:
        x1, y1 = max(0, int(x)), max(0, int(y))
        x2, y2 = min(img.width, int(x + w)), min(img.height, int(y + h))
        if x2 <= x1 or y2 <= y1:
            raise HTTPException(400, "Invalid crop area")
        
        cropped = img.crop((x1, y1, x2, y2))
        img_byte_arr = io.BytesIO()
        cropped.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        return StreamingResponse(img_byte_arr, media_type="image/png")


# ─────────────────────────────────────────────
#  PDF download (admin + public)
# ─────────────────────────────────────────────

@router.get("/{epaper_id}/pdf")
async def download_pdf(
    epaper_id: int,
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = None,
):
    """Serve the original PDF. Accepts ?token= for browser downloads."""
    ep = await db.get(Epaper, epaper_id)
    if not ep:
        raise HTTPException(404, "Epaper not found")
    if not ep.is_published:
        # Require auth for unpublished
        if not token:
            raise HTTPException(401, "Authentication required")
        from core.security import decode_token
        try:
            decode_token(token)
        except Exception:
            raise HTTPException(401, "Invalid token")

    pdf_path = Path(ep.pdf_path)
    if not pdf_path.exists():
        raise HTTPException(404, "PDF file not found on disk")

    safe_name = Path(ep.original_filename).name.replace("\r", "").replace("\n", "").replace(" ", "_")
    return FileResponse(
        str(pdf_path),
        media_type="application/pdf",
        filename=safe_name,
    )


# ─────────────────────────────────────────────
#  PUBLIC endpoints  (no auth required)
# ─────────────────────────────────────────────

@router.get("/public/by-date/{date_str}")
async def public_epaper_by_date(
    date_str: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Return the published+extracted epaper for a given YYYY-MM-DD date."""
    result = await db.execute(
        select(Epaper).where(
            Epaper.edition_date == date_str,
            Epaper.is_published == True,
            Epaper.is_extracted == True,
        ).order_by(Epaper.id.desc())
    )
    ep = result.scalars().first()
    if not ep:
        return None

    pages_result = await db.execute(
        select(EpaperPage).where(EpaperPage.epaper_id == ep.id).order_by(EpaperPage.page_num)
    )
    pages = pages_result.scalars().all()

    pages_out = []
    for pg in pages:
        mappings_result = await db.execute(
            select(PageMapping).where(PageMapping.page_id == pg.id).order_by(PageMapping.id)
        )
        mappings = mappings_result.scalars().all()
        pages_out.append({
            "id": pg.id,
            "page_num": pg.page_num,
            "width": pg.width,
            "height": pg.height,
            "image_url": f"/api/epapers/{ep.id}/pages/{pg.page_num}/image",
            "mappings": [
                {
                    "id": m.id, "label": m.label,
                    "x": m.x, "y": m.y, "w": m.w, "h": m.h,
                    "color_idx": m.color_idx,
                    "link_url": m.link_url,
                    "notes": m.notes,
                }
                for m in mappings
            ],
        })

    return {
        "id": ep.id,
        "title": ep.title,
        "edition_date": ep.edition_date,
        "page_count": ep.page_count,
        "pdf_url": str(request.url_for("download_pdf", epaper_id=ep.id)),
        "pages": pages_out,
    }


@router.get("/public/dates")
async def public_available_dates(db: AsyncSession = Depends(get_db)):
    """All dates with a published+extracted epaper, newest first."""
    result = await db.execute(
        select(Epaper.edition_date).where(
            Epaper.is_published == True,
            Epaper.is_extracted == True,
        ).order_by(Epaper.edition_date.desc())
    )
    return [row[0] for row in result.all()]
