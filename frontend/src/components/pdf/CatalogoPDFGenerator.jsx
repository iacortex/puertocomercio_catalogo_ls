import React, { useMemo, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ⭐ PORTADA ULTRA PREMIUM CON DEGRADADOS, EFECTOS Y DISEÑO
async function drawPremiumCover(pdf, portadaUrl, title, subtitle) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Fondo degradado vertical estilo premium
  const gradient = pdf.context2d.createLinearGradient(0, 0, 0, pageHeight);
  gradient.addColorStop(0, "#001f3f");
  gradient.addColorStop(0.5, "#0d3c61");
  gradient.addColorStop(1, "#001e2f");
  pdf.context2d.fillStyle = gradient;
  pdf.context2d.fillRect(0, 0, pageWidth, pageHeight);

  // Imagen de portada centrada
  if (portadaUrl) {
    try {
      const img = await fetchImageAsDataURL(portadaUrl);
      const imgWidth = pageWidth * 0.85;
      const imgHeight = (imgWidth * 12) / 9;
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = 25;

      pdf.addImage(img, "PNG", imgX, imgY, imgWidth, imgHeight, "", "FAST");
    } catch (err) {
      console.log("Error cargando portada", err);
    }
  }

  // Capa glass suave
  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new pdf.GState({ opacity: 0.08 }));
  pdf.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 10, 10, "F");
  pdf.setGState(new pdf.GState({ opacity: 1 }));

  // TÍTULO grande con sombra
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, pageWidth / 2 + 1, 250 + 1, { align: "center" });
  pdf.setTextColor("#ffe680");
  pdf.text(title, pageWidth / 2, 250, { align: "center" });

  // SUBTÍTULO elegante
  pdf.setFontSize(15);
  pdf.setTextColor("#ffffffcc");
  pdf.text(subtitle, pageWidth / 2, 268, { align: "center" });

  // AÑO 2025 estilo dorado
  pdf.setFontSize(56);
  pdf.setTextColor("#ffd700");
  pdf.text("2025", pageWidth / 2, 310, { align: "center" });

  // Línea elegante bajo el año
  pdf.setDrawColor("#ffaa00");
  pdf.setLineWidth(0.8);
  pdf.line(pageWidth / 2 - 30, 318, pageWidth / 2 + 30, 318);
}

async function fetchImageAsDataURL(url) {
  try {
    // Crear un proxy para evitar problemas de CORS
    const proxyUrl = url.startsWith('http') ? url : window.location.origin + url;
    
    const res = await fetch(proxyUrl, { 
      mode: "cors",
      cache: "no-cache"
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Error fetching image:", err);
    // Retornar imagen placeholder en base64
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  }
}

async function ensureImagesLoaded(node) {
  const imgs = node.querySelectorAll("img");
  return Promise.all(
    [...imgs].map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) return resolve();
          img.onload = img.onerror = () => resolve();
          // Timeout de seguridad
          setTimeout(resolve, 3000);
        })
    )
  );
}

export default function CatalogoPDFGenerator({
  products = [],
  portadaUrl = "/keenboosup.png",
  title = "PUERTO COMERCIO",
  subtitle = "Catálogo Premium — Edición 2025",
}) {
  const hiddenRef = useRef(null);

  // Productos por página estilo revista
  const itemsPerPage = 6;
  const pages = useMemo(() => {
    const arr = [];
    for (let i = 0; i < products.length; i += itemsPerPage) {
      arr.push(products.slice(i, i + itemsPerPage));
    }
    return arr.length ? arr : [[]];
  }, [products]);

  async function generatePDF() {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // ⭐ 1. PORTADA PREMIUM
      await drawPremiumCover(pdf, portadaUrl, title, subtitle);

      pdf.addPage();

      // ⭐ 2. ÍNDICE
      pdf.setFontSize(22);
      pdf.setTextColor("#333");
      pdf.text("Índice", 15, 20);

      const categories = {};
      products.forEach((p) => {
        const cat = p.categoria || "Otros";
        categories[cat] = (categories[cat] || 0) + 1;
      });

      let y = 40;
      pdf.setFontSize(13);
      pdf.setTextColor("#444");

      Object.keys(categories).forEach((c) => {
        pdf.text(`• ${c} (${categories[c]})`, 20, y);
        y += 8;
      });

      pdf.addPage();

      // ⭐ 3. PÁGINAS DE PRODUCTOS (HTML → PDF)
      const hidden = hiddenRef.current;
      if (!hidden) {
        throw new Error("Elemento oculto no encontrado");
      }

      hidden.style.display = "block";
      hidden.style.position = "fixed";
      hidden.style.left = "-9999px";
      hidden.style.top = "0";

      const nodes = hidden.children;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Esperar a que las imágenes carguen
        await ensureImagesLoaded(node);

        const canvas = await html2canvas(node, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 15000,
        });

        const img = canvas.toDataURL("image/png");
        pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);

        if (i < nodes.length - 1) pdf.addPage();
      }

      hidden.style.display = "none";

      pdf.save("catalogo_puerto_comercio_premium.pdf");
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF. Por favor intenta nuevamente.");
    }
  }

  return (
    <>
      <button
        onClick={generatePDF}
        className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg hover:scale-105 transition"
      >
        📘 Descargar PDF Premium
      </button>

      {/* Contenido HTML oculto para html2canvas */}
      <div ref={hiddenRef} style={{ display: "none" }}>
        {pages.map((pageItems, index) => (
          <div
            key={index}
            style={{
              width: "794px",
              height: "1123px",
              background: "#ffffff",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 0 20px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0a3d62",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                flex: 1,
              }}
            >
              {pageItems.map((p, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid #e2e2e2",
                    background:
                      "linear-gradient(145deg, #ffffff, #f6f8fa, #ffffff)",
                    boxShadow:
                      "4px 4px 12px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,1)",
                    display: "flex",
                    gap: "14px",
                  }}
                >
                  <img
                    src={p.imagen || "https://placehold.co/300x300?text=Producto"}
                    crossOrigin="anonymous"
                    style={{
                      width: "42%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/300x300?text=Producto";
                    }}
                  />

                  <div style={{ width: "58%" }}>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>
                      {p.nombre}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "#555",
                        marginTop: "6px",
                      }}
                    >
                      {p.descripcion}
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        fontWeight: 800,
                        color: "#0089a7",
                        fontSize: "15px",
                      }}
                    >
                      {p?.precios?.[0]?.precio || ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#999",
              }}
            >
              Página {index + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
