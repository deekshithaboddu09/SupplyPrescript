
from pydantic import BaseModel, Field, field_validator
import re


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        value = value.strip().lower()

        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("Enter a valid email address")

        return value


class UserLogin(BaseModel):
    email: str
    password: str


class AdminSetup(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=12, max_length=128)
    setup_token: str = Field(min_length=20)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str
