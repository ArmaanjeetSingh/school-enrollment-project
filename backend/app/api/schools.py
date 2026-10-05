# app/routers/schools.py
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.database import SessionDep
from app.dependencies.user import get_current_user, require_school_data_access, require_school_owner
from app.models.users import User
from app.models.school import School
from app.schemas.school import (
    SchoolCreate,
    SchoolUpdate,
    SchoolResponse,
)
from app.services.school_service import SchoolService

router = APIRouter(
    prefix="/schools",
    tags=["Schools"]
)

# 1. Create a school (Center Owner)
@router.post(
    "",
    response_model=SchoolResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_school(
    school_create: SchoolCreate,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = SchoolService(db)
    return await service.create_school(
        school_data=school_create,
        user_id=user.id
    )

# 2. Get all schools accessible to user (Owned + Joined via operator)
@router.get(
    "",
    response_model=list[SchoolResponse]
)
async def get_my_schools(
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = SchoolService(db)
    return await service.get_my_all_schools(user_id=user.id)

# 3. Get one school (Allows BOTH owner and linked operator)
@router.get(
    "/{school_id}",
    response_model=SchoolResponse
)
async def get_school(
    school: School = Depends(require_school_data_access)
):
    # require_school_data_access verifies the user is owner OR joined operator
    # and raises 404 / 403 if unauthorized, preventing NoneType ResponseValidationError
    return school

# 4. Update school (OWNER ONLY)
@router.put(
    "/{school_id}",
    response_model=SchoolResponse
)
async def update_school(
    school_id: int,
    school_update: SchoolUpdate,
    db: SessionDep,
    school: School = Depends(require_school_owner)  # Only center owner can update
):
    service = SchoolService(db)
    return await service.update_school(
        school_id=school_id,
        user_id=school.user_id,
        school_update=school_update
    )

# 5. Delete school (OWNER ONLY)
@router.delete(
    "/{school_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_school(
    school_id: int,
    db: SessionDep,
    school: School = Depends(require_school_owner)  # Only center owner can delete
):
    service = SchoolService(db)
    await service.delete_school(
        school_id=school_id,
        user_id=school.user_id
    )

class JoinSchoolRequest(BaseModel):
    passcode: str

# 6. Join as operator
@router.post("/join")
async def join_school_as_operator(
    payload: JoinSchoolRequest,
    db: SessionDep,
    current_user: User = Depends(get_current_user)
):
    service = SchoolService(db)
    return await service.assign_school_operator(payload.passcode, current_user.id)