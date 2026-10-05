from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import settings
from typing import Annotated
from fastapi import Depends

db_url = settings.DATABASE_URL

def get_async_db_url()->str:
    if not db_url:
        raise ValueError("Database Url is not setup")
    if '?' in db_url:
        base_url = db_url.split('?')[0]
        
    else :
        base_url = db_url
    if base_url.startswith('postgresql://'):
        async_db_url = base_url.replace('postgresql://','postgresql+asyncpg://',1)
    else :
        async_db_url = base_url
    return async_db_url

engine = create_async_engine(get_async_db_url(),echo=True)
AsyncSessionLocal = async_sessionmaker(
    bind = engine,
    class_=AsyncSession,
    expire_on_commit = False
)

class Base(DeclarativeBase):
    pass

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session
        
SessionDep = Annotated[AsyncSession,Depends(get_async_db)]