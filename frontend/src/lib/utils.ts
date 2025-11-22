import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs));
}


export function resolveImageUrl(imagen: string | null | undefined): string {
if (!imagen) return "https://placehold.co/300x300";


if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;


const base = (import.meta.env.VITE_API_URL || "http://72.61.56.128:8000").replace(/\/$/, "");


if (imagen.startsWith("/")) return `${base}${imagen}`;


return `${base}/uploads/${imagen}`;
}