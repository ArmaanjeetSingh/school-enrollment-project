from fastapi import FastAPI
from app.api.user import router as user_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.enrollments import router as enrollment_router
from app.api.schools import router as school_router
from app.api.reports import router as report_router
import app.models
# from app.database import SessionDep,AsyncSessionLocal
# from app.repository.category import CategoryRepository
    
app = FastAPI()

app.include_router(user_router)
app.include_router(school_router)
app.include_router(enrollment_router)
app.include_router(report_router)

origins = [
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers (Authorization, Content-Type)
)