from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.schemas.enrollment import EnrollmentDataCreate
from app.models.school import EnrollmentData, CategoryEnum, School, SchoolOperator


class EnrollmentRepo:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def create_enrollment(
        self, enrollment_create: EnrollmentDataCreate, school_id: int
    ) -> EnrollmentData:
        enrollment_data = EnrollmentData(
            **enrollment_create.model_dump(), school_id=school_id
        )
        self.session.add(enrollment_data)
        await self.session.commit()
        await self.session.refresh(enrollment_data)
        return enrollment_data
    
    async def get_all_enrollments_for_user(self, user_id: int) -> list[EnrollmentData]:
        """
        Retrieves all enrollments for schools owned by the user
        OR schools the user has joined as an operator.
        """
        stmt = (
            select(EnrollmentData)
            .join(School, EnrollmentData.school_id == School.id)
            .outerjoin(SchoolOperator, SchoolOperator.school_id == School.id)
            .where(
                or_(
                    School.user_id == user_id,
                    SchoolOperator.user_id == user_id
                )
            )
            .distinct()
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_school_by_user(self, school_id: int, user_id: int) -> School | None:
        """
        Checks whether the user has access to this school as owner OR operator.
        """
        stmt = (
            select(School)
            .outerjoin(SchoolOperator, SchoolOperator.school_id == School.id)
            .where(
                School.id == school_id,
                or_(
                    School.user_id == user_id,
                    SchoolOperator.user_id == user_id
                )
            )
            .distinct()
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_by_id(self, enrollment_id: int, user_id: int) -> EnrollmentData | None:
        """
        Fetches an enrollment record if the user is owner OR operator of its school.
        """
        stmt = (
            select(EnrollmentData)
            .join(School, EnrollmentData.school_id == School.id)
            .outerjoin(SchoolOperator, SchoolOperator.school_id == School.id)
            .where(
                EnrollmentData.id == enrollment_id,
                or_(
                    School.user_id == user_id,
                    SchoolOperator.user_id == user_id
                )
            )
            .distinct()
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_all_by_school(self, school_id: int) -> list[EnrollmentData]:
        stmt = (
            select(EnrollmentData)
            .where(EnrollmentData.school_id == school_id)
            .order_by(EnrollmentData.class_, EnrollmentData.category)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_by_school_class_category(
        self, school_id: int, class_: int, category: CategoryEnum
    ) -> EnrollmentData | None:
        stmt = select(EnrollmentData).where(
            EnrollmentData.school_id == school_id,
            EnrollmentData.class_ == class_,
            EnrollmentData.category == category
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def update(self, enrollment_data: EnrollmentData) -> EnrollmentData:
        await self.session.commit()
        await self.session.refresh(enrollment_data)
        return enrollment_data
    
    async def delete(self, enrollment: EnrollmentData) -> None:
        await self.session.delete(enrollment)
        await self.session.commit()