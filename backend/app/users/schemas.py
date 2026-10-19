"""Request and response shapes for the users and auth endpoints."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LoginIn(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(max_length=200)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    is_admin: bool
    is_active: bool
    created_at: datetime


class UserCreate(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(max_length=200)
    is_admin: bool = False


class UserUpdate(BaseModel):
    """Only the fields sent are changed."""

    is_active: bool | None = None
    is_admin: bool | None = None
    password: str | None = Field(default=None, max_length=200)
