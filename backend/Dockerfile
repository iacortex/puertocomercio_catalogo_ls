FROM python:3.11-slim

# Establecer carpeta de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para reportlab y pillow
RUN apt-get update && apt-get install -y \
    build-essential \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libpng-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero (permitiendo cache de Docker)
COPY requirements.txt /app/

# Instalar dependencias Python (incluye reportlab)
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del backend
COPY . /app

# Exponer puerto del backend
EXPOSE 8000

# Iniciar el servidor FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
