
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.database.db import get_connection
from backend.services.auth_service import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    connection = get_connection()

    try:
        user = connection.execute(
            """
            SELECT id, name, email, role, status
            FROM users
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()
    finally:
        connection.close()

    if user is None or user["status"] != "approved":
        raise HTTPException(status_code=401, detail="Account is not active")

    return dict(user)


def require_admin(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user
