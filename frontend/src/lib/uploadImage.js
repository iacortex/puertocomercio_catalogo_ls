import { supabase } from "../supabase";

export const uploadImage = async (file) => {
  const fileName = `${crypto.randomUUID()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("productos")   // tu bucket
    .upload(fileName, file);

  if (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }

  const { data: publicURL } = supabase.storage
    .from("productos")
    .getPublicUrl(fileName);

  return publicURL.publicUrl;
};
