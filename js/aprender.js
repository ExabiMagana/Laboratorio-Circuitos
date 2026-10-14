/* =========================================================
   CircuitLab — aprender.js
   Fase 8: renderiza el índice y las lecciones
   Consume window.CircuitLab.lecciones
   ========================================================= */

(function () {
  "use strict";

  const lecciones = window.CircuitLab && window.CircuitLab.lecciones;
  if (!Array.isArray(lecciones) || lecciones.length === 0) {
    console.error("aprender.js: no se encontraron lecciones en window.CircuitLab.lecciones.");
    return;
  }

  const navList = document.getElementById("lesson-nav-list");
  const content = document.getElementById("lesson-content");

  /* =========================================================
     Render del índice lateral
     ========================================================= */
  function renderIndice() {
    navList.innerHTML = lecciones.map((l, i) => `
      <li>
        <a href="#${l.id}" class="lesson-nav__link" data-lesson="${l.id}">
          <span class="lesson-nav__num">${i + 1}.</span>
          <span class="lesson-nav__text">
            ${l.titulo}
            <span class="lesson-nav__sub">${l.subtitulo}</span>
          </span>
        </a>
      </li>
    `).join("");
  }

  /* =========================================================
     Render de una lección
     ========================================================= */
  function renderLeccion(l, numero) {
    const formulasHTML = (l.formulas || []).map((f) => `
      <div class="formula-block">
        <span class="formula">${f.latex}</span>
        <span class="formula-block__desc">${f.descripcion}</span>
      </div>
    `).join("");

    const pasosHTML = (l.ejemplo.pasos || []).map((p) => `
      <li><span class="steps__detail">${p}</span></li>
    `).join("");

    const enlacesHTML = (l.enlaces || []).length
      ? `<div class="lesson-actions">
           ${l.enlaces.map((e) => `<a class="btn btn--primary btn--sm" href="${e.href}">${e.texto} →</a>`).join("")}
         </div>`
      : "";

    return `
      <article class="lesson" id="${l.id}">
        <header class="lesson__header">
          <div class="lesson__num">Lección ${numero}</div>
          <h2 class="lesson__title">${l.titulo}</h2>
          <p class="lesson__subtitle">${l.subtitulo}</p>
        </header>

        <section class="lesson__section">
          <h3>Definición</h3>
          <p>${l.definicion}</p>
        </section>

        <section class="lesson__section">
          <h3>Explicación</h3>
          ${l.explicacion}
        </section>

        <section class="lesson__section">
          <h3>Fórmulas</h3>
          <div class="formula-list">${formulasHTML}</div>
        </section>

        <section class="lesson__section">
          <h3>Ejemplo resuelto</h3>
          <div class="example-box">
            <p class="example-box__enunciado"><strong>Enunciado:</strong> ${l.ejemplo.enunciado}</p>
            <ol class="steps">${pasosHTML}</ol>
          </div>
        </section>

        ${enlacesHTML}
      </article>
    `;
  }

  function renderLecciones() {
    content.innerHTML = lecciones.map((l, i) => renderLeccion(l, i + 1)).join("");
  }

  /* =========================================================
     Índice activo según scroll
     ========================================================= */
  function activarEnlace(id) {
    document.querySelectorAll(".lesson-nav__link").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.lesson === id);
    });
  }

  function observarScroll() {
    const articulos = document.querySelectorAll(".lesson");
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activarEnlace(entry.target.id);
      });
    }, {
      rootMargin: "-30% 0px -60% 0px",
      threshold: 0
    });

    articulos.forEach((a) => observer.observe(a));
  }

  /* =========================================================
     Navegación suave dentro de la página
     ========================================================= */
  function suavizarAnclas() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
        activarEnlace(id);
      });
    });
  }

  /* =========================================================
     Inicialización
     ========================================================= */
  renderIndice();
  renderLecciones();
  suavizarAnclas();
  observarScroll();

  // Si la URL trae un hash, activamos esa lección al cargar
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    activarEnlace(id);
  } else if (lecciones[0]) {
    activarEnlace(lecciones[0].id);
  }

  console.log("CircuitLab · aprender.js cargado (Fase 8).");
})();