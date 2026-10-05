# app/services/ai_service.py
import json
from groq import AsyncGroq
from app.config import settings

class AIService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.AI_API_KEY)

    async def answer_report_question(self, question: str, metrics: list[dict]) -> str:
        system_prompt = (
            "You are an education intelligence system evaluating school enrollment performance.\n"
            "Analyze the provided JSON dataset of schools to answer the question directly.\n\n"
            "Answering Guidelines:\n"
            "1. Highest / Lowest Count: Explicitly name the schools with the highest and lowest `total_strength`.\n"
            "2. Growth & Decline: Reference `mom_trend` to show which schools increased or decreased.\n"
            "3. Dropout Analysis: Reference `critical_dropouts` to identify class transitions losing the most students.\n"
            "4. Keep the response concise, formatted in markdown bullets, and cite exact numbers."
        )

        user_content = f"""
Schools Dataset:
{json.dumps(metrics, indent=2, default=str)}

Question: {question}
"""

        # Enforce supported model identifier
        model_name = getattr(settings, "AI_MODEL", None)
        if not model_name or "llama-3.3" in model_name:
            model_name = "llama-3.1-8b-instant"

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.1
        )

        return response.choices[0].message.content