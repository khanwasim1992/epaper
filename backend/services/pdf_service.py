import fitz
from pathlib import Path
from core.config import settings


async def extract_pdf_pages(epaper_id: int, pdf_path: str) -> list[dict]:
    """Extract all pages of a PDF as PNG images."""
    output_dir = Path(settings.PAGES_DIR) / str(epaper_id)
    output_dir.mkdir(parents=True, exist_ok=True)

    pages = []
    pdf = fitz.open(pdf_path)

    for i, page in enumerate(pdf):
        mat = fitz.Matrix(2.0, 2.0)   # 2x scale → ~150 dpi equivalent
        pix = page.get_pixmap(matrix=mat)
        img_path = output_dir / f"page_{i + 1}.png"
        pix.save(str(img_path))
        pages.append({
            "page_num": i + 1,
            "image_path": str(img_path),
            "width": pix.width,
            "height": pix.height,
        })

    pdf.close()
    return pages
