import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://polcfcvliywvyrqqzabl.supabase.co",
  "sb_publishable_vYAThAFRwhyw98R_FoqO1g_mUrj3UGa"
);

export const uploadImage = async (file) => {
  const fileName = `${crypto.randomUUID()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("productos")
    .upload(fileName, file);

  if (error) throw error;

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from("productos")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  let imageURL = product.image;

  if (file) {
    imageURL = await uploadImage(file);
  }

  await fetch("http://localhost:8000/productos", {
    method: editing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...product,
      imagen: imageURL
    })
  });

  alert("Producto guardado");
};

