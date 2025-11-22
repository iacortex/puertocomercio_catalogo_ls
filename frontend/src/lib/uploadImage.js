export async function uploadImageToBackend(file) {
if (!file) return null;


// Prefer VITE var, fallback to explicit VPS (safe fallback)
const API_URL = (import.meta.env.VITE_API_URL || "http://72.61.56.128:8000").replace(/\/$/, "");


const formData = new FormData();
formData.append("file", file);


const res = await fetch(`${API_URL}/upload-image`, {
method: "POST",
body: formData,
});


if (!res.ok) {
const txt = await res.text().catch(() => "");
console.error("Upload failed:", res.status, txt);
throw new Error("Error subiendo imagen");
}


const data = await res.json();
// backend returns { ok: true, ruta: "/uploads/filename.png" }
return data.ruta || data.url || null;
}
