export async function uploadImageToBackend(file, API_BASE) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload-image`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.ok) throw new Error("Error subiendo imagen");

  // retorna solo el nombre del archivo
  return data.ruta;
}
