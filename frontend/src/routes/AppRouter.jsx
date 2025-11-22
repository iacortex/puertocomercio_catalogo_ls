import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalogo from "../pages/Catalogo";
import Login from "../pages/Login";
import AdminPanel from "../pages/AdminPanel";
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLICO */}
        <Route path="/" element={<Catalogo />} />

        {/* LOGIN ADMIN */}
        <Route path="/admin/login" element={<Login />} />

        {/* ADMIN PROTEGIDO */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
