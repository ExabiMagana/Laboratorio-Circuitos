/* =========================================================
   CircuitLab — lecciones.js
   Fase 8: contenido de las lecciones educativas
   Separado del HTML para facilitar el mantenimiento.
   ========================================================= */

(function () {
  "use strict";

  window.CircuitLab = window.CircuitLab || {};

  window.CircuitLab.lecciones = [

    /* ============================================================
       1. Magnitudes eléctricas
       ============================================================ */
    {
      id: "magnitudes",
      titulo: "Magnitudes eléctricas",
      subtitulo: "Voltaje, corriente, resistencia y potencia",
      definicion: "Las magnitudes eléctricas son las cantidades que describen el comportamiento de un circuito. Las cuatro fundamentales son: voltaje (V), corriente (I), resistencia (R) y potencia (P).",
      explicacion: `
        <p>Imagina un circuito como un sistema de tuberías por las que circula agua:</p>
        <ul>
          <li>El <strong>voltaje</strong> es la presión del agua. Se mide en voltios (V).</li>
          <li>La <strong>corriente</strong> es el caudal que pasa por la tubería. Se mide en amperios (A).</li>
          <li>La <strong>resistencia</strong> es el estrechamiento de la tubería que dificulta el paso. Se mide en ohmios (Ω).</li>
          <li>La <strong>potencia</strong> es la energía que se transfiere por segundo. Se mide en vatios (W).</li>
        </ul>
      `,
      formulas: [
        { latex: "V = I × R", descripcion: "Ley de Ohm" },
        { latex: "P = V × I", descripcion: "Potencia" }
      ],
      ejemplo: {
        enunciado: "Un circuito tiene una fuente de 12 V y una resistencia de 6 Ω. ¿Cuál es la corriente?",
        pasos: [
          "Datos: V = 12 V, R = 6 Ω.",
          "Fórmula: I = V / R.",
          "Sustitución: I = 12 / 6.",
          "Resultado: I = 2 A."
        ]
      },
      enlaces: [
        { href: "calculadoras.html#panel-ohm", texto: "Ir a la calculadora de Ley de Ohm" }
      ]
    },

    /* ============================================================
       2. Ley de Ohm
       ============================================================ */
    {
      id: "ley-ohm",
      titulo: "Ley de Ohm",
      subtitulo: "La relación fundamental entre V, I y R",
      definicion: "La Ley de Ohm establece que la corriente que circula por un conductor es directamente proporcional al voltaje aplicado e inversamente proporcional a su resistencia.",
      explicacion: `
        <p>Formulada por Georg Simon Ohm en 1827, es la ecuación más utilizada en electricidad. Permite calcular cualquiera de las tres magnitudes conociendo las otras dos.</p>
        <p>Se cumple en componentes <em>óhmicos</em> (resistencias lineales). En componentes no lineales (diodos, transistores) la relación no es constante.</p>
      `,
      formulas: [
        { latex: "V = I × R", descripcion: "Para calcular voltaje" },
        { latex: "I = V / R", descripcion: "Para calcular corriente" },
        { latex: "R = V / I", descripcion: "Para calcular resistencia" }
      ],
      ejemplo: {
        enunciado: "Calcula la corriente que circula por una resistencia de 6 Ω conectada a 12 V.",
        pasos: [
          "Datos: V = 12 V, R = 6 Ω.",
          "Como buscamos I: I = V / R.",
          "Sustitución: I = 12 / 6.",
          "Resultado: I = 2 A.",
          "Comprobación: V = I × R = 2 × 6 = 12 V ✔."
        ]
      },
      enlaces: [
        { href: "calculadoras.html#panel-ohm", texto: "Calculadora de Ley de Ohm" }
      ]
    },

    /* ============================================================
       3. Potencia eléctrica
       ============================================================ */
    {
      id: "potencia",
      titulo: "Potencia eléctrica",
      subtitulo: "Energía transferida por unidad de tiempo",
      definicion: "La potencia eléctrica es la cantidad de energía que un componente absorbe o entrega por unidad de tiempo. Se mide en vatios (W).",
      explicacion: `
        <p>La potencia puede calcularse con tres fórmulas equivalentes, según los datos disponibles:</p>
        <ul>
          <li>Si conoces V e I: <span class="formula formula--inline">P = V × I</span></li>
          <li>Si conoces I y R: <span class="formula formula--inline">P = I² × R</span></li>
          <li>Si conoces V y R: <span class="formula formula--inline">P = V² / R</span></li>
        </ul>
        <p>En una resistencia, toda la potencia se disipa como calor. En una fuente, la potencia se <em>entrega</em> al circuito.</p>
      `,
      formulas: [
        { latex: "P = V × I", descripcion: "Fórmula básica" },
        { latex: "P = I² × R", descripcion: "Con corriente y resistencia" },
        { latex: "P = V² / R", descripcion: "Con voltaje y resistencia" }
      ],
      ejemplo: {
        enunciado: "Una resistencia de 6 Ω tiene una corriente de 2 A. ¿Cuánta potencia disipa?",
        pasos: [
          "Datos: I = 2 A, R = 6 Ω.",
          "Como conocemos I y R: P = I² × R.",
          "Sustitución: P = 2² × 6 = 4 × 6.",
          "Resultado: P = 24 W.",
          "Comprobación: V = I × R = 12 V; P = V × I = 12 × 2 = 24 W ✔."
        ]
      },
      enlaces: [
        { href: "calculadoras.html#panel-potencia", texto: "Calculadora de potencia" }
      ]
    },

    /* ============================================================
       4. Circuitos en serie
       ============================================================ */
    {
      id: "serie",
      titulo: "Circuitos en serie",
      subtitulo: "Un solo camino para la corriente",
      definicion: "En un circuito en serie, los componentes se conectan uno tras otro, formando un único camino cerrado. La corriente es la misma en todos los componentes y el voltaje se reparte entre ellos.",
      explicacion: `
        <p>Propiedades clave de los circuitos en serie:</p>
        <ul>
          <li>La <strong>corriente</strong> es la misma en todos los componentes.</li>
          <li>El <strong>voltaje total</strong> es la suma de los voltajes de cada componente.</li>
          <li>La <strong>resistencia equivalente</strong> es la suma de las resistencias.</li>
          <li>La <strong>potencia total</strong> es la suma de las potencias de cada componente.</li>
        </ul>
        <p>Aplicación práctica: las luces de un árbol de Navidad antiguo iban en serie; si se fundía una, se apagaban todas.</p>
      `,
      formulas: [
        { latex: "R_eq = R1 + R2 + … + Rn", descripcion: "Resistencia equivalente" },
        { latex: "I = V / R_eq", descripcion: "Corriente común" },
        { latex: "V_i = I × R_i", descripcion: "Voltaje en cada resistencia" }
      ],
      ejemplo: {
        enunciado: "Circuito con fuente de 12 V, R1 = 2 Ω y R2 = 4 Ω en serie. Calcula todos los valores.",
        pasos: [
          "R_eq = R1 + R2 = 2 + 4 = 6 Ω.",
          "I = V / R_eq = 12 / 6 = 2 A.",
          "V1 = I × R1 = 2 × 2 = 4 V.",
          "V2 = I × R2 = 2 × 4 = 8 V.",
          "Comprobación: V1 + V2 = 4 + 8 = 12 V ✔."
        ]
      },
      enlaces: [
        { href: "analisis.html#panel-serie", texto: "Analizador de circuitos en serie" }
      ]
    },

    /* ============================================================
       5. Circuitos en paralelo
       ============================================================ */
    {
      id: "paralelo",
      titulo: "Circuitos en paralelo",
      subtitulo: "Varios caminos para la corriente",
      definicion: "En un circuito en paralelo, los componentes se conectan de forma que todos comparten el mismo voltaje. La corriente total se reparte entre las ramas.",
      explicacion: `
        <p>Propiedades clave de los circuitos en paralelo:</p>
        <ul>
          <li>El <strong>voltaje</strong> es el mismo en todas las ramas.</li>
          <li>La <strong>corriente total</strong> es la suma de las corrientes de cada rama.</li>
          <li>La <strong>resistencia equivalente</strong> es menor que la menor de las resistencias.</li>
          <li>La <strong>potencia total</strong> es la suma de las potencias de cada rama.</li>
        </ul>
        <p>Aplicación práctica: las instalaciones eléctricas domésticas están en paralelo; así cada aparato recibe 220 V (o 120 V) y puede encenderse y apagarse de forma independiente.</p>
      `,
      formulas: [
        { latex: "1 / R_eq = 1/R1 + 1/R2 + … + 1/Rn", descripcion: "Resistencia equivalente" },
        { latex: "I_i = V / R_i", descripcion: "Corriente de cada rama" },
        { latex: "I_total = I1 + I2 + … + In", descripcion: "Corriente total" }
      ],
      ejemplo: {
        enunciado: "Circuito con fuente de 12 V, R1 = 6 Ω y R2 = 12 Ω en paralelo.",
        pasos: [
          "1 / R_eq = 1/6 + 1/12 = 2/12 + 1/12 = 3/12.",
          "R_eq = 12 / 3 = 4 Ω.",
          "I1 = V / R1 = 12 / 6 = 2 A.",
          "I2 = V / R2 = 12 / 12 = 1 A.",
          "I_total = I1 + I2 = 3 A.",
          "Comprobación: I_total = V / R_eq = 12 / 4 = 3 A ✔."
        ]
      },
      enlaces: [
        { href: "analisis.html#panel-paralelo", texto: "Analizador de circuitos en paralelo" }
      ]
    },

    /* ============================================================
       6. Circuitos mixtos
       ============================================================ */
    {
      id: "mixtos",
      titulo: "Circuitos mixtos",
      subtitulo: "Combinación de serie y paralelo",
      definicion: "Un circuito mixto combina conexiones en serie y en paralelo. Para resolverlo, se simplifica por partes hasta obtener una única resistencia equivalente.",
      explicacion: `
        <p>Método de reducción:</p>
        <ol>
          <li>Identificar los grupos de resistencias en serie y en paralelo.</li>
          <li>Reducir primero los grupos más internos (los que están en paralelo, normalmente).</li>
          <li>Continuar reduciendo hasta obtener una sola resistencia equivalente.</li>
          <li>Calcular la corriente total.</li>
          <li>Ir "deshaciendo" las reducciones para encontrar V e I en cada componente.</li>
        </ol>
      `,
      formulas: [
        { latex: "R_eq = R_serie + R_paralelo_reducida", descripcion: "Reducción paso a paso" }
      ],
      ejemplo: {
        enunciado: "Circuito con Rs = 2 Ω en serie con el paralelo de Rp1 = 6 Ω y Rp2 = 3 Ω. Fuente: 12 V.",
        pasos: [
          "Rp_eq = 1 / (1/6 + 1/3) = 1 / (1/6 + 2/6) = 1 / (3/6) = 2 Ω.",
          "R_eq = Rs + Rp_eq = 2 + 2 = 4 Ω.",
          "I_total = 12 / 4 = 3 A.",
          "V_Rs = 3 × 2 = 6 V.",
          "V_Rp (paralelo) = 12 − 6 = 6 V.",
          "I_Rp1 = 6 / 6 = 1 A · I_Rp2 = 6 / 3 = 2 A.",
          "Comprobación: I_Rp1 + I_Rp2 = 1 + 2 = 3 A ✔."
        ]
      },
      enlaces: [
        { href: "analisis.html#panel-mixto", texto: "Analizador de circuitos mixtos" }
      ]
    },

    /* ============================================================
       7. Primera ley de Kirchhoff (KCL)
       ============================================================ */
    {
      id: "kcl",
      titulo: "Primera ley de Kirchhoff",
      subtitulo: "Ley de corrientes (KCL)",
      definicion: "La suma de las corrientes que entran a un nodo es igual a la suma de las corrientes que salen de él. También se enuncia como: la suma algebraica de corrientes en un nodo es cero.",
      explicacion: `
        <p>Se basa en la <strong>conservación de la carga eléctrica</strong>: la carga no se acumula en un nodo, así que todo lo que entra tiene que salir.</p>
        <p>Es útil para analizar circuitos con varios caminos que se unen en un punto, como los nudos de una red de tuberías.</p>
      `,
      formulas: [
        { latex: "Σ I_entra = Σ I_sale", descripcion: "Forma clásica" },
        { latex: "Σ I = 0", descripcion: "Forma algebraica (con signos)" }
      ],
      ejemplo: {
        enunciado: "A un nodo entran 5 A. Por una rama salen 2 A. ¿Cuánto sale por la otra rama?",
        pasos: [
          "Ecuación: Σ I_entra = Σ I_sale.",
          "5 = 2 + Ix.",
          "Ix = 5 − 2 = 3 A.",
          "Comprobación: 5 = 2 + 3 ✔."
        ]
      },
      enlaces: [
        { href: "kirchhoff.html#panel-kcl", texto: "Comprobador de la ley de corrientes" }
      ]
    },

    /* ============================================================
       8. Segunda ley de Kirchhoff (KVL)
       ============================================================ */
    {
      id: "kvl",
      titulo: "Segunda ley de Kirchhoff",
      subtitulo: "Ley de voltajes (KVL)",
      definicion: "En cualquier malla cerrada de un circuito, la suma algebraica de los voltajes es cero. Equivalente: la suma de las subidas de tensión es igual a la suma de las caídas.",
      explicacion: `
        <p>Se basa en la <strong>conservación de la energía</strong>: si recorres una malla completa y vuelves al punto de partida, la energía ganada y perdida debe igualarse.</p>
        <p>Al recorrer una malla, se asigna signo positivo a las subidas de voltaje (fuentes) y negativo a las caídas (resistencias).</p>
      `,
      formulas: [
        { latex: "Σ V = 0", descripcion: "Forma algebraica" },
        { latex: "V_fuente = V1 + V2 + … + Vn", descripcion: "Forma en serie" }
      ],
      ejemplo: {
        enunciado: "Fuente de 12 V, caídas de 5 V y 7 V. ¿Se cumple la ley?",
        pasos: [
          "Ecuación: V_fuente − V1 − V2 = 0.",
          "12 − 5 − 7 = 0 ✔.",
          "Si faltara la segunda caída: 12 − 5 − Vx = 0 → Vx = 7 V."
        ]
      },
      enlaces: [
        { href: "kirchhoff.html#panel-kvl", texto: "Comprobador de la ley de voltajes" }
      ]
    },

    /* ============================================================
       9. Unidades y conversiones
       ============================================================ */
    {
      id: "unidades",
      titulo: "Unidades y conversiones",
      subtitulo: "Los prefijos del Sistema Internacional",
      definicion: "Las magnitudes eléctricas se expresan con unidades del Sistema Internacional (SI). Los prefijos permiten trabajar con valores muy grandes o muy pequeños sin escribir demasiados ceros.",
      explicacion: `
        <p>Prefijos más utilizados en electricidad:</p>
        <table class="data-table">
          <thead>
            <tr><th>Prefijo</th><th>Símbolo</th><th>Factor</th><th>Ejemplo</th></tr>
          </thead>
          <tbody>
            <tr><td>giga</td><td>G</td><td class="numeric">10⁹</td><td>1 GΩ = 1 000 000 000 Ω</td></tr>
            <tr><td>mega</td><td>M</td><td class="numeric">10⁶</td><td>1 MΩ = 1 000 000 Ω</td></tr>
            <tr><td>kilo</td><td>k</td><td class="numeric">10³</td><td>1 kΩ = 1 000 Ω</td></tr>
            <tr><td>mili</td><td>m</td><td class="numeric">10⁻³</td><td>1 mA = 0.001 A</td></tr>
            <tr><td>micro</td><td>µ</td><td class="numeric">10⁻⁶</td><td>1 µA = 0.000001 A</td></tr>
            <tr><td>nano</td><td>n</td><td class="numeric">10⁻⁹</td><td>1 nA = 0.000000001 A</td></tr>
          </tbody>
        </table>
      `,
      formulas: [
        { latex: "1 kΩ = 1000 Ω", descripcion: "Ejemplo de conversión" },
        { latex: "1 mA = 0.001 A", descripcion: "Ejemplo de conversión" }
      ],
      ejemplo: {
        enunciado: "Expresa 0.0025 A en miliamperios y 4700 Ω en kiloohmios.",
        pasos: [
          "0.0025 A × 1000 mA/A = 2.5 mA.",
          "4700 Ω / 1000 Ω/kΩ = 4.7 kΩ."
        ]
      },
      enlaces: []
    }

  ];

  console.log("CircuitLab · lecciones.js cargado (Fase 8).");
})();