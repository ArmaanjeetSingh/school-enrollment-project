# app/services/report_service.py
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.reports import ReportData, ReportStatus
from app.repository.reports import ReportRepo
from app.repository.enrollments import EnrollmentRepo

class ReportService:
    def __init__(self, session: AsyncSession):
        self.report_repo = ReportRepo(session)
        self.enrollment_repo = EnrollmentRepo(session)
        self.session = session
        
    async def generate_report(self, user_id: int, report_month: date):
        # 1. Check whether report exists
        existing_report = await self.report_repo.get_report_by_month(user_id=user_id, report_month=report_month)
        if existing_report:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Report already exists this month")
        
        # 2. Get current enrollment data
        enrollments = await self.enrollment_repo.get_all_enrollments_for_user(user_id)
        if not enrollments:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No Enrollment data found")
        
        # 3. Create report header
        report = await self.report_repo.create_report(user_id=user_id, report_month=report_month)
        
        # 4. Create Snapshots
        report_data = [
            ReportData(
                report_id=report.id,
                school_id=enrollment.school_id,
                class_=enrollment.class_,
                category=enrollment.category,
                boys=enrollment.boys,
                girls=enrollment.girls,
                below_6=enrollment.below_6,
                between_6_and_11=enrollment.between_6_and_11,
                above_11=enrollment.above_11
            )
            for enrollment in enrollments
        ]

        await self.report_repo.add_report_data(report_data)
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def get_my_reports(self, user_id: int):
        return await self.report_repo.get_all_reports(user_id)
   
    async def get_report(self, user_id: int, report_id: int):
        report = await self.report_repo.get_report_by_id(user_id=user_id, report_id=report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        return report

    async def refresh_report(self, user_id: int, report_id: int):
        report = await self.report_repo.get_report_by_id(user_id=user_id, report_id=report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        if report.status == ReportStatus.FINAL:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Finalized report cannot be modified")
        
        enrollments = await self.enrollment_repo.get_all_enrollments_for_user(user_id)
        if not enrollments:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No enrollment data found")
        
        await self.report_repo.delete_report_data(report_id)
        report_data = [
            ReportData(
                report_id=report.id,
                school_id=enrollment.school_id,
                class_=enrollment.class_,
                category=enrollment.category,
                boys=enrollment.boys,
                girls=enrollment.girls,
                below_6=enrollment.below_6,
                between_6_and_11=enrollment.between_6_and_11,
                above_11=enrollment.above_11
            )
            for enrollment in enrollments
        ]

        await self.report_repo.add_report_data(report_data)
        await self.session.commit()
        
        # Reload with selectinload so relationship data serializes cleanly in ReportDetailResponse
        return await self.report_repo.get_report_by_id(user_id=user_id, report_id=report_id)
    
    async def finalize_report(self, user_id: int, report_id: int):
        report = await self.report_repo.get_report_by_id(user_id=user_id, report_id=report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        if report.status == ReportStatus.FINAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Report is already finalized"
            )

        report.status = ReportStatus.FINAL
        await self.session.commit()
        await self.session.refresh(report)
        return report