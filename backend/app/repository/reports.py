# app/repository/reports.py
from datetime import date
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.reports import Report, ReportData, ReportStatus

class ReportRepo:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def create_report(self, user_id: int, report_month: date) -> Report:
        report = Report(user_id=user_id, report_month=report_month, status=ReportStatus.DRAFT)
        self.session.add(report)
        await self.session.flush()
        return report
        
    async def get_report_by_month(self, user_id: int, report_month: date) -> Report | None:
        stmt = select(Report).where(Report.user_id == user_id, Report.report_month == report_month)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_all_reports(self, user_id: int) -> list[Report]:
        stmt = select(Report).where(Report.user_id == user_id).order_by(Report.report_month.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_report_by_id(self, user_id: int, report_id: int) -> Report | None:
        stmt = (
            select(Report)
            .where(Report.user_id == user_id, Report.id == report_id)
            .options(
                selectinload(Report.data).selectinload(ReportData.school)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_report_data(self, report_id: int) -> list[ReportData]:
        stmt = select(ReportData).where(ReportData.report_id == report_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def delete_report_data(self, report_id: int):
        stmt = delete(ReportData).where(ReportData.report_id == report_id)
        await self.session.execute(stmt)
    
    async def delete_report(self, report: Report) -> None:
        await self.session.delete(report)
        
    async def add_report_data(self, report_data: list[ReportData]):
        self.session.add_all(report_data)