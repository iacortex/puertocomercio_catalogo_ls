import os
import json
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
import aiofiles
import asyncio

# Auth
from fastapi import Depends
from routes.auth import router as auth_router, get_current_user

BASE_DIR = os.path.dirname(__file__)
JSON_PATH = os.path.join(BASE_DIR, "products.json")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

lock = asyncio.Lock()  # para evitar race conditions en el archivo JSON

app = FastAPI(title="Puerto Comercio - API", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restringir en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas Auth
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

# -----------------------
# Models
# -----------------------
class Precio(BaseModel):
    cantidad: str
    precio: int

class ProductoIn(BaseModel):
    nombre: str
    descripcion: str
    imagen: Optional[str] = "/uploads/keenboosup.png"
    categoria: str
    marca: str
    precios: List[Precio]
    intensidad: Optional[int] = 1
    maxIntensidad: Optional[int] = 5

class Producto(ProductoIn):
    id: int

# -----------------------
# Helpers JSON
# -----------------------
async def read_db():
    async with lock:
        if not os.path.exists(JSON_PATH):
            with open(JSON_PATH, "w", encoding="utf-8") as f:
                json.dump({"nextId": 100, "productos": []}, f, ensure_ascii=False, indent=2)
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    return data

async def write_db(data):
    async with lock:
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# -----------------------
# Rutas CRUD
# -----------------------
@app.get("/productos")
async def listar_productos():
    data = await read_db()
    return {"ok": True, "productos": data.get("productos", [])}

@app.get("/productos/{producto_id}")
async def obtener_producto(producto_id: int):
    data = await read_db()
    for p in data.get("productos", []):
        if p["id"] == producto_id:
            return {"ok": True, "producto": p}
    raise HTTPException(status_code=404, detail="Producto no encontrado")

# ---------- RUTAS PROTEGIDAS ----------
@app.post("/productos", status_code=201)
async def crear_producto(
    payload: ProductoIn,
    user: dict = Depends(get_current_user)
):
    data = await read_db()
    nid = data.get("nextId", 1)
    nuevo = payload.dict()
    nuevo["id"] = nid
    data.setdefault("productos", []).append(nuevo)
    data["nextId"] = nid + 1
    await write_db(data)
    return {"ok": True, "producto": nuevo}

@app.put("/productos/{producto_id}")
async def actualizar_producto(
    producto_id: int,
    payload: ProductoIn,
    user: dict = Depends(get_current_user)
):
    data = await read_db()
    productos = data.get("productos", [])
    for i, p in enumerate(productos):
        if p["id"] == producto_id:
            actualizado = payload.dict()
            actualizado["id"] = producto_id
            productos[i] = actualizado
            await write_db(data)
            return {"ok": True, "producto": actualizado}
    raise HTTPException(status_code=404, detail="Producto no encontrado")

@app.delete("/productos/{producto_id}")
async def eliminar_producto(
    producto_id: int,
    user: dict = Depends(get_current_user)
):
    data = await read_db()
    productos = data.get("productos", [])
    new = [p for p in productos if p["id"] != producto_id]
    if len(new) == len(productos):
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    data["productos"] = new
    await write_db(data)
    return {"ok": True}

# -----------------------
# Upload de imágenes (PROTEGIDO)
# -----------------------
@app.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1]
    fname = f"{uuid4().hex}{ext or '.jpg'}"

    dest = os.path.join(UPLOAD_DIR, fname)

    async with aiofiles.open(dest, "wb") as out:
        content = await file.read()
        await out.write(content)

    return {"ok": True, "ruta": f"/uploads/{fname}"}

# Servir imágenes (PÚBLICO)
@app.get("/uploads/{filename}")
async def serve_uploads(filename: str):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path)

# -----------------------
# Health
# -----------------------
@app.get("/health")
async def health():
    return {"ok": True, "msg": "api up"}
