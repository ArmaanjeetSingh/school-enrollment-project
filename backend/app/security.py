from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated  = "auto"
)

def hash_password(pwd : str)-> str:
    return pwd_context.hash(pwd)

def verify_hash_password(plain_pwd : str, hashed_password : str)->bool:
    return pwd_context.verify(plain_pwd,hashed_password)