import axios from "axios";

const api = axios.create({
  baseURL: "http://72.61.56.128", // BACKEND
  timeout: 20000,
});

// 🔐 Agregar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚠️ Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error API:", error?.response || error);
    return Promise.reject(error);
  }
);

export default api;
