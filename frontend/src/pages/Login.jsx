import { useState } from "react";
import api from "../../api/axios";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const { data } = await api.post("/auth/login", {
        username: user,
        password: pass,
      });

      localStorage.setItem("token", data.access_token);
      window.location.href = "/admin";
    } catch (e) {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login Admin</h1>
      <input
        placeholder="Usuario"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      /><br/><br/>

      <input
        placeholder="Contraseña"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      /><br/><br/>

      <button onClick={login}>Ingresar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
