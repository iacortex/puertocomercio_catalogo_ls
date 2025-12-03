// Catalogo.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Moon,
  Sun,
  XCircle,
  Filter,
  Cigarette,
  Leaf,
  Package,
  Tags,
  ShoppingBag,
  TrendingUp,
  X,
  Star,
} from "lucide-react";

// ** NUEVO - Import del generador de PDF (estilo premium glossy) **
import CatalogoPDFGenerator from "../components/pdf/CatalogoPDFGenerator";

/**
 * Catalogo.jsx
 * - Recupera productos de `${API_URL}/productos`
 * - Soporta búsqueda, filtros por marca y categoría
 * - Muestra cards, modal con detalle y panel mobile de filtros
 * - Protecciones para evitar `.map`/`.toLowerCase` sobre undefined
 */

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Catalogo() {
  // --- STATE ---
  const [productos, setProductos] = useState([]); // arreglo seguro
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); // búsqueda (siempre string)
  const [marcaFiltro, setMarcaFiltro] = useState("TODAS");
  const [categoriaFiltro, setCategoriaFiltro] = useState("TODAS");
  const [dark, setDark] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- EFFECT: dark class toggle ---
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", dark);
    } catch (e) {
      // no-op en entornos sin DOM (seguridad)
    }
  }, [dark]);

  // --- FETCH productos ---
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // protección: si API_URL vacío, evitamos fetch y dejamos vacío
    if (!API_URL) {
      console.warn("VITE_API_URL no definido. Usando array vacío de productos.");
      setProductos([]);
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/productos`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        // Backend puede devolver directamente [] o { productos: [...] }
        const list = Array.isArray(data) ? data : data?.productos ?? [];
        setProductos(list);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setProductos([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // --- CATEGORÍAS (constantes) ---
  const categorias = [
    { id: "TODAS", label: "Todas", Icon: Tags },
    { id: "CIGARRILLOS", label: "Cigarrillos", Icon: Cigarette },
    { id: "TABACOS", label: "Tabacos", Icon: Leaf },
    { id: "FILTROS", label: "Filtros", Icon: Filter },
    { id: "PAPELILLOS", label: "Papelillos", Icon: Package },
    { id: "ECONOMICOS", label: "Económicos", Icon: TrendingUp },
  ];

  // --- Marcas dinámicas extraídas de productos ---
  const marcasDisponibles = useMemo(() => {
    const setMarcas = new Set();
    productos.forEach((p) => {
      if (p?.marca) setMarcas.add(String(p.marca).toUpperCase());
    });
    return ["TODAS", ...Array.from(setMarcas).sort()];
  }, [productos]);

  // --- Filtrado seguro de productos ---
  const filtrados = useMemo(() => {
    const txt = String(q || "").toLowerCase();
    return (productos || []).filter((p) => {
      // seguridad: p puede ser null/undefined
      if (!p) return false;

      const nombre = String(p.nombre || "").toLowerCase();
      const descripcion = String(p.descripcion || "").toLowerCase();

      const matchTxt =
        txt === "" || nombre.includes(txt) || descripcion.includes(txt);

      const matchMarca =
        marcaFiltro === "TODAS" ||
        String(p.marca || "").toUpperCase() === String(marcaFiltro);

      const matchCategoria =
        categoriaFiltro === "TODAS" ||
        String(p.categoria || "").toUpperCase() === String(categoriaFiltro);

      return matchTxt && matchMarca && matchCategoria;
    });
  }, [q, marcaFiltro, categoriaFiltro, productos]);

  // --- Formateo de precio ---
  const formatPrice = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(Number(n || 0));

  const isAnyFilter = marcaFiltro !== "TODAS" || categoriaFiltro !== "TODAS";

  // --- Render intensidad (barras) ---
  const renderIntensidad = (intensidad = 0, maxIntensidad = 5) => {
    const max = Number(maxIntensidad) || 5;
    const val = Math.max(0, Math.min(max, Number(intensidad || 0)));
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full ${
              i < val
                ? "bg-gradient-to-r from-orange-400 to-red-500"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  // --- NEW: Preparo lista para PDF (imagen -> URL absoluta si corresponde) ---
  const productsForPdf = useMemo(() => {
    return (filtrados || []).map((p) => {
      const imagenRaw = p?.imagen || "";
      // Si ya es una URL absoluta, la usamos, si no la convertimos a la ruta del backend
      const imagenUrl =
        imagenRaw && (String(imagenRaw).startsWith("http") || String(imagenRaw).startsWith("data:"))
          ? imagenRaw
          : imagenRaw
          ? `${API_URL.replace(/\/$/, "")}/uploads/${imagenRaw}`
          : "";
      return { ...p, imagen: imagenUrl };
    });
  }, [filtrados]);

  // --- Loading UI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  // --- Main render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-700 dark:from-sky-400 dark:to-blue-500 bg-clip-text text-transparent">
                Puerto Comercio
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
                {productos.length} productos disponibles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* =========================
                Aquí agregué el botón PDF (premium glossy)
                - CatalogoPDFGenerator incluye el botón y el contenido oculto para html2canvas
               ========================= */}
            <CatalogoPDFGenerator
              products={productsForPdf}
              logoUrl="/keenboosup.png"
              title="PUERTO COMERCIO"
              subtitle="Catálogo 2025 — Edición Premium"
            />

            <button
              onClick={() => setDark((d) => !d)}
              className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 dark:from-yellow-500 dark:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>

            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-900 dark:text-white placeholder-slate-500"
            />

            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                aria-label="Limpiar búsqueda"
              >
                <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop filters */}
        <div className="hidden lg:block mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category pills */}
              <div className="flex gap-2 flex-wrap flex-1">
                {categorias.map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCategoriaFiltro(c.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      categoriaFiltro === c.id
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    <c.Icon size={16} />
                    <span className="text-sm">{c.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Brands select */}
              <select
                value={marcaFiltro}
                onChange={(e) => setMarcaFiltro(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {marcasDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Clear */}
              {isAnyFilter && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCategoriaFiltro("TODAS");
                    setMarcaFiltro("TODAS");
                    setQ("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg"
                >
                  <XCircle size={16} />
                  Limpiar
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filters button */}
        <div className="lg:hidden mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setMobileFilters(true)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-4 rounded-xl shadow-lg font-semibold"
          >
            <Filter size={18} />
            Filtros y Categorías
            {isAnyFilter && (
              <span className="bg-white text-sky-600 px-2 py-1 rounded-full text-xs font-bold ml-2">
                Activos
              </span>
            )}
          </motion.button>
        </div>

        {/* Mobile filter panel */}
        <AnimatePresence>
          {mobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFilters(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-slate-900 z-50 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Filtros
                    </h2>
                    <button
                      onClick={() => setMobileFilters(false)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Cerrar filtros"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                      Categorías
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categorias.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCategoriaFiltro(c.id)}
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            categoriaFiltro === c.id
                              ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-600"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <c.Icon size={24} />
                          <span className="text-sm font-medium">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                      Marcas
                    </h3>
                    <select
                      value={marcaFiltro}
                      onChange={(e) => setMarcaFiltro(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {marcasDisponibles.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {isAnyFilter && (
                      <button
                        onClick={() => {
                          setCategoriaFiltro("TODAS");
                          setMarcaFiltro("TODAS");
                          setQ("");
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold"
                      >
                        <XCircle size={18} />
                        Limpiar filtros
                      </button>
                    )}

                    <button
                      onClick={() => setMobileFilters(false)}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg"
                    >
                      Ver {filtrados.length} productos
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(filtrados || []).map((p, idx) => (
            <motion.div
              key={p?.id ?? idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedProduct(p)}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer transition-all duration-300 group"
            >
              {/* Image area */}
              <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                <img
                  src={p?.imagen ? `${API_URL}/uploads/${p.imagen}` : "https://placehold.co/600x400?text=Producto"}
                  alt={p?.nombre ?? "Producto"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/300x300?text=Producto";
                  }}
                />

                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                    {p?.categoria ?? "—"}
                  </span>
                </div>

                {p?.intensidad != null && (
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-orange-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {p.intensidad}/{p?.maxIntensidad ?? 5}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {p?.nombre ?? "Sin nombre"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {p?.descripcion ?? "Sin descripción disponible"}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {p?.marca ?? "—"}
                  </span>
                </div>

                {/* Prices */}
                <div className="space-y-2">
                  {Array.isArray(p?.precios) && p.precios.slice(0, 2).map((pr, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {pr?.cantidad ?? ""}
                      </span>
                      <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                        {formatPrice(pr?.precio)}
                      </span>
                    </div>
                  ))}

                  {Array.isArray(p?.precios) && p.precios.length > 2 && (
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                      +{p.precios.length - 2} precios más
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filtrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Intenta ajustar los filtros o realizar otra búsqueda
            </p>

            {isAnyFilter && (
              <button
                onClick={() => {
                  setCategoriaFiltro("TODAS");
                  setMarcaFiltro("TODAS");
                  setQ("");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg"
              >
                <XCircle size={18} />
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}

        {/* Product counter */}
        {filtrados.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Mostrando{" "}
              <span className="font-bold text-sky-600 dark:text-sky-400">
                {filtrados.length}
              </span>{" "}
              de <span className="font-bold">{productos.length}</span> productos
            </p>
          </div>
        )}
      </div>

      {/* Product detail modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <img
                  src={
                    selectedProduct?.imagen
                      ? `${API_URL}/uploads/${selectedProduct.imagen}`
                      : "https://placehold.co/600x400?text=Producto"
                  }
                  alt={selectedProduct?.nombre ?? "Producto"}
                  className="w-full h-64 object-cover rounded-t-2xl"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400?text=Producto";
                  }}
                />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedProduct?.nombre}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {selectedProduct?.descripcion ?? "Sin descripción disponible"}
                </p>

                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full text-sm font-semibold">
                    {selectedProduct?.categoria ?? "—"}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                    {selectedProduct?.marca ?? "—"}
                  </span>
                </div>

                {/* Intensidad */}
                {selectedProduct?.intensidad != null && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Intensidad del producto
                    </p>
                    {renderIntensidad(selectedProduct.intensidad, selectedProduct.maxIntensidad)}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {selectedProduct.intensidad} de {selectedProduct?.maxIntensidad ?? 5}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Precios disponibles
                  </h3>
                  {Array.isArray(selectedProduct?.precios) && selectedProduct.precios.map((pr, i) => (
                    <div key={i} className="flex justify-between items-center bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 rounded-xl p-4">
                      <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        {pr?.cantidad}
                      </span>
                      <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                        {formatPrice(pr?.precio)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
