import { NavLink } from "react-router-dom";
import { Home, Package, Tags, Users, Settings } from "lucide-react";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", icon: <Home size={20} />, to: "/" },
    { name: "Productos", icon: <Package size={20} />, to: "/productos" },
    { name: "Categorias", icon: <Tags size={20} />, to: "/categorias" },
    { name: "Usuarios", icon: <Users size={20} />, to: "/usuarios" },
    { name: "Configuración", icon: <Settings size={20} />, to: "/configuracion" },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 shadow-sm">
      <div className="p-5 font-bold text-xl border-b">Admin</div>

      <nav className="p-3 flex flex-col gap-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-md transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
