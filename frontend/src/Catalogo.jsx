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

const API_URL = import.meta.env.VITE_API_URL;



console.log("API_URL =", API_URL);

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("TODAS");
  const [categoriaFiltro, setCategoriaFiltro] = useState("TODAS");
  const [dark, setDark] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Cargar productos del backend
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/productos`)
      .then((r) => r.json())
      .then((data) => {
        setProductos(data.productos || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setProductos([]);
        setLoading(false);
      });
  }, []);

  const categorias = [
    { id: "TODAS", label: "Todas", Icon: Tags },
    { id: "CIGARRILLOS", label: "Cigarrillos", Icon: Cigarette },
    { id: "TABACOS", label: "Tabacos", Icon: Leaf },
    { id: "FILTROS", label: "Filtros", Icon: Filter },
    { id: "PAPELILLOS", label: "Papelillos", Icon: Package },
    { id: "ECONOMICOS", label: "Económicos", Icon: TrendingUp },
  ];

  // Obtener marcas dinámicamente de los productos
  const marcasDisponibles = useMemo(() => {
    const marcasSet = new Set(productos.map(p => p.marca).filter(Boolean));
    return ["TODAS", ...Array.from(marcasSet).sort()];
  }, [productos]);

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      const txt = q.toLowerCase();
      const matchTxt =
        p.nombre?.toLowerCase().includes(txt) ||
        p.descripcion?.toLowerCase().includes(txt);

      const matchMarca =
        marcaFiltro === "TODAS" ||
        (p.marca || "").toUpperCase() === marcaFiltro;

      const matchCategoria =
        categoriaFiltro === "TODAS" ||
        (p.categoria || "").toUpperCase() === categoriaFiltro;

      return matchTxt && matchMarca && matchCategoria;
    });
  }, [q, marcaFiltro, categoriaFiltro, productos]);

  const formatPrice = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(n);

  const isAnyFilter = marcaFiltro !== "TODAS" || categoriaFiltro !== "TODAS";

  // Renderizar barras de intensidad
  const renderIntensidad = (intensidad, maxIntensidad = 5) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(maxIntensidad)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full ${
              i < intensidad
                ? "bg-gradient-to-r from-orange-400 to-red-500"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* HEADER MEJORADO */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
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
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDark((d) => !d)}
              className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 dark:from-yellow-500 dark:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 relative"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-900 dark:text-white placeholder-slate-500"
              placeholder="Buscar productos..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              </button>
            )}
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* DESKTOP FILTERS */}
        <div className="hidden lg:block mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category Pills */}
              <div className="flex gap-2 flex-wrap flex-1">
                {categorias.map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategoriaFiltro(c.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      categoriaFiltro === c.id
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    <c.Icon size={16} />
                    <span className="text-sm">{c.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Brand Select */}
              <select
                value={marcaFiltro}
                onChange={(e) => setMarcaFiltro(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {marcasDisponibles.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {isAnyFilter && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCategoriaFiltro("TODAS");
                    setMarcaFiltro("TODAS");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 hover:shadow-xl transition-all"
                >
                  <XCircle size={16} />
                  Limpiar
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE FILTER BUTTON */}
        <div className="lg:hidden mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileFilters(true)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-4 rounded-xl shadow-lg font-semibold"
          >
            <Filter size={20} />
            Filtros y Categorías
            {isAnyFilter && (
              <span className="bg-white text-sky-600 px-2 py-1 rounded-full text-xs font-bold">
                Activos
              </span>
            )}
          </motion.button>
        </div>

        {/* MOBILE FILTER PANEL */}
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
                className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-slate-900 z-50 overflow-y-auto shadow-2xl"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Filtros
                    </h2>
                    <button
                      onClick={() => setMobileFilters(false)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X size={24} />
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
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {isAnyFilter && (
                      <button
                        onClick={() => {
                          setCategoriaFiltro("TODAS");
                          setMarcaFiltro("TODAS");
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors"
                      >
                        <XCircle size={20} />
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
          {filtrados.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedProduct(p)}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                <img
                  src={`${API_URL}/uploads/${p.imagen}`}

                  alt={p.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x300?text=Producto";
                  }}
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                    {p.categoria}
                  </span>
                </div>
                {/* Intensidad Badge */}
                {p.intensidad && (
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-orange-500 fill-orange-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {p.intensidad}/{p.maxIntensidad || 5}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {p.nombre}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {p.descripcion || "Sin descripción disponible"}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {p.marca}
                  </span>
                </div>

                {/* Prices */}
                <div className="space-y-2">
                  {p.precios?.slice(0, 2).map((pr, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {pr.cantidad}
                      </span>
                      <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                        {formatPrice(pr.precio)}
                      </span>
                    </div>
                  ))}
                  {p.precios?.length > 2 && (
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                      +{p.precios.length - 2} precios más
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filtrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <XCircle size={20} />
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}

        {/* Product Count */}
        {filtrados.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Mostrando <span className="font-bold text-sky-600 dark:text-sky-400">{filtrados.length}</span> de{" "}
              <span className="font-bold">{productos.length}</span> productos
            </p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <img
                  src={`${API_URL}${selectedProduct.imagen}`}
                  alt={selectedProduct.nombre}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/600x400?text=Producto";
                  }}
                />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedProduct.nombre}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {selectedProduct.descripcion || "Sin descripción disponible"}
                </p>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full text-sm font-semibold">
                    {selectedProduct.categoria}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                    {selectedProduct.marca}
                  </span>
                </div>
                
                {/* Intensidad en Modal */}
                {selectedProduct.intensidad && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Intensidad del producto
                    </p>
                    {renderIntensidad(selectedProduct.intensidad, selectedProduct.maxIntensidad)}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {selectedProduct.intensidad} de {selectedProduct.maxIntensidad || 5}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Precios disponibles
                  </h3>
                  {selectedProduct.precios?.map((pr, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 rounded-xl p-4"
                    >
                      <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        {pr.cantidad}
                      </span>
                      <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                        {formatPrice(pr.precio)}
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