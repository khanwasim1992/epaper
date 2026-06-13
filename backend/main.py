import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.database import engine, Base, AsyncSessionLocal
from core.security import hash_password
from core.config import settings
from models.models import Admin
from routers import auth, epapers
from sqlalchemy import select

app = FastAPI(title="ePaper Admin API", version="1.0.0", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if hasattr(settings, 'CORS_ORIGINS') else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(epapers.router)


@app.exception_handler(Exception)
async def global_exc_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"[UNHANDLED] {request.method} {request.url}\n{tb}")
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.on_event("startup")
async def startup():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default admin if not exists
    async with AsyncSessionLocal() as db:
        existing = (await db.execute(
            select(Admin).where(Admin.username == settings.ADMIN_USERNAME)
        )).scalar_one_or_none()

        if not existing:
            admin = Admin(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
            )
            db.add(admin)
            await db.commit()
            print(f"[SEED] Admin created: {settings.ADMIN_USERNAME} / {settings.ADMIN_PASSWORD}")
        else:
            print(f"[SEED] Admin already exists: {settings.ADMIN_USERNAME}")


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
