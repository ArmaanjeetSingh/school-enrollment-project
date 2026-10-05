# app/routers/reports.py
from datetime import date
from typing import Annotated
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import SessionDep
from app.dependencies.user import get_current_user
from app.models.users import User
from app.schemas.reports import ReportResponse, ReportDetailResponse, GenerateReportRequest, AIReportQueryRequest, AIReportQueryResponse
from app.services.report_service import ReportService
from app.services.analytics_service import AnalyticsService
from app.services.ai_service import AIService

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    payload: GenerateReportRequest,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = ReportService(db)
    return await service.generate_report(
        user_id=user.id,
        report_month=payload.report_month
    )

@router.get("", response_model=list[ReportResponse])
async def get_my_reports(
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = ReportService(db)
    return await service.get_my_reports(user_id=user.id)

@router.get("/{report_id}", response_model=ReportDetailResponse)
async def get_report(
    report_id: int,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = ReportService(db)
    report = await service.get_report(user_id=user.id, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.put("/{report_id}/refresh", response_model=ReportDetailResponse)
async def refresh_report(
    report_id: int,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = ReportService(db)
    return await service.refresh_report(user_id=user.id, report_id=report_id)

@router.post("/{report_id}/finalize", response_model=ReportResponse)
async def finalize_report(
    report_id: int,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    service = ReportService(db)
    return await service.finalize_report(user_id=user.id, report_id=report_id)

@router.post("/ai-query", response_model=AIReportQueryResponse)
async def query_reports_with_ai(
    payload: AIReportQueryRequest,
    db: SessionDep,
    user: Annotated[User, Depends(get_current_user)]
):
    analytics = AnalyticsService(db)
    comparison_metrics = await analytics.get_schools_monthly_comparison(user.id,payload.target_date)
    ai = AIService()
    answer = await ai.answer_report_question(payload.question, comparison_metrics)
    return {"answer": answer}