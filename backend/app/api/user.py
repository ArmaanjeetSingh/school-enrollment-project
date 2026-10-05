from fastapi import APIRouter, status, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.database import SessionDep
from app.services.user_service import UserService, UserRepository
from app.models.users import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.dependencies.jwt import create_access_token,create_refresh_token
from app.dependencies.user import get_current_user
from app.config import settings
from jose import jwt, JWTError
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, session: SessionDep):
    user_repo = UserRepository(session)
    user_service = UserService(user_repo)
    new_user = await user_service.register_user(user_in)
    return new_user

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    user_repo = UserRepository(session)
    user_service = UserService(user_repo)
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    exists_user = await user_service.authenticate_user(credentials)
    
    if not exists_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(exists_user.email)
    refresh_token = create_refresh_token(exists_user.email)
    response = JSONResponse(
        content={
            "detail": "Logged in Successfully !!",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    )
    response.set_cookie(
        "access_token", access_token, 
        samesite="lax", httponly=True, secure=False, max_age=60*60*24*1  # secure=False for localhost dev
    )
    response.set_cookie(
        "refresh_token", refresh_token, 
        samesite="lax", httponly=True, secure=False, max_age=60*60*24*7
    )
    return response
    
    
@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.cookies.get("refresh_token")
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError:
        raise credentials_exception
    if payload.get("type") != "refresh":
        raise credentials_exception

    email: str | None = payload.get("sub")
    if not email:
        raise credentials_exception

    new_access_token = create_access_token(subject=email)
    response = JSONResponse(
        content={
            "detail": "Token refreshed successfully",
            "type": "bearer"
        }
    )
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 1  # 1 day
    )

    return response
    
    
@router.get('/me',status_code= status.HTTP_200_OK)
async def get_me(current_user : User = Depends(get_current_user)):
    return {
        "id":current_user.id,
        "email":current_user.email,
        "is_active":current_user.is_active,
        "created_at":current_user.created_at
   }
    
    
@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    response = JSONResponse(content={"detail": "Logged out successfully"})
    response.delete_cookie(key="access_token", samesite="lax", httponly=True)
    response.delete_cookie(key="refresh_token", samesite="lax", httponly=True)
    return response