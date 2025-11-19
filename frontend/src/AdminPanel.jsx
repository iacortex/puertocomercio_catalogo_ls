// src/AdminPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash, Sun, Moon, Save, X } from "lucide-react";
import { resolveImageUrl } from "./lib/utils";
import { uploadImageToBackend } from "./lib/uploadImage";

// --- API BASE ---
// --- API BASE ---
const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:3001";
const API = `${API_BASE.replace(/\/$/, "")}/productos`;


// --- Constantes ---
const categorias = ["TABACOS", "FILTROS", "PAPELILLOS", "ECONOMICOS", "CIGARRILLOS"];
const marcas = ["BRISTOL", "ATLAS", "FOX", "MALBORO", "KENT", "LUCKY STRIKE", "PALL MALL"];

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [dark, setDark] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    imagen: "https://placehold.co/300x300",
    categoria: categorias[0],
    marca: marcas[0],
    precios: [{ cantidad: "unidad", precio: 1000 }],
  });

  // Para manejar file input y preview antes de guardar
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // -----------------------
  // Cargar productos
  // -----------------------
  const cargarProductos = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setProductos(data.productos || []);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setProductos([]);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // -----------------------
  // Dark Mode
  // -----------------------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  // -----------------------
  // Helpers de formulario
  // -----------------------
  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      imagen: "https://placehold.co/300x300",
      categoria: categorias[0],
      marca: marcas[0],
      precios: [{ cantidad: "unidad", precio: 1000 }],
    });
    setEditando(null);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const editarProducto = (p) => {
    setEditando(p.id);
    // Si la imagen es relativa (p ej '/uploads/foo.png') la dejamos tal cual,
    // resolveImageUrl la convertirá al mostrarla.
    setForm({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      imagen: p.imagen || "https://placehold.co/300x300",
      categoria: p.categoria || categorias[0],
      marca: p.marca || marcas[0],
      precios: p.precios || [{ cantidad: "unidad", precio: 1000 }],
      intensidad: p.intensidad,
      maxIntensidad: p.maxIntensidad,
      id: p.id,
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setModal(true);
  };

  const borrarProducto = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar");
    }
  };

  const removerPrecio = (index) => {
    if (form.precios.length === 1) return;
    const nuevosPrecios = form.precios.filter((_, i) => i !== index);
    setForm({ ...form, precios: nuevosPrecios });
  };

  // -----------------------
  // Manejo de archivos (upload)
  // -----------------------
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    // preview local
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // -----------------------
  // Guardar (POST/PUT)
  // -----------------------
  const guardar = async () => {
    try {
      // Si hay un file seleccionado, subirlo primero
      let imagenFinal = form.imagen;
      if (selectedFile) {
        // sube al backend y devuelve la URL pública o path
        imagenFinal = await uploadImageToBackend(selectedFile);
      }

      const payload = { ...form, imagen: imagenFinal };
      const url = editando ? `${API}/${editando}` : API;
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) {
        console.error("Error guardando producto:", data);
        return alert("Error al guardar");
      }

      await cargarProductos();
      resetForm();
      setModal(false);
    } catch (err) {
      console.error("Error en guardar:", err);
      alert("Error al guardar producto");
    }
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-700 dark:from-sky-400 dark:to-blue-500 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Gestiona tu catálogo de productos
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDark(!dark)}
              className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 dark:from-yellow-500 dark:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NUEVO PRODUCTO BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetForm();
            setModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mb-6"
        >
          <Plus size={20} />
          Nuevo Producto
        </motion.button>

        {/* TABLA */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Imagen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Precios
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {productos.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={resolveImageUrl(p.imagen)}
                        alt={p.nombre}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {p.nombre}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                        {p.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {p.marca}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {p.precios?.slice(0, 2).map((pr, i) => (
                          <div key={i} className="text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-medium">{pr.cantidad}:</span> $
                            {pr.precio.toLocaleString("es-CL")}
                          </div>
                        ))}
                        {p.precios?.length > 2 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            +{p.precios.length - 2} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => editarProducto(p)}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Edit3 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => borrarProducto(p.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          <Trash size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {productos.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No hay productos registrados
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editando ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <button
                  onClick={() => setModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Marlboro Red"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Breve descripción del producto..."
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white transition-all cursor-pointer"
                    >
                      {categorias.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Marca
                    </label>
                    <select
                      value={form.marca}
                      onChange={(e) => setForm({ ...form, marca: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white transition-all cursor-pointer"
                    >
                      {marcas.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    URL de la imagen (o sube una)
                  </label>

                  <div className="flex gap-3 items-start">
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={form.imagen}
                      onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white transition-all"
                    />

                    <div className="flex flex-col items-end gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileInputChange}
                      />
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="px-4 py-2 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-lg font-medium hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors"
                      >
                        Subir
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      <img
                        src={selectedFile ? previewUrl : resolveImageUrl(form.imagen)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedFile ? selectedFile.name : form.imagen}
                    </div>
                  </div>
                </div>

                {/* Precios */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Precios
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setForm({
                          ...form,
                          precios: [...form.precios, { cantidad: "", precio: 0 }],
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-lg text-sm font-medium hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors"
                    >
                      <Plus size={16} />
                      Agregar
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {form.precios.map((pr, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <input
                          type="text"
                          placeholder="Cantidad (ej: Unidad)"
                          value={pr.cantidad}
                          onChange={(e) => {
                            const clone = [...form.precios];
                            clone[i].cantidad = e.target.value;
                            setForm({ ...form, precios: clone });
                          }}
                          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white transition-all"
                        />

                        <input
                          type="number"
                          placeholder="Precio"
                          value={pr.precio}
                          onChange={(e) => {
                            const clone = [...form.precios];
                            clone[i].precio = Number(e.target.value);
                            setForm({ ...form, precios: clone });
                          }}
                          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white transition-all"
                        />

                        {form.precios.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removerPrecio(i)}
                            className="p-2.5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          >
                            <X size={18} />
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setModal(false)}
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={guardar}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save size={18} />
                  Guardar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
