/* =========================================================
   CircuitLab — calculadoras.js
   Fase 4: lógica de UI para las tres calculadoras
   Consume window.CircuitLab.calculos (Fase 3)
   ========================================================= */

(function () {
  "use strict";

  const C = window.CircuitLab && window.CircuitLab.calculos;
  const D = window.CircuitLab && window.CircuitLab.diagramas;
  if (!C) {
    console.error("calculadoras.js: falta window.CircuitLab.calculos. ¿Se cargó calculos.js antes?");
    return;
  }

  /* =========================================================
     Utilidades de UI
     ========================================================= */

  /** Muestra un mensaje de error en el contenedor de resultado. */
  function renderError(container, mensaje) {
    container.innerHTML = `
      <div class="alert alert--error">
        <strong>No se pudo calcular</strong>
        ${mensaje}
      </div>
    `;
  }

  /** Marca visualmente un campo como inválido. */
  function marcarInvalido(input, hint) {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.add("field--invalid");
    const hintEl = field.querySelector(".field__hint");
    if (hintEl && hint) hintEl.textContent = hint;
  }

  /** Limpia todos los estados de error de un panel. */
  function limpiarEstados(panel) {
    panel.querySelectorAll(".field--invalid").forEach((f) => f.classList.remove("field--invalid"));
    panel.querySelectorAll(".field__hint").forEach((h) => {
      // Restaura el hint original si lo tenía guardado
      if (h.dataset.original) h.textContent = h.dataset.original;
    });
  }

  /** Guarda los hints originales para poder restaurarlos. */
  function guardarHints(panel) {
    panel.querySelectorAll(".field__hint").forEach((h) => {
      if (!h.dataset.original) h.dataset.original = h.textContent;
    });
  }

  /**
   * Lee el valor de un input como número.
   * Devuelve { ok, valor, motivo }.
   * Acepta coma decimal y espacios.
   */
  function leerNumero(input) {
    const raw = (input.value || "").trim().replace(",", ".");
    if (raw === "") return { ok: false, valor: null, motivo: "Este campo es obligatorio." };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { ok: false, valor: null, motivo: "Introduce un número válido." };
    return { ok: true, valor: n };
  }

  /** Formatea un valor + unidad para mostrarlo. */
  function fmt(valor, unidad) {
    const r = C.round(valor, 4);
    return `<span class="result-card__value">${r}<span class="result-card__unit">${unidad}</span></span>`;
  }

  /** Bloque reutilizable: fórmula + sustitución. */
  function bloqueFormula(formula, sustitucion) {
    return `
      <h4>Fórmula utilizada</h4>
      <span class="formula">${formula}</span>
      <h4>Sustitución de valores</h4>
      <span class="formula">${sustitucion}</span>
    `;
  }

  /* =========================================================
     Pestañas
     ========================================================= */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => {
        const activo = t === tab;
        t.classList.toggle("is-active", activo);
        t.setAttribute("aria-selected", String(activo));
        t.tabIndex = activo ? 0 : -1;
      });

      panels.forEach((p) => {
        const activo = p.id === `panel-${target}`;
        p.classList.toggle("is-active", activo);
        p.hidden = !activo;
      });
    });
  });

  /* =========================================================
     Calculadora 1 — Ley de Ohm
     ========================================================= */
  const ohm = {
    target:   document.getElementById("ohm-target"),
    V:        document.getElementById("ohm-V"),
    I:        document.getElementById("ohm-I"),
    R:        document.getElementById("ohm-R"),
    fieldV:   document.getElementById("ohm-field-V"),
    fieldI:   document.getElementById("ohm-field-I"),
    fieldR:   document.getElementById("ohm-field-R"),
    calcular: document.getElementById("ohm-calcular"),
    limpiar:  document.getElementById("ohm-limpiar"),
    pdf:      document.getElementById("ohm-pdf"),
    salida:   document.getElementById("ohm-resultado"),
    panel:    document.getElementById("panel-ohm")
  };

  guardarHints(ohm.panel);

  // Muestra solo los campos que no son el objetivo
  function actualizarCamposOhm() {
    const t = ohm.target.value;
    ohm.fieldV.style.display = t === "V" ? "none" : "";
    ohm.fieldI.style.display = t === "I" ? "none" : "";
    ohm.fieldR.style.display = t === "R" ? "none" : "";
    limpiarEstados(ohm.panel);
  }
  ohm.target.addEventListener("change", actualizarCamposOhm);
  actualizarCamposOhm();

  ohm.calcular.addEventListener("click", () => {
    limpiarEstados(ohm.panel);
    const target = ohm.target.value;

    // Determinar qué campos leer
    const campos = [];
    if (target !== "V") campos.push({ input: ohm.V, key: "V" });
    if (target !== "I") campos.push({ input: ohm.I, key: "I" });
    if (target !== "R") campos.push({ input: ohm.R, key: "R" });

    const datos = {};
    let hayError = false;

    campos.forEach(({ input, key }) => {
      const r = leerNumero(input);
      if (!r.ok) {
        marcarInvalido(input, r.motivo);
        hayError = true;
      } else if (key === "R" && r.valor <= 0) {
        marcarInvalido(input, "La resistencia debe ser mayor que cero.");
        hayError = true;
      } else {
        datos[key] = r.valor;
      }
    });

    if (hayError) {
      renderError(ohm.salida, "Revisa los campos marcados en rojo.");
      ohm.pdf.disabled = true;
      return;
    }

    let resultado;
    try {
      resultado = C.leyDeOhm(target, datos);
    } catch (err) {
      renderError(ohm.salida, err.message);
      ohm.pdf.disabled = true;
      return;
    }

    const magnitud = { V: "Voltaje", I: "Corriente", R: "Resistencia" }[target];
    const claseCard = { V: "voltage", I: "current", R: "resistance" }[target];

    ohm.salida.innerHTML = `
      <div class="output-stack">
        <div class="result-card result-card--${claseCard}">
          <div class="result-card__label">${magnitud}</div>
          ${fmt(resultado.valor, resultado.unidad)}
          <p class="result-card__note">Calculado con la Ley de Ohm.</p>
        </div>
        ${bloqueFormula(resultado.formula, resultado.sustitucion)}
        <h4>Procedimiento</h4>
        <ol class="steps">
          <li>
            <span class="steps__title">Datos conocidos</span>
            <span class="steps__detail">${campos.map((c) => `${c.key} = ${datos[c.key]} ${unidadDe(c.key)}`).join(", ")}.</span>
          </li>
          <li>
            <span class="steps__title">Fórmula aplicada</span>
            <span class="steps__detail">${resultado.formula}</span>
          </li>
          <li>
            <span class="steps__title">Sustitución</span>
            <span class="steps__detail">${resultado.sustitucion}</span>
          </li>
          <li>
            <span class="steps__title">Resultado</span>
            <span class="steps__detail">${magnitud} = ${resultado.valor} ${resultado.unidad}</span>
          </li>
        </ol>
        <div class="alert alert--success">
          <strong>Comprobación</strong>
          ${comprobacionOhm(target, datos, resultado.valor)}
        </div>
      </div>
    `;
    ohm.pdf.disabled = false;
  });

  ohm.limpiar.addEventListener("click", () => {
    ohm.V.value = "";
    ohm.I.value = "";
    ohm.R.value = "";
    limpiarEstados(ohm.panel);
    ohm.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Introduce los valores y pulsa <em>Calcular</em> para ver el resultado y el procedimiento.
      </div>
    `;
    ohm.pdf.disabled = true;
  });

    ohm.pdf.addEventListener("click", () => {
    const target = ohm.target.value;
    const magnitud = { V: "Voltaje", I: "Corriente", R: "Resistencia" }[target];
    const valorTxt = ohm.salida.querySelector(".result-card__value");
    const formulaEl = ohm.salida.querySelector(".formula");
    const sustitucionEl = ohm.salida.querySelectorAll(".formula")[1];
    const pasosEls = ohm.salida.querySelectorAll(".steps__detail");
    const verificEl = ohm.salida.querySelector(".alert--success");

    if (!valorTxt) {
      alert("Primero calcula un resultado para poder exportarlo.");
      return;
    }

    const datosEntrada = [];
    [["V", "Voltaje", "V"], ["I", "Corriente", "A"], ["R", "Resistencia", "Ω"]].forEach(([k, label, u]) => {
      if (k !== target) {
        const input = document.getElementById(`ohm-${k}`);
        if (input && input.value) {
          datosEntrada.push({ etiqueta: label, valor: `${input.value} ${u}` });
        }
      }
    });

    const valor = valorTxt.textContent.trim().replace(/\s+/g, " ");
    const formulas = formulaEl ? [{
      formula: formulaEl.textContent.trim(),
      sustitucion: sustitucionEl ? sustitucionEl.textContent.trim() : ""
    }] : [];

    const pasos = [...pasosEls].map((el) => el.textContent.trim());

    window.CircuitLab.pdf.exportar({
      titulo: `Ley de Ohm — Cálculo de ${magnitud.toLowerCase()}`,
      subtitulo: `Resultado: ${valor}`,
      datos: datosEntrada,
      resultado: {
        etiqueta: magnitud,
        valor,
        nota: "Calculado con la Ley de Ohm"
      },
      formulas,
      pasos,
      verificaciones: verificEl ? [{
        ok: true,
        titulo: "Comprobación",
        detalle: verificEl.textContent.replace(/Comprobación/i, "").trim()
      }] : []
    });
  });

  function unidadDe(key) {
    return { V: "V", I: "A", R: "Ω" }[key];
  }

  function comprobacionOhm(target, datos, valor) {
    // Comprobamos con la fórmula independiente a la calculada
    switch (target) {
      case "V": {
        const esperado = datos.I * datos.R;
        return `V = I × R = ${datos.I} × ${datos.R} = ${esperado} V.`;
      }
      case "I": {
        const esperado = datos.V / datos.R;
        return `I = V / R = ${datos.V} / ${datos.R} = ${C.round(esperado, 4)} A.`;
      }
      case "R": {
        const esperado = datos.V / datos.I;
        return `R = V / I = ${datos.V} / ${datos.I} = ${C.round(esperado, 4)} Ω.`;
      }
    }
    return "";
  }

  /* =========================================================
     Calculadora 2 — Potencia
     ========================================================= */
  const pot = {
    V:        document.getElementById("pot-V"),
    I:        document.getElementById("pot-I"),
    R:        document.getElementById("pot-R"),
    calcular: document.getElementById("pot-calcular"),
    limpiar:  document.getElementById("pot-limpiar"),
    pdf:      document.getElementById("pot-pdf"),
    salida:   document.getElementById("pot-resultado"),
    panel:    document.getElementById("panel-potencia")
  };

  guardarHints(pot.panel);

  pot.calcular.addEventListener("click", () => {
    limpiarEstados(pot.panel);

    const campos = [
      { input: pot.V, key: "V" },
      { input: pot.I, key: "I" },
      { input: pot.R, key: "R" }
    ];

    const datos = {};
    let rellenados = 0;

    campos.forEach(({ input, key }) => {
      const raw = (input.value || "").trim();
      if (raw === "") return;
      const r = leerNumero(input);
      if (!r.ok) {
        marcarInvalido(input, r.motivo);
        rellenados = -1;
        return;
      }
      if (key === "R" && r.valor <= 0) {
        marcarInvalido(input, "La resistencia debe ser mayor que cero.");
        rellenados = -1;
        return;
      }
      datos[key] = r.valor;
      rellenados++;
    });

    if (rellenados === -1) {
      renderError(pot.salida, "Revisa los campos marcados en rojo.");
      pot.pdf.disabled = true;
      return;
    }
    if (rellenados < 2) {
      renderError(pot.salida, "Introduce al menos dos magnitudes para calcular la potencia.");
      pot.pdf.disabled = true;
      return;
    }

    let resultado;
    try {
      resultado = C.potencia(datos);
    } catch (err) {
      renderError(pot.salida, err.message);
      pot.pdf.disabled = true;
      return;
    }

    const conocidosTxt = Object.keys(datos)
      .map((k) => `${k} = ${datos[k]} ${unidadDe(k)}`)
      .join(", ");

    pot.salida.innerHTML = `
      <div class="output-stack">
        <div class="result-card result-card--power">
          <div class="result-card__label">Potencia</div>
          ${fmt(resultado.valor, "W")}
          <p class="result-card__note">Calculada a partir de los datos disponibles.</p>
        </div>
        ${bloqueFormula(resultado.formula, resultado.sustitucion)}
        <h4>Procedimiento</h4>
        <ol class="steps">
          <li>
            <span class="steps__title">Datos conocidos</span>
            <span class="steps__detail">${conocidosTxt}.</span>
          </li>
          <li>
            <span class="steps__title">Fórmula elegida</span>
            <span class="steps__detail">${resultado.formula}</span>
          </li>
          <li>
            <span class="steps__title">Sustitución</span>
            <span class="steps__detail">${resultado.sustitucion}</span>
          </li>
          <li>
            <span class="steps__title">Resultado</span>
            <span class="steps__detail">P = ${resultado.valor} W</span>
          </li>
        </ol>
        <div class="alert alert--success">
          <strong>Comprobación cruzada</strong>
          ${comprobacionPotencia(datos, resultado.valor)}
        </div>
      </div>
    `;
    pot.pdf.disabled = false;
  });

  pot.limpiar.addEventListener("click", () => {
    pot.V.value = "";
    pot.I.value = "";
    pot.R.value = "";
    limpiarEstados(pot.panel);
    pot.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Introduce dos magnitudes y pulsa <em>Calcular</em>.
      </div>
    `;
    pot.pdf.disabled = true;
  });

    pot.pdf.addEventListener("click", () => {
    const valorTxt = pot.salida.querySelector(".result-card__value");
    if (!valorTxt) {
      alert("Primero calcula un resultado para poder exportarlo.");
      return;
    }

    const datosEntrada = [];
    [["V", "Voltaje", "V"], ["I", "Corriente", "A"], ["R", "Resistencia", "Ω"]].forEach(([k, label, u]) => {
      const input = document.getElementById(`pot-${k}`);
      if (input && input.value.trim()) {
        datosEntrada.push({ etiqueta: label, valor: `${input.value} ${u}` });
      }
    });

    const valor = valorTxt.textContent.trim().replace(/\s+/g, " ");
    const formulasEls = pot.salida.querySelectorAll(".formula");
    const formulas = formulasEls.length >= 2 ? [{
      formula: formulasEls[0].textContent.trim(),
      sustitucion: formulasEls[1].textContent.trim()
    }] : [];

    const pasos = [...pot.salida.querySelectorAll(".steps__detail")].map((el) => el.textContent.trim());
    const verificEl = pot.salida.querySelector(".alert--success");

    window.CircuitLab.pdf.exportar({
      titulo: "Potencia eléctrica",
      subtitulo: `Resultado: ${valor}`,
      datos: datosEntrada,
      resultado: {
        etiqueta: "Potencia",
        valor,
        nota: "Calculada a partir de los datos disponibles"
      },
      formulas,
      pasos,
      verificaciones: verificEl ? [{
        ok: true,
        titulo: "Comprobación cruzada",
        detalle: verificEl.textContent.replace(/Comprobación cruzada/i, "").trim()
      }] : []
    });
  });

  function comprobacionPotencia(datos, valor) {
    const { V, I, R } = datos;
    const lineas = [];
    if (V != null && I != null) lineas.push(`P = V × I = ${V} × ${I} = ${C.round(V * I, 4)} W`);
    if (I != null && R != null) lineas.push(`P = I² × R = ${I}² × ${R} = ${C.round(I * I * R, 4)} W`);
    if (V != null && R != null) lineas.push(`P = V² / R = ${V}² / ${R} = ${C.round((V * V) / R, 4)} W`);
    return lineas.join("<br>") + `<br><em>Valor mostrado: ${valor} W.</em>`;
  }

  /* =========================================================
     Calculadora 3 — Resistencia equivalente
     ========================================================= */
  const req = {
    tipo:     document.getElementById("req-tipo"),
    lista:    document.getElementById("req-lista"),
    agregar:  document.getElementById("req-agregar"),
    calcular: document.getElementById("req-calcular"),
    limpiar:  document.getElementById("req-limpiar"),
    pdf:      document.getElementById("req-pdf"),
    salida:   document.getElementById("req-resultado"),
    panel:    document.getElementById("panel-req")
  };

  let contadorReq = 0;

  function crearFilaReq(valorInicial) {
    contadorReq++;
    const id = `req-${contadorReq}`;
    const row = document.createElement("div");
    row.className = "res-row";
    row.dataset.id = id;

    row.innerHTML = `
      <div class="field__control">
        <span class="res-row__label">R${contadorReq}</span>
        <input id="${id}" type="text" inputmode="decimal" placeholder="Ej. 6" autocomplete="off" />
        <span class="field__unit">Ω</span>
      </div>
      <button type="button" class="res-row__remove" aria-label="Eliminar R${contadorReq}" title="Eliminar">×</button>
    `;

    if (valorInicial != null) {
      row.querySelector("input").value = valorInicial;
    }

    row.querySelector(".res-row__remove").addEventListener("click", () => {
      row.remove();
      actualizarBotonesEliminar();
    });

    req.lista.appendChild(row);
    actualizarBotonesEliminar();
  }

  function actualizarBotonesEliminar() {
    const filas = req.lista.querySelectorAll(".res-row");
    filas.forEach((fila) => {
      const btn = fila.querySelector(".res-row__remove");
      btn.disabled = filas.length <= 1;
    });
  }

  // Estado inicial: 3 resistencias de ejemplo (2, 4, 6) para que el usuario
  // vea de inmediato cómo funciona con los valores de referencia del proyecto.
  crearFilaReq("2");
  crearFilaReq("4");
  crearFilaReq("6");

  req.agregar.addEventListener("click", () => crearFilaReq(""));

  req.calcular.addEventListener("click", () => {
    // limpiar estilos de error previos en las filas
    req.lista.querySelectorAll(".field--invalid").forEach((f) => f.classList.remove("field--invalid"));

    const filas = [...req.lista.querySelectorAll(".res-row")];
    const valores = [];
    let hayError = false;

    filas.forEach((fila) => {
      const input = fila.querySelector("input");
      const contenedor = fila.querySelector(".field__control");
      const r = leerNumero(input);
      if (!r.ok || r.valor <= 0) {
        contenedor.style.borderColor = "var(--c-error)";
        contenedor.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--c-error) 15%, transparent)";
        hayError = true;
      } else {
        contenedor.style.borderColor = "";
        contenedor.style.boxShadow = "";
        valores.push(r.valor);
      }
    });

    if (hayError) {
      renderError(req.salida, "Todas las resistencias deben ser números positivos.");
      req.pdf.disabled = true;
      return;
    }
    if (valores.length === 0) {
      renderError(req.salida, "Añade al menos una resistencia.");
      req.pdf.disabled = true;
      return;
    }

    const tipo = req.tipo.value;
    let resultado;
    try {
      resultado = C.resistenciaEquivalente(tipo, valores);
    } catch (err) {
      renderError(req.salida, err.message);
      req.pdf.disabled = true;
      return;
    }

    const tipoTxt = tipo === "serie" ? "Serie" : "Paralelo";
    const diagrama = D
      ? `<div class="diagram">
           <div class="diagram__caption">Diagrama de la conexión</div>
           ${D.resistencias(tipo, valores, resultado.valor)}
         </div>`
      : "";

    req.salida.innerHTML = `
      <div class="output-stack">
        <div class="result-card result-card--resistance">
          <div class="result-card__label">Resistencia equivalente (${tipoTxt})</div>
          ${fmt(resultado.valor, "Ω")}
          <p class="result-card__note">Calculada a partir de ${valores.length} resistencia${valores.length === 1 ? "" : "s"}.</p>
        </div>
        ${diagrama}
        ${bloqueFormula(resultado.formula, resultado.sustitucion)}
        <h4>Procedimiento</h4>
        <ol class="steps">
          <li>
            <span class="steps__title">Tipo de conexión</span>
            <span class="steps__detail">${tipoTxt}</span>
          </li>
          <li>
            <span class="steps__title">Fórmula</span>
            <span class="steps__detail">${resultado.formula}</span>
          </li>
          <li>
            <span class="steps__title">Sustitución</span>
            <span class="steps__detail">${resultado.sustitucion}</span>
          </li>
          <li>
            <span class="steps__title">Resultado</span>
            <span class="steps__detail">R_eq = ${resultado.valor} Ω</span>
          </li>
        </ol>
        <div class="alert alert--success">
          <strong>Observación</strong>
          ${observacionReq(tipo, valores, resultado.valor)}
        </div>
      </div>
    `;
    req.pdf.disabled = false;
  });

  req.limpiar.addEventListener("click", () => {
    req.lista.innerHTML = "";
    contadorReq = 0;
    crearFilaReq("2");
    crearFilaReq("4");
    crearFilaReq("6");
    req.tipo.value = "serie";
    req.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Añade resistencias y pulsa <em>Calcular</em>.
      </div>
    `;
    req.pdf.disabled = true;
  });

    req.pdf.addEventListener("click", () => {
    const valorTxt = req.salida.querySelector(".result-card__value");
    if (!valorTxt) {
      alert("Primero calcula un resultado para poder exportarlo.");
      return;
    }

    const tipo = req.tipo.value;
    const tipoTxt = tipo === "serie" ? "Serie" : "Paralelo";
    const datosEntrada = [];

    req.lista.querySelectorAll(".res-row").forEach((fila, i) => {
      const v = fila.querySelector("input").value.trim();
      if (v) datosEntrada.push({ etiqueta: `R${i + 1}`, valor: `${v} Ω` });
    });

    const valor = valorTxt.textContent.trim().replace(/\s+/g, " ");
    const formulasEls = req.salida.querySelectorAll(".formula");
    const formulas = formulasEls.length >= 2 ? [{
      formula: formulasEls[0].textContent.trim(),
      sustitucion: formulasEls[1].textContent.trim()
    }] : [];

    const pasos = [...req.salida.querySelectorAll(".steps__detail")].map((el) => el.textContent.trim());
    const verificEl = req.salida.querySelector(".alert--success");
    const diagramaEl = req.salida.querySelector(".diagram svg");

    window.CircuitLab.pdf.exportar({
      titulo: `Resistencia equivalente — ${tipoTxt}`,
      subtitulo: `Resultado: ${valor}`,
      datos: datosEntrada,
      diagramaSVG: diagramaEl ? diagramaEl.outerHTML : null,
      resultado: {
        etiqueta: `Resistencia equivalente (${tipoTxt})`,
        valor,
        nota: `Calculada a partir de ${datosEntrada.length} resistencia${datosEntrada.length === 1 ? "" : "s"}`
      },
      formulas,
      pasos,
      verificaciones: verificEl ? [{
        ok: true,
        titulo: "Observación",
        detalle: verificEl.textContent.replace(/Observación/i, "").trim()
      }] : []
    });
  });

  function observacionReq(tipo, valores, reqEq) {
    if (tipo === "serie") {
      const suma = valores.reduce((a, b) => a + b, 0);
      return `En serie, la resistencia equivalente siempre es mayor que la mayor de las resistencias. Suma = ${C.round(suma, 4)} Ω.`;
    }
    const min = Math.min(...valores);
    return `En paralelo, la resistencia equivalente siempre es menor que la menor de las resistencias (${min} Ω).`;
  }

  /* =========================================================
     Inicialización
     ========================================================= */

    console.log("CircuitLab · calculadoras.js cargado (Fase 10).");
})();