from fastapi import Depends, HTTPException, status
from app.models.users import User
from app.repository.user import UserRepository
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.security import hash_password, verify_hash_password

class UserService :
    def __init__(self,user_repo : UserRepository) :
        self.user_repo = user_repo
        
    async def register_user(self, user_in : UserCreate)-> UserResponse | None:
        existing_user = await self.user_repo.get_user_by_email(user_in.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail = 'Email already exists')
        new_user = User(
            email = user_in.email,
            hashed_password = hash_password(user_in.password)
        )
        return await self.user_repo.register_user(new_user)
    
    
    async def authenticate_user(self, user_in : UserLogin) -> UserResponse | None:
        existing_user = await self.user_repo.get_user_by_email(user_in.email)
        if not existing_user:
            return None
        if not verify_hash_password:
            return None
        if not existing_user.is_active:
            return None
        return existing_user
        
        
    
    