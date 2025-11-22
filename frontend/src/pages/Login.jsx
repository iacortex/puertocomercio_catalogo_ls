import { useState } from "react";
import axios from "axios";

const API = "http://72.61.56.128";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      if (data.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={login} className="w-80 bg-gray-800 p-6 rounded-xl">
        <h1 className="text-2xl mb-4 text-center">Puerto Comercio Admin</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-700 mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 rounded bg-gray-700 mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 w-full p-2 rounded mt-3 hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}
