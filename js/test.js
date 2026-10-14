/* =========================================================
   CircuitLab — tests.js
   Fase 3: pruebas del motor matemático
   Carga este archivo solo en desarrollo (index.html).
   ========================================================= */

(function () {
  "use strict";

  const C = window.CircuitLab && window.CircuitLab.calculos;
  if (!C) {
    console.error("tests.js: no se encontró window.CircuitLab.calculos. ¿Se cargó calculos.js antes?");
    return;
  }

  /* ---------- Utilidades de test ---------- */
  let passed = 0;
  let failed = 0;
  const results = [];

  function approx(a, b, tol = 1e-6) {
    return Math.abs(a - b) < tol;
  }

  function test(nombre, fn) {
    try {
      fn();
      passed++;
      results.push({ nombre, ok: true });
    } catch (err) {
      failed++;
      results.push({ nombre, ok: false, error: err.message });
    }
  }

  function expectEqual(actual, expected, etiqueta) {
    if (typeof actual === "number" && typeof expected === "number") {
      if (!approx(actual, expected)) {
        throw new Error(`${etiqueta || ""} Esperado: ${expected}, obtenido: ${actual}`);
      }
    } else if (actual !== expected) {
      throw new Error(`${etiqueta || ""} Esperado: ${expected}, obtenido: ${actual}`);
    }
  }

  function expectError(fn, codeEsperado) {
    try {
      fn();
    } catch (err) {
      if (codeEsperado && err.code !== codeEsperado) {
        throw new Error(`Se esperaba código "${codeEsperado}", pero llegó "${err.code}".`);
      }
      return;
    }
    throw new Error(`Se esperaba un error${codeEsperado ? ` (${codeEsperado})` : ""}, pero no se lanzó.`);
  }

  /* =========================================================
     Ley de Ohm
     ========================================================= */
  test("Ley de Ohm · I = V / R  (12 V, 6 Ω) → 2 A", () => {
    const r = C.leyDeOhm("I", { V: 12, R: 6 });
    expectEqual(r.valor, 2, "I:");
    expectEqual(r.unidad, "A", "unidad:");
  });

  test("Ley de Ohm · V = I × R  (2 A, 6 Ω) → 12 V", () => {
    const r = C.leyDeOhm("V", { I: 2, R: 6 });
    expectEqual(r.valor, 12, "V:");
    expectEqual(r.unidad, "V", "unidad:");
  });

  test("Ley de Ohm · R = V / I  (12 V, 2 A) → 6 Ω", () => {
    const r = C.leyDeOhm("R", { V: 12, I: 2 });
    expectEqual(r.valor, 6, "R:");
    expectEqual(r.unidad, "Ω", "unidad:");
  });

  test("Ley de Ohm · I con R = 0 lanza DIVISION_POR_CERO", () => {
    expectError(() => C.leyDeOhm("I", { V: 12, R: 0 }), "DIVISION_POR_CERO");
  });

  test("Ley de Ohm · datos insuficientes", () => {
    expectError(() => C.leyDeOhm("I", { V: 12 }), "DATOS_INSUFICIENTES");
  });

  /* =========================================================
     Potencia
     ========================================================= */
  test("Potencia · V × I  (12 V, 2 A) → 24 W", () => {
    const r = C.potencia({ V: 12, I: 2 });
    expectEqual(r.valor, 24, "P:");
    expectEqual(r.unidad, "W", "unidad:");
  });

  test("Potencia · I² × R  (2 A, 6 Ω) → 24 W", () => {
    const r = C.potencia({ I: 2, R: 6 });
    expectEqual(r.valor, 24, "P:");
  });

  test("Potencia · V² / R  (12 V, 6 Ω) → 24 W", () => {
    const r = C.potencia({ V: 12, R: 6 });
    expectEqual(r.valor, 24, "P:");
  });

  /* =========================================================
     Resistencias equivalentes
     ========================================================= */
  test("Serie · 2 Ω + 4 Ω + 6 Ω = 12 Ω", () => {
    const r = C.resistenciaSerie([2, 4, 6]);
    expectEqual(r.valor, 12, "Req:");
  });

  test("Paralelo · 6 Ω || 3 Ω = 2 Ω", () => {
    const r = C.resistenciaParalelo([6, 3]);
    expectEqual(r.valor, 2, "Req:");
  });

  test("Serie · resistencia inválida (0) lanza error", () => {
    expectError(() => C.resistenciaSerie([2, 0, 6]), "RESISTENCIA_INVALIDA");
  });

  test("Paralelo · resistencia negativa lanza error", () => {
    expectError(() => C.resistenciaParalelo([6, -3]), "RESISTENCIA_INVALIDA");
  });

  /* =========================================================
     Circuito en serie
     12 V, R1 = 2 Ω, R2 = 4 Ω → Req = 6 Ω, Itot = 2 A, V1 = 4, V2 = 8
     ========================================================= */
  test("Circuito serie · 12 V, [2, 4] Ω", () => {
    const r = C.circuitoSerie(12, [2, 4]);
    expectEqual(r.Req, 6, "Req:");
    expectEqual(r.Itotal, 2, "Itot:");
    expectEqual(r.componentes[0].V, 4, "V1:");
    expectEqual(r.componentes[1].V, 8, "V2:");
    expectEqual(r.componentes[0].I, 2, "I1:");
    expectEqual(r.componentes[1].I, 2, "I2:");
    expectEqual(r.Ptotal, 24, "Ptot:");
  });

  /* =========================================================
     Circuito en paralelo
     12 V, R1 = 6 Ω, R2 = 12 Ω → Req = 4 Ω, I1 = 2 A, I2 = 1 A, Itot = 3 A
     ========================================================= */
  test("Circuito paralelo · 12 V, [6, 12] Ω", () => {
    const r = C.circuitoParalelo(12, [6, 12]);
    expectEqual(r.Req, 4, "Req:");
    expectEqual(r.componentes[0].I, 2, "I1:");
    expectEqual(r.componentes[1].I, 1, "I2:");
    expectEqual(r.Itotal, 3, "Itot:");
    expectEqual(r.componentes[0].V, 12, "V1:");
    expectEqual(r.componentes[1].V, 12, "V2:");
    expectEqual(r.Ptotal, 36, "Ptot:");
  });

  /* =========================================================
     Circuito mixto t1: Rs + (Rp1 || Rp2)
     Rs = 2, Rp1 = 6, Rp2 = 3, fuente = 12
     Rp_eq = 2 Ω → Req = 4 Ω → Itot = 3 A
     V_Rs = 6 V → V_Rp = 6 V → I_Rp1 = 1 A, I_Rp2 = 2 A
     ========================================================= */
  test("Mixto t1 · Rs=2, Rp1=6, Rp2=3, 12 V", () => {
    const r = C.circuitoMixto("t1", 12, [2, 6, 3]);
    expectEqual(r.Req, 4, "Req:");
    expectEqual(r.Itotal, 3, "Itot:");
    expectEqual(r.componentes[0].V, 6, "V_Rs:");
    expectEqual(r.componentes[1].V, 6, "V_Rp1:");
    expectEqual(r.componentes[2].V, 6, "V_Rp2:");
    expectEqual(r.componentes[1].I, 1, "I_Rp1:");
    expectEqual(r.componentes[2].I, 2, "I_Rp2:");
  });

  /* =========================================================
     Kirchhoff · Primera ley
     Entra 5 A, sale 2 A → la otra rama saca 3 A
     ========================================================= */
  test("KCL · entra 5, sale 2 + 3 → cumple", () => {
    const r = C.leyCorrientes([5], [2, 3]);
    if (!r.cumple) throw new Error("Debería cumplirse.");
    expectEqual(r.entra, 5, "entra:");
    expectEqual(r.sale, 5, "sale:");
  });

  test("KCL · corriente faltante (5 A entra, 2 A sale) → 3 A", () => {
    const r = C.corrienteFaltante([5], [2]);
    expectEqual(r.valor, 3, "Ix:");
  });

  test("KCL · 5 A entra, 2 A sale → NO cumple por sí solo", () => {
    const r = C.leyCorrientes([5], [2]);
    if (r.cumple) throw new Error("No debería cumplirse sin la rama que falta.");
  });

  /* =========================================================
     Kirchhoff · Segunda ley
     12 V - 5 V - 7 V = 0
     ========================================================= */
  test("KVL · 12 - 5 - 7 = 0", () => {
    const r = C.leyVoltajes([12, -5, -7]);
    if (!r.cumple) throw new Error(`Suma = ${r.suma}, debería ser 0.`);
  });

  test("KVL · 12 - 5 - 5 = 2 (no cumple)", () => {
    const r = C.leyVoltajes([12, -5, -5]);
    if (r.cumple) throw new Error("No debería cumplirse.");
    expectEqual(r.suma, 2, "suma:");
  });

  /* =========================================================
     Balance de potencia
     ========================================================= */
  test("Balance de potencia · 24 W fuente, [8, 16] W componentes → cumple", () => {
    const r = C.balancePotencia(24, [8, 16]);
    if (!r.cumple) throw new Error("Debería cumplirse.");
  });

  test("Balance de potencia · 24 W fuente, [8, 10] W componentes → no cumple", () => {
    const r = C.balancePotencia(24, [8, 10]);
    if (r.cumple) throw new Error("No debería cumplirse.");
  });

    /* =========================================================
     Fase 7 — Kirchhoff ampliado
     ========================================================= */
  test("KVL · voltaje faltante: 12 - 5 = ? → 7", () => {
    const r = C.voltajeFaltante([12, -5]);
    expectEqual(r.valor, -7, "Vx:");
  });

  test("Sistema 2×2 · 2x + 3y = 13, 4x - y = 5 → x=2, y=3", () => {
    const s = C.sistema2x2(2, 3, 13, 4, -1, 5);
    expectEqual(s.x, 2, "x:");
    expectEqual(s.y, 3, "y:");
  });

  test("Sistema 2×2 · singular cuando Δ = 0", () => {
    expectError(() => C.sistema2x2(1, 2, 3, 2, 4, 6), "SISTEMA_SINGULAR");
  });

    test("Dos mallas · V1=12, V2=9, R1=2, R2=4, R3=6 → balance OK", () => {
    const r = C.dosMallas({ V1: 12, V2: 9, R1: 2, R2: 4, R3: 6 });
    if (!r.potencias.balanceOK) {
      throw new Error(
        `Balance: entregada=${r.potencias.entregada} W, disipada=${r.potencias.disipada} W`
      );
    }
  });

  test("Dos mallas · balance cuadra dentro de tolerancia", () => {
    const r = C.dosMallas({ V1: 12, V2: 9, R1: 2, R2: 4, R3: 6 });
    const dif = Math.abs(r.potencias.entregada - r.potencias.disipada);
    if (dif > 1e-6) {
      throw new Error(`Diferencia de balance: ${dif} W`);
    }
  });

  test("Dos mallas · corrientes esperadas para V1=12,V2=9,R1=2,R2=4,R3=6", () => {
    // Sistema:
    //   (R1+R2)·i1 − R2·i2 = V1   →  6·i1 − 4·i2 = 12
    //   −R2·i1 + (R2+R3)·i2 = −V2 →  −4·i1 + 10·i2 = −9
    // Δ = 44 · Δx = 84 · Δy = −6
    // i1 ≈ 1.9091 A · i2 ≈ −0.1364 A
    const r = C.dosMallas({ V1: 12, V2: 9, R1: 2, R2: 4, R3: 6 });
    expectEqual(r.sistema.det, 44, "Δ:");
    expectEqual(r.sistema.detX, 84, "Δx:");
    expectEqual(r.sistema.detY, -6, "Δy:");
    expectEqual(r.i1, C.round(84 / 44, 4), "i1:");
    expectEqual(r.i2, C.round(-6 / 44, 4), "i2:");
  });

  test("Dos mallas · resistencias inválidas", () => {
    expectError(() => C.dosMallas({ V1: 12, V2: 9, R1: 0, R2: 4, R3: 6 }), "RESISTENCIA_INVALIDA");
  });

  /* =========================================================
     Informe en consola
     ========================================================= */
  const total = passed + failed;
  const estiloTitulo = "font-weight: bold; font-size: 13px;";
  const estiloOK     = "color: #16a34a;";
  const estiloKO     = "color: #dc2626;";

  console.group("%cCircuitLab · Tests del motor matemático", estiloTitulo);
  results.forEach((r) => {
    if (r.ok) {
      console.log(`%c✔ ${r.nombre}`, estiloOK);
    } else {
      console.log(`%c✘ ${r.nombre}\n   → ${r.error}`, estiloKO);
    }
  });
  console.log(
    `%c${passed} / ${total} pruebas correctas${failed ? ` · ${failed} fallidas` : ""}`,
    failed ? estiloKO : estiloOK
  );
  console.groupEnd();

  // Acceso rápido desde consola
  window.CircuitLab.tests = {
    passed,
    failed,
    total,
    resultados: results
  };
})();