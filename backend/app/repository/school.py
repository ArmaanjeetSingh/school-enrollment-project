from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.school import School, SchoolOperator
from app.schemas.school import SchoolCreate, SchoolUpdate


class SchoolRepo:
    def __init__(self, db: AsyncSession):
        self.session = db
        
    async def create_school(self, school_name: SchoolCreate, user_id: int) -> School:
        school_data = School(**school_name.model_dump(), user_id=user_id)
        self.session.add(school_data)
        await self.session.commit()
        await self.session.refresh(school_data)
        return school_data
    
    async def get_school_by_id(self, school_id: int) -> School | None:
        return await self.session.get(School, school_id)
    
    async def get_school_by_name(self, school_name: str, user_id: int) -> School | None:
        stmt = (
            select(School)
            .outerjoin(SchoolOperator, SchoolOperator.school_id == School.id)
            .where(
                School.name == school_name,
                or_(
                    School.user_id == user_id,           # Owner
                    SchoolOperator.user_id == user_id    # Joined Operator
                )
            )
            .distinct()
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_school_by_user(self, school_id: int, user_id: int) -> School | None:
        stmt = (
            select(School)
            .outerjoin(SchoolOperator, SchoolOperator.school_id == School.id)
            .where(
                School.id == school_id,
                or_(
                    School.user_id == user_id,           # Owner
                    SchoolOperator.user_id == user_id    # Joined Operator
                )
            )
            .distinct()
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_all_schools(self, user_id: int) -> list[School]:
        stmt = (
            select(School)
            .outerjoin(SchoolOperator, SchoolOperator.school_id == School.id)
            .where(
                or_(
                    School.user_id == user_id,           # Owner
                    SchoolOperator.user_id == user_id    # Joined Operator
                )
            )
            .distinct()
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def update_school(self, school_data: School, school_update: SchoolUpdate) -> School:
        for key, val in school_update.model_dump(exclude_none=True).items():
            setattr(school_data, key, val)
        await self.session.commit()
        await self.session.refresh(school_data)
        return school_data
        
    async def delete_school(self, school: School) -> None:
        await self.session.delete(school)
        await self.session.commit()
        
    async def create_school_operator(self, school: School, user_id: int) -> SchoolOperator:
        operator_link = SchoolOperator(school_id=school.id, user_id=user_id)
        self.session.add(operator_link)
        await self.session.commit()
        await self.session.refresh(operator_link)
        return operator_link
        
    async def check_for_exisitng_school_operator(self, passcode: str) -> School | None:
        res = await self.session.execute(
            select(School).where(School.operator_passcode == passcode.strip())
        )
        return res.scalar_one_or_none()
    
    async def check_for_link(self, school_id: int, user_id: int) -> SchoolOperator | None:
        stmt = select(SchoolOperator).where(
            SchoolOperator.school_id == school_id,
            SchoolOperator.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()