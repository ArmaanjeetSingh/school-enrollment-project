from pydantic import BaseModel, Field

class SchoolBase(BaseModel):
    name: str = Field(
    ...,
    min_length=2,
    max_length=100,
    description="Name of the School"
    )
    
class SchoolCreate(SchoolBase):
    pass

class SchoolResponse(SchoolBase):
    id : int
    operator_passcode : str
    model_config={"from_attributes":True}
    
class SchoolUpdate(SchoolBase):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )
    
