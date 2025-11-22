import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://72.61.56.128";

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const token = localStorage.getItem("token");

  const auth = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const cargarProductos = async () => {
    const res = await axios.get(`${API}/productos`);
    setProductos(res.data.productos);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl">Panel Admin</h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Salir
        </button>
      </div>

      <h2 className="text-xl mb-3">Productos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productos.map(p => (
          <div key={p.id} className="p-3 bg-gray-800 rounded">
            <img
              src={`${API}${p.imagen}`}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="font-bold mt-2">{p.nombre}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
