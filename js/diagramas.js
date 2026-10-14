(function () {
  "use strict";

  /* Constantes de dibujo */
  const MARGIN   = 24;
  const UNIT     = 70;
  const ROW_H    = 120;
  const RES_W    = 52;
  const RES_H    = 22;
  const BAT_W    = 28;
  const BAT_H    = 44;
  const ARROW_SZ = 7;

  /* Utilidades */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function fmtNum(v) {
    const n = Math.round(v * 10000) / 10000;
    return String(n);
  }

  function fmt(v, u) {
    return `${fmtNum(v)}${u ? " " + u : ""}`;
  }

  /* Símbolos */

  function resistor(x, y, etiqueta, valor) {
    const w = RES_W;
    const h = RES_H;
    const x1 = x - w / 2;
    const y1 = y - h / 2;

    const seg = w / 6;
    const pts = [
      [x1, y],
      [x1 + seg * 0.5, y - h / 2],
      [x1 + seg * 1.5, y + h / 2],
      [x1 + seg * 2.5, y - h / 2],
      [x1 + seg * 3.5, y + h / 2],
      [x1 + seg * 4.5, y - h / 2],
      [x1 + seg * 5.5, y + h / 2],
      [x1 + w, y]
    ];
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

    const valorTxt = valor != null ? `<text class="label-soft" x="${x}" y="${y + h / 2 + 16}" text-anchor="middle">${esc(valor)}</text>` : "";

    return `
      <path class="resistor" d="${d}" />
      <text class="label" x="${x}" y="${y - h / 2 - 8}" text-anchor="middle">${esc(etiqueta)}</text>
      ${valorTxt}
    `;
  }

  function bateria(x, y, etiqueta) {
    return `
      <line class="battery" x1="${x - BAT_W / 2}" y1="${y}" x2="${x + BAT_W / 2}" y2="${y}" />
      <line class="battery" x1="${x - BAT_W / 3}" y1="${y - 9}" x2="${x + BAT_W / 3}" y2="${y - 9}" />
      <line class="battery" x1="${x - BAT_W / 2}" y1="${y - 18}" x2="${x + BAT_W / 2}" y2="${y - 18}" />
      <text class="label" x="${x - BAT_W / 2 - 6}" y="${y - 6}" text-anchor="end">${esc(etiqueta)}</text>
      <text class="label-soft" x="${x + BAT_W / 2 + 4}" y="${y - 6}">+</text>
    `;
  }

  function nodo(x, y, etiqueta) {
    const label = etiqueta
      ? `<text class="label" x="${x + 8}" y="${y - 8}">${esc(etiqueta)}</text>`
      : "";
    return `<circle class="node" cx="${x}" cy="${y}" r="4" />${label}`;
  }

  function flechaCorrienteH(x, y, etiqueta) {
    const w = 32;
    return `
      <g class="current-arrow">
        <line class="current" x1="${x - w / 2}" y1="${y}" x2="${x + w / 2 - ARROW_SZ}" y2="${y}" />
        <polygon class="current"
          points="${x + w / 2 - ARROW_SZ},${y - 5} ${x + w / 2},${y} ${x + w / 2 - ARROW_SZ},${y + 5}" />
        <text class="label-current" x="${x}" y="${y - 8}" text-anchor="middle">${esc(etiqueta)}</text>
      </g>
    `;
  }

  function flechaCorrienteV(x, y, dir, etiqueta) {
    const h = 30;
    const y2 = y + dir * h / 2;
    const y1 = y - dir * h / 2;
    const tipY = dir > 0 ? y2 : y1;
    const baseY = tipY - dir * ARROW_SZ;
    return `
      <g class="current-arrow">
        <line class="current" x1="${x}" y1="${y1}" x2="${x}" y2="${baseY}" />
        <polygon class="current"
          points="${x - 5},${baseY} ${x},${tipY} ${x + 5},${baseY}" />
        <text class="label-current" x="${x + 10}" y="${y}" text-anchor="start">${esc(etiqueta)}</text>
      </g>
    `;
  }

  function marcaVoltajeH(x, y, valor) {
    const dx = RES_W / 2 + 14;
    return `
      <g class="voltage-marks">
        <text class="label-voltage" x="${x - dx}" y="${y - 8}" text-anchor="middle">+</text>
        <text class="label-voltage" x="${x + dx}" y="${y - 8}" text-anchor="middle">−</text>
        <text class="label-voltage" x="${x}" y="${y - RES_H / 2 - 24}" text-anchor="middle">${esc(valor)}</text>
      </g>
    `;
  }

  /* SERIE  */
  function serie(data) {
    const n = data.componentes.length;
    const ancho = MARGIN * 2 + UNIT * (n + 2);
    const alto  = ROW_H * 2;
    const yTop  = MARGIN + 30;
    const yBot  = alto - MARGIN - 30;
    const yMid  = (yTop + yBot) / 2;

    const batX = MARGIN + 30;
    const batY = yMid;
    const primerX = batX + UNIT;

    const partes = [];

    // Marco del diagrama
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" />`);

    // Cables superior e inferior
    partes.push(`<line class="wire" x1="${batX}" y1="${yTop}" x2="${ancho - MARGIN}" y2="${yTop}" />`);
    partes.push(`<line class="wire" x1="${batX}" y1="${yBot}" x2="${ancho - MARGIN}" y2="${yBot}" />`);

    // Batería
    partes.push(`<line class="wire" x1="${batX}" y1="${yTop}" x2="${batX}" y2="${batY - BAT_H / 2}" />`);
    partes.push(`<line class="wire" x1="${batX}" y1="${yBot}" x2="${batX}" y2="${batY + BAT_H / 2}" />`);
    partes.push(bateria(batX, batY, `${fmt(data.fuente, "V")}`));

    // Resistencias
    data.componentes.forEach((c, i) => {
      const x = primerX + i * UNIT;
      partes.push(`<line class="wire" x1="${x}" y1="${yTop}" x2="${x}" y2="${yMid - RES_H / 2}" />`);
      partes.push(`<line class="wire" x1="${x}" y1="${yMid + RES_H / 2}" x2="${x}" y2="${yBot}" />`);
      partes.push(resistor(x, yMid, c.nombre, `${fmt(c.R, "Ω")}`));
      partes.push(marcaVoltajeH(x, yMid, `V = ${fmt(c.V, "V")}`));
    });

    // Nodos en las esquinas
    partes.push(nodo(batX, yTop, "A"));
    partes.push(nodo(ancho - MARGIN, yTop, "B"));

    // Flecha de corriente en el cable superior
    const xFlecha = batX + UNIT * 0.5;
    partes.push(flechaCorrienteH(xFlecha, yTop, `I = ${fmt(data.Itotal, "A")}`));

    // Flecha de corriente en el cable inferior
    partes.push(`
      <g class="current-arrow">
        <line class="current" x1="${ancho - MARGIN - 30}" y1="${yBot}" x2="${batX + 30}" y2="${yBot}" />
        <polygon class="current"
          points="${batX + 30 - ARROW_SZ},${yBot - 5} ${batX + 30},${yBot} ${batX + 30 - ARROW_SZ},${yBot + 5}" />
      </g>
    `);

    return `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Circuito en serie">
      ${partes.join("")}
    </svg>`;
  }

  /* PARALELO */
  function paralelo(data) {
    const n = data.componentes.length;
    const rowH = 80;
    const alto = MARGIN * 2 + rowH * n;
    const ancho = MARGIN * 2 + UNIT * 4;

    const xBat  = MARGIN + 30;
    const xLeft = xBat + UNIT;
    const xRight = ancho - MARGIN;
    const xRes  = (xLeft + xRight) / 2;

    const yFirst = MARGIN + rowH / 2;
    const yLast  = MARGIN + rowH * (n - 1) + rowH / 2;

    const partes = [];
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" />`);

    // Barra superior e inferior
    partes.push(`<line class="wire" x1="${xLeft}" y1="${yFirst}" x2="${xLeft}" y2="${yLast}" />`);
    partes.push(`<line class="wire" x1="${xRight}" y1="${yFirst}" x2="${xRight}" y2="${yLast}" />`);
    partes.push(nodo(xLeft, yFirst, "A"));
    partes.push(nodo(xRight, yFirst, "B"));

    // Batería
    const yBat = (yFirst + yLast) / 2;
    partes.push(`<line class="wire" x1="${xBat}" y1="${yFirst}" x2="${xLeft}" y2="${yFirst}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yLast}" x2="${xLeft}" y2="${yLast}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yBat - BAT_H / 2}" x2="${xBat}" y2="${yFirst}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yBat + BAT_H / 2}" x2="${xBat}" y2="${yLast}" />`);
    partes.push(bateria(xBat, yBat, `${fmt(data.fuente, "V")}`));

    // Ramas
    data.componentes.forEach((c, i) => {
      const y = MARGIN + rowH * i + rowH / 2;
      partes.push(`<line class="wire" x1="${xLeft}" y1="${y}" x2="${xRes - RES_W / 2}" y2="${y}" />`);
      partes.push(`<line class="wire" x1="${xRes + RES_W / 2}" y1="${y}" x2="${xRight}" y2="${y}" />`);
      partes.push(resistor(xRes, y, c.nombre, `${fmt(c.R, "Ω")}`));
      partes.push(nodo(xLeft, y));
      partes.push(nodo(xRight, y));

      // Flecha de corriente en la rama
      const xFlecha = xLeft + (xRes - RES_W / 2 - xLeft) / 2;
      partes.push(flechaCorrienteH(xFlecha, y, `I=${fmt(c.I, "A")}`));

      // Valor de voltaje
      partes.push(`<text class="label-voltage" x="${xRight + 6}" y="${y + 4}">${fmt(c.V, "V")}</text>`);
    });

    return `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Circuito en paralelo">
      ${partes.join("")}
    </svg>`;
  }

  /* MIXTO t1: Rs + (Rp1 || Rp2) */
  function mixtoT1(data) {
    const ancho = 520;
    const alto  = 240;
    const yTop = 50;
    const yMid = 120;
    const yBot = 190;

    const xBat = 30;
    const xRs  = 140;
    const xRp1 = 330;
    const xRp2 = 330;
    const xEnd = 470;

    const partes = [];
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" />`);

    // Batería
    partes.push(bateria(xBat, yMid, `${fmt(data.fuente, "V")}`));
    partes.push(`<line class="wire" x1="${xBat}" y1="${yMid - BAT_H / 2}" x2="${xBat}" y2="${yTop}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yTop}" x2="${xRs - RES_W / 2}" y2="${yTop}" />`);

    // Rama de Rs
    partes.push(resistor(xRs, yTop, "Rs", `${fmt(data.componentes[0].R, "Ω")}`));
    partes.push(`<line class="wire" x1="${xRs + RES_W / 2}" y1="${yTop}" x2="${xRp1 - RES_W / 2}" y2="${yTop}" />`);

    // Bifurcación
    const xSplit = xRp1 - RES_W / 2;
    partes.push(nodo(xSplit, yTop, "B"));
    partes.push(`<line class="wire" x1="${xSplit}" y1="${yTop}" x2="${xSplit}" y2="${yMid - 30}" />`);
    partes.push(`<line class="wire" x1="${xSplit}" y1="${yMid + 30}" x2="${xSplit}" y2="${yBot}" />`);
    partes.push(nodo(xSplit, yMid));

    // Rama Rp1
    partes.push(`<line class="wire" x1="${xSplit}" y1="${yTop}" x2="${xRp1 - RES_W / 2}" y2="${yTop}" />`);
    partes.push(resistor(xRp1, yTop, "Rp1", `${fmt(data.componentes[1].R, "Ω")}`));
    partes.push(`<line class="wire" x1="${xRp1 + RES_W / 2}" y1="${yTop}" x2="${xEnd}" y2="${yTop}" />`);

    // Rama Rp2
    partes.push(`<line class="wire" x1="${xSplit}" y1="${yBot}" x2="${xRp2 - RES_W / 2}" y2="${yBot}" />`);
    partes.push(resistor(xRp2, yBot, "Rp2", `${fmt(data.componentes[2].R, "Ω")}`));
    partes.push(`<line class="wire" x1="${xRp2 + RES_W / 2}" y1="${yBot}" x2="${xEnd}" y2="${yBot}" />`);

    // Cierre por la derecha
    partes.push(`<line class="wire" x1="${xEnd}" y1="${yTop}" x2="${xEnd}" y2="${yBot}" />`);
    // Vuelta al borne inferior
    partes.push(`<line class="wire" x1="${xEnd}" y1="${yBot}" x2="${xBat}" y2="${yBot}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yBot}" x2="${xBat}" y2="${yMid + BAT_H / 2}" />`);

    // Nodos
    partes.push(nodo(xEnd, yTop, "C"));
    partes.push(nodo(xEnd, yBot, "D"));
    partes.push(nodo(xBat, yBot, ""));

    // Flechas de corriente
    partes.push(flechaCorrienteH(xBat + 30, yTop, `I=${fmt(data.Itotal, "A")}`));
    partes.push(flechaCorrienteH(xRs + RES_W / 2 + 20, yTop, "")); // seguimos por Rs
    partes.push(flechaCorrienteH(xRp1 - RES_W / 2 - 20, yTop, `I=${fmt(data.componentes[1].I, "A")}`));
    partes.push(flechaCorrienteH(xRp2 - RES_W / 2 - 20, yBot, `I=${fmt(data.componentes[2].I, "A")}`));

    // Voltajes
    partes.push(marcaVoltajeH(xRs, yTop, `V=${fmt(data.componentes[0].V, "V")}`));
    partes.push(marcaVoltajeH(xRp1, yTop, `V=${fmt(data.componentes[1].V, "V")}`));
    partes.push(marcaVoltajeH(xRp2, yBot, `V=${fmt(data.componentes[2].V, "V")}`));

    return `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Circuito mixto t1">
      ${partes.join("")}
    </svg>`;
  }

  /* MIXTO t2: R1 + (R2 || R3) — misma forma que t1 con otras etiquetas */
  function mixtoT2(data) {
    let svg = mixtoT1(data);
    svg = svg.replace(">Rs<", ">R1<").replace(">Rp1<", ">R2<").replace(">Rp2<", ">R3<");
    svg = svg.replace('aria-label="Circuito mixto t1"', 'aria-label="Circuito mixto t2"');
    return svg;
  }

  /* MIXTO t3: (R1 || R2) + (R3 || R4) */
  function mixtoT3(data) {
    const ancho = 580;
    const alto  = 260;
    const yTop = 60;
    const yBot = 200;

    const xBat    = 30;
    const xSplit1 = 130;
    const xR1     = 210;
    const xR2     = 210;
    const xMid    = 320;
    const xR3     = 400;
    const xR4     = 400;
    const xEnd    = 550;

    const partes = [];
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" />`);

    // Batería
    const yMid = (yTop + yBot) / 2;
    partes.push(bateria(xBat, yMid, `${fmt(data.fuente, "V")}`));
    partes.push(`<line class="wire" x1="${xBat}" y1="${yMid + BAT_H / 2}" x2="${xBat}" y2="${yBot}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yBot}" x2="${xSplit1}" y2="${yBot}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yMid - BAT_H / 2}" x2="${xBat}" y2="${yTop}" />`);
    partes.push(`<line class="wire" x1="${xBat}" y1="${yTop}" x2="${xSplit1}" y2="${yTop}" />`);

    // Bloque 1
    partes.push(`<line class="wire" x1="${xSplit1}" y1="${yTop}" x2="${xSplit1}" y2="${yBot}" />`);
    partes.push(`<line class="wire" x1="${xSplit1}" y1="${yTop}" x2="${xR1 - RES_W / 2}" y2="${yTop}" />`);
    partes.push(resistor(xR1, yTop, "R1", `${fmt(data.componentes[0].R, "Ω")}`));
    partes.push(`<line class="wire" x1="${xR1 + RES_W / 2}" y1="${yTop}" x2="${xMid}" y2="${yTop}" />`);
    partes.push(`<line class="wire" x1="${xSplit1}" y1="${yBot}" x2="${xR2 - RES_W / 2}" y2="${yBot}" />`);
    partes.push(resistor(xR2, yBot, "R2", `${fmt(data.componentes[1].R, "Ω")}`));
    partes.push(`<line class="wire" x1="${xR2 + RES_W / 2}" y1="${yBot}" x2="${xMid}" y2="${yBot}" />`);
    partes.push(`<line class="wire" x1="${xMid}" y1="${yTop}" x2="${xMid}" y2="${yBot}" />`);
    partes.push(nodo(xSplit1, yTop, "A"));
    partes.push(nodo(xSplit1, yBot));
    partes.push(nodo(xMid, yTop, "B"));
    partes.push(nodo(xMid, yBot));

    // Bloque 2
    partes.push(`<line class="wire" x1="${xMid}" y1="${yTop}" x2="${xR3 - RES_W / 2}" y2="${yTop}" />`);
    partes.push(resistor(xR3, yTop, "R3", `${fmt(data.componentes[2].R, "Ω")}`));
    partes.push(`<line class="wire" x1="${xR3 + RES_W / 2}" y1="${yTop}" x2="${xEnd}" y2="${yTop}" />`);
    partes.push(`<line class="wire" x1="${xMid}" y1="${yBot}" x2="${xR4 - RES_W / 2}" y2="${yBot}" />`);
    partes.push(resistor(xR4, yBot, "R4", `${fmt(data.componentes[3].R, "Ω")}`));
    partes.push(`<line class="wire" x1="${xR4 + RES_W / 2}" y1="${yBot}" x2="${xEnd}" y2="${yBot}" />`);
    partes.push(`<line class="wire" x1="${xEnd}" y1="${yTop}" x2="${xEnd}" y2="${yBot}" />`);
    partes.push(nodo(xEnd, yTop, "C"));
    partes.push(nodo(xEnd, yBot));

    // Flechas de corriente
    partes.push(flechaCorrienteH(xBat + 30, yTop, `I=${fmt(data.Itotal, "A")}`));
    partes.push(flechaCorrienteH(xR1 - RES_W / 2 - 20, yTop, `I=${fmt(data.componentes[0].I, "A")}`));
    partes.push(flechaCorrienteH(xR2 - RES_W / 2 - 20, yBot, `I=${fmt(data.componentes[1].I, "A")}`));
    partes.push(flechaCorrienteH(xR3 - RES_W / 2 - 20, yTop, `I=${fmt(data.componentes[2].I, "A")}`));
    partes.push(flechaCorrienteH(xR4 - RES_W / 2 - 20, yBot, `I=${fmt(data.componentes[3].I, "A")}`));

    // Voltajes
    partes.push(marcaVoltajeH(xR1, yTop, `V=${fmt(data.componentes[0].V, "V")}`));
    partes.push(marcaVoltajeH(xR2, yBot, `V=${fmt(data.componentes[1].V, "V")}`));
    partes.push(marcaVoltajeH(xR3, yTop, `V=${fmt(data.componentes[2].V, "V")}`));
    partes.push(marcaVoltajeH(xR4, yBot, `V=${fmt(data.componentes[3].V, "V")}`));

    return `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Circuito mixto t3">
      ${partes.join("")}
    </svg>`;
  }

  /* Despachador mixto */
  function mixto(data) {
    switch (data.tipo) {
      case "mixto-t1": return mixtoT1(data);
      case "mixto-t2": return mixtoT2(data);
      case "mixto-t3": return mixtoT3(data);
      default:         return "";
    }
  }

  function resistencias(tipo, valores, req) {
    if (tipo === "serie") return resistenciaSerieSVG(valores, req);
    if (tipo === "paralelo") return resistenciaParaleloSVG(valores, req);
    return "";
  }

  function resistenciaSerieSVG(valores, req) {
    const n = valores.length;
    const ancho = MARGIN * 2 + UNIT * n + 40;
    const alto  = 130;
    const yMid  = alto / 2;
    const xStart = MARGIN + 20;

    const partes = [];
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" />`);
    partes.push(`<line class="wire" x1="${xStart}" y1="${yMid}" x2="${xStart + UNIT * n + 20}" y2="${yMid}" />`);

    valores.forEach((v, i) => {
      const x = xStart + 20 + i * UNIT + UNIT / 2;
      partes.push(resistor(x, yMid, `R${i + 1}`, `${fmtNum(v)} Ω`));
    });

    // Etiqueta de Req
    partes.push(`<text class="label-soft" x="${ancho / 2}" y="${alto - 12}" text-anchor="middle">R_eq = ${fmtNum(req)} Ω</text>`);

    // Flecha de corriente
    partes.push(flechaCorrienteH(xStart + 20, yMid - RES_H / 2 - 22, ""));

    return `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Resistencias en serie">
      ${partes.join("")}
    </svg>`;
  }

  function resistenciaParaleloSVG(valores, req) {
    const n = valores.length;
    const rowH = 60;
    const alto = MARGIN * 2 + rowH * n;
    const ancho = MARGIN * 2 + UNIT * 3;

    const xLeft = MARGIN + 40;
    const xRight = ancho - MARGIN - 20;
    const xRes = (xLeft + xRight) / 2;

    const yFirst = MARGIN + rowH / 2;
    const yLast  = MARGIN + rowH * (n - 1) + rowH / 2;

    const partes = [];
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" />`);
    partes.push(`<line class="wire" x1="${xLeft}" y1="${yFirst}" x2="${xLeft}" y2="${yLast}" />`);
    partes.push(`<line class="wire" x1="${xRight}" y1="${yFirst}" x2="${xRight}" y2="${yLast}" />`);

    valores.forEach((v, i) => {
      const y = MARGIN + rowH * i + rowH / 2;
      partes.push(`<line class="wire" x1="${xLeft}" y1="${y}" x2="${xRes - RES_W / 2}" y2="${y}" />`);
      partes.push(`<line class="wire" x1="${xRes + RES_W / 2}" y1="${y}" x2="${xRight}" y2="${y}" />`);
      partes.push(resistor(xRes, y, `R${i + 1}`, `${fmtNum(v)} Ω`));
      partes.push(nodo(xLeft, y));
      partes.push(nodo(xRight, y));
    });

    partes.push(`<text class="label-soft" x="${ancho / 2}" y="${alto - 8}" text-anchor="middle">R_eq = ${fmtNum(req)} Ω</text>`);

    return `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Resistencias en paralelo">
      ${partes.join("")}
    </svg>`;
  }

  /* DIAGRAMA DE NODO (KCL) */

  function nodoKCL(data) {
    const cx = 260;
    const cy = 140;
    const radio = 14;
    const largoFlecha = 90;

    const partes = [];
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="519" height="279" />`);

    // Nodo central
    partes.push(`<circle class="node" cx="${cx}" cy="${cy}" r="${radio}" />`);
    partes.push(`<text class="label" x="${cx}" y="${cy + 5}" text-anchor="middle">N</text>`);

    // Entrantes
    const posicionesEntrantes = [
      { x: cx - largoFlecha - 60, y: cy, dir: "right" },
      { x: cx, y: cy - largoFlecha - 50, dir: "down" }
    ];

    data.entrantes.forEach((valor, i) => {
      const pos = posicionesEntrantes[i % posicionesEntrantes.length];
      if (pos.dir === "right") {
        partes.push(`<line class="wire" x1="${pos.x}" y1="${pos.y}" x2="${cx - radio - ARROW_SZ}" y2="${pos.y}" />`);
        partes.push(`<polygon class="current" points="${cx - radio - ARROW_SZ},${pos.y - 5} ${cx - radio},${pos.y} ${cx - radio - ARROW_SZ},${pos.y + 5}" />`);
        partes.push(`<text class="label-current" x="${pos.x}" y="${pos.y - 12}">I${i + 1}=${fmtNum(valor)} A</text>`);
        partes.push(`<circle class="node" cx="${pos.x}" cy="${pos.y}" r="3" />`);
      } else {
        partes.push(`<line class="wire" x1="${pos.x}" y1="${pos.y}" x2="${cx}" y2="${cy - radio - ARROW_SZ}" />`);
        partes.push(`<polygon class="current" points="${cx - 5},${cy - radio - ARROW_SZ} ${cx},${cy - radio} ${cx + 5},${cy - radio - ARROW_SZ}" />`);
        partes.push(`<text class="label-current" x="${cx + 12}" y="${pos.y + 4}">I${i + 1}=${fmtNum(valor)} A</text>`);
        partes.push(`<circle class="node" cx="${pos.x}" cy="${pos.y}" r="3" />`);
      }
    });

    // Salientes
    const posicionesSalientes = [
      { x: cx + largoFlecha + 60, y: cy, dir: "right" },
      { x: cx, y: cy + largoFlecha + 50, dir: "down" }
    ];

    data.salientes.forEach((valor, i) => {
      const pos = posicionesSalientes[i % posicionesSalientes.length];
      if (pos.dir === "right") {
        partes.push(`<line class="wire" x1="${cx + radio}" y1="${pos.y}" x2="${pos.x}" y2="${pos.y}" />`);
        partes.push(`<polygon class="current" points="${pos.x - ARROW_SZ},${pos.y - 5} ${pos.x},${pos.y} ${pos.x - ARROW_SZ},${pos.y + 5}" />`);
        partes.push(`<text class="label-current" x="${cx + radio}" y="${pos.y - 12}">I_s${i + 1}=${fmtNum(valor)} A</text>`);
        partes.push(`<circle class="node" cx="${pos.x}" cy="${pos.y}" r="3" />`);
      } else {
        partes.push(`<line class="wire" x1="${pos.x}" y1="${cy + radio}" x2="${pos.x}" y2="${pos.y}" />`);
        partes.push(`<polygon class="current" points="${pos.x - 5},${pos.y - ARROW_SZ} ${pos.x},${pos.y} ${pos.x + 5},${pos.y - ARROW_SZ}" />`);
        partes.push(`<text class="label-current" x="${pos.x + 12}" y="${cy + radio + 20}">I_s${i + 1}=${fmtNum(valor)} A</text>`);
        partes.push(`<circle class="node" cx="${pos.x}" cy="${pos.y}" r="3" />`);
      }
    });

    return `<svg viewBox="0 0 520 280" width="520" height="280"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nodo para la ley de corrientes">
      ${partes.join("")}
    </svg>`;
  }

  /* DIAGRAMA DE MALLA (KVL) */

  function mallaKVL(data) {
    const ancho = 460;
    const alto = 240;
    const x1 = 60;
    const x2 = ancho - 60;
    const y1 = 50;
    const y2 = alto - 50;

    const partes = [];
    partes.push(`<rect class="frame" x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" />`);

    // Malla rectangular
    partes.push(`<line class="wire" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" />`);
    partes.push(`<line class="wire" x1="${x2}" y1="${y1}" x2="${x2}" y2="${y2}" />`);
    partes.push(`<line class="wire" x1="${x2}" y1="${y2}" x2="${x1}" y2="${y2}" />`);
    partes.push(`<line class="wire" x1="${x1}" y1="${y2}" x2="${x1}" y2="${y1}" />`);

    // Flecha de sentido horario en el centro
    const cxf = (x1 + x2) / 2;
    const cyf = (y1 + y2) / 2;
    partes.push(`
      <path class="current" d="M ${cxf - 20} ${cyf} L ${cxf + 20} ${cyf}" />
      <polygon class="current" points="${cxf + 20 - ARROW_SZ},${cyf - 5} ${cxf + 20},${cyf} ${cxf + 20 - ARROW_SZ},${cyf + 5}" />
    `);
    partes.push(`<text class="label-current" x="${cxf}" y="${cyf - 12}" text-anchor="middle">sentido horario</text>`);

    // Batería arriba
    if (data.voltajes[0]) {
      partes.push(bateria((x1 + x2) / 2, y1 - 2, `${fmtNum(data.voltajes[0].valor)} V`));
    }

    // Resto de voltajes como cajas de texto repartidas por el camino
    const restantes = data.voltajes.slice(1);
    const posiciones = [
      { x: x2, y: (y1 + y2) / 2, anchor: "start", dx: 10, dy: 4 },   // lado derecho
      { x: (x1 + x2) / 2, y: y2, anchor: "middle", dx: 0, dy: 22 },  // abajo
      { x: x1, y: (y1 + y2) / 2, anchor: "end", dx: -10, dy: 4 }     // izquierda
    ];

    restantes.forEach((v, i) => {
      const pos = posiciones[i % posiciones.length];
      const signo = v.valor >= 0 ? "+" : "−";
      const abs = Math.abs(v.valor);
      partes.push(`
        <text class="label-voltage" x="${pos.x + pos.dx}" y="${pos.y + pos.dy}" text-anchor="${pos.anchor}">
          ${signo}${fmtNum(abs)} V
        </text>
      `);
    });

    return `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Malla para la ley de voltajes">
      ${partes.join("")}
    </svg>`;
  }

  /* Exportación */
  window.CircuitLab = window.CircuitLab || {};
    window.CircuitLab.diagramas = {
    serie,
    paralelo,
    mixto,
    resistencias,
    nodoKCL,
    mallaKVL
  };

})();