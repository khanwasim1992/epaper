from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(128), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(256))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Epaper(Base):
    __tablename__ = "epapers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(256))
    edition_date: Mapped[str] = mapped_column(String(20))   # ISO date string YYYY-MM-DD
    original_filename: Mapped[str] = mapped_column(String(256))
    pdf_path: Mapped[str] = mapped_column(String(512))
    page_count: Mapped[int] = mapped_column(Integer, default=0)

    # Extraction state
    is_extracted: Mapped[bool] = mapped_column(Boolean, default=False)
    extracted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Publish state
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    pages: Mapped[List["EpaperPage"]] = relationship(
        "EpaperPage", back_populates="epaper", cascade="all, delete-orphan", order_by="EpaperPage.page_num"
    )


class EpaperPage(Base):
    __tablename__ = "epaper_pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    epaper_id: Mapped[int] = mapped_column(Integer, ForeignKey("epapers.id", ondelete="CASCADE"))
    page_num: Mapped[int] = mapped_column(Integer)
    image_path: Mapped[str] = mapped_column(String(512))
    width: Mapped[int] = mapped_column(Integer, default=0)
    height: Mapped[int] = mapped_column(Integer, default=0)

    epaper: Mapped["Epaper"] = relationship("Epaper", back_populates="pages")
    mappings: Mapped[List["PageMapping"]] = relationship(
        "PageMapping", back_populates="page", cascade="all, delete-orphan"
    )


class PageMapping(Base):
    __tablename__ = "page_mappings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    page_id: Mapped[int] = mapped_column(Integer, ForeignKey("epaper_pages.id", ondelete="CASCADE"))
    epaper_id: Mapped[int] = mapped_column(Integer, ForeignKey("epapers.id", ondelete="CASCADE"))

    label: Mapped[str] = mapped_column(String(256), default="Region")
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    w: Mapped[float] = mapped_column(Float)
    h: Mapped[float] = mapped_column(Float)
    color_idx: Mapped[int] = mapped_column(Integer, default=0)

    # Optional metadata for each mapping
    link_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    page: Mapped["EpaperPage"] = relationship("EpaperPage", back_populates="mappings")
