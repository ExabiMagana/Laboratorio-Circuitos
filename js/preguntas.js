/* =========================================================
   CircuitLab — preguntas.js
   Fase 9: banco de preguntas para los desafíos
   Cada categoría tiene 5 preguntas. Cada pregunta tiene 4 opciones.
   La respuesta correcta está marcada con "correcta" (índice 0-3).
   ========================================================= */

(function () {
  "use strict";

  window.CircuitLab = window.CircuitLab || {};

  window.CircuitLab.categorias = [

    /* ============================================================
       CATEGORÍA 1 — Conceptos básicos
       ============================================================ */
    {
      id: "conceptos",
      titulo: "Conceptos básicos",
      descripcion: "Magnitudes eléctricas y unidades del SI.",
      preguntas: [
        {
          enunciado: "¿En qué unidad se mide la corriente eléctrica?",
          opciones: ["Voltio (V)", "Amperio (A)", "Ohmio (Ω)", "Vatio (W)"],
          correcta: 1,
          explicacion: "La corriente eléctrica se mide en amperios (A). El voltio mide voltaje, el ohmio mide resistencia y el vatio mide potencia."
        },
        {
          enunciado: "¿Cuál de estas magnitudes representa la oposición al paso de la corriente?",
          opciones: ["Voltaje", "Corriente", "Resistencia", "Potencia"],
          correcta: 2,
          explicacion: "La resistencia (R), medida en ohmios (Ω), es la oposición que ofrece un material al paso de la corriente."
        },
        {
          enunciado: "¿Cuál es el equivalente de 1 kΩ?",
          opciones: ["0.001 Ω", "100 Ω", "1000 Ω", "1 000 000 Ω"],
          correcta: 2,
          explicacion: "El prefijo 'kilo' equivale a 10³, por lo que 1 kΩ = 1000 Ω."
        },
        {
          enunciado: "¿Qué magnitud se mide en vatios (W)?",
          opciones: ["Voltaje", "Corriente", "Resistencia", "Potencia"],
          correcta: 3,
          explicacion: "La potencia eléctrica, que es la energía transferida por unidad de tiempo, se mide en vatios (W)."
        },
        {
          enunciado: "Si por un conductor circula una corriente de 2 mA, ¿a cuántos amperios equivale?",
          opciones: ["0.0002 A", "0.002 A", "0.02 A", "2000 A"],
          correcta: 1,
          explicacion: "El prefijo 'mili' equivale a 10⁻³, por lo que 2 mA = 2 × 0.001 A = 0.002 A."
        }
      ]
    },

    /* ============================================================
       CATEGORÍA 2 — Ley de Ohm
       ============================================================ */
    {
      id: "ley-ohm",
      titulo: "Ley de Ohm",
      descripcion: "Cálculos directos e inversos con V, I y R.",
      preguntas: [
        {
          enunciado: "Una resistencia de 6 Ω está conectada a 12 V. ¿Cuál es la corriente?",
          opciones: ["0.5 A", "2 A", "6 A", "72 A"],
          correcta: 1,
          explicacion: "I = V / R = 12 / 6 = 2 A."
        },
        {
          enunciado: "Si circulan 3 A por una resistencia de 4 Ω, ¿qué voltaje hay entre sus extremos?",
          opciones: ["0.75 V", "7 V", "12 V", "1.33 V"],
          correcta: 2,
          explicacion: "V = I × R = 3 × 4 = 12 V."
        },
        {
          enunciado: "Por una resistencia circulan 0.5 A cuando se le aplican 10 V. ¿Cuál es su resistencia?",
          opciones: ["5 Ω", "10 Ω", "20 Ω", "0.05 Ω"],
          correcta: 2,
          explicacion: "R = V / I = 10 / 0.5 = 20 Ω."
        },
        {
          enunciado: "Si se duplica el voltaje aplicado a una resistencia y esta permanece constante, ¿qué le ocurre a la corriente?",
          opciones: ["Se reduce a la mitad", "No cambia", "Se duplica", "Se cuadruplica"],
          correcta: 2,
          explicacion: "Según la Ley de Ohm, I = V / R. Si V se duplica y R se mantiene, I también se duplica (relación directamente proporcional)."
        },
        {
          enunciado: "Una resistencia de 0 Ω (cortocircuito ideal) se conecta a 12 V. ¿Qué corriente circula?",
          opciones: ["0 A", "12 A", "Infinita (en la práctica, muy alta y peligrosa)", "1 A"],
          correcta: 2,
          explicacion: "Con R = 0, la Ley de Ohm da I = V / 0, que es infinito matemáticamente. En la práctica, la corriente solo está limitada por la resistencia interna de la fuente, y puede ser peligrosa."
        }
      ]
    },

    /* ============================================================
       CATEGORÍA 3 — Potencia
       ============================================================ */
    {
      id: "potencia",
      titulo: "Potencia eléctrica",
      descripcion: "Cálculos con P = V×I, P = I²×R, P = V²/R.",
      preguntas: [
        {
          enunciado: "Un componente tiene 12 V entre sus extremos y circulan 2 A. ¿Cuánta potencia consume?",
          opciones: ["6 W", "14 W", "24 W", "48 W"],
          correcta: 2,
          explicacion: "P = V × I = 12 × 2 = 24 W."
        },
        {
          enunciado: "Una resistencia de 6 Ω disipa 2 A. ¿Cuánta potencia disipa?",
          opciones: ["12 W", "24 W", "3 W", "72 W"],
          correcta: 1,
          explicacion: "P = I² × R = 2² × 6 = 4 × 6 = 24 W."
        },
        {
          enunciado: "Una resistencia de 6 Ω tiene 12 V entre sus extremos. ¿Cuánta potencia disipa?",
          opciones: ["2 W", "24 W", "72 W", "36 W"],
          correcta: 1,
          explicacion: "P = V² / R = 12² / 6 = 144 / 6 = 24 W."
        },
        {
          enunciado: "Si se duplica la corriente que circula por una resistencia, ¿qué le ocurre a la potencia disipada?",
          opciones: ["Se duplica", "Se cuadruplica", "No cambia", "Se reduce a la mitad"],
          correcta: 1,
          explicacion: "Con P = I² × R, si I se duplica, I² se cuadruplica. Por tanto la potencia se multiplica por 4."
        },
        {
          enunciado: "En un circuito en serie, dos resistencias disipan 8 W y 16 W. ¿Cuánta potencia entrega la fuente?",
          opciones: ["8 W", "16 W", "24 W", "4 W"],
          correcta: 2,
          explicacion: "La potencia se conserva: la fuente entrega la suma de las potencias disipadas por los componentes. 8 + 16 = 24 W."
        }
      ]
    },

    /* ============================================================
       CATEGORÍA 4 — Serie y paralelo
       ============================================================ */
    {
      id: "serie-paralelo",
      titulo: "Serie y paralelo",
      descripcion: "Reducciones y distribuciones de V e I.",
      preguntas: [
        {
          enunciado: "¿Cuál es la resistencia equivalente de 2 Ω, 4 Ω y 6 Ω en serie?",
          opciones: ["4 Ω", "10 Ω", "12 Ω", "2 Ω"],
          correcta: 2,
          explicacion: "En serie las resistencias se suman: R_eq = 2 + 4 + 6 = 12 Ω."
        },
        {
          enunciado: "¿Cuál es la resistencia equivalente de 6 Ω y 3 Ω en paralelo?",
          opciones: ["9 Ω", "2 Ω", "3 Ω", "4.5 Ω"],
          correcta: 1,
          explicacion: "1 / R_eq = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 → R_eq = 2 Ω."
        },
        {
          enunciado: "En un circuito en serie con 3 resistencias, ¿cómo es la corriente?",
          opciones: ["Mayor en la primera resistencia", "La misma en todas", "Menor en la última", "Depende de los valores"],
          correcta: 1,
          explicacion: "En un circuito en serie solo hay un camino para la corriente, por lo que es la misma en todos los componentes."
        },
        {
          enunciado: "En un circuito en paralelo con 2 resistencias, ¿cómo es el voltaje?",
          opciones: ["Mayor en la de mayor resistencia", "Mayor en la de menor resistencia", "El mismo en ambas", "Depende"],
          correcta: 2,
          explicacion: "En paralelo todas las ramas están conectadas al mismo par de nodos, por lo que comparten el mismo voltaje (el de la fuente)."
        },
        {
          enunciado: "Dos resistencias de 4 Ω están en paralelo. ¿Cuál es la equivalente?",
          opciones: ["8 Ω", "4 Ω", "2 Ω", "1 Ω"],
          correcta: 2,
          explicacion: "Para dos resistencias iguales en paralelo, R_eq = R / 2 = 4 / 2 = 2 Ω. Comprobación: 1/R_eq = 1/4 + 1/4 = 2/4 = 1/2."
        }
      ]
    },

    /* ============================================================
       CATEGORÍA 5 — Circuitos mixtos
       ============================================================ */
    {
      id: "mixtos",
      titulo: "Circuitos mixtos",
      descripcion: "Reducción por partes y distribución de V e I.",
      preguntas: [
        {
          enunciado: "Rs = 2 Ω en serie con el paralelo de Rp1 = 6 Ω y Rp2 = 3 Ω. ¿Cuál es la R_eq?",
          opciones: ["11 Ω", "4 Ω", "5 Ω", "9 Ω"],
          correcta: 1,
          explicacion: "Rp_eq = 1/(1/6 + 1/3) = 2 Ω. R_eq = Rs + Rp_eq = 2 + 2 = 4 Ω."
        },
        {
          enunciado: "En el circuito anterior con fuente de 12 V, ¿cuál es la corriente total?",
          opciones: ["2 A", "3 A", "4 A", "6 A"],
          correcta: 1,
          explicacion: "I_total = V / R_eq = 12 / 4 = 3 A."
        },
        {
          enunciado: "En ese mismo circuito, ¿qué voltaje cae en Rs?",
          opciones: ["4 V", "6 V", "8 V", "12 V"],
          correcta: 1,
          explicacion: "V_Rs = I_total × Rs = 3 × 2 = 6 V. El resto (6 V) cae en el bloque en paralelo."
        },
        {
          enunciado: "Con esos mismos datos, ¿qué corriente circula por Rp1 (6 Ω)?",
          opciones: ["0.5 A", "1 A", "2 A", "3 A"],
          correcta: 1,
          explicacion: "El voltaje en el paralelo es 6 V. I_Rp1 = 6 / 6 = 1 A. I_Rp2 = 6 / 3 = 2 A. Suma = 3 A ✔."
        },
        {
          enunciado: "¿Cuál es la potencia total disipada por el circuito del ejemplo?",
          opciones: ["12 W", "24 W", "36 W", "48 W"],
          correcta: 2,
          explicacion: "P_total = V × I_total = 12 × 3 = 36 W. También: P_Rs + P_Rp1 + P_Rp2 = 18 + 6 + 12 = 36 W ✔."
        }
      ]
    },

    /* ============================================================
       CATEGORÍA 6 — Leyes de Kirchhoff
       ============================================================ */
    {
      id: "kirchhoff",
      titulo: "Leyes de Kirchhoff",
      descripcion: "KCL, KVL y resolución de mallas.",
      preguntas: [
        {
          enunciado: "A un nodo entran 5 A y sale una rama con 2 A. ¿Cuánto sale por la otra rama?",
          opciones: ["2 A", "3 A", "5 A", "7 A"],
          correcta: 1,
          explicacion: "KCL: Σ I_entra = Σ I_sale. 5 = 2 + Ix → Ix = 3 A."
        },
        {
          enunciado: "En una malla hay una fuente de 12 V y dos caídas de 5 V y 7 V. ¿Se cumple KVL?",
          opciones: ["Sí, 12 − 5 − 7 = 0", "No, falta un voltaje", "Sí, pero solo si V1 > V2", "No se puede saber"],
          correcta: 0,
          explicacion: "Σ V = 0. 12 − 5 − 7 = 0, por lo que KVL se cumple."
        },
        {
          enunciado: "¿Qué principio físico sustenta la primera ley de Kirchhoff (KCL)?",
          opciones: ["Conservación de la energía", "Conservación de la carga", "Ley de Ohm", "Inducción electromagnética"],
          correcta: 1,
          explicacion: "KCL se basa en la conservación de la carga eléctrica: la carga no se acumula en un nodo."
        },
        {
          enunciado: "En una malla con fuente de 12 V y caída de 5 V, ¿cuánto vale la otra caída?",
          opciones: ["5 V", "7 V", "12 V", "17 V"],
          correcta: 1,
          explicacion: "Σ V = 0 → 12 − 5 − Vx = 0 → Vx = 7 V."
        },
        {
          enunciado: "¿Qué principio físico sustenta la segunda ley de Kirchhoff (KVL)?",
          opciones: ["Conservación de la energía", "Conservación de la carga", "Ley de Ohm", "Efecto Joule"],
          correcta: 0,
          explicacion: "KVL se basa en la conservación de la energía: al recorrer una malla cerrada, la energía ganada y perdida deben igualarse."
        }
      ]
    }

  ];

  console.log("CircuitLab · preguntas.js cargado (Fase 9).");
})();