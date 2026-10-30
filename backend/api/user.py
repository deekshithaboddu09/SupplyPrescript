
from fastapi import APIRouter, Depends

from backend.api.dependencies import get_current_user

router = APIRouter(
    prefix="/user",
    tags=["user"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/me")
def get_my_profile(current_user=Depends(get_current_user)):
    return current_user
