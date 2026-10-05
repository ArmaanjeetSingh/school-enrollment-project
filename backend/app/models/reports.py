from app.database import Base
from sqlalchemy import String, DateTime, Integer,ForeignKey, Date, Enum,UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.school import CategoryEnum
from datetime import datetime,date
import enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.users import User
    
class ReportStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    FINAL = "END"

class Report(Base):
    __tablename__="reports"
    id : Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    user_id : Mapped[int] = mapped_column(ForeignKey("users.id",ondelete="CASCADE"),nullable=False)
    report_month : Mapped[date] =  mapped_column(Date,nullable=False)
    status: Mapped[ReportStatus] = mapped_column(Enum(ReportStatus,values_callable=lambda x: [e.value for e in x],native_enum=True),default=ReportStatus.DRAFT,nullable=False)
    generated_at : Mapped[datetime] = mapped_column(DateTime,default= lambda : datetime.utcnow(), nullable=False)
    user : Mapped["User"] = relationship("User",back_populates="reports")
    data: Mapped[list["ReportData"]] = relationship(back_populates="report",cascade="all, delete-orphan")
    __table_args__ = (
    UniqueConstraint(
        "user_id",
        "report_month",
        name="uq_user_report_month"
    ),
   )
    
    
class ReportData(Base):
    __tablename__="report_data"
    id : Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    report_id : Mapped[int] = mapped_column(ForeignKey("reports.id",ondelete="CASCADE"),nullable=False)
    school_id : Mapped[int] = mapped_column(ForeignKey("schools.id",ondelete="CASCADE"),nullable=False)
    class_ : Mapped[int] = mapped_column(Integer,nullable=False)
    category: Mapped[CategoryEnum] = mapped_column(Enum(CategoryEnum),nullable=False)
    boys: Mapped[int] = mapped_column(Integer,nullable=False)
    girls: Mapped[int] = mapped_column(Integer,nullable=False)
    below_6: Mapped[int] = mapped_column(Integer,nullable=False)
    between_6_and_11: Mapped[int] = mapped_column(Integer,nullable=False)
    above_11: Mapped[int] = mapped_column(Integer,nullable=False)
    report : Mapped["Report"] = relationship(back_populates="data")
    school = relationship("School", lazy="select")
    