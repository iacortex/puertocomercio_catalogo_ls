import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(imagen: string | null | undefined): string {
  if (!imagen) return "";

  // Si ya es URL absoluta
  if (imagen.startsWith("http://") || imagen.startsWith("https://")) {
    return imagen;
  }

  // Base: API local o producción
  const base = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  // Si la ruta empieza por "/", ejemplo "/uploads/file.png"
  if (imagen.startsWith("/")) {
    return `${base}${imagen}`;
  }

  // Si solo viene "archivo.png", asumimos uploads
  return `${base}/uploads/${imagen}`;
}
