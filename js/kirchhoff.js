/* =========================================================
   CircuitLab — kirchhoff.js
   Fase 7: UI del módulo de leyes de Kirchhoff
   ========================================================= */

(function () {
  "use strict";

  const C = window.CircuitLab && window.CircuitLab.calculos;
  const D = window.CircuitLab && window.CircuitLab.diagramas;
  if (!C || !D) {
    console.error("kirchhoff.js: faltan calculos.js o diagramas.js.");
    return;
  }

  /* =========================================================
     Utilidades
     ========================================================= */
  function leerNumero(input, permitirVacio) {
    const raw = (input.value || "").trim().replace(",", ".");
    if (raw === "") {
      if (permitirVacio) return { ok: true, valor: null };
      return { ok: false, motivo: "Este campo es obligatorio." };
    }
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

    function exportarResultado(titulo, subtitulo, datosEntrada, resultado, formulas, pasos, verificaciones, diagramaSVG) {
    window.CircuitLab.pdf.exportar({
      titulo, subtitulo, datos: datosEntrada,
      diagramaSVG: diagramaSVG || null,
      resultado, formulas, pasos, verificaciones: verificaciones || []
    });
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
     Lista dinámica genérica (corrientes / voltajes)
     ========================================================= */
  function crearGestorLista(contenedor, botonAgregar, prefijo, unidad, valoresIniciales) {
    let contador = 0;

    function crearFila(valor) {
      contador++;
      const idx = contador;
      const row = document.createElement("div");
      row.className = "res-row";
      row.innerHTML = `
        <div class="field__control">
          <span class="res-row__label">${prefijo}${idx}</span>
          <input type="text" inputmode="decimal" autocomplete="off" placeholder="—" />
          <span class="field__unit">${unidad}</span>
        </div>
        <button type="button" class="res-row__remove" aria-label="Eliminar" title="Eliminar">×</button>
      `;
      if (valor != null) row.querySelector("input").value = valor;
      row.querySelector(".res-row__remove").addEventListener("click", () => {
        row.remove();
        actualizar();
      });
      contenedor.appendChild(row);
      actualizar();
    }

    function actualizar() {
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
        (valores || []).forEach((v) => crearFila(v));
      },
      leerValores(permitirVacio) {
        const filas = [...contenedor.querySelectorAll(".res-row")];
        const valores = [];
        let vacios = 0;
        let error = false;
        filas.forEach((fila) => {
          const input = fila.querySelector("input");
          const contenedorControl = fila.querySelector(".field__control");
          const r = leerNumero(input, permitirVacio);
          contenedorControl.style.borderColor = "";
          contenedorControl.style.boxShadow = "";
          if (!r.ok) {
            contenedorControl.style.borderColor = "var(--c-error)";
            contenedorControl.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--c-error) 15%, transparent)";
            error = true;
          } else if (r.valor == null) {
            valores.push(null);
            vacios++;
          } else {
            valores.push(r.valor);
          }
        });
        if (error) return null;
        return { valores, vacios };
      }
    };
  }

  /* =========================================================
     KCL — Ley de corrientes
     ========================================================= */
  const kcl = {
    modo:      document.getElementById("kcl-modo"),
    entrantes: document.getElementById("kcl-entrantes"),
    salientes: document.getElementById("kcl-salientes"),
    addEntra:  document.getElementById("kcl-add-entra"),
    addSale:   document.getElementById("kcl-add-sale"),
    calcular:  document.getElementById("kcl-calcular"),
    limpiar:   document.getElementById("kcl-limpiar"),
    pdf:       document.getElementById("kcl-pdf"),
    salida:    document.getElementById("kcl-resultado")
  };

  const gestorEntra = crearGestorLista(kcl.entrantes, kcl.addEntra, "Ie", "A", [5]);
  const gestorSale  = crearGestorLista(kcl.salientes, kcl.addSale,  "Is", "A", [2]);

  kcl.calcular.addEventListener("click", () => {
    const modo = kcl.modo.value;
    const permitirVacio = modo === "faltante";

    const entra = gestorEntra.leerValores(permitirVacio);
    const sale  = gestorSale.leerValores(permitirVacio);

    if (!entra || !sale) {
      renderError(kcl.salida, "Revisa los campos marcados en rojo.");
      kcl.pdf.disabled = true;
      return;
    }

    // Modo comprobar: todas deben ser números
    if (modo === "comprobar") {
      const todas = [...entra.valores, ...sale.valores];
      if (todas.some((v) => v == null)) {
        renderError(kcl.salida, "Faltan datos. Introduce todas las corrientes.");
        kcl.pdf.disabled = true;
        return;
      }
      const r = C.leyCorrientes(entra.valores, sale.valores);

      kcl.salida.innerHTML = `
        <div class="analysis-output">
          <div class="diagram">
            <div class="diagram__caption">Nodo con corrientes</div>
            ${D.nodoKCL({ entrantes: entra.valores, salientes: sale.valores })}
          </div>

          <h3>Ecuación</h3>
          <span class="formula">Σ I_entra = Σ I_sale</span>
          <span class="formula">${r.ecuacion}</span>

          <h3>Comprobación</h3>
          <div class="alert alert--${r.cumple ? "success" : "error"}">
            <strong>${r.cumple ? "Se cumple" : "No se cumple"}</strong>
            Entra: ${r.entra} A · Sale: ${r.sale} A · Diferencia: ${r.diferencia} A
          </div>
        </div>
      `;
      kcl.pdf.disabled = false;
      return;
    }

    // Modo faltante: exactamente un null entre todos
    const todos = [...entra.valores, ...sale.valores];
    const nulos = todos.filter((v) => v == null).length;
    if (nulos !== 1) {
      renderError(kcl.salida, "Deja exactamente una corriente vacía para calcularla.");
      kcl.pdf.disabled = true;
      return;
    }

    // Identificar de qué lado está el vacío
    let resultado;
    if (entra.valores.includes(null)) {
      // Falta una entrante: Σ entra = Σ sale → faltante = Σ sale - Σ otras entra
      const otras = entra.valores.filter((v) => v != null);
      const sumaSale = sale.valores.reduce((a, b) => a + b, 0);
      const sumaOtras = otras.reduce((a, b) => a + b, 0);
      const valor = sumaSale - sumaOtras;
      resultado = {
        valor,
        lado: "entra",
        ecuacion: `Ix + ${otras.join(" + ")} = ${sale.valores.join(" + ")}`
      };
    } else {
      const otras = sale.valores.filter((v) => v != null);
      const sumaEntra = entra.valores.reduce((a, b) => a + b, 0);
      const sumaOtras = otras.reduce((a, b) => a + b, 0);
      const valor = sumaEntra - sumaOtras;
      resultado = {
        valor,
        lado: "sale",
        ecuacion: `${entra.valores.join(" + ")} = Ix + ${otras.join(" + ")}`
      };
    }

    kcl.salida.innerHTML = `
      <div class="output-stack">
        <div class="result-card result-card--current">
          <div class="result-card__label">Corriente faltante (${resultado.lado})</div>
          <div class="result-card__value">${C.round(resultado.valor, 4)}<span class="result-card__unit">A</span></div>
          <p class="result-card__note">Calculada aplicando KCL en el nodo.</p>
        </div>

        <h4>Ecuación</h4>
        <span class="formula">Σ I_entra = Σ I_sale</span>
        <span class="formula">${resultado.ecuacion}</span>

        <div class="alert alert--success">
          <strong>Resultado</strong>
          La corriente faltante es <strong>${C.round(resultado.valor, 4)} A</strong>
          en el lado de las corrientes que ${resultado.lado === "entra" ? "entran" : "salen"}.
        </div>
      </div>
    `;
    kcl.pdf.disabled = false;
  });

  kcl.limpiar.addEventListener("click", () => {
    kcl.modo.value = "comprobar";
    gestorEntra.limpiar([5]);
    gestorSale.limpiar([2]);
    kcl.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Introduce las corrientes y pulsa <em>Calcular</em>.
      </div>
    `;
    kcl.pdf.disabled = true;
  });

    kcl.pdf.addEventListener("click", () => {
    if (kcl.pdf.disabled) return;
    const diagramaEl = kcl.salida.querySelector(".diagram svg");
    const valorEl = kcl.salida.querySelector(".result-card__value");
    const formulaEls = [...kcl.salida.querySelectorAll(".formula")];
    const alertEl = kcl.salida.querySelector(".alert--success, .alert--error");

    const datosEntrada = [];
    kcl.entrantes.querySelectorAll("input").forEach((inp, i) => {
      if (inp.value.trim()) datosEntrada.push({ etiqueta: `Ie${i + 1} (entra)`, valor: `${inp.value.trim()} A` });
    });
    kcl.salientes.querySelectorAll("input").forEach((inp, i) => {
      if (inp.value.trim()) datosEntrada.push({ etiqueta: `Is${i + 1} (sale)`, valor: `${inp.value.trim()} A` });
    });

    const esFaltante = !!valorEl;
    const resultado = esFaltante
      ? { etiqueta: "Corriente faltante", valor: valorEl.textContent.trim().replace(/\s+/g, " ") }
      : { etiqueta: "Comprobación KCL", valor: alertEl ? alertEl.textContent.trim().slice(0, 80) : "—" };

    const formulas = formulaEls.map((el) => ({ formula: el.textContent.trim(), sustitucion: "" }));

    exportarResultado(
      "Ley de corrientes (KCL)",
      datosEntrada.map((d) => `${d.etiqueta}: ${d.valor}`).join(" · "),
      datosEntrada, resultado, formulas, [],
      alertEl ? [{
        ok: alertEl.classList.contains("alert--success"),
        titulo: "Resultado",
        detalle: alertEl.textContent.replace(/Se cumple|No se cumple/i, "").trim()
      }] : [],
      diagramaEl ? diagramaEl.outerHTML : null
    );
  });

  /* =========================================================
     KVL — Ley de voltajes
     ========================================================= */
  const kvl = {
    modo:     document.getElementById("kvl-modo"),
    lista:    document.getElementById("kvl-lista"),
    add:      document.getElementById("kvl-add"),
    calcular: document.getElementById("kvl-calcular"),
    limpiar:  document.getElementById("kvl-limpiar"),
    pdf:      document.getElementById("kvl-pdf"),
    salida:   document.getElementById("kvl-resultado")
  };

  const gestorKvl = crearGestorLista(kvl.lista, kvl.add, "V", "V", [12, -5, -7]);

  kvl.calcular.addEventListener("click", () => {
    const modo = kvl.modo.value;
    const permitirVacio = modo === "faltante";

    const r = gestorKvl.leerValores(permitirVacio);
    if (!r) {
      renderError(kvl.salida, "Revisa los campos marcados en rojo.");
      kvl.pdf.disabled = true;
      return;
    }

    if (modo === "comprobar") {
      if (r.valores.some((v) => v == null)) {
        renderError(kvl.salida, "Faltan datos. Introduce todos los voltajes.");
        kvl.pdf.disabled = true;
        return;
      }
      const res = C.leyVoltajes(r.valores);

      kvl.salida.innerHTML = `
        <div class="analysis-output">
          <div class="diagram">
            <div class="diagram__caption">Malla cerrada</div>
            ${D.mallaKVL({ voltajes: r.valores.map((v, i) => ({ etiqueta: `V${i + 1}`, valor: v })) })}
          </div>

          <h3>Ecuación</h3>
          <span class="formula">Σ V = 0</span>
          <span class="formula">${res.ecuacion} = ${res.suma} V</span>

          <h3>Comprobación</h3>
          <div class="alert alert--${res.cumple ? "success" : "error"}">
            <strong>${res.cumple ? "Se cumple" : "No se cumple"}</strong>
            Suma algebraica: ${res.suma} V
          </div>
        </div>
      `;
      kvl.pdf.disabled = false;
      return;
    }

    // Modo faltante
    const nulos = r.valores.filter((v) => v == null).length;
    if (nulos !== 1) {
      renderError(kvl.salida, "Deja exactamente un voltaje vacío para calcularlo.");
      kvl.pdf.disabled = true;
      return;
    }

    const conocidos = r.valores.filter((v) => v != null);
    const res = C.voltajeFaltante(conocidos);

    kvl.salida.innerHTML = `
      <div class="output-stack">
        <div class="result-card result-card--voltage">
          <div class="result-card__label">Voltaje faltante</div>
          <div class="result-card__value">${C.round(res.valor, 4)}<span class="result-card__unit">V</span></div>
          <p class="result-card__note">Calculado aplicando KVL en la malla.</p>
        </div>

        <h4>Ecuación</h4>
        <span class="formula">Σ V = 0</span>
        <span class="formula">${res.ecuacion}</span>

        <div class="alert alert--success">
          <strong>Resultado</strong>
          La caída faltante es <strong>${C.round(res.valor, 4)} V</strong>.
        </div>
      </div>
    `;
    kvl.pdf.disabled = false;
  });

  kvl.limpiar.addEventListener("click", () => {
    kvl.modo.value = "comprobar";
    gestorKvl.limpiar([12, -5, -7]);
    kvl.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Introduce los voltajes y pulsa <em>Calcular</em>.
      </div>
    `;
    kvl.pdf.disabled = true;
  });

    kvl.pdf.addEventListener("click", () => {
    if (kvl.pdf.disabled) return;
    const diagramaEl = kvl.salida.querySelector(".diagram svg");
    const valorEl = kvl.salida.querySelector(".result-card__value");
    const formulaEls = [...kvl.salida.querySelectorAll(".formula")];
    const alertEl = kvl.salida.querySelector(".alert--success, .alert--error");

    const datosEntrada = [];
    kvl.lista.querySelectorAll("input").forEach((inp, i) => {
      if (inp.value.trim()) datosEntrada.push({ etiqueta: `V${i + 1}`, valor: `${inp.value.trim()} V` });
    });

    const esFaltante = !!valorEl;
    const resultado = esFaltante
      ? { etiqueta: "Voltaje faltante", valor: valorEl.textContent.trim().replace(/\s+/g, " ") }
      : { etiqueta: "Comprobación KVL", valor: alertEl ? alertEl.textContent.trim().slice(0, 80) : "—" };

    const formulas = formulaEls.map((el) => ({ formula: el.textContent.trim(), sustitucion: "" }));

    exportarResultado(
      "Ley de voltajes (KVL)",
      datosEntrada.map((d) => `${d.etiqueta}: ${d.valor}`).join(" · "),
      datosEntrada, resultado, formulas, [],
      alertEl ? [{
        ok: alertEl.classList.contains("alert--success"),
        titulo: "Resultado",
        detalle: alertEl.textContent.replace(/Se cumple|No se cumple/i, "").trim()
      }] : [],
      diagramaEl ? diagramaEl.outerHTML : null
    );
  });

  /* =========================================================
     Mallas — dos mallas
     ========================================================= */
  const mall = {
    V1:       document.getElementById("mall-V1"),
    V2:       document.getElementById("mall-V2"),
    R1:       document.getElementById("mall-R1"),
    R2:       document.getElementById("mall-R2"),
    R3:       document.getElementById("mall-R3"),
    calcular: document.getElementById("mall-calcular"),
    limpiar:  document.getElementById("mall-limpiar"),
    pdf:      document.getElementById("mall-pdf"),
    salida:   document.getElementById("mall-resultado")
  };

  mall.calcular.addEventListener("click", () => {
    // limpiar estilos
    [mall.V1, mall.V2, mall.R1, mall.R2, mall.R3].forEach((i) =>
      i.closest(".field").classList.remove("field--invalid"));

    const campos = [
      { input: mall.V1, key: "V1", esR: false },
      { input: mall.V2, key: "V2", esR: false },
      { input: mall.R1, key: "R1", esR: true },
      { input: mall.R2, key: "R2", esR: true },
      { input: mall.R3, key: "R3", esR: true }
    ];

    const datos = {};
    let error = false;

    campos.forEach(({ input, key, esR }) => {
      const r = leerNumero(input, false);
      if (!r.ok) {
        input.closest(".field").classList.add("field--invalid");
        error = true;
      } else if (esR && r.valor <= 0) {
        input.closest(".field").classList.add("field--invalid");
        error = true;
      } else {
        datos[key] = r.valor;
      }
    });

    if (error) {
      renderError(mall.salida, "Revisa los campos marcados en rojo.");
      mall.pdf.disabled = true;
      return;
    }

    let r;
    try {
      r = C.dosMallas(datos);
    } catch (err) {
      renderError(mall.salida, err.message);
      mall.pdf.disabled = true;
      return;
    }

    const filasComp = r.componentes.map((c) => `
      <tr>
        <td>${c.nombre}</td>
        <td class="numeric">${fmt(c.R, "Ω")}</td>
        <td class="numeric">${fmt(c.V, "V")}</td>
        <td class="numeric">${fmt(c.I, "A")}</td>
        <td class="numeric">${fmt(c.P, "W")}</td>
      </tr>
    `).join("");

    mall.salida.innerHTML = `
      <div class="analysis-output">

        <div class="summary-grid">
          <div class="summary-tile summary-tile--current">
            <div class="summary-tile__label">Corriente malla 1 (i1)</div>
            <div class="summary-tile__value">${r.i1}<span class="summary-tile__unit">A</span></div>
          </div>
          <div class="summary-tile summary-tile--current">
            <div class="summary-tile__label">Corriente malla 2 (i2)</div>
            <div class="summary-tile__value">${r.i2}<span class="summary-tile__unit">A</span></div>
          </div>
          <div class="summary-tile summary-tile--current">
            <div class="summary-tile__label">Corriente por R2</div>
            <div class="summary-tile__value">${r.iR2}<span class="summary-tile__unit">A</span></div>
          </div>
          <div class="summary-tile summary-tile--power">
            <div class="summary-tile__label">P entregada</div>
            <div class="summary-tile__value">${r.potencias.entregada}<span class="summary-tile__unit">W</span></div>
          </div>
        </div>

        <h3>Sistema de ecuaciones</h3>
        <span class="formula">Malla 1: ${r.sistema.malla1.texto}</span>
        <span class="formula">Malla 2: ${r.sistema.malla2.texto}</span>

        <h3>Procedimiento</h3>
        <ol class="steps">
          ${r.sistema.pasos.map((p) => `
            <li><span class="steps__detail">${p}</span></li>
          `).join("")}
        </ol>

        <h3>Resultados por componente</h3>
        <table class="data-table">
          <caption>Resistencias y fuentes</caption>
          <thead>
            <tr>
              <th scope="col">Componente</th>
              <th scope="col" class="numeric">R</th>
              <th scope="col" class="numeric">V</th>
              <th scope="col" class="numeric">I</th>
              <th scope="col" class="numeric">P</th>
            </tr>
          </thead>
          <tbody>${filasComp}</tbody>
          <tfoot>
            <tr>
              <td>Balance</td>
              <td class="numeric">—</td>
              <td class="numeric">—</td>
              <td class="numeric">—</td>
              <td class="numeric">${r.potencias.disipada} W</td>
            </tr>
          </tfoot>
        </table>

                <h3>Verificación</h3>
        <div class="verify-list">
          <div class="verify-item verify-item--${r.potencias.balanceOK ? "ok" : "warn"}">
            <span class="verify-item__icon">${r.potencias.balanceOK ? "✔" : "!"}</span>
            <div class="verify-item__body">
              <span class="verify-item__title">Balance de potencia</span>
              <span class="verify-item__detail">
                P_entregada (|V·I|) = ${r.potencias.entregada} W ·
                P_disipada (Σ I²·R) = ${r.potencias.disipada} W ·
                Diferencia = ${C.round(r.potencias.entregada - r.potencias.disipada, 6)} W
              </span>
            </div>
          </div>
        </div>

        <div class="alert alert--info" style="margin-top: 1rem;">
          <strong>Nota sobre la convención de signos</strong>
          Las corrientes de malla se han tomado en sentido horario. Si una fuente
          queda con corriente entrante, su potencia <em>entregada</em> se muestra
          en valor absoluto, ya que el objetivo es comprobar la conservación de
          energía. Las potencias con signo (convención de referencia) están
          disponibles en la consola.
        </div>

      </div>
    `;
    mall.pdf.disabled = false;
  });

  mall.limpiar.addEventListener("click", () => {
    mall.V1.value = "12";
    mall.V2.value = "9";
    mall.R1.value = "2";
    mall.R2.value = "4";
    mall.R3.value = "6";
    [mall.V1, mall.V2, mall.R1, mall.R2, mall.R3].forEach((i) =>
      i.closest(".field").classList.remove("field--invalid"));
    mall.salida.innerHTML = `
      <div class="alert alert--info">
        <strong>Esperando datos</strong>
        Ajusta los valores y pulsa <em>Calcular</em>.
      </div>
    `;
    mall.pdf.disabled = true;
  });

    mall.pdf.addEventListener("click", () => {
    if (mall.pdf.disabled) return;

    const datosEntrada = [
      { etiqueta: "Fuente V1", valor: `${mall.V1.value} V` },
      { etiqueta: "Fuente V2", valor: `${mall.V2.value} V` },
      { etiqueta: "R1", valor: `${mall.R1.value} Ω` },
      { etiqueta: "R2", valor: `${mall.R2.value} Ω` },
      { etiqueta: "R3", valor: `${mall.R3.value} Ω` }
    ];

    const i1El = mall.salida.querySelectorAll(".summary-tile__value")[0];
    const i2El = mall.salida.querySelectorAll(".summary-tile__value")[1];
    const iR2El = mall.salida.querySelectorAll(".summary-tile__value")[2];
    const pEntEl = mall.salida.querySelectorAll(".summary-tile__value")[3];
    const formulaEls = [...mall.salida.querySelectorAll(".formula")];
    const pasosEls = [...mall.salida.querySelectorAll(".steps__detail")];
    const verifyEls = [...mall.salida.querySelectorAll(".verify-item")];

    const formulas = formulaEls.map((el) => ({ formula: el.textContent.trim(), sustitucion: "" }));
    const pasos = pasosEls.map((el) => el.textContent.trim());

    // Tabla por componente -> reconstruimos desde la tabla del DOM
    const filasTabla = [...mall.salida.querySelectorAll(".data-table tbody tr")].map((tr) => {
      const tds = [...tr.querySelectorAll("td")].map((td) => td.textContent.trim());
      return `${tds[0]}: R=${tds[1]}, V=${tds[2]}, I=${tds[3]}, P=${tds[4]}`;
    });

    const verificaciones = verifyEls.map((v) => ({
      ok: v.classList.contains("verify-item--ok"),
      titulo: v.querySelector(".verify-item__title")?.textContent.trim() || "",
      detalle: v.querySelector(".verify-item__detail")?.textContent.trim() || ""
    }));

    exportarResultado(
      "Resolución por mallas",
      `i1 = ${i1El ? i1El.textContent.trim() : "—"} · i2 = ${i2El ? i2El.textContent.trim() : "—"} · i_R2 = ${iR2El ? iR2El.textContent.trim() : "—"}`,
      datosEntrada,
      {
        etiqueta: "Corrientes de malla",
        valor: `i1=${i1El ? i1El.textContent.trim() : "—"} · i2=${i2El ? i2El.textContent.trim() : "—"}`,
        nota: `P entregada = ${pEntEl ? pEntEl.textContent.trim() : "—"}`
      },
      formulas,
      pasos,
      verificaciones,
      null
    );
  });

  console.log("CircuitLab · kirchhoff.js cargado (Fase 10).");
})();