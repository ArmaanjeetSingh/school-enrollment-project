# app/routers/enrollments.py
from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated

from app.database import SessionDep
from app.dependencies.user import get_current_user, require_school_data_access
from app.schemas.enrollment import (
    EnrollmentDataCreate,
    EnrollmentDataUpdate,
    EnrollmentDataResponse
)
from app.services.enrollment_service import EnrollmentService
from app.models.users import User
from app.models.school import School

router = APIRouter(
    prefix="/school",
    tags=["Enrollments"]
)

# 1. Create enrollment for a school (Owner or Operator)
@router.post("/{school_id}/enrollments", response_model=EnrollmentDataResponse)
async def create_enrollment(
    school_id: int,
    enrollment_create: EnrollmentDataCreate,
    db: SessionDep,
    school: School = Depends(require_school_data_access),
    user: User = Depends(get_current_user)
):
    service = EnrollmentService(db)
    # Pass school.id and user.id (or school.user_id if records are grouped by school)
    return await service.create_enrollment(school_id, user.id, enrollment_create)

# 2. Get enrollments for a specific school (Owner or Operator)
@router.get("/{school_id}/enrollments", response_model=list[EnrollmentDataResponse])
async def get_school_enrollments(
    school_id: int,
    db: SessionDep,
    school: School = Depends(require_school_data_access)
):
    service = EnrollmentService(db)
    return await service.get_school_enrollments(school_id=school_id,user_id=school.user_id)

# 3. Get single enrollment row
@router.get("/enrollments/{enrollment_id}", response_model=EnrollmentDataResponse)
async def get_enrollment(
    enrollment_id: int,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = EnrollmentService(db)
    item = await service.get_enrollment_by_id(enrollment_id=enrollment_id, user_id=user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Enrollment data not found")
    return item

# 4. Update enrollment entry under a school
@router.put("/enrollments/{enrollment_id}", response_model=EnrollmentDataResponse)
async def update_enrollment(
    enrollment_id: int,
    enrollment_update: EnrollmentDataUpdate,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = EnrollmentService(db)
    return await service.update_enrollment(
        enrollment_id=enrollment_id,
        user_id=user.id,
        enrollment_update=enrollment_update
    )

# 5. Delete enrollment entry
@router.delete("/enrollments/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enrollment(
    enrollment_id: int,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = EnrollmentService(db)
    await service.delete_enrollment(
        enrollment_id=enrollment_id,
        user_id=user.id
    )