/* =========================================================
   CircuitLab — main.js
   Fase 2: navegación basada en data-page y utilidades
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

    appNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        appNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Resaltar enlace activo según la página ---------- */
  const navLinks = document.querySelectorAll(".app-nav a[data-page]");

  function getCurrentPage() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    if (path === "" || path === "index.html") return "inicio";
    return path.replace(".html", "");
  }

  function updateActiveLink() {
    const current = getCurrentPage();
    navLinks.forEach((link) => {
      const isActive = link.dataset.page === current;
      link.classList.toggle("is-active", isActive);
    });
  }

  document.addEventListener("DOMContentLoaded", updateActiveLink);

  /* ---------- Utilidades generales (fases futuras) ---------- */
  window.CircuitLab = window.CircuitLab || {};

  window.CircuitLab.round = function (value, decimals = 4) {
    if (!Number.isFinite(value)) return value;
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(value * factor) / factor;
    return Object.is(rounded, -0) ? 0 : rounded;
  };

  window.CircuitLab.format = function (value, unit = "", decimals = 4) {
    if (!Number.isFinite(value)) return "—";
    const rounded = window.CircuitLab.round(value, decimals);
    return unit ? `${rounded} ${unit}` : `${rounded}`;
  };

  window.CircuitLab.isPositiveNumber = function (value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0;
  };

  console.log("CircuitLab · Fase 2 completada. Componentes listos.");;
})();