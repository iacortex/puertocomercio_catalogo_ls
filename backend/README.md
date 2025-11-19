FastAPI backend for Catalogo

Run (inside backend folder):
    python -m venv .venv
    source .venv/bin/activate   # or .venv\Scripts\activate on Windows
    pip install -r requirements.txt
    uvicorn main:app --reload --port 3001

Endpoints:
    GET /productos       -> lista completa (reads products.json)
    GET /productos/{id}  -> detalle por id
