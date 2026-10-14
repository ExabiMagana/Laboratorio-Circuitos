(function () {
  "use strict";

  const C = window.CircuitLab && window.CircuitLab.calculos;
  const D = window.CircuitLab && window.CircuitLab.diagramas;
  if (!C || !D) {
    console.error("analisis.js: faltan calculos.js o diagramas.js.");
    return;
  }

  /* Utilidades */

  function leerNumero(input) {
    const raw = (input.value || "").trim().replace(",", ".");
    if (raw === "") return { ok: false, motivo: "Este campo es obligatorio." };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { ok: false, motivo: "Introduce un número válido." };
    return { ok: true, valor: n };
  }

  function renderError(container, mensaje) {
    container.innerHTML = `
      <div class="alert alert--error">
        <strong>No se pudo calcular</strong>
        ${mensaje}
      </div>
    `;
  }

  function fmt(v, u) {
    const n = C.round(v, 4);
    return `${n}${u ? " " + u : ""}`;
  }

    function exportarAnalisis(tipoTxt, datosEntrada, r, salidaEl) {
    const valorTxt = salidaEl.querySelector(".summary-tile__value");
    const formulas = [...salidaEl.querySelectorAll(".formula")].slice(0, 4).map((el) => ({
      formula: el.textContent.trim(), sustitucion: ""
    }));
    const pasos = [...salidaEl.querySelectorAll(".steps__detail")].map((el) => el.textContent.trim());
    const diagramaEl = salidaEl.querySelector(".diagram svg");

    // Reconstruir verificaciones desde el DOM
    const verificaciones = [...salidaEl.querySelectorAll(".verify-item")].map((v) => ({
      ok: v.classList.contains("verify-item--ok"),
      titulo: v.querySelector(".verify-item__title")?.textContent.trim() || "",
      detalle: v.querySelector(".verify-item__detail")?.textContent.trim() || ""
    }));

    window.CircuitLab.pdf.exportar({
      titulo: `Análisis — Circuito ${tipoTxt}`,
      subtitulo: `R_eq = ${r.Req} Ω · I_total = ${r.Itotal} A · P_total = ${r.Ptotal} W`,
      datos: datosEntrada,
      diagramaSVG: diagramaEl ? diagramaEl.outerHTML : null,
      resultado: {
        etiqueta: "Resumen",
        valor: `Req = ${r.Req} Ω`,
        nota: `V = ${r.fuente} V · I = ${r.Itotal} A · P = ${r.Ptotal} W`
      },
      formulas,
      pasos,
      verificaciones
    });
  }

  function tablaComponentes(componentes, totales) {
    const filas = componentes.map((c) => `
      <tr>
        <td>${c.nombre}</td>
        <td class="numeric">${fmt(c.R, "Ω")}</td>
        <td class="numeric">${fmt(c.V, "V")}</td>
        <td class="numeric">${fmt(c.I, "A")}</td>
        <td class="numeric">${fmt(c.P, "W")}</td>
      </tr>
    `).join("");

    const filaTotal = totales ? `
      <tfoot>
        <tr>
          <td>Total</td>
          <td class="numeric">${fmt(totales.R, "Ω")}</td>
          <td class="numeric">${fmt(totales.V, "V")}</td>
          <td class="numeric">${fmt(totales.I, "A")}</td>
          <td class="numeric">${fmt(totales.P, "W")}</td>
        </tr>
      </tfoot>
    ` : "";

    return `
      <table class="data-table">
        <caption>Resultados por componente</caption>
        <thead>
          <tr>
            <th scope="col">Componente</th>
            <th scope="col" class="numeric">R</th>
            <th scope="col" class="numeric">V</th>
            <th scope="col" class="numeric">I</th>
            <th scope="col" class="numeric">P</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
        ${filaTotal}
      </table>
    `;
  }

  function verificacion(items) {
    const lis = items.map((it) => `
      <div class="verify-item verify-item--${it.ok ? "ok" : "warn"}">
        <span class="verify-item__icon">${it.ok ? "✔" : "!"}</span>
        <div class="verify-item__body">
          <span class="verify-item__title">${it.titulo}</span>
          <span class="verify-item__detail">${it.detalle}</span>
        </div>
      </div>
    `).join("");
    return `<div class="verify-list">${lis}</div>`;
  }

  function summaryTile(label, valor, unidad, tipo) {
    return `
      <div class="summary-tile summary-tile--${tipo}">
        <div class="summary-tile__label">${label}</div>
        <div class="summary-tile__value">${C.round(valor, 4)}<span class="summary-tile__unit">${unidad}</span></div>
      </div>
    `;
  }

  /* Pestañas */
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

  /* Lista dinámica genérica */
  function crearGestorLista(contenedor, botonAgregar, prefijo, valoresIniciales) {
    let contador = 0;

    function crearFila(valor) {
      contador++;
      const idx = contador;
      const row = document.createElement("div");
      row.className = "res-row";
      row.dataset.id = `${prefijo}-${idx}`;
      row.innerHTML = `
        <div class="field__control">
          <span class="res-row__label">${prefijo}${idx}</span>
          <input type="text" inputmode="decimal" placeholder="Ej. 6" autocomplete="off" />
          <span class="field__unit">Ω</span>
        </div>
        <button type="button" class="res-row__remove" aria-label="Eliminar" title="Eliminar">×</button>
      `;
      if (valor != null) row.querySelector("input").value = valor;
      row.querySelector(".res-row__remove").addEventListener("click", () => {
        row.remove();
        actualizarBotones();
      });
      contenedor.appendChild(row);
      actualizarBotones();
    }

    function actualizarBotones() {
      const filas = contenedor.querySelectorAll(".res-row");
      filas.forEach((f) => {
        f.querySelector(".res-row__remove").disabled = filas.length <= 1;
      });
    }

    (valoresIniciales || []).forEach((v) => crearFila(v));

    botonAgregar.addEventListener("click", () => crearFila(""));

    return {
      limpiar(valores) {
        contenedor.innerHTML = "";
        contador = 0;
        valores.forEach((v) => crearFila(v));
      },
      leerValores() {
        const filas = [...contenedor.querySelectorAll(".res-row")];
        const valores = [];
        let error = false;
        filas.forEach((fila) => {
          const input = fila.querySelector("input");
          const contenedorControl = fila.querySelector(".field__control");
          const r = leerNumero(input);
          if (!r.ok || r.valor <= 0) {
            contenedorControl.style.borderColor = "var(--c-error)";
            contenedorControl.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--c-error) 15%, transparent)";
            error = true;
          } else {
            contenedorControl.style.borderColor = "";
            contenedorControl.style.boxShadow = "";
            valores.push(r.valor);
          }
        });
        return error ? null : valores;
      },
      limpiarEstilos() {
        contenedor.querySelectorAll(".field__control").forEach((c) => {
          c.style.borderColor = "";
          c.style.boxShadow = "";
        });
      }
    };
  }

  /* Serie */
  const serie = {
    panel:    document.getElementById("panel-serie"),
    fuente:   document.getElementById("serie-fuente"),
    listaEl:  document.getElementById("serie-lista"),
    agregar:  document.getElementById("serie-agregar"),
    calcular: document.getElementById("serie-calcular"),
    limpiar:  document.getElementById("serie-limpiar"),
    pdf:      document.getElementById("serie-pdf"),
    salida:   document.getElementById("serie-resultado")
  };

  const gestorSerie = crearGestorLista(serie.listaEl, serie.agregar, "R", [2, 4]);

  serie.calcular.addEventListener("click", () => {
    gestorSerie.limpiarEstilos();

    const f = leerNumero(serie.fuente);
    if (!f.ok || f.valor <= 0) {
      serie.fuente.closest(".field").classList.add("field--invalid");
      renderError(serie.salida, "El voltaje de la fuente debe ser un número positivo.");
      serie.pdf.disabled = true;
      return;
    }
    serie.fuente.closest(".field").classList.remove("field--invalid");

    const resistencias = gestorSerie.leerValores();
    if (!resistencias) {
      renderError(serie.salida, "Todas las resistencias deben ser números positivos.");
      serie.pdf.disabled = true;
      return;
    }

    let r;
    try {
      r = C.circuitoSerie(f.valor, resistencias);
    } catch (err) {
      renderError(serie.salida, err.message);
      serie.pdf.disabled = true;
      return;
    }

    const sumaV = r.componentes.reduce((a, c) => a + c.V, 0);
    const sumaP = r.componentes.reduce((a, c) => a + c.P, 0);
    const kvlOK = Math.abs(sumaV - r.fuente) < 1e-6;
    const balanceOK = Math.abs(sumaP - r.Ptotal) < 1e-6;

    const salida = `
      <div class="analysis-output">

        <div class="summary-grid">
          ${summaryTile("R equivalente", r.Req, "Ω", "resist")}
          ${summaryTile("V fuente", r.fuente, "V", "voltage")}
          ${summaryTile("I total", r.Itotal, "A", "current")}
          ${summaryTile("P total", r.Ptotal, "W", "power")}
        </div>

        <div class="diagram">
          <div class="diagram__caption">Diagrama del circuito</div>
          ${D.serie(r)}
        </div>

        <h3>Fórmula de la resistencia equivalente</h3>
        <span class="formula">${r.procedimiento.reqFormula}</span>
        <span class="formula">${r.procedimiento.reqSustitucion} = ${r.Req} Ω</span>

        <h3>Corriente total</h3>
        <span class="formula">${r.procedimiento.corrienteFormula}</span>
        <span class="formula">${r.procedimiento.corrienteSustitucion} = ${r.Itotal} A</span>

        <h3>Procedimiento</h3>
        <ol class="steps">
          <li>
            <span class="steps__title">Resistencia equivalente</span>
            <span class="steps__detail">${r.procedimiento.reqSustitucion} = ${r.Req} Ω</span>
          </li>
          <li>
            <span class="steps__title">Corriente total (común a todos)</span>
            <span class="steps__detail">I = V / R_eq = ${r.fuente} / ${r.Req} = ${r.Itotal} A</span>
          </li>
          ${r.componentes.map((c) => `
            <li>
              <span class="steps__title">${c.nombre} · V = I × R</span>
              <span class="steps__detail">V = ${r.Itotal} × ${c.R} = ${c.V} V · P = V × I = ${c.V} × ${c.I} = ${c.P} W</span>
            </li>
          `).join("")}
        </ol>

        ${tablaComponentes(r.componentes, {
          R: r.Req, V: r.fuente, I: r.Itotal, P: r.Ptotal
        })}

        <h3>Verificación</h3>
        ${verificacion([
          {
            ok: kvlOK,
            titulo: "Segunda ley de Kirchhoff (malla)",
            detalle: `Σ V_i = ${C.round(sumaV, 4)} V · V_fuente = ${r.fuente} V`
          },
          {
            ok: balanceOK,
            titulo: "Balance de potencia",
            detalle: `P_fuente = ${r.Ptotal} W · Σ P_i = ${C.round(sumaP, 4)} W`
          }
        ])}

      </div>
    `;

    serie.salida.innerHTML = salida;
    serie.pdf.disabled = false;
  });

  serie.limpiar.addEventListener("click", () => {
    serie.fuente.value = "12";
    serie.fuente.closest(".field").classList.remove("field--invalid");
    gestorSerie.limpiar([2, 4]);
    serie.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Introduce los valores y pulsa <em>Calcular</em>.
      </div>
    `;
    serie.pdf.disabled = true;
  });

    serie.pdf.addEventListener("click", () => {
    const datosEntrada = [{ etiqueta: "Fuente", valor: `${serie.fuente.value} V` }];
    serie.listaEl.querySelectorAll(".res-row").forEach((fila, i) => {
      const v = fila.querySelector("input").value.trim();
      if (v) datosEntrada.push({ etiqueta: `R${i + 1}`, valor: `${v} Ω` });
    });
    const f = Number(serie.fuente.value.replace(",", "."));
    const resistencias = [...serie.listaEl.querySelectorAll("input")].map((i) => Number(i.value.replace(",", ".")));
    try {
      const r = C.circuitoSerie(f, resistencias);
      exportarAnalisis("serie", datosEntrada, r, serie.salida);
    } catch (err) {
      alert("No se puede exportar: " + err.message);
    }
  });

  /* Paralelo */
  const paralelo = {
    panel:    document.getElementById("panel-paralelo"),
    fuente:   document.getElementById("paralelo-fuente"),
    listaEl:  document.getElementById("paralelo-lista"),
    agregar:  document.getElementById("paralelo-agregar"),
    calcular: document.getElementById("paralelo-calcular"),
    limpiar:  document.getElementById("paralelo-limpiar"),
    pdf:      document.getElementById("paralelo-pdf"),
    salida:   document.getElementById("paralelo-resultado")
  };

  const gestorParalelo = crearGestorLista(paralelo.listaEl, paralelo.agregar, "R", [6, 12]);

  paralelo.calcular.addEventListener("click", () => {
    gestorParalelo.limpiarEstilos();

    const f = leerNumero(paralelo.fuente);
    if (!f.ok || f.valor <= 0) {
      paralelo.fuente.closest(".field").classList.add("field--invalid");
      renderError(paralelo.salida, "El voltaje de la fuente debe ser un número positivo.");
      paralelo.pdf.disabled = true;
      return;
    }
    paralelo.fuente.closest(".field").classList.remove("field--invalid");

    const resistencias = gestorParalelo.leerValores();
    if (!resistencias) {
      renderError(paralelo.salida, "Todas las resistencias deben ser números positivos.");
      paralelo.pdf.disabled = true;
      return;
    }

    let r;
    try {
      r = C.circuitoParalelo(f.valor, resistencias);
    } catch (err) {
      renderError(paralelo.salida, err.message);
      paralelo.pdf.disabled = true;
      return;
    }

    const sumaI = r.componentes.reduce((a, c) => a + c.I, 0);
    const sumaP = r.componentes.reduce((a, c) => a + c.P, 0);
    const kclOK = Math.abs(sumaI - r.Itotal) < 1e-6;
    const balanceOK = Math.abs(sumaP - r.Ptotal) < 1e-6;

    const salida = `
      <div class="analysis-output">

        <div class="summary-grid">
          ${summaryTile("R equivalente", r.Req, "Ω", "resist")}
          ${summaryTile("V fuente", r.fuente, "V", "voltage")}
          ${summaryTile("I total", r.Itotal, "A", "current")}
          ${summaryTile("P total", r.Ptotal, "W", "power")}
        </div>

        <div class="diagram">
          <div class="diagram__caption">Diagrama del circuito</div>
          ${D.paralelo(r)}
        </div>

        <h3>Fórmula de la resistencia equivalente</h3>
        <span class="formula">${r.procedimiento.reqFormula}</span>
        <span class="formula">${r.procedimiento.reqSustitucion} → R_eq = ${r.Req} Ω</span>

        <h3>Corriente total</h3>
        <span class="formula">${r.procedimiento.corrienteFormula}</span>
        <span class="formula">${r.procedimiento.corrienteSustitucion} = ${r.Itotal} A</span>

        <h3>Procedimiento</h3>
        <ol class="steps">
          <li>
            <span class="steps__title">Resistencia equivalente (paralelo)</span>
            <span class="steps__detail">${r.procedimiento.reqSustitucion} → R_eq = ${r.Req} Ω</span>
          </li>
          <li>
            <span class="steps__title">Voltaje común</span>
            <span class="steps__detail">Todos los componentes están al voltaje de la fuente: ${r.fuente} V</span>
          </li>
          ${r.componentes.map((c) => `
            <li>
              <span class="steps__title">${c.nombre} · I = V / R</span>
              <span class="steps__detail">I = ${r.fuente} / ${c.R} = ${c.I} A · P = ${c.P} W</span>
            </li>
          `).join("")}
          <li>
            <span class="steps__title">Corriente total</span>
            <span class="steps__detail">I_total = Σ I_i = ${r.Itotal} A</span>
          </li>
        </ol>

        ${tablaComponentes(r.componentes, {
          R: r.Req, V: r.fuente, I: r.Itotal, P: r.Ptotal
        })}

        <h3>Verificación</h3>
        ${verificacion([
          {
            ok: kclOK,
            titulo: "Primera ley de Kirchhoff (nodo)",
            detalle: `Σ I_ramas = ${C.round(sumaI, 4)} A · I_total = ${r.Itotal} A`
          },
          {
            ok: balanceOK,
            titulo: "Balance de potencia",
            detalle: `P_fuente = ${r.Ptotal} W · Σ P_i = ${C.round(sumaP, 4)} W`
          }
        ])}

      </div>
    `;

    paralelo.salida.innerHTML = salida;
    paralelo.pdf.disabled = false;
  });

  paralelo.limpiar.addEventListener("click", () => {
    paralelo.fuente.value = "12";
    paralelo.fuente.closest(".field").classList.remove("field--invalid");
    gestorParalelo.limpiar([6, 12]);
    paralelo.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Introduce los valores y pulsa <em>Calcular</em>.
      </div>
    `;
    paralelo.pdf.disabled = true;
  });

    paralelo.pdf.addEventListener("click", () => {
    const datosEntrada = [{ etiqueta: "Fuente", valor: `${paralelo.fuente.value} V` }];
    paralelo.listaEl.querySelectorAll(".res-row").forEach((fila, i) => {
      const v = fila.querySelector("input").value.trim();
      if (v) datosEntrada.push({ etiqueta: `R${i + 1}`, valor: `${v} Ω` });
    });
    const f = Number(paralelo.fuente.value.replace(",", "."));
    const resistencias = [...paralelo.listaEl.querySelectorAll("input")].map((i) => Number(i.value.replace(",", ".")));
    try {
      const r = C.circuitoParalelo(f, resistencias);
      exportarAnalisis("paralelo", datosEntrada, r, paralelo.salida);
    } catch (err) {
      alert("No se puede exportar: " + err.message);
    }
  });

  /* Mixto */
  const mixto = {
    panel:     document.getElementById("panel-mixto"),
    topologia: document.getElementById("mixto-topologia"),
    fuente:    document.getElementById("mixto-fuente"),
    listaEl:   document.getElementById("mixto-lista"),
    hint:      document.getElementById("mixto-hint"),
    calcular:  document.getElementById("mixto-calcular"),
    limpiar:   document.getElementById("mixto-limpiar"),
    pdf:       document.getElementById("mixto-pdf"),
    salida:    document.getElementById("mixto-resultado")
  };

  const nombresPorTopologia = {
    t1: ["Rs", "Rp1", "Rp2"],
    t2: ["R1", "R2", "R3"],
    t3: ["R1", "R2", "R3", "R4"]
  };

  const valoresPorTopologia = {
    t1: [2, 6, 3],
    t2: [2, 6, 3],
    t3: [2, 6, 3, 6]
  };

  let contadorMixto = 0;

  function construirMixto() {
    const topo = mixto.topologia.value;
    const nombres = nombresPorTopologia[topo];
    const valores = valoresPorTopologia[topo];

    mixto.listaEl.innerHTML = "";
    contadorMixto = 0;

    nombres.forEach((nombre, i) => {
      contadorMixto++;
      const row = document.createElement("div");
      row.className = "res-row";
      row.dataset.id = `mix-${contadorMixto}`;
      row.innerHTML = `
        <div class="field__control">
          <span class="res-row__label">${nombre}</span>
          <input type="text" inputmode="decimal" placeholder="Ej. 6" autocomplete="off" value="${valores[i]}" />
          <span class="field__unit">Ω</span>
        </div>
      `;
      mixto.listaEl.appendChild(row);
    });

    const descripciones = {
      t1: "Rs en serie con el paralelo de Rp1 y Rp2.",
      t2: "R1 en serie con el paralelo de R2 y R3.",
      t3: "(R1 ∥ R2) en serie con (R3 ∥ R4)."
    };
    mixto.hint.textContent = descripciones[topo];
  }

  mixto.topologia.addEventListener("change", construirMixto);
  construirMixto();

  mixto.calcular.addEventListener("click", () => {
    // limpiar estilos
    mixto.listaEl.querySelectorAll(".field__control").forEach((c) => {
      c.style.borderColor = "";
      c.style.boxShadow = "";
    });

    const f = leerNumero(mixto.fuente);
    if (!f.ok || f.valor <= 0) {
      mixto.fuente.closest(".field").classList.add("field--invalid");
      renderError(mixto.salida, "El voltaje de la fuente debe ser un número positivo.");
      mixto.pdf.disabled = true;
      return;
    }
    mixto.fuente.closest(".field").classList.remove("field--invalid");

    const topo = mixto.topologia.value;
    const inputs = mixto.listaEl.querySelectorAll("input");
    const valores = [];
    let error = false;

    inputs.forEach((input) => {
      const contenedor = input.closest(".field__control");
      const r = leerNumero(input);
      if (!r.ok || r.valor <= 0) {
        contenedor.style.borderColor = "var(--c-error)";
        contenedor.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--c-error) 15%, transparent)";
        error = true;
      } else {
        valores.push(r.valor);
      }
    });

    if (error) {
      renderError(mixto.salida, "Todas las resistencias deben ser números positivos.");
      mixto.pdf.disabled = true;
      return;
    }

    let r;
    try {
      r = C.circuitoMixto(topo, f.valor, valores);
    } catch (err) {
      renderError(mixto.salida, err.message);
      mixto.pdf.disabled = true;
      return;
    }

    const sumaP = r.componentes.reduce((a, c) => a + c.P, 0);
    const balanceOK = Math.abs(sumaP - r.Ptotal) < 1e-6;

    const salida = `
      <div class="analysis-output">

        <div class="summary-grid">
          ${summaryTile("R equivalente", r.Req, "Ω", "resist")}
          ${summaryTile("V fuente", r.fuente, "V", "voltage")}
          ${summaryTile("I total", r.Itotal, "A", "current")}
          ${summaryTile("P total", r.Ptotal, "W", "power")}
        </div>

        <div class="diagram">
          <div class="diagram__caption">Diagrama del circuito</div>
          ${D.mixto(r)}
        </div>

        <h3>Procedimiento de reducción</h3>
        <ol class="steps">
          ${r.procedimiento.pasos.map((paso) => `
            <li>
              <span class="steps__detail">${paso}</span>
            </li>
          `).join("")}
        </ol>

        ${tablaComponentes(r.componentes, {
          R: r.Req, V: r.fuente, I: r.Itotal, P: r.Ptotal
        })}

        <h3>Verificación</h3>
        ${verificacion([
          {
            ok: balanceOK,
            titulo: "Balance de potencia",
            detalle: `P_fuente = ${r.Ptotal} W · Σ P_i = ${C.round(sumaP, 4)} W`
          }
        ])}

      </div>
    `;

    mixto.salida.innerHTML = salida;
    mixto.pdf.disabled = false;
  });

  mixto.limpiar.addEventListener("click", () => {
    mixto.fuente.value = "12";
    mixto.fuente.closest(".field").classList.remove("field--invalid");
    construirMixto();
    mixto.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Ajusta las resistencias y pulsa <em>Calcular</em>.
      </div>
    `;
    mixto.pdf.disabled = true;
  });

    mixto.pdf.addEventListener("click", () => {
    const topo = mixto.topologia.value;
    const nombres = nombresPorTopologia[topo];
    const datosEntrada = [{ etiqueta: "Fuente", valor: `${mixto.fuente.value} V` }];
    mixto.listaEl.querySelectorAll("input").forEach((input, i) => {
      const v = input.value.trim();
      if (v) datosEntrada.push({ etiqueta: nombres[i] || `R${i + 1}`, valor: `${v} Ω` });
    });
    const f = Number(mixto.fuente.value.replace(",", "."));
    const valores = [...mixto.listaEl.querySelectorAll("input")].map((i) => Number(i.value.replace(",", ".")));
    try {
      const r = C.circuitoMixto(topo, f, valores);
      exportarAnalisis(`mixto (${topo})`, datosEntrada, r, mixto.salida);
    } catch (err) {
      alert("No se puede exportar: " + err.message);
    }
  });

})();