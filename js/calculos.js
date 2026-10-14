(function () {
  "use strict";

  /* Utilidades internas */

  const EPS = 1e-9;

  function round(value, decimals = 6) {
    if (!Number.isFinite(value)) return value;
    const factor = Math.pow(10, decimals);
    const r = Math.round(value * factor) / factor;
    return Object.is(r, -0) ? 0 : r;
  }

  function isFiniteNumber(v) {
    return typeof v === "number" && Number.isFinite(v);
  }

  function isPositive(v) {
    return isFiniteNumber(v) && v > 0;
  }

  function fail(code, message) {
    const err = new Error(message || code);
    err.code = code;
    throw err;
  }

  /* 1. Ley de Ohm */
  function leyDeOhm(target, data) {
    const { V, I, R } = data || {};

    switch (target) {
      case "V": {
        if (!isFiniteNumber(I) || !isFiniteNumber(R)) {
          fail("DATOS_INSUFICIENTES", "Se necesitan I y R para calcular V.");
        }
        const valor = I * R;
        return {
          valor: round(valor),
          unidad: "V",
          formula: "V = I × R",
          sustitucion: `V = ${I} × ${R}`
        };
      }
      case "I": {
        if (!isFiniteNumber(V) || !isFiniteNumber(R)) {
          fail("DATOS_INSUFICIENTES", "Se necesitan V y R para calcular I.");
        }
        if (R === 0) fail("DIVISION_POR_CERO", "La resistencia no puede ser cero.");
        const valor = V / R;
        return {
          valor: round(valor),
          unidad: "A",
          formula: "I = V / R",
          sustitucion: `I = ${V} / ${R}`
        };
      }
      case "R": {
        if (!isFiniteNumber(V) || !isFiniteNumber(I)) {
          fail("DATOS_INSUFICIENTES", "Se necesitan V e I para calcular R.");
        }
        if (I === 0) fail("DIVISION_POR_CERO", "La corriente no puede ser cero.");
        const valor = V / I;
        return {
          valor: round(valor),
          unidad: "Ω",
          formula: "R = V / I",
          sustitucion: `R = ${V} / ${I}`
        };
      }
      default:
        fail("TARGET_INVALIDO", `Magnitud desconocida: ${target}`);
    }
  }

  /* 2. Potencia eléctrica */
  function potencia(data) {
    const { V, I, R } = data || {};

    if (isFiniteNumber(V) && isFiniteNumber(I)) {
      return {
        valor: round(V * I),
        unidad: "W",
        formula: "P = V × I",
        sustitucion: `P = ${V} × ${I}`
      };
    }
    if (isFiniteNumber(I) && isFiniteNumber(R)) {
      return {
        valor: round(I * I * R),
        unidad: "W",
        formula: "P = I² × R",
        sustitucion: `P = ${I}² × ${R}`
      };
    }
    if (isFiniteNumber(V) && isFiniteNumber(R)) {
      if (R === 0) fail("DIVISION_POR_CERO", "La resistencia no puede ser cero.");
      return {
        valor: round((V * V) / R),
        unidad: "W",
        formula: "P = V² / R",
        sustitucion: `P = ${V}² / ${R}`
      };
    }
    fail("DATOS_INSUFICIENTES", "Se necesitan al menos dos magnitudes para calcular P.");
  }

  /* 3. Resistencia equivalente */
  function resistenciaSerie(resistencias) {
    if (!Array.isArray(resistencias) || resistencias.length === 0) {
      fail("SIN_RESISTENCIAS", "Debe haber al menos una resistencia.");
    }
    resistencias.forEach((r, i) => {
      if (!isPositive(r)) {
        fail("RESISTENCIA_INVALIDA", `R${i + 1} debe ser un número positivo finito.`);
      }
    });
    const suma = resistencias.reduce((acc, r) => acc + r, 0);
    return {
      valor: round(suma),
      unidad: "Ω",
      formula: "R_eq = R1 + R2 + ... + Rn",
      sustitucion: resistencias.join(" + ")
    };
  }

  function resistenciaParalelo(resistencias) {
    if (!Array.isArray(resistencias) || resistencias.length === 0) {
      fail("SIN_RESISTENCIAS", "Debe haber al menos una resistencia.");
    }
    resistencias.forEach((r, i) => {
      if (!isPositive(r)) {
        fail("RESISTENCIA_INVALIDA", `R${i + 1} debe ser un número positivo finito.`);
      }
    });

    const invSuma = resistencias.reduce((acc, r) => acc + 1 / r, 0);
    if (invSuma === 0) fail("DIVISION_POR_CERO", "La suma de inversos es cero.");
    const valor = 1 / invSuma;

    const terminos = resistencias.map((r) => `1/${r}`).join(" + ");
    return {
      valor: round(valor),
      unidad: "Ω",
      formula: "1 / R_eq = 1/R1 + 1/R2 + ... + 1/Rn",
      sustitucion: `1 / R_eq = ${terminos}`
    };
  }

  function resistenciaEquivalente(tipo, resistencias) {
    if (tipo === "serie")    return resistenciaSerie(resistencias);
    if (tipo === "paralelo") return resistenciaParalelo(resistencias);
    fail("TIPO_INVALIDO", `Tipo de conexión desconocido: ${tipo}`);
  }

  /* 4. Circuito en serie */
  function circuitoSerie(fuente, resistencias) {
    if (!isPositive(fuente)) {
      fail("FUENTE_INVALIDA", "El voltaje de la fuente debe ser positivo.");
    }
    const req = resistenciaSerie(resistencias);

    const corriente = fuente / req.valor;

    const componentes = resistencias.map((r, i) => {
      const v = corriente * r;
      const p = corriente * corriente * r;
      return {
        nombre: `R${i + 1}`,
        R: round(r),
        V: round(v),
        I: round(corriente),
        P: round(p)
      };
    });

    const potenciaTotal = componentes.reduce((acc, c) => acc + c.P, 0);

    return {
      tipo: "serie",
      fuente: round(fuente),
      Req: req.valor,
      Itotal: round(corriente),
      Vtotal: round(fuente),
      Ptotal: round(potenciaTotal),
      componentes,
      procedimiento: {
        reqFormula: req.formula,
        reqSustitucion: req.sustitucion,
        corrienteFormula: "I = V / R_eq",
        corrienteSustitucion: `I = ${fuente} / ${req.valor}`
      }
    };
  }

  /* 5. Circuito en paralelo */
  function circuitoParalelo(fuente, resistencias) {
    if (!isPositive(fuente)) {
      fail("FUENTE_INVALIDA", "El voltaje de la fuente debe ser positivo.");
    }
    const req = resistenciaParalelo(resistencias);

    const componentes = resistencias.map((r, i) => {
      const corrienteRama = fuente / r;
      const p = fuente * corrienteRama;
      return {
        nombre: `R${i + 1}`,
        R: round(r),
        V: round(fuente),        
        I: round(corrienteRama),
        P: round(p)
      };
    });

    const corrienteTotal = componentes.reduce((acc, c) => acc + c.I, 0);
    const potenciaTotal  = componentes.reduce((acc, c) => acc + c.P, 0);

    return {
      tipo: "paralelo",
      fuente: round(fuente),
      Req: req.valor,
      Itotal: round(corrienteTotal),
      Vtotal: round(fuente),
      Ptotal: round(potenciaTotal),
      componentes,
      procedimiento: {
        reqFormula: req.formula,
        reqSustitucion: req.sustitucion,
        corrienteFormula: "I_total = I1 + I2 + ... + In",
        corrienteSustitucion: componentes.map((c) => c.I).join(" + ")
      }
    };
  }

  /* 6. Circuito mixto prediseñado */
  function circuitoMixto(topologia, fuente, resistencias) {
    if (!isPositive(fuente)) {
      fail("FUENTE_INVALIDA", "El voltaje de la fuente debe ser positivo.");
    }
    if (!Array.isArray(resistencias)) {
      fail("SIN_RESISTENCIAS", "Las resistencias deben venir en un arreglo.");
    }

    switch (topologia) {
      case "t1": return mixtoT1(fuente, resistencias);
      case "t2": return mixtoT2(fuente, resistencias);
      case "t3": return mixtoT3(fuente, resistencias);
      default:   fail("TOPOLOGIA_INVALIDA", `Topología desconocida: ${topologia}`);
    }
  }

  function mixtoT1(fuente, r) {
    if (r.length !== 3) fail("ARGS_INVALIDOS", "t1 requiere 3 resistencias: [Rs, Rp1, Rp2].");
    const [Rs, Rp1, Rp2] = r;
    if (!isPositive(Rs) || !isPositive(Rp1) || !isPositive(Rp2)) {
      fail("RESISTENCIA_INVALIDA", "Todas las resistencias deben ser positivas.");
    }

    const rpEq = 1 / (1 / Rp1 + 1 / Rp2);
    const req  = Rs + rpEq;
    const itot = fuente / req;

    const vRs = itot * Rs;
    const vRp = fuente - vRs;

    const iRp1 = vRp / Rp1;
    const iRp2 = vRp / Rp2;

    return {
      tipo: "mixto-t1",
      fuente: round(fuente),
      Req: round(req),
      Itotal: round(itot),
      Vtotal: round(fuente),
      Ptotal: round(fuente * itot),
      componentes: [
        { nombre: "Rs",  R: round(Rs),  V: round(vRs), I: round(itot), P: round(vRs * itot) },
        { nombre: "Rp1", R: round(Rp1), V: round(vRp), I: round(iRp1), P: round(vRp * iRp1) },
        { nombre: "Rp2", R: round(Rp2), V: round(vRp), I: round(iRp2), P: round(vRp * iRp2) }
      ],
      procedimiento: {
        pasos: [
          `Rp_eq = 1 / (1/${Rp1} + 1/${Rp2}) = ${round(rpEq)} Ω`,
          `R_eq = Rs + Rp_eq = ${Rs} + ${round(rpEq)} = ${round(req)} Ω`,
          `I_total = V / R_eq = ${fuente} / ${round(req)} = ${round(itot)} A`,
          `V_Rs = I_total × Rs = ${round(vRs)} V`,
          `V_Rp (paralelo) = V - V_Rs = ${round(vRp)} V`,
          `I_Rp1 = V_Rp / Rp1 = ${round(iRp1)} A`,
          `I_Rp2 = V_Rp / Rp2 = ${round(iRp2)} A`
        ]
      }
    };
  }

  function mixtoT2(fuente, r) {
    if (r.length !== 3) fail("ARGS_INVALIDOS", "t2 requiere 3 resistencias: [R1, R2, R3].");
    const [R1, R2, R3] = r;
    if (!isPositive(R1) || !isPositive(R2) || !isPositive(R3)) {
      fail("RESISTENCIA_INVALIDA", "Todas las resistencias deben ser positivas.");
    }

    const rpEq = 1 / (1 / R2 + 1 / R3);
    const req  = R1 + rpEq;
    const itot = fuente / req;

    const vR1 = itot * R1;
    const vRp = fuente - vR1;

    const iR2 = vRp / R2;
    const iR3 = vRp / R3;

    return {
      tipo: "mixto-t2",
      fuente: round(fuente),
      Req: round(req),
      Itotal: round(itot),
      Vtotal: round(fuente),
      Ptotal: round(fuente * itot),
      componentes: [
        { nombre: "R1", R: round(R1), V: round(vR1), I: round(itot), P: round(vR1 * itot) },
        { nombre: "R2", R: round(R2), V: round(vRp), I: round(iR2), P: round(vRp * iR2) },
        { nombre: "R3", R: round(R3), V: round(vRp), I: round(iR3), P: round(vRp * iR3) }
      ],
      procedimiento: {
        pasos: [
          `Rp_eq (R2 || R3) = 1 / (1/${R2} + 1/${R3}) = ${round(rpEq)} Ω`,
          `R_eq = R1 + Rp_eq = ${R1} + ${round(rpEq)} = ${round(req)} Ω`,
          `I_total = V / R_eq = ${fuente} / ${round(req)} = ${round(itot)} A`,
          `V_R1 = I_total × R1 = ${round(vR1)} V`,
          `V_R2 = V_R3 = V - V_R1 = ${round(vRp)} V`,
          `I_R2 = V_R2 / R2 = ${round(iR2)} A`,
          `I_R3 = V_R3 / R3 = ${round(iR3)} A`
        ]
      }
    };
  }

  function mixtoT3(fuente, r) {
    if (r.length !== 4) fail("ARGS_INVALIDOS", "t3 requiere 4 resistencias: [R1, R2, R3, R4].");
    const [R1, R2, R3, R4] = r;
    if (!isPositive(R1) || !isPositive(R2) || !isPositive(R3) || !isPositive(R4)) {
      fail("RESISTENCIA_INVALIDA", "Todas las resistencias deben ser positivas.");
    }

    const rp1 = 1 / (1 / R1 + 1 / R2);
    const rp2 = 1 / (1 / R3 + 1 / R4);
    const req = rp1 + rp2;
    const itot = fuente / req;

    const vP1 = itot * rp1;
    const vP2 = itot * rp2;

    const iR1 = vP1 / R1;
    const iR2 = vP1 / R2;
    const iR3 = vP2 / R3;
    const iR4 = vP2 / R4;

    return {
      tipo: "mixto-t3",
      fuente: round(fuente),
      Req: round(req),
      Itotal: round(itot),
      Vtotal: round(fuente),
      Ptotal: round(fuente * itot),
      componentes: [
        { nombre: "R1", R: round(R1), V: round(vP1), I: round(iR1), P: round(vP1 * iR1) },
        { nombre: "R2", R: round(R2), V: round(vP1), I: round(iR2), P: round(vP1 * iR2) },
        { nombre: "R3", R: round(R3), V: round(vP2), I: round(iR3), P: round(vP2 * iR3) },
        { nombre: "R4", R: round(R4), V: round(vP2), I: round(iR4), P: round(vP2 * iR4) }
      ],
      procedimiento: {
        pasos: [
          `Rp1 (R1 || R2) = 1 / (1/${R1} + 1/${R2}) = ${round(rp1)} Ω`,
          `Rp2 (R3 || R4) = 1 / (1/${R3} + 1/${R4}) = ${round(rp2)} Ω`,
          `R_eq = Rp1 + Rp2 = ${round(req)} Ω`,
          `I_total = V / R_eq = ${round(itot)} A`,
          `V_P1 (paralelo 1) = I_total × Rp1 = ${round(vP1)} V`,
          `V_P2 (paralelo 2) = I_total × Rp2 = ${round(vP2)} V`,
          `I_R1 = V_P1 / R1 = ${round(iR1)} A`,
          `I_R2 = V_P1 / R2 = ${round(iR2)} A`,
          `I_R3 = V_P2 / R3 = ${round(iR3)} A`,
          `I_R4 = V_P2 / R4 = ${round(iR4)} A`
        ]
      }
    };
  }

  /* 7. Leyes de Kirchhoff */
  function leyCorrientes(entrantes, salientes) {
    if (!Array.isArray(entrantes) || !Array.isArray(salientes)) {
      fail("ARGS_INVALIDOS", "Se esperan dos arreglos de corrientes.");
    }
    [...entrantes, ...salientes].forEach((v, i) => {
      if (!isFiniteNumber(v)) fail("CORRIENTE_INVALIDA", `Corriente no válida en posición ${i}.`);
    });

    const entra = entrantes.reduce((a, b) => a + b, 0);
    const sale  = salientes.reduce((a, b) => a + b, 0);
    const dif   = entra - sale;

    return {
      ecuacion: `${entrantes.join(" + ")} = ${salientes.join(" + ")}`,
      entra: round(entra),
      sale:  round(sale),
      diferencia: round(dif),
      cumple: Math.abs(dif) < 1e-6
    };
  }

  function corrienteFaltante(conocidas, otras) {
    if (!Array.isArray(conocidas) || !Array.isArray(otras)) {
      fail("ARGS_INVALIDOS", "Se esperan dos arreglos de corrientes.");
    }
    const sumaConocidas = conocidas.reduce((a, b) => a + b, 0);
    const sumaOtras     = otras.reduce((a, b) => a + b, 0);
    return {
      valor: round(sumaConocidas - sumaOtras),
      unidad: "A",
      ecuacion: `${conocidas.join(" + ")} = ${[...otras, "Ix"].join(" + ")}`
    };
  }

  function leyVoltajes(voltajes) {
    if (!Array.isArray(voltajes) || voltajes.length === 0) {
      fail("ARGS_INVALIDOS", "Se espera un arreglo de voltajes.");
    }
    voltajes.forEach((v, i) => {
      if (!isFiniteNumber(v)) fail("VOLTAJE_INVALIDO", `Voltaje no válido en posición ${i}.`);
    });

    const suma = voltajes.reduce((a, b) => a + b, 0);
    return {
      ecuacion: voltajes.map((v) => (v >= 0 ? `+ ${v}` : `- ${Math.abs(v)}`)).join(" "),
      suma: round(suma),
      cumple: Math.abs(suma) < 1e-6
    };
  }

  /* 8. Comprobación de balance de potencia */
  function balancePotencia(potenciaFuente, potenciasComponentes) {
    if (!isFiniteNumber(potenciaFuente) || !Array.isArray(potenciasComponentes)) {
      fail("ARGS_INVALIDOS", "Se espera una potencia de fuente y un arreglo de potencias.");
    }
    const suma = potenciasComponentes.reduce((a, b) => a + b, 0);
    const dif  = potenciaFuente - suma;
    return {
      fuente: round(potenciaFuente),
      consumida: round(suma),
      diferencia: round(dif),
      cumple: Math.abs(dif) < 1e-6
    };
  }

    /* 9. Kirchhoff */
  function voltajeFaltante(conocidos) {
    if (!Array.isArray(conocidos) || conocidos.length === 0) {
      fail("ARGS_INVALIDOS", "Se espera un arreglo de voltajes conocidos.");
    }
    conocidos.forEach((v, i) => {
      if (!isFiniteNumber(v)) fail("VOLTAJE_INVALIDO", `Voltaje no válido en posición ${i}.`);
    });
    const suma = conocidos.reduce((a, b) => a + b, 0);
    return {
      valor: round(-suma),
      unidad: "V",
      ecuacion: `${conocidos.map((v) => (v >= 0 ? `+ ${v}` : `- ${Math.abs(v)}`)).join(" ")} + Vx = 0`
    };
  }

  function sistema2x2(a1, b1, c1, a2, b2, c2) {
    const coefs = [a1, b1, c1, a2, b2, c2];
    coefs.forEach((v, i) => {
      if (!isFiniteNumber(v)) fail("COEFICIENTE_INVALIDO", `Coeficiente no válido en posición ${i}.`);
    });

    const det  = a1 * b2 - a2 * b1;
    const detX = c1 * b2 - c2 * b1;
    const detY = a1 * c2 - a2 * c1;

    if (Math.abs(det) < EPS) {
      fail("SISTEMA_SINGULAR", "El sistema no tiene solución única (determinante = 0).");
    }

    const x = detX / det;
    const y = detY / det;

    return {
      x: round(x),
      y: round(y),
      det:  round(det),
      detX: round(detX),
      detY: round(detY),
      pasos: [
        `Determinante principal: Δ = (${a1})(${b2}) − (${a2})(${b1}) = ${round(det)}`,
        `Determinante de x: Δx = (${c1})(${b2}) − (${c2})(${b1}) = ${round(detX)}`,
        `Determinante de y: Δy = (${a1})(${c2}) − (${a2})(${c1}) = ${round(detY)}`,
        `x = Δx / Δ = ${round(detX)} / ${round(det)} = ${round(x)}`,
        `y = Δy / Δ = ${round(detY)} / ${round(det)} = ${round(y)}`
      ]
    };
  }

  function dosMallas(data) {
    const { V1, V2, R1, R2, R3 } = data || {};

    if (!isPositive(R1) || !isPositive(R2) || !isPositive(R3)) {
      fail("RESISTENCIA_INVALIDA", "Todas las resistencias deben ser positivas.");
    }
    if (!isFiniteNumber(V1) || !isFiniteNumber(V2)) {
      fail("FUENTE_INVALIDA", "Ambas fuentes deben ser números finitos.");
    }

    const a1 = R1 + R2;
    const b1 = -R2;
    const c1 = V1;

    const a2 = -R2;
    const b2 = R2 + R3;
    const c2 = -V2;

    const sol = sistema2x2(a1, b1, c1, a2, b2, c2);

    const i1 = sol.x;
    const i2 = sol.y;

    // Corriente por R2
    const iR2 = i1 - i2;

    // Voltajes de cada resistencia
    const vR1 = i1 * R1;
    const vR2 = iR2 * R2;
    const vR3 = i2 * R3;

    // Potencias disipadas
    const pR1 = i1 * i1 * R1;
    const pR2 = iR2 * iR2 * R2;
    const pR3 = i2 * i2 * R3;
    const disipada = pR1 + pR2 + pR3;

    const pV1firmada = V1 * i1;
    const pV2firmada = V2 * i2;
    const pV1 = Math.abs(pV1firmada);
    const pV2 = Math.abs(pV2firmada);
    const entregada = pV1 + pV2;

    const balance = Math.abs(entregada - disipada) < 1e-6;

    return {
      tipo: "dos-mallas",
      datos: { V1: round(V1), V2: round(V2), R1: round(R1), R2: round(R2), R3: round(R3) },
      i1: round(i1),
      i2: round(i2),
      iR2: round(iR2),
      componentes: [
        { nombre: "R1", R: round(R1), V: round(vR1), I: round(i1),  P: round(pR1) },
        { nombre: "R2", R: round(R2), V: round(vR2), I: round(iR2), P: round(pR2) },
        { nombre: "R3", R: round(R3), V: round(vR3), I: round(i2),  P: round(pR3) }
      ],
            fuentes: [
        {
          nombre: "V1",
          V: round(V1),
          I: round(i1),
          P: round(pV1),              
          P_firmada: round(pV1firmada)
        },
        {
          nombre: "V2",
          V: round(V2),
          I: round(i2),
          P: round(pV2),
          P_firmada: round(pV2firmada)
        }
      ],
      potencias: {
        entregada: round(entregada),
        disipada:  round(disipada),
        balanceOK: balance
      },
      sistema: {
        malla1: { a: round(a1), b: round(b1), c: round(c1), texto: `(${a1})·i1 + (${b1})·i2 = ${c1}` },
        malla2: { a: round(a2), b: round(b2), c: round(c2), texto: `(${a2})·i1 + (${b2})·i2 = ${c2}` },
        det:  sol.det,
        detX: sol.detX,
        detY: sol.detY,
        pasos: sol.pasos
      }
    };
  }

  /* Exportación */

  window.CircuitLab = window.CircuitLab || {};
  window.CircuitLab.calculos = {
    // Utilidades
    round,
    isFiniteNumber,
    isPositive,

    // Magnitudes
    leyDeOhm,
    potencia,

    // Resistencias equivalentes
    resistenciaSerie,
    resistenciaParalelo,
    resistenciaEquivalente,

    // Circuitos
    circuitoSerie,
    circuitoParalelo,
    circuitoMixto,

    // Kirchhoff
    leyCorrientes,
    corrienteFaltante,
    leyVoltajes,
    voltajeFaltante,

    // Sistemas y mallas
    sistema2x2,
    dosMallas,

    // Comprobaciones
    balancePotencia
  };

})();