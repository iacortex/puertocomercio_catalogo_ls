import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminPanel from "./AdminPanel"; // si lo tienes en src/ directo
import Login from "./pages/Login";
import PrivateRoute from "./router/PrivateRoute";
import Catalogo from "./pages/Catalogo"; // si tienes la página catálogo

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={Catalogo ? <Catalogo /> : <div>Catálogo</div>} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
