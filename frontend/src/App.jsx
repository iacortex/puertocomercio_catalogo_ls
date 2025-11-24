import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Catalogo from "./Catalogo";
import AdminPanel from "./AdminPanel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección automática desde "/" hacia "/productos" */}
        <Route path="/" element={<Navigate to="/productos" replace />} />

        {/* Rutas reales */}
        <Route path="/productos" element={<Catalogo />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* Ruta para cuando no exista */}
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
