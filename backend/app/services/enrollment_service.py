from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.enrollments import EnrollmentRepo
from app.schemas.enrollment import EnrollmentDataCreate,EnrollmentDataUpdate
from fastapi import HTTPException
from sqlalchemy import select

class EnrollmentService:
    def __init__(self,session : AsyncSession):
        self.repo = EnrollmentRepo(session)
        
    @staticmethod
    def _validate_totals(boys : int,girls : int,below_6 : int, between_6_and_11 : int, above_11 : int):
        return boys + girls == (between_6_and_11 + below_6 + above_11)
        
        
    async def create_enrollment(self,school_id : int, user_id: int,enrollment_data : EnrollmentDataCreate):
        # check school exists
        # check school belongs to current user
        # check duplicate (school, class, category)
        # validate total
        # Repo. create()
        school = await self.repo.get_school_by_user(school_id,user_id)
        if not school:
            raise HTTPException(status_code=404, detail = "School Does not exists for given user")
        existing = await self.repo.get_by_school_class_category(school_id,enrollment_data.class_,enrollment_data.category)
        if existing:
           raise HTTPException(status_code=400, detail="Enrollment data already exists for this class and category")
        if not self._validate_totals(enrollment_data.boys, enrollment_data.girls, enrollment_data.below_6,enrollment_data.between_6_and_11,enrollment_data.above_11):
           raise HTTPException(status_code=400,detail="Boys + girls must equal the total of all age groups")
        return await self.repo.create_enrollment(enrollment_data,school_id)      
        
    async def get_enrollments_for_user(self,user_id : int):
        return await self.repo.get_all_enrollments_for_user(user_id=user_id)
    
    async def get_enrollment_by_id(self, enrollment_id : int,user_id:int):
        enrollment = await self.repo.get_by_id(enrollment_id,user_id=user_id)
        if not enrollment:
           raise HTTPException(status_code=404, detail="Enrollemt ID does not exists")
        return enrollment
        
    async def get_school_enrollments(self, school_id : int,user_id : int):
        school = await self.repo.get_school_by_user(school_id,user_id)
        if not school:
            raise HTTPException(status_code=404, detail = "School Does not exists for given user")
        enrollments = await self.repo.get_all_by_school(school_id=school_id)
        return enrollments
    
    
    async def update_enrollment(self, enrollment_id : int,user_id : int, enrollment_update : EnrollmentDataUpdate):
          enrollment = await self.repo.get_by_id(enrollment_id,user_id)
          if not enrollment:
              raise HTTPException(status_code=404, detail="Enrollemt ID does not exists for given user")
          updates = enrollment_update.model_dump(exclude_none=True)
          
          boys = updates.get("boys", enrollment.boys)
          girls = updates.get("girls", enrollment.girls)
          below_6 = updates.get("below_6", enrollment.below_6)
          between_6_and_11 = updates.get("between_6_and_11",enrollment.between_6_and_11)
          above_11 = updates.get("above_11", enrollment.above_11)
          
          if not self._validate_totals(boys,girls,below_6,between_6_and_11,above_11):
            raise HTTPException(status_code=400,detail="Boys + girls must equal the total of all age groups")
          
          for key,value in updates.items():
               setattr(enrollment,key,value)
          updated_data = await self.repo.update(enrollment)
          return updated_data
      
      
    async def delete_enrollment(self, enrollment_id : int, user_id):
        enrollment = await self.repo.get_by_id(enrollment_id,user_id)
        if not enrollment:
            raise HTTPException(status_code=404, detail="Enrollemt ID does not exists for given user")
        await self.repo.delete(enrollment=enrollment)
          