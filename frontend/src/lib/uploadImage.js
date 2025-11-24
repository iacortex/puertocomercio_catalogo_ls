export async function uploadImageToBackend(file) {
  if (!file) return null;

  // Leer la URL del backend desde las variables de entorno de Vite
  const API_BASE = import.meta.env.VITE_API_URL;

  if (!API_BASE) {
    console.error("❌ ERROR: VITE_API_URL no está definida en el frontend");
    throw new Error("VITE_API_URL no está configurada");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload-image`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.ok) {
    console.error("❌ Error subiendo imagen:", data);
    throw new Error("Error subiendo imagen al backend");
  }

  // retornamos SOLO el nombre del archivo
  return data.ruta;
}
