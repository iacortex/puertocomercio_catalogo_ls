import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalogo from "./Catalogo";
import AdminPanel from "./AdminPanel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
