/* =========================================================
   CircuitLab — main.js
   Fase 1: navegación básica y utilidades generales
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Navegación móvil ---------- */
  const navToggle = document.getElementById("navToggle");
  const appNav    = document.getElementById("appNav");

  if (navToggle && appNav) {
    navToggle.addEventListener("click", () => {
      const open = appNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    // Cierra el menú al hacer clic en un enlace (útil en móvil)
    appNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        appNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Resaltar enlace activo según el hash ---------- */
  const navLinks = document.querySelectorAll(".app-nav a");

  function updateActiveLink() {
    const hash = window.location.hash || "#inicio";
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === hash;
      link.classList.toggle("is-active", isActive);
    });
  }

  window.addEventListener("hashchange", updateActiveLink);
  updateActiveLink();

  /* ---------- Utilidades generales (se usarán en fases futuras) ---------- */
  // Se exponen en window.CircuitLab para reutilizarlas desde otras páginas.
  window.CircuitLab = window.CircuitLab || {};

  /**
   * Redondea un número a una cantidad de decimales, evitando -0.
   * @param {number} value
   * @param {number} decimals
   * @returns {number}
   */
  window.CircuitLab.round = function (value, decimals = 4) {
    if (!Number.isFinite(value)) return value;
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(value * factor) / factor;
    return Object.is(rounded, -0) ? 0 : rounded;
  };

  /**
   * Formatea un número para mostrarlo con unidad.
   * @param {number} value
   * @param {string} unit
   * @param {number} decimals
   * @returns {string}
   */
  window.CircuitLab.format = function (value, unit = "", decimals = 4) {
    if (!Number.isFinite(value)) return "—";
    const rounded = window.CircuitLab.round(value, decimals);
    return unit ? `${rounded} ${unit}` : `${rounded}`;
  };

  /**
   * Comprueba si un valor es un número positivo finito.
   * @param {*} value
   * @returns {boolean}
   */
  window.CircuitLab.isPositiveNumber = function (value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0;
  };

  console.log("CircuitLab · Fase 1 cargada correctamente.");
})();