import React, { useState, useEffect } from "react";
import { uploadImage } from "./lib/uploadImage";

export default function ProductModal({ open, onClose, onSave, product }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    marca: "",
    categoria: "",
    imagen: "",
    precios: []
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (product) {
      setForm(product);
      setPreview(product.imagen || "");
    }
  }, [product]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    let imageURL = form.imagen;

    if (file) {
      imageURL = await uploadImage(file);
    }

    onSave({ ...form, imagen: imageURL });
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 999
    }}>
      
      <div style={{
        width: 420,
        background: "#fff",
        padding: 25,
        borderRadius: 12
      }}>
        
        <h2>{product ? "Editar producto" : "Nuevo producto"}</h2>

        {/* Imagen + Preview */}
        <label style={{ display: "block", marginTop: 15, fontWeight: 600 }}>
          Imagen
        </label>
        <input type="file" accept="image/*" onChange={handleImage} />

        {preview && (
          <img 
            src={preview}
            alt=""
            style={{
              marginTop: 10,
              width: "100%",
              height: 180,
              objectFit: "contain",
              borderRadius: 12,
              border: "1px solid #ddd"
            }}
          />
        )}

        {/* Campos */}
        <label style={{ marginTop: 15, display: "block" }}>Nombre</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <label style={{ marginTop: 15, display: "block" }}>Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <label style={{ marginTop: 15, display: "block" }}>Marca</label>
        <input
          name="marca"
          value={form.marca}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <label style={{ marginTop: 15, display: "block" }}>Categoría</label>
        <input
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
        />

        {/* Botones */}
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{ marginRight: 10, padding: "8px 16px" }}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            style={{
              background: "#0ea5e9",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
