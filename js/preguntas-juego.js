(function () {
  "use strict";

  window.CircuitLab = window.CircuitLab || {};

  /* Adaptador */
  function adaptar(p, categoriaTitulo, indice) {
    return {
      id: `${slug(categoriaTitulo)}_${String(indice + 1).padStart(3, "0")}`,
      categoria: categoriaTitulo,
      pregunta: p.enunciado,
      opciones: Array.isArray(p.opciones) ? p.opciones.slice(0, 4) : [],
      correcta: Number.isInteger(p.correcta) ? p.correcta : 0,
      explicacion: p.explicacion || ""
    };
  }

  /* Convierte un texto libre en un identificador corto. */
  function slug(s) {
    return String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 30);
  }

  /* Valida que una pregunta adaptada cumpla los requisitos mínimos.*/
  function esValida(p) {
    return (
      p &&
      typeof p.pregunta === "string" && p.pregunta.length > 0 &&
      Array.isArray(p.opciones) && p.opciones.length === 4 &&
      Number.isInteger(p.correcta) &&
      p.correcta >= 0 && p.correcta <= 3 &&
      typeof p.explicacion === "string"
    );
  }

  function extraerTodas() {
    const categorias = window.CircuitLab && window.CircuitLab.categorias;
    if (!Array.isArray(categorias) || categorias.length === 0) {
      console.warn("preguntas-juego.js: no hay categorías en CircuitLab.categorias.");
      return [];
    }

    const resultado = [];
    categorias.forEach((cat) => {
      const titulo = cat.titulo || cat.id || "Sin categoría";
      (cat.preguntas || []).forEach((p, i) => {
        const adaptada = adaptar(p, titulo, i);
        if (esValida(adaptada)) {
          resultado.push(adaptada);
        } else {
          console.warn("preguntas-juego.js: pregunta descartada por formato inválido.", p);
        }
      });
    });

    return resultado;
  }

  function barajar(arr) {
    const copia = arr.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function crearBolsa() {
    const todas = extraerTodas();
    let mezcladas = barajar(todas);
    let cursor = 0;

    return {
      siguiente() {
        if (mezcladas.length === 0) return null;
        if (cursor >= mezcladas.length) {
          mezcladas = barajar(todas);
          cursor = 0;
        }
        return mezcladas[cursor++];
      },
      quedan() {
        return mezcladas.length - cursor;
      },
      total() {
        return mezcladas.length;
      },
      reiniciar() {
        mezcladas = barajar(todas);
        cursor = 0;
      }
    };
  }

  /* Exportación */

  window.CircuitLab.preguntasJuego = {
    extraerTodas,
    crearBolsa,
    barajar,
    esValida,
    adaptar
  };

})();