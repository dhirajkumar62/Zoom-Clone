from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to extract and validate the authenticated JWT user and active status."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact an administrator.",
        )

    return user


def require_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    """Explicit dependency for authenticated user verification."""
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency restricting access to ADMIN or OWNER account roles."""
    if current_user.account_role not in ["ADMIN", "OWNER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to administrative accounts",
        )
    return current_user


def require_owner(current_user: User = Depends(get_current_user)) -> User:
    """Dependency restricting access exclusively to OWNER account role."""
    if current_user.account_role != "OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted exclusively to system Owner",
        )
    return current_user

