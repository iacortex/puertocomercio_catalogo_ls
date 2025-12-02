// CatalogoPDFGenerator.jsx
import React, { useMemo, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * CatalogoPDFGenerator
 * Props:
 *  - products: array de productos (mismo objeto que usas en Catalogo.jsx)
 *  - logoUrl: url del logo a usar en portada (puede ser /logo.png si lo copias a /public)
 *  - title: título de portada
 *  - subtitle: subtítulo de portada
 *
 * Uso:
 * <CatalogoPDFGenerator products={filtrados} logoUrl="/logo.png" title="Puerto Comercio" />
 */

export default function CatalogoPDFGenerator({
  products = [],
  logoUrl = "/logo.png",
  title = "PUERTO COMERCIO",
  subtitle = "Catálogo 2025 — Edición Premium",
}) {
  const hiddenRef = useRef(null);

  // Agrupar productos por página: 2 columnas x 3 filas = 6 por página (ajustable)
  const itemsPerPage = 6;
  const pages = useMemo(() => {
    const arr = [];
    for (let i = 0; i < products.length; i += itemsPerPage) {
      arr.push(products.slice(i, i + itemsPerPage));
    }
    // si no hay productos aún, crea al menos una página vacía
    return arr.length ? arr : [[]];
  }, [products]);

  // Helper para forzar que imágenes carguen con crossOrigin para html2canvas
  // (recomendado: servir imágenes con Access-Control-Allow-Origin: *)
  const makeImgTag = (src, alt = "") =>
    `<img src="${src}" alt="${alt}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" crossorigin="anonymous" />`;

  async function generatePDF() {
    // A4 en mm
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // --- PORTADA ---
    // Diseño portada con jsPDF (texto + logo)
    try {
      // fondo sutil
      pdf.setFillColor(245, 247, 250);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // logo (si existe) lo intentamos poner en la portada
      if (logoUrl) {
        // usamos html2canvas para capturar logo si es necesario; pero jsPDF puede cargar dataURL.
        try {
          const logoCanvas = await html2canvas(document.querySelector(`#pdf-logo-demo`) || document.body, {
            backgroundColor: null,
            useCORS: true,
          });
          // no útil si no hay un nodo; ignoramos
        } catch (e) {
          // no fatal
        }
      }

      // Título grande
      pdf.setFontSize(28);
      pdf.setTextColor(22, 33, 62);
      pdf.text(title, pageWidth / 2, 60, { align: "center" });

      pdf.setFontSize(14);
      pdf.setTextColor(80, 90, 110);
      pdf.text(subtitle, pageWidth / 2, 76, { align: "center" });

      // fecha
      pdf.setFontSize(10);
      const fecha = new Date().toLocaleDateString();
      pdf.text(`Generado: ${fecha}`, pageWidth - 10, pageHeight - 10, { align: "right" });

      // Add small logo bottom-left if exists (we'll try to draw image by loading it)
      if (logoUrl) {
        try {
          const logoImg = await fetchImageAsDataURL(logoUrl);
          const logoW = 30; // mm
          const logoH = (logoW * 50) / 50; // proporción aproximada
          pdf.addImage(logoImg, "PNG", 12, pageHeight - 12 - logoH, logoW, logoH);
        } catch (err) {
          // ignore if logo fails
        }
      }

      pdf.addPage();
    } catch (err) {
      console.error("Error portada PDF:", err);
    }

    // --- ÍNDICE (opcional) ---
    pdf.setFontSize(16);
    pdf.setTextColor(20, 30, 60);
    pdf.text("Índice", 15, 20);

    // simple índice: categorias / cuenta (puedes ajustar)
    const categories = {};
    products.forEach((p) => {
      const cat = (p?.categoria || "Otros").toString();
      categories[cat] = (categories[cat] || 0) + 1;
    });

    pdf.setFontSize(11);
    let yIndex = 30;
    Object.keys(categories).forEach((c) => {
      pdf.text(`• ${c} (${categories[c]})`, 18, yIndex);
      yIndex += 7;
      if (yIndex > pageHeight - 20) {
        pdf.addPage();
        yIndex = 20;
      }
    });

    pdf.addPage();

    // --- PÁGINAS DE PRODUCTOS ---
    // Usamos un contenedor DOM (hidden but visible off-screen) con cada "page" pre-renderizada
    // y luego capturamos cada página con html2canvas (mejor calidad que capturar todo de una).
    const hidden = hiddenRef.current;
    if (!hidden) {
      alert("Error interno: contenedor invisible no encontrado");
      return;
    }

    // Forzamos que esté visible fuera de pantalla para html2canvas:
    hidden.style.position = "fixed";
    hidden.style.left = "-10000px";
    hidden.style.top = "0";
    hidden.style.zIndex = "-1000";
    hidden.style.display = "block";

    try {
      // Recorremos cada página (cada hijo del contenedor hidden)
      const pageNodes = Array.from(hidden.children);
      for (let i = 0; i < pageNodes.length; i++) {
        const node = pageNodes[i];
        // Esperar que imágenes carguen
        await ensureImagesLoaded(node);

        const canvas = await html2canvas(node, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: null });
        const imgData = canvas.toDataURL("image/png");

        // ajustar imagen en pdf manteniendo proporción
        const imgProps = pdf.getImageProperties(imgData);
        const imgWmm = pageWidth;
        const imgHmm = (imgProps.height * imgWmm) / imgProps.width;

        // si es la primera página del bloque, ya estamos en una página nueva, si no agregamos
        // Nota: ya añadimos varias páginas (portada, indice). Simplemente agregamos imagen y página siguiente
        pdf.addImage(imgData, "PNG", 0, 0, imgWmm, imgHmm);
        if (i < pageNodes.length - 1) {
          pdf.addPage();
        }
      }
    } catch (err) {
      console.error("Error generando páginas de productos:", err);
    } finally {
      // ocultar el container de nuevo
      hidden.style.display = "none";
    }

    // Guardar
    pdf.save("catalogo_puerto_comercio_revista.pdf");
  }

  // ayuda: convertir imagen a dataURL
  async function fetchImageAsDataURL(url) {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // espera que todas las imágenes dentro de un nodo hayan cargado
  function ensureImagesLoaded(node) {
    const imgs = Array.from(node.querySelectorAll("img"));
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = img.onerror = () => resolve();
          })
      )
    );
  }

  // --- RENDER: hidden pages offscreen + botón ---
  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={generatePDF}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
        >
          📄 Descargar Catálogo (Revista)
        </button>
      </div>

      {/* Hidden (off-screen) container with preformatted pages */}
      <div
        ref={hiddenRef}
        id="catalogo-pdf-hidden"
        style={{ display: "none" }} /* se mostrará temporalmente en generatePDF */
      >
        {/* portada sucia — la portada ya la hacemos con jsPDF, pero dejamos una previsualización */}
        {/* Páginas de productos: cada hijo corresponde a 1 página A4 renderable */}
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className="pdf-page"
            style={{
              width: "794px", // A4 @ 96dpi ≈ 794 x 1123
              height: "1123px",
              boxSizing: "border-box",
              padding: "36px",
              background: "white",
              color: "#111827",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {/* Header de la página */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{title}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Grid de productos (2 cols x 3 filas) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginTop: "8px",
                flex: 1,
              }}
            >
              {pageItems.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #e6eef6",
                    alignItems: "stretch",
                    background: "#ffffff",
                  }}
                >
                  <div style={{ width: "42%", height: "100px", borderRadius: 8, overflow: "hidden" }}>
                    <img
                      src={p?.imagen ? `${p.imagen.startsWith("http") ? p.imagen : p.imagen}` : "/placeholder.png"}
                      alt={p?.nombre || ""}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div style={{ width: "58%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                        {p?.nombre || "Sin nombre"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: 6, minHeight: 36 }}>
                        {p?.descripcion ? (p.descripcion.length > 120 ? p.descripcion.slice(0, 120) + "..." : p.descripcion) : "Sin descripción"}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0ea5a9" }}>
                        {p?.precios && Array.isArray(p.precios) && p.precios[0] ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Number(p.precios[0].precio || 0)) : ""}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>{p?.marca || ""}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Relleno si la página tiene menos items */}
              {Array.from({ length: itemsPerPage - pageItems.length }).map((_, j) => (
                <div key={"empty-" + j} style={{ visibility: "hidden" }} />
              ))}
            </div>

            {/* Footer con numeración */}
            <div style={{ textAlign: "center", fontSize: "10px", color: "#9ca3af", marginTop: 8 }}>
              Página {pageIndex + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
