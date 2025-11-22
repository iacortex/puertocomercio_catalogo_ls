import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://72.61.56.128";

export default function Admin() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    marca: "",
    precios: [{ cantidad: "", precio: 0 }],
    intensidad: 1,
    maxIntensidad: 5,
  });
  const [imagen, setImagen] = useState(null);

  const token = localStorage.getItem("token");

  const auth = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const cargar = async () => {
    const r = await axios.get(`${API}/productos`);
    setProductos(r.data.productos);
  };

  useEffect(() => {
    cargar();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const subirImagen = async () => {
    if (!imagen) return null;
    const fd = new FormData();
    fd.append("file", imagen);

    const { data } = await axios.post(`${API}/upload-image`, fd, auth);
    return data.ruta;
  };

  const crearProducto = async (e) => {
    e.preventDefault();

    let ruta = await subirImagen();

    const payload = {
      ...form,
      imagen: ruta || "/uploads/keenboosup.png",
    };

    await axios.post(`${API}/productos`, payload, auth);
    cargar();
    alert("Producto creado");
  };

  const borrar = async (id) => {
    await axios.delete(`${API}/productos/${id}`, auth);
    cargar();
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between">
        <h1 className="text-3xl">Panel Admin</h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Salir
        </button>
      </div>

      <form className="bg-gray-800 p-4 rounded mt-6 mb-6" onSubmit={crearProducto}>
        <h2 className="text-xl mb-4">Crear Producto</h2>

        <input
          placeholder="Nombre"
          className="w-full p-2 bg-gray-700 rounded mb-2"
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          placeholder="Descripción"
          className="w-full p-2 bg-gray-700 rounded mb-2"
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <input
          placeholder="Categoría"
          className="w-full p-2 bg-gray-700 rounded mb-2"
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        />

        <input
          placeholder="Marca"
          className="w-full p-2 bg-gray-700 rounded mb-2"
          onChange={(e) => setForm({ ...form, marca: e.target.value })}
        />

        <label className="block mt-3">Imagen:</label>
        <input
          type="file"
          className="w-full mb-4"
          onChange={(e) => setImagen(e.target.files[0])}
        />

        <button className="bg-blue-600 px-4 py-2 rounded">Crear</button>
      </form>

      <h2 className="text-2xl mb-4">Productos</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productos.map((p) => (
          <div key={p.id} className="bg-gray-800 p-4 rounded shadow">
            <img
              src={`${API}${p.imagen}`}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h3 className="text-lg font-bold">{p.nombre}</h3>
            <p className="text-sm text-gray-300">{p.descripcion}</p>

            <button
              className="bg-red-600 px-3 py-1 rounded mt-3"
              onClick={() => borrar(p.id)}
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
