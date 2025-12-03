from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import timedelta, datetime

from auth import authenticate_user, create_access_token  # tu lógica existente
from schemas import Token

# Router
router = APIRouter()

# La ruta donde se obtiene el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Clave y algoritmo (deben ser iguales a los usados en create_access_token)
SECRET_KEY = "SECRET123"   # <-- reemplazar por el tuyo real si corresponde
ALGORITHM = "HS256"


# -----------------------------------------
# LOGIN
# -----------------------------------------
@router.post("/login", response_model=Token)
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    user = authenticate_user(username, password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )

    access_token_expires = timedelta(hours=24)

    access_token = create_access_token(
        data={"sub": username},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


# -----------------------------------------
# get_current_user - NECESARIO para backend
# -----------------------------------------
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Valida el token enviado por el frontend.
    Retorna datos del usuario si es válido.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token requerido"
        )

    try:
        # Decodificar token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username: str = payload.get("sub")

        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
            )

        return {"username": username}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
