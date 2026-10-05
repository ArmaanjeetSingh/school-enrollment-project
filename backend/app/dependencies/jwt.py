from datetime import datetime,timedelta
from jose import jwt  
from app.config import settings

def create_access_token(subject : str)->str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub":subject,
        "exp":expire,
        "type":"access"
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm= settings.JWT_ALGORITHM
    )
    
def create_refresh_token(subject : str) -> str:
    expire = datetime.utcnow()+timedelta(
        days= settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    
    payload = {
        "sub":subject,
        "exp":expire,
        "type":'refresh'
    }
    
    return jwt.encode (
        payload,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )