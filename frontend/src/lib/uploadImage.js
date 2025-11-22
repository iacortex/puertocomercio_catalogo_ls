// sube al endpoint /upload-image (FastAPI según tu backend)
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function uploadImageToBackend(file) {
  const fd = new FormData();
  fd.append("file", file);

  const token = localStorage.getItem("token"); // si está disponible
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API.replace(/\/$/, "")}/upload-image`, {
    method: "POST",
    headers,
    body: fd,
  });

  // backend devuelve { ok: true, ruta: "/uploads/xxxx.png" }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    console.error("uploadImageToBackend error:", data);
    throw new Error("Error subiendo imagen");
  }

  return data.ruta || data.url || data.path; // ruta relativa esperada
}
