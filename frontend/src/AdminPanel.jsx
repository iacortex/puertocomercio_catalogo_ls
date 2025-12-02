import React, { useEffect, useState } from "react";
import { uploadImageToBackend } from "./lib/uploadImage";

export default function AdminPanel() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ==========================
  //   CARGAR PRODUCTOS
  // ==========================
  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================
  //   ABRIR MODAL
  // ==========================
  const openModal = (product = null) => {
    setSelectedProduct(
      product || {
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "",
        stock: "",
        imagen: "",
      }
    );
    setSelectedFile(null);
    setModalOpen(true);
  };

  // ==========================
  //   GUARDAR PRODUCTO
  // ==========================
  const saveProduct = async () => {
    try {
      let imagenFinal = selectedProduct.imagen;

      // Si hay archivo nuevo → subirlo
      if (selectedFile) {
        imagenFinal = await uploadImageToBackend(selectedFile, API_URL);
      }

      const método = selectedProduct.id ? "PUT" : "POST";
      const url = selectedProduct.id
        ? `${API_URL}/products/${selectedProduct.id}`
        : `${API_URL}/products`;

      const res = await fetch(url, {
        method: método,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selectedProduct, imagen: imagenFinal }),
      });

      if (!res.ok) throw new Error("Error guardando producto");

      setModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error guardando producto");
    }
  };

  // ==========================
  //   ELIMINAR PRODUCTO
  // ==========================
  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error eliminando");

      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error eliminando producto");
    }
  };

  // ==========================
  //   RENDER
  // ==========================
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* ---------- HEADER ---------- */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
            Administrar Productos
          </h1>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all"
          >
            ➕ Nuevo Producto
          </button>
        </div>
      </header>

      {/* ---------- TABLA ---------- */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
        <div className="overflow-x-auto w-full">
          <table className="min-w-[700px] w-full bg-white dark:bg-slate-800 rounded-xl shadow">
            <thead className="bg-gray-200 dark:bg-slate-700">
              <tr>
                <th className="p-3 text-left">Imagen</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Precio</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b dark:border-slate-700">
                  <td className="p-3">
                    <img
                      src={
                        p.imagen
                          ? `${API_URL}/uploads/${p.imagen}`
                          : "https://placehold.co/600x400?text=Producto"
                      }
                      alt=""
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg shadow-sm"
                    />
                  </td>

                  <td className="p-3">{p.nombre}</td>
                  <td className="p-3">${p.precio}</td>
                  <td className="p-3">{p.stock}</td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => openModal(p)}
                      className="p-1.5 sm:p-2 bg-yellow-400 rounded-lg"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 sm:p-2 bg-red-500 text-white rounded-lg"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ---------- MODAL ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-3 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-white">
              {selectedProduct.id ? "Editar Producto" : "Nuevo Producto"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={selectedProduct.nombre}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    nombre: e.target.value,
                  })
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-slate-900 dark:text-white"
              />

              <input
                type="number"
                placeholder="Precio"
                value={selectedProduct.precio}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    precio: e.target.value,
                  })
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-slate-900 dark:text-white"
              />

              <input
                type="number"
                placeholder="Stock"
                value={selectedProduct.stock}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    stock: e.target.value,
                  })
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-slate-900 dark:text-white"
              />

              <input
                type="text"
                placeholder="Categoría"
                value={selectedProduct.categoria}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    categoria: e.target.value,
                  })
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* ---------- IMAGEN ---------- */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-white">
                Imagen del producto
              </label>

              <input
                type="file"
                className="mt-2 w-full"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              {selectedProduct.imagen && (
                <img
                  src={`${API_URL}/uploads/${selectedProduct.imagen}`}
                  className="w-24 h-24 rounded-lg mt-3 object-cover border"
                />
              )}
            </div>

            {/* ---------- BOTONES ---------- */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={saveProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
