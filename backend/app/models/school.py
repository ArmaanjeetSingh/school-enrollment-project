from sqlalchemy import String, DateTime, Integer,ForeignKey,Enum,UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column,relationship
from app.database import Base
from app.models.users import User
from enum import Enum as EnumType
from datetime import datetime
import secrets
class CategoryEnum(str,EnumType):
    SC="SC"
    OBC="OBC"
    GENERAL="GENERAL"
    BC="BC"

def generate_access_code():
    # Generates a clean 8-character token, e.g. "SCH-A1B2C3"
    return f"SCH-{secrets.token_hex(3).upper()}"
class School(Base):
    __tablename__="schools"
    id : Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    name : Mapped[str] = mapped_column(String(20),nullable=False)
    user_id : Mapped[int] = mapped_column(ForeignKey("users.id",ondelete="CASCADE"),nullable=False)
    user : Mapped["User"] = relationship("User",back_populates="schools")
    enrollments : Mapped[list["EnrollmentData"]] = relationship(back_populates="school",cascade="all,delete-orphan")
    operator_passcode : Mapped[str] =  mapped_column(String, unique=True, default=generate_access_code, nullable=False)
    
class EnrollmentData(Base):
    __tablename__="enrollment_data"
    id : Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True,index=True)
    school_id : Mapped[int] = mapped_column(ForeignKey("schools.id",ondelete='CASCADE'),nullable=False)
    class_ : Mapped[int] = mapped_column(Integer,nullable=False)
    category : Mapped[CategoryEnum] = mapped_column(Enum(CategoryEnum),nullable=False)
    boys : Mapped[int] = mapped_column(Integer,nullable=False,default=0)    
    girls : Mapped[int] = mapped_column(Integer,nullable=False,default=0)    
    below_6 : Mapped[int] = mapped_column(Integer,nullable=False,default=0)    
    between_6_and_11 : Mapped[int] = mapped_column(Integer,nullable=False,default=0)    
    above_11 : Mapped[int] = mapped_column(Integer,nullable=False,default=0)
    updated_at:Mapped[datetime] = mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)
    school : Mapped["School"] = relationship("School",back_populates="enrollments")   
    __table_args__ = (UniqueConstraint("school_id","class_","category",name="uq_school_class_category"),) 
    
class SchoolOperator(Base):
    __tablename__ = "school_operators"

    id : Mapped[int] = mapped_column(Integer, primary_key=True)
    school_id : Mapped[int] = mapped_column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    user_id : Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at : Mapped[int] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("school_id", "user_id", name="uq_operator_school"),
    )