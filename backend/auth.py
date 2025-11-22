from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from schemas import UserInDB, User

SECRET_KEY = "PUERTO_COMERCIO_SUPER_SECRETO"   # cámbialo por seguridad
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 día

fake_user_db = {
    "admin": {
        "username": "admin",
        "hashed_password": "$2b$12$5S45oXxjAJv/w1R9n56kOOfT7z59WlCgG7lDpJYhKDPutYXEBaeZC"  # contraseña: admin123
    }
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def hash_password(password: str):
    return pwd_context.hash(password)


def get_user(username: str) -> Optional[UserInDB]:
    if username in fake_user_db:
        data = fake_user_db[username]
        return UserInDB(**data)
    return None


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
