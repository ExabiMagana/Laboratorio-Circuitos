/* =========================================================
   CircuitLab — desafios.js
   Fase 9: lógica del módulo de desafíos
   Consume window.CircuitLab.categorias (Fase 9)
   ========================================================= */

(function () {
  "use strict";

  const categorias = window.CircuitLab && window.CircuitLab.categorias;
  if (!Array.isArray(categorias) || categorias.length === 0) {
    console.error("desafios.js: no se encontraron categorías.");
    return;
  }

  const root = document.getElementById("desafio-root");
  if (!root) {
    console.error("desafios.js: falta #desafio-root.");
    return;
  }

  /* =========================================================
     Estado de la sesión
     ========================================================= */
  const estado = {
    categoria: null,      // objeto categoría
    indice: 0,            // pregunta actual (0..n-1)
    respuestas: [],       // [{ acerto, opcionElegida }]
    respondida: false     // si la pregunta actual ya fue respondida
  };

  /* =========================================================
     Utilidades
     ========================================================= */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function letra(i) {
    return ["A", "B", "C", "D"][i] || "?";
  }

  /* =========================================================
     Pantalla 1 — Selección de categoría
     ========================================================= */
  function renderInicio() {
    const tarjetas = categorias.map((c) => `
      <button type="button" class="category-card" data-categoria="${c.id}">
        <div class="category-card__title">${esc(c.titulo)}</div>
        <div class="category-card__desc">${esc(c.descripcion)}</div>
        <div class="category-card__meta">${c.preguntas.length} preguntas</div>
      </button>
    `).join("");

    root.innerHTML = `
      <div class="alert alert--info">
        <strong>¿Cómo funciona?</strong>
        Elige una categoría. Verás una pregunta por pantalla con 4 opciones.
        Al pulsar una, se marca la respuesta correcta y aparece la explicación.
        Al final verás tu puntuación.
      </div>

      <div class="category-grid">
        ${tarjetas}
      </div>
    `;

    root.querySelectorAll(".category-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = categorias.find((c) => c.id === btn.dataset.categoria);
        if (!cat) return;
        iniciarCategoria(cat);
      });
    });
  }

  /* =========================================================
     Inicio de una categoría
     ========================================================= */
  function iniciarCategoria(categoria) {
    estado.categoria = categoria;
    estado.indice = 0;
    estado.respuestas = [];
    estado.respondida = false;
    renderPregunta();
  }

  /* =========================================================
     Pantalla 2 — Pregunta
     ========================================================= */
  function renderPregunta() {
    const cat = estado.categoria;
    const total = cat.preguntas.length;
    const p = cat.preguntas[estado.indice];
    const num = estado.indice + 1;
    const progreso = Math.round((estado.indice / total) * 100);

    // Si ya está respondida, mostramos la explicación y las marcas.
    const yaRespondida = estado.respondida;
    const elegida = yaRespondida ? estado.respuestas[estado.indice].opcionElegida : null;

    const opcionesHTML = p.opciones.map((op, i) => {
      const esCorrecta = i === p.correcta;
      let clase = "option";
      if (yaRespondida) {
        if (esCorrecta) clase += " option--correct";
        else if (i === elegida) clase += " option--wrong";
        else clase += " option--muted";
      }
      return `
        <button type="button" class="${clase}" data-indice="${i}" ${yaRespondida ? "disabled" : ""}>
          <span class="option__letter">${letra(i)}</span>
          <span class="option__text">${esc(op)}</span>
        </button>
      `;
    }).join("");

    const explicacionHTML = yaRespondida ? `
      <div class="alert alert--${estado.respuestas[estado.indice].acerto ? "success" : "error"}"
           style="margin-top: 1.5rem;">
        <strong>${estado.respuestas[estado.indice].acerto ? "¡Correcto!" : "Respuesta incorrecta"}</strong>
        ${esc(p.explicacion)}
      </div>
    ` : "";

    const botonSiguiente = yaRespondida
      ? (num < total
          ? `<button type="button" class="btn btn--primary" id="btn-siguiente">Siguiente pregunta →</button>`
          : `<button type="button" class="btn btn--primary" id="btn-resultado">Ver resultado final →</button>`)
      : "";

    const botonSalir = `<button type="button" class="btn btn--ghost btn--sm" id="btn-salir">← Cambiar categoría</button>`;

    root.innerHTML = `
      <div class="quiz">

        <div class="quiz__header">
          <div class="quiz__meta">
            <span class="quiz__categoria">${esc(cat.titulo)}</span>
            <span class="quiz__contador">Pregunta ${num} de ${total}</span>
          </div>
          <div class="progress">
            <div class="progress__bar" style="width:${progreso}%"></div>
          </div>
        </div>

        <h2 class="quiz__enunciado">${esc(p.enunciado)}</h2>

        <div class="options">
          ${opcionesHTML}
        </div>

        ${explicacionHTML}

        <div class="quiz__actions">
          ${botonSalir}
          ${botonSiguiente}
        </div>

      </div>
    `;

    // Listeners
    root.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (estado.respondida) return;
        const elegida = Number(btn.dataset.indice);
        const acerto = elegida === p.correcta;
        estado.respuestas[estado.indice] = { acerto, opcionElegida: elegida };
        estado.respondida = true;
        renderPregunta();
      });
    });

    const btnSig = document.getElementById("btn-siguiente");
    if (btnSig) {
      btnSig.addEventListener("click", () => {
        estado.indice++;
        estado.respondida = false;
        renderPregunta();
      });
    }

    const btnRes = document.getElementById("btn-resultado");
    if (btnRes) {
      btnRes.addEventListener("click", renderResultado);
    }

    const btnSalir = document.getElementById("btn-salir");
    if (btnSalir) {
      btnSalir.addEventListener("click", renderInicio);
    }
  }

  /* =========================================================
     Pantalla 3 — Resultado final
     ========================================================= */
  function renderResultado() {
    const cat = estado.categoria;
    const total = cat.preguntas.length;
    const aciertos = estado.respuestas.filter((r) => r && r.acerto).length;
    const errores = total - aciertos;
    const porcentaje = Math.round((aciertos / total) * 100);

    let mensaje = "";
    let claseAlert = "success";
    if (porcentaje === 100) mensaje = "¡Perfecto! Dominas esta categoría.";
    else if (porcentaje >= 80) mensaje = "¡Muy bien! Solo se te escaparon un par de detalles.";
    else if (porcentaje >= 60) mensaje = "Buen trabajo, pero conviene repasar algún concepto.";
    else if (porcentaje >= 40) mensaje = "Vas por buen camino, pero necesitas repasar.";
    else { mensaje = "Conviene que vuelvas a las lecciones antes de reintentar."; claseAlert = "warning"; }

    const detalle = cat.preguntas.map((p, i) => {
      const r = estado.respuestas[i];
      const ok = r && r.acerto;
      return `
        <li class="review-item review-item--${ok ? "ok" : "ko"}">
          <div class="review-item__head">
            <span class="review-item__num">${i + 1}.</span>
            <span class="review-item__title">${esc(p.enunciado)}</span>
          </div>
          <div class="review-item__detail">
            Tu respuesta: <strong>${letra(r.opcionElegida)}</strong> ·
            Correcta: <strong>${letra(p.correcta)}</strong>
            ${ok ? "✔" : "✘"}
          </div>
          <div class="review-item__exp">${esc(p.explicacion)}</div>
        </li>
      `;
    }).join("");

    root.innerHTML = `
      <div class="quiz">
        <h2 class="quiz__enunciado">Resultado · ${esc(cat.titulo)}</h2>

        <div class="result-summary">
          <div class="result-summary__score">
            <div class="result-summary__number">${porcentaje}<span>%</span></div>
            <div class="result-summary__label">aciertos</div>
          </div>
          <div class="result-summary__detail">
            <p><strong>${aciertos}</strong> respuestas correctas</p>
            <p><strong>${errores}</strong> respuestas incorrectas</p>
            <p><strong>${total}</strong> preguntas en total</p>
          </div>
        </div>

        <div class="alert alert--${claseAlert}">
          <strong>${mensaje}</strong>
        </div>

        <h3 style="margin-top: 2rem;">Revisión de respuestas</h3>
        <ul class="review-list">${detalle}</ul>

        <div class="quiz__actions">
          <button type="button" class="btn btn--ghost btn--sm" id="btn-inicio">← Cambiar categoría</button>
          <button type="button" class="btn btn--primary" id="btn-reintentar">Intentar de nuevo</button>
        </div>
      </div>
    `;

    document.getElementById("btn-inicio").addEventListener("click", renderInicio);
    document.getElementById("btn-reintentar").addEventListener("click", () => iniciarCategoria(cat));
  }

  /* =========================================================
     Inicio
     ========================================================= */
  renderInicio();

  console.log("CircuitLab · desafios.js cargado (Fase 9).");
})();