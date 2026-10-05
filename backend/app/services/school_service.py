from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.school import SchoolRepo
from fastapi import HTTPException, status
from app.schemas.school import SchoolCreate, SchoolUpdate

class SchoolService:
    def __init__(self, session : AsyncSession):
        self.repo = SchoolRepo(session)
        
    async def create_school(self, school_data : SchoolCreate, user_id : int):
        school_exists = await self.repo.get_school_by_name(school_name=school_data.name,user_id=user_id)
        if school_exists:
            raise HTTPException(status_code=400,detail="School already exists")
        school = await self.repo.create_school(school_data,user_id)
        return school
    
    async def get_my_all_schools(self,user_id : int):
        schools = await self.repo.get_all_schools(user_id)
        return schools
    
    
    async def get_my_school(self,school_id:int,user_id : int):
        schools = await self.repo.get_school_by_user(school_id,user_id)
        return schools
    
    async def update_school(self,school_id : int,user_id : int,school_update : SchoolUpdate):
        school_data = await self.repo.get_school_by_user(school_id, user_id)
        if not school_data:
            raise HTTPException(status_code=400,detail="School does not exists")
        school = await self.repo.update_school(school_data,school_update)
        return school
    
    async def delete_school(self,school_id : int,user_id:int):
        school_data = await self.repo.get_school_by_user(school_id,user_id)
        if not school_data:
            raise HTTPException(status_code=400,detail="School does not exists")
        await self.repo.delete_school(school_data)
        
        
    async def assign_school_operator(self,passcode : str,user_id : int):
        school = await self.repo.check_for_exisitng_school_operator(passcode)
    
        if not school:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Invalid school passcode. Please verify with your center administrator")

        existing = await self.repo.check_for_link(school.id,user_id)
        if existing:
            return {"message": "Already linked to this school", "school_id": school.id, "school_name": school.name}
        await self.repo.create_school_operator(school,user_id)
        return {"message": f"Successfully joined {school.name} as an operator","school_id": school.id,"school_name": school.name}