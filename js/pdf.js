
/* =========================================================
   CircuitLab — pdf.js
   Exportación a PDF con jsPDF + svg2pdf.js
   Expone: CircuitLab.pdf.exportar(opciones)
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     Comprobación de dependencias
     ========================================================= */

  function hayDependencias() {
    const tieneJsPDF =
      window.jspdf &&
      typeof window.jspdf.jsPDF === "function";

    const tieneSvg =
      tieneJsPDF &&
      typeof new window.jspdf.jsPDF().svg === "function";

    if (!tieneJsPDF) {
      console.error("pdf.js: falta jsPDF.");
    }

    if (!tieneSvg) {
      console.error(
        "pdf.js: jsPDF no tiene el método .svg(). " +
        "Comprueba la carga de svg2pdf.js."
      );
    }

    return Boolean(tieneJsPDF && tieneSvg);
  }

  /* =========================================================
     Utilidades
     ========================================================= */

  function fechaActual() {
    const d = new Date();
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${anio} ${hh}:${mm}`;
  }

  function fechaArchivo() {
    const d = new Date();
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${anio}-${mes}-${dia}_${hh}${mm}`;
  }

  function limpiarNombre(s) {
    return String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60);
  }

  /* =========================================================
     Paleta de colores
     ========================================================= */

  const COLOR = {
    brand:      [14, 165, 164],
    brandDark:  [11, 127, 126],
    text:       [26, 35, 50],
    textSoft:   [74, 85, 104],
    textMuted:  [138, 148, 166],
    border:     [217, 222, 231],
    bgAlt:      [238, 242, 247],
    voltage:    [37, 99, 235],
    current:    [234, 88, 12],
    resistance: [124, 58, 237],
    power:      [202, 138, 4],
    success:    [22, 163, 74],
    warning:    [217, 119, 6],
    error:      [220, 38, 38]
  };

  /* =========================================================
     Utilidades de dibujo compartidas
     Reciben explícitamente el documento jsPDF.
     ========================================================= */

  function setColor(doc, rgb) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  }

  function setDraw(doc, rgb) {
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  }

  function setFill(doc, rgb) {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  }

  /* =========================================================
     Motor de exportación
     ========================================================= */

  async function exportar(opciones = {}) {
    if (!hayDependencias()) {
      alert(
        "No se pudo cargar el módulo de PDF.\n\n" +
        "Comprueba tu conexión a internet y recarga la página."
      );
      return;
    }

    try {
      const { jsPDF } = window.jspdf;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      /* Configuración de página */

      const PAGE_W = doc.internal.pageSize.getWidth();
      const PAGE_H = doc.internal.pageSize.getHeight();
      const MARGIN = 18;
      const CONTENT_W = PAGE_W - MARGIN * 2;

      let y = MARGIN;

      function checkPageBreak(altura) {
        if (y + altura > PAGE_H - MARGIN) {
          doc.addPage();
          y = MARGIN;
        }
      }

      /* =====================================================
         CABECERA
         ===================================================== */

      setFill(doc, COLOR.brand);
      doc.rect(0, 0, PAGE_W, 24, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("CircuitLab", MARGIN, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        "Laboratorio de circuitos eléctricos",
        MARGIN,
        18
      );

      doc.setFontSize(9);
      doc.text(
        fechaActual(),
        PAGE_W - MARGIN,
        12,
        { align: "right" }
      );

      doc.setFontSize(7);
      doc.text(
        "Generado por CircuitLab v0.1",
        PAGE_W - MARGIN,
        18,
        { align: "right" }
      );

      y = 34;

      /* =====================================================
         TÍTULO Y SUBTÍTULO
         ===================================================== */

      if (opciones.titulo) {
        setColor(doc, COLOR.text);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(String(opciones.titulo), MARGIN, y);
        y += 7;
      }

      if (opciones.subtitulo) {
        setColor(doc, COLOR.textSoft);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const sub = doc.splitTextToSize(
          String(opciones.subtitulo),
          CONTENT_W
        );

        doc.text(sub, MARGIN, y);
        y += sub.length * 5 + 3;
      }

      setDraw(doc, COLOR.border);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 6;

      /* =====================================================
         DATOS DE ENTRADA
         ===================================================== */

      if (
        Array.isArray(opciones.datos) &&
        opciones.datos.length > 0
      ) {
        checkPageBreak(30);

        y = seccionTitulo(
          doc, "Datos de entrada", MARGIN, y, CONTENT_W
        );

        y = tablaDatos(
          doc, opciones.datos, MARGIN, y, CONTENT_W
        );

        y += 6;
      }

      /* =====================================================
         DIAGRAMA SVG
         ===================================================== */

      if (opciones.diagramaSVG) {
        checkPageBreak(80);

        y = seccionTitulo(
          doc, "Diagrama", MARGIN, y, CONTENT_W
        );

        y = await insertarSVG(
          doc,
          opciones.diagramaSVG,
          MARGIN,
          y,
          CONTENT_W
        );

        y += 6;
      }

      /* =====================================================
         RESULTADO PRINCIPAL
         ===================================================== */

      if (opciones.resultado) {
        checkPageBreak(30);

        y = cajaResultado(
          doc,
          opciones.resultado,
          MARGIN,
          y,
          CONTENT_W
        );

        y += 6;
      }

      /* =====================================================
         FÓRMULAS Y SUSTITUCIÓN
         ===================================================== */

      if (
        Array.isArray(opciones.formulas) &&
        opciones.formulas.length > 0
      ) {
        checkPageBreak(30);

        y = seccionTitulo(
          doc,
          "Fórmulas y sustitución",
          MARGIN,
          y,
          CONTENT_W
        );

        opciones.formulas.forEach((f) => {
          checkPageBreak(20);

          setFill(doc, COLOR.bgAlt);
          setDraw(doc, COLOR.brand);
          doc.setLineWidth(0.8);

          const formulaH = 8;

          doc.rect(
            MARGIN,
            y - 5,
            CONTENT_W,
            formulaH,
            "F"
          );

          doc.line(
            MARGIN,
            y - 5,
            MARGIN,
            y - 5 + formulaH
          );

          setColor(doc, COLOR.text);
          doc.setFont("courier", "bold");
          doc.setFontSize(11);

          doc.text(
            String(f.formula || ""),
            MARGIN + 3,
            y
          );

          y += formulaH;

          if (f.sustitucion) {
            setColor(doc, COLOR.textSoft);
            doc.setFont("courier", "normal");
            doc.setFontSize(10);

            const sustitucion = doc.splitTextToSize(
              String(f.sustitucion),
              CONTENT_W - 6
            );

            doc.text(sustitucion, MARGIN + 3, y + 2);
            y += sustitucion.length * 5 + 1;
          }

          y += 3;
        });

        y += 3;
      }

      /* =====================================================
         PROCEDIMIENTO
         ===================================================== */

      if (
        Array.isArray(opciones.pasos) &&
        opciones.pasos.length > 0
      ) {
        checkPageBreak(30);

        y = seccionTitulo(
          doc, "Procedimiento", MARGIN, y, CONTENT_W
        );

        opciones.pasos.forEach((paso, i) => {
          const texto = `${i + 1}. ${paso}`;

          const lineas = doc.splitTextToSize(
            texto,
            CONTENT_W - 4
          );

          const altura = lineas.length * 5 + 2;

          checkPageBreak(altura);

          setColor(doc, COLOR.text);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(lineas, MARGIN + 2, y);

          y += altura;
        });

        y += 4;
      }

      /* =====================================================
         VERIFICACIONES
         ===================================================== */

      if (
        Array.isArray(opciones.verificaciones) &&
        opciones.verificaciones.length > 0
      ) {
        checkPageBreak(30);

        y = seccionTitulo(
          doc, "Verificación", MARGIN, y, CONTENT_W
        );

        opciones.verificaciones.forEach((v) => {
          const color = v.ok
            ? COLOR.success
            : COLOR.warning;

          const icono = v.ok ? "OK" : "!";

          setDraw(doc, color);
          setFill(doc, [250, 250, 250]);
          doc.setLineWidth(1);

          doc.rect(
            MARGIN,
            y - 4,
            CONTENT_W,
            14,
            "F"
          );

          doc.line(
            MARGIN,
            y - 4,
            MARGIN,
            y + 10
          );

          setColor(doc, color);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(icono, MARGIN + 3, y + 2);

          setColor(doc, COLOR.text);
          doc.setFontSize(10);
          doc.text(
            String(v.titulo || ""),
            MARGIN + 14,
            y
          );

          setColor(doc, COLOR.textSoft);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);

          const det = doc.splitTextToSize(
            String(v.detalle || ""),
            CONTENT_W - 18
          );

          doc.text(det, MARGIN + 14, y + 5);

          y += Math.max(16, det.length * 4 + 7);
        });

        y += 2;
      }

      /* =====================================================
         PIE DE PÁGINA
         ===================================================== */

      const totalPaginas = doc.internal.getNumberOfPages();

      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);

        setDraw(doc, COLOR.border);
        doc.setLineWidth(0.3);

        doc.line(
          MARGIN,
          PAGE_H - 12,
          PAGE_W - MARGIN,
          PAGE_H - 12
        );

        setColor(doc, COLOR.textMuted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
          "CircuitLab · Proyecto educativo",
          MARGIN,
          PAGE_H - 7
        );

        doc.text(
          `Página ${i} de ${totalPaginas}`,
          PAGE_W - MARGIN,
          PAGE_H - 7,
          { align: "right" }
        );
      }

      /* =====================================================
         DESCARGA
         ===================================================== */

      const nombreBase = limpiarNombre(
        opciones.titulo || "Documento"
      );

      const nombre =
        `CircuitLab_${nombreBase}_${fechaArchivo()}.pdf`;

      doc.save(nombre);

    } catch (error) {
      console.error("Error al generar el PDF:", error);

      alert(
        "No se pudo generar el PDF. " +
        "Revisa la consola del navegador para ver el error."
      );

      throw error;
    }
  }

  /* =========================================================
     Helpers de maquetación
     ========================================================= */

  function seccionTitulo(doc, texto, x, y, ancho) {
    setColor(doc, COLOR.brandDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(texto.toUpperCase(), x, y);

    setDraw(doc, COLOR.border);
    doc.setLineWidth(0.3);
    doc.line(x, y + 1.5, x + ancho, y + 1.5);

    return y + 7;
  }

  function tablaDatos(doc, datos, x, y, ancho) {
    const colIzq = ancho * 0.45;

    datos.forEach((d, i) => {
      if (i % 2 === 0) {
        setFill(doc, COLOR.bgAlt);
        doc.rect(x, y - 4, ancho, 7, "F");
      }

      setColor(doc, COLOR.textSoft);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(
        String(d.etiqueta || ""),
        x + 2,
        y
      );

      setColor(doc, COLOR.text);
      doc.setFont("courier", "bold");

      const valor = doc.splitTextToSize(
        String(d.valor ?? ""),
        ancho * 0.53 - 4
      );

      doc.text(valor, x + colIzq + 2, y);

      y += Math.max(7, valor.length * 5);
    });

    return y + 2;
  }

  function cajaResultado(doc, resultado, x, y, ancho) {
    let color = COLOR.brand;

    const etiqueta = String(
      resultado.etiqueta || ""
    ).toLowerCase();

    if (etiqueta.includes("voltaje")) {
      color = COLOR.voltage;
    } else if (etiqueta.includes("corriente")) {
      color = COLOR.current;
    } else if (etiqueta.includes("resistencia")) {
      color = COLOR.resistance;
    } else if (etiqueta.includes("potencia")) {
      color = COLOR.power;
    }

    setFill(doc, color);
    doc.rect(x, y - 4, ancho, 3, "F");

    setDraw(doc, COLOR.border);
    setFill(doc, [255, 255, 255]);
    doc.setLineWidth(0.4);
    doc.rect(x, y - 1, ancho, 24, "FD");

    setColor(doc, COLOR.textMuted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      String(resultado.etiqueta || "").toUpperCase(),
      x + 4,
      y + 5
    );

    setColor(doc, color);
    doc.setFont("courier", "bold");
    doc.setFontSize(22);

    doc.text(
      String(resultado.valor ?? ""),
      x + 4,
      y + 16
    );

    if (resultado.nota) {
      setColor(doc, COLOR.textSoft);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      const nota = doc.splitTextToSize(
        String(resultado.nota),
        ancho - 8
      );

      doc.text(nota, x + 4, y + 21);
    }

    return y + 28;
  }

  /* =========================================================
     Inserción del diagrama SVG
     ========================================================= */

  async function insertarSVG(
    doc,
    svgString,
    x,
    y,
    anchoMax
  ) {
    // 1) Estilos embebidos: svg2pdf NO lee el CSS externo de la página,
    //    así que hay que inyectar los estilos directamente en el SVG.
    //    Los valores son copia en hex de las variables CSS de styles.css.
    const estilosSVG = `
      <style>
        .wire     { stroke: #2f3a4d; stroke-width: 2; fill: none; stroke-linecap: round; }
        .resistor { fill: none; stroke: #7c3aed; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
        .battery  { stroke: #2563eb; stroke-width: 2.5; stroke-linecap: round; fill: none; }
        .node     { fill: #2f3a4d; stroke: #ffffff; stroke-width: 1.5; }
        .frame    { fill: none; stroke: #d9dee7; stroke-width: 1; stroke-dasharray: 4 4; }

        .label         { fill: #1a2332; font-family: monospace; font-size: 12px; font-weight: 600; }
        .label-soft    { fill: #4a5568; font-family: monospace; font-size: 11px; }
        .label-current { fill: #ea580c; font-family: monospace; font-size: 11px; font-weight: 700; }
        .label-voltage { fill: #2563eb; font-family: monospace; font-size: 11px; font-weight: 700; }

        .current { stroke: #ea580c; stroke-width: 1.8; fill: none; stroke-linecap: round; }
        polygon.current { fill: #ea580c; stroke: none; }
      </style>
    `;

    // 2) Insertamos un fondo blanco y los estilos justo después de <svg ...>
    //    El <rect fill="#fff"> evita que svg2pdf rellene el área con negro.
    const svgPreparado = svgString
      .replace(
        /<svg([^>]*)>/,
        `<svg$1><rect width="100%" height="100%" fill="#ffffff" />${estilosSVG}`
      );

    const parser = new DOMParser();

    const svgDoc = parser.parseFromString(
      svgPreparado,
      "image/svg+xml"
    );

    if (
      svgDoc.querySelector("parsererror") ||
      !svgDoc.documentElement ||
      svgDoc.documentElement.tagName.toLowerCase() !== "svg"
    ) {
      console.warn("El diagrama SVG no es válido.");
      return y;
    }

    const svgEl = svgDoc.documentElement;

    let vbW = 400;
    let vbH = 200;

    if (svgEl.hasAttribute("viewBox")) {
      const vb = svgEl
        .getAttribute("viewBox")
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      if (
        vb.length === 4 &&
        vb.every(Number.isFinite) &&
        vb[2] > 0 &&
        vb[3] > 0
      ) {
        vbW = vb[2];
        vbH = vb[3];
      }
    }

    const proporcion = vbH / vbW;
    const anchoFinal = anchoMax;
    const altoFinal = Math.min(
      anchoFinal * proporcion,
      100
    );

    setDraw(doc, COLOR.border);
    setFill(doc, [255, 255, 255]);
    doc.setLineWidth(0.4);

    doc.rect(
      x,
      y - 2,
      anchoFinal,
      altoFinal + 8,
      "FD"
    );

    try {
      await doc.svg(svgEl, {
        x: x + 2,
        y: y + 2,
        width: anchoFinal - 4,
        height: altoFinal
      });
    } catch (err) {
      console.warn(
        "No se pudo insertar el SVG en el PDF:",
        err
      );

      setColor(doc, COLOR.textMuted);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);

      doc.text(
        "(Diagrama no disponible)",
        x + 4,
        y + altoFinal / 2
      );
    }

    return y + altoFinal + 10;
  }

  /* =========================================================
     Exponer el módulo
     ========================================================= */

  window.CircuitLab = window.CircuitLab || {};

  window.CircuitLab.pdf = {
    exportar,
    hayDependencias
  };

  console.log(
    "CircuitLab · pdf.js cargado correctamente."
  );

})();
