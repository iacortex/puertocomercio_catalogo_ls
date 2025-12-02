import React from "react";

export default function CatalogoDownloader() {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const descargarCatalogo = () => {
    window.open(`${API_BASE}/catalogo-pdf`, "_blank");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 p-10">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Catálogo Puerto Comercio</h1>
        <p className="text-gray-600 mb-6">Genera y descarga tu catálogo en PDF con portada incluida.</p>

        <button
          onClick={descargarCatalogo}
          className="px-6 py-3 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition">
          Descargar Catálogo PDF
        </button>

        <div className="mt-10 border rounded-xl overflow-hidden shadow">
          <img
            src="/catalogo_portada.png"
            alt="Portada"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
