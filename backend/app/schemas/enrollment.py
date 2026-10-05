from pydantic import BaseModel, Field,model_validator
from app.models.school import CategoryEnum
from datetime import datetime

class EnrollmentDataBase(BaseModel):
    class_: int = Field(..., ge=1, le=5)
    category : CategoryEnum
    boys: int = Field(..., ge=0)
    girls: int = Field(..., ge=0)
    below_6: int = Field(..., ge=0)
    between_6_and_11: int = Field(..., ge=0)
    above_11: int = Field(..., ge=0)
    @model_validator(mode="after")
    def validate_totals(self):
        total = self.boys + self.girls
        ages = (self.below_6 + self.between_6_and_11 + self.above_11)
        if total != ages:
           raise ValueError("Boys + Girls must equal the total of all age groups.")
        return self
    
class EnrollmentDataCreate(EnrollmentDataBase):
    pass

class EnrollmentDataResponse(EnrollmentDataBase):
    id : int
    model_config={"from_attributes":True}
    
class EnrollmentDataUpdate(BaseModel):
    class_: int | None = Field(default=None, ge=1, le=12)
    category: CategoryEnum | None = None
    boys: int | None = Field(default=None, ge=0)
    girls: int | None = Field(default=None, ge=0)
    below_6: int | None = Field(default=None, ge=0)
    between_6_and_11: int | None = Field(default=None, ge=0)
    above_11: int | None = Field(default=None, ge=0)
    updated_at: datetime | None = Field(default=None)