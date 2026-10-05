from fastapi import Depends, HTTPException,status,Request
from app.database import SessionDep
from app.config import settings
from app.models.users import User
from app.models.school import School, SchoolOperator
from sqlalchemy import select
from app.repository.user import UserRepository
from jose import jwt, JWTError

async def get_current_user(db: SessionDep, request: Request):
    credentials_execp = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get("access_token")
    if not token:
        raise credentials_execp

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str | None = payload.get("sub")
        if not email:
            raise credentials_execp
    except JWTError:
        raise credentials_execp

    user_repo = UserRepository(db)
    user = await user_repo.get_user_by_email(email)
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

async def require_school_owner(
    school_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_user)
) -> School:
    """
    Used for:
    - Generating & finalizing monthly reports
    - Changing school metadata / deleting schools
    - Refreshing report data
    """
    res = await db.execute(select(School).where(School.id == school_id))
    school = res.scalar_one_or_none()

    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    # If the current user is NOT the owner who created it, reject with 403
    if school.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: Only the center school owner can perform this operation."
        )

    return school


# --- 2. RESTRICTED ACCESS: OWNER OR LINKED OPERATOR ---
async def require_school_data_access(
    school_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_user)
) -> School:
    """
    Used for:
    - Adding class enrollment data
    - Updating class enrollment data
    - Viewing current raw demographic entry rows
    """
    res = await db.execute(select(School).where(School.id == school_id))
    school = res.scalar_one_or_none()

    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    if school.user_id == current_user.id:
        return school
    op_res = await db.execute(
        select(SchoolOperator).where(
            SchoolOperator.school_id == school_id,
            SchoolOperator.user_id == current_user.id
        )
    )
    is_operator = op_res.scalar_one_or_none()

    if not is_operator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: You are not assigned to enter data for this school."
        )

    return school