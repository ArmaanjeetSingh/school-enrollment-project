# app/services/analytics_service.py
from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, extract
from app.models.school import School, SchoolOperator, EnrollmentData

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_schools_monthly_comparison(self, user_id: int,target_date: date | None = None) -> list[dict]:
        """
        Calculates Month-over-Month (MoM) enrollment shifts, student strengths,
        and transition dropouts across schools accessible to the user.
        """
        if target_date is None:
            target_date = date.today()

        # Compute target and previous months
        current_month = target_date.month
        current_year = target_date.year

        prev_date = target_date - relativedelta(months=1)
        prev_month = prev_date.month
        prev_year = prev_date.year

        # 1. Fetch accessible schools (Owner or Operator)
        stmt = (
            select(School)
            .outerjoin(SchoolOperator, SchoolOperator.school_id == School.id)
            .where(
                or_(
                    School.user_id == user_id,
                    SchoolOperator.user_id == user_id
                )
            )
            .distinct()
        )
        schools = (await self.db.execute(stmt)).scalars().all()

        results = []

        for school in schools:
            # 2. Fetch all enrollment rows for this school
            enr_stmt = select(EnrollmentData).where(EnrollmentData.school_id == school.id)
            records = (await self.db.execute(enr_stmt)).scalars().all()

            # Partition records by month/year using report_date or created_at
            def matches_period(record, m: int, y: int):
                # Inspect date attributes dynamically
                dt = (
                    getattr(record, 'report_date', None) or 
                    getattr(record, 'report_month', None) or 
                    getattr(record, 'created_at', None)
                )
                if dt:
                    return dt.month == m and dt.year == y
                # Fallback to current period if no date column exists on individual rows
                return m == current_month and y == current_year

            curr_records = [r for r in records if matches_period(r, current_month, current_year)]
            prev_records = [r for r in records if matches_period(r, prev_month, prev_year)]

            curr_boys = sum(getattr(r, 'boys', 0) or 0 for r in curr_records)
            curr_girls = sum(getattr(r, 'girls', 0) or 0 for r in curr_records)
            curr_total = curr_boys + curr_girls

            prev_total = sum((getattr(r, 'boys', 0) or 0) + (getattr(r, 'girls', 0) or 0) for r in prev_records)

            # Month-over-Month calculation
            mom_trend = "No prior month data"
            diff = 0
            if prev_total > 0:
                diff = curr_total - prev_total
                pct = round((diff / prev_total) * 100, 2)
                mom_trend = f"{'+' if diff > 0 else ''}{diff} students ({pct}%)"

            # Class-level breakdown for current month
            class_map = {}
            for r in curr_records:
                c = r.class_
                count = (getattr(r, 'boys', 0) or 0) + (getattr(r, 'girls', 0) or 0)
                class_map[c] = class_map.get(c, 0) + count

            # Progression dropouts between sequential grades
            transition_drops = {}
            sorted_classes = sorted(class_map.keys())
            for i in range(len(sorted_classes) - 1):
                c1, c2 = sorted_classes[i], sorted_classes[i + 1]
                loss = class_map[c1] - class_map[c2]
                if loss > 0:
                    transition_drops[f"Class {c1} to {c2}"] = f"Drop of {loss} students"

            results.append({
                "school_id": school.id,
                "school_name": school.name,
                "period": f"{target_date.strftime('%B %Y')}",
                "comparison_period": f"{prev_date.strftime('%B %Y')}",
                "total_strength": curr_total,
                "net_monthly_change": diff,
                "boys_count": curr_boys,
                "girls_count": curr_girls,
                "mom_trend": mom_trend,
                "class_level_enrollments": class_map,
                "critical_dropouts": transition_drops
            })

        return results