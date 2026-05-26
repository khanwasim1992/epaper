from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import timedelta

from core.database import get_db
from core.security import verify_password, hash_password, create_access_token, get_current_user
from core.config import settings
from models.models import Admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str


class ChangePasswordRequest(BaseModel):
    new_password: str
    confirm_password: str


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    # Check DB first
    result = await db.execute(select(Admin).where(Admin.username == form_data.username))
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not admin.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token(
        {"sub": admin.username, "role": "admin"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=admin.username,
        role="admin",
    )


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_password = payload.new_password
    confirm_password = payload.confirm_password

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirm password do not match")

    result = await db.execute(select(Admin).where(Admin.username == current_user["username"]))
    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin account not found")

    admin.hashed_password = hash_password(new_password)
    await db.commit()

    return {"message": "Password changed successfully"}
