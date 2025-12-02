from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
import os
from datetime import datetime

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
PDF_FOLDER = os.path.join(BASE_DIR, "pdfs")

os.makedirs(PDF_FOLDER, exist_ok=True)

@router.get("/catalogo-pdf")
def generar_catalogo():
    productos_path = os.path.join(BASE_DIR, "data", "productos.json")

    if not os.path.exists(productos_path):
        raise HTTPException(status_code=404, detail="El archivo productos.json no existe")

    import json
    with open(productos_path, "r", encoding="utf-8") as f:
        productos = json.load(f)

    pdf_path = os.path.join(PDF_FOLDER, "catalogo_productos.pdf")

    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    contenido = []

    # Portada
    titulo = Paragraph("<b><font size=22>P U E R T O  C O M E R C I O</font></b>", styles["Title"])
    fecha = Paragraph(f"<font size=12>Catálogo generado: {datetime.now().strftime('%d/%m/%Y')}</font>", styles["Normal"])

    contenido.append(Spacer(1, 150))
    contenido.append(titulo)
    contenido.append(Spacer(1, 20))
    contenido.append(fecha)
    contenido.append(Spacer(1, 300))

    contenido.append(Paragraph("<b><font size=16>Catálogo de Productos</font></b>", styles["Heading2"]))
    contenido.append(Spacer(1, 20))

    # Productos
    for p in productos:
        contenido.append(Paragraph(f"<b>{p['nombre']}</b>", styles["Heading3"]))
        contenido.append(Paragraph(f"Precio: {p['precio']}", styles["Normal"]))

        if p.get("descripcion"):
            contenido.append(Paragraph(f"{p['descripcion']}", styles["Normal"]))

        # Imagen
        if p.get("imagen"):
            img_path = os.path.join(UPLOAD_FOLDER, p["imagen"])
            if os.path.exists(img_path):
                contenido.append(Image(img_path, width=200, height=200))
        
        contenido.append(Spacer(1, 20))

    doc.build(contenido)

    return FileResponse(pdf_path, filename="catalogo_puerto_comercio.pdf")
