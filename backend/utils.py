import json
from pathlib import Path

DATA = Path("products.json")

def load_products():
    if not DATA.exists():
        return {"productos": []}
    with open(DATA, "r", encoding="utf-8") as f:
        return json.load(f)

def save_products(data):
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
