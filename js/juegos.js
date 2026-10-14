(function () {
  "use strict";

  const Preguntas = window.CircuitLab && window.CircuitLab.preguntasJuego;
  if (!Preguntas) {
    console.error("juegos.js: no se encontró CircuitLab.preguntasJuego.");
    return;
  }

  /* 
     Configuración
      */
  const CONFIG = {
    vidaInicial: 5,
    maxEnemigos: 8,
    aciertosPorOleada: 5,

    tiempoBase: 8,
    tiempoMinimo: 5,
    reduccionTiempoPorOleada: 1,
    retardoEntrePreguntas: 800,
    duracionVeloOleada: 1600,

    puntosAcierto: 100,
    bonoRapidoMax: 50,
    rachaBono3: 3,
    puntosBono3: 200,
    rachaBono5: 5,

    velocidadBaseEnemigo: 0.060,
    velocidadMaxEnemigo: 0.180,
    incrementoVelocidadPorOleada: 0.015,
    intervaloBaseSpawn: 2.20,
    intervaloMinSpawn: 0.90,
    reduccionIntervaloSpawnPorOleada: 0.15,

    enemigosPorAtaqueEspecial: 3,
    radioContactoEnemigo: 0.045
  };

  /* 
     Estado
      */
  const estado = {
    pantalla: "inicio",
    vida: CONFIG.vidaInicial,
    puntuacion: 0,
    oleada: 1,
    aciertos: 0,
    aciertosEnOleada: 0,
    errores: 0,
    racha: 0,
    mejorRacha: 0,
    enemigosDerrotados: 0,
    enemigos: [],

    preguntaActual: null,
    tiempoRestante: 0,
    tiempoTotalPregunta: 0,
    respondida: false,
    bloqueandoSiguientePregunta: false,

    pausado: false,
    terminado: false,
    enTransicionOleada: false,
    motivoFin: null,

    rafId: null,
    ultimoFrame: 0,
    acumuladorSpawn: 0,
    contadorEnemigos: 0,
    timeouts: [],

    bolsa: null
  };

  /* 
     DOM
      */
  const el = {
    pantallaInicio: document.getElementById("cs-pantalla-inicio"),
    pantallaJuego:  document.getElementById("cs-pantalla-juego"),
    pantallaFin:    document.getElementById("cs-pantalla-fin"),

    arena:          document.getElementById("cs-arena"),
    capaActores:    document.getElementById("cs-capa-actores"),
    capaEfectos:    document.getElementById("cs-capa-efectos"),
    veloPausa:      document.getElementById("cs-velo-pausa"),
    veloFin:        document.getElementById("cs-velo-fin"),

    btnIniciar:     document.getElementById("cs-btn-iniciar"),
    btnPausa:       document.getElementById("cs-btn-pausa"),
    btnSalir:       document.getElementById("cs-btn-salir"),
    btnReanudar:    document.getElementById("cs-btn-reanudar"),
    btnSalirPausa:  document.getElementById("cs-btn-salir-pausa"),
    btnReintentar:  document.getElementById("cs-btn-reintentar"),
    btnSalirFin:    document.getElementById("cs-btn-salir-fin"),

    hudVida:        document.getElementById("cs-hud-vida"),
    hudPuntuacion:  document.getElementById("cs-hud-puntuacion"),
    hudOleada:      document.getElementById("cs-hud-oleada"),
    hudDerrotados:  document.getElementById("cs-hud-derrotados"),

    hudRacha:        document.getElementById("cs-hud-racha"),
    hudRachaIcono:   document.getElementById("cs-hud-racha-icono"),
    hudRachaRelleno: document.getElementById("cs-hud-racha-relleno"),
    rachaContenedor: document.querySelector(".cs-racha"),

    pregunta:            document.getElementById("cs-pregunta"),
    preguntaCategoria:   document.getElementById("cs-pregunta-categoria"),
    preguntaEnunciado:   document.getElementById("cs-pregunta-enunciado"),
    preguntaOpciones:    document.getElementById("cs-pregunta-opciones"),
    preguntaExplicacion: document.getElementById("cs-pregunta-explicacion"),
    tiempo:              document.getElementById("cs-tiempo"),
    tiempoBarra:         document.getElementById("cs-tiempo-barra"),
    tiempoTexto:         document.getElementById("cs-tiempo-texto"),

    // Pantalla de fin
    finMotivo:     document.getElementById("cs-fin-motivo"),
    finPuntuacion: document.getElementById("cs-fin-puntuacion"),
    finOleada:     document.getElementById("cs-fin-oleada"),
    finDerrotados: document.getElementById("cs-fin-derrotados"),
    finAciertos:   document.getElementById("cs-fin-aciertos"),
    finErrores:    document.getElementById("cs-fin-errores"),
    finPrecision:  document.getElementById("cs-fin-precision"),
    finRacha:      document.getElementById("cs-fin-racha"),
    finMensaje:    document.getElementById("cs-fin-mensaje")
  };

  /* 
     Utilidades
      */

  function limpiarTimeouts() {
    estado.timeouts.forEach((id) => clearTimeout(id));
    estado.timeouts = [];
  }

  function programarTimeout(fn, ms) {
    const id = setTimeout(() => {
      estado.timeouts = estado.timeouts.filter((t) => t !== id);
      fn();
    }, ms);
    estado.timeouts.push(id);
    return id;
  }

  function detenerBucle() {
    if (estado.rafId != null) {
      cancelAnimationFrame(estado.rafId);
      estado.rafId = null;
    }
  }

  function escapar(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* 
     Fórmulas de dificultad
      */

  function tiempoDePregunta(oleada) {
    return Math.max(
      CONFIG.tiempoMinimo,
      CONFIG.tiempoBase - (oleada - 1) * CONFIG.reduccionTiempoPorOleada
    );
  }

  function velocidadEnemigo(oleada) {
    return Math.min(
      CONFIG.velocidadMaxEnemigo,
      CONFIG.velocidadBaseEnemigo + (oleada - 1) * CONFIG.incrementoVelocidadPorOleada
    );
  }

  function intervaloSpawn(oleada) {
    return Math.max(
      CONFIG.intervaloMinSpawn,
      CONFIG.intervaloBaseSpawn - (oleada - 1) * CONFIG.reduccionIntervaloSpawnPorOleada
    );
  }

  /* 
     Pantallas
      */

  function mostrarPantalla(nombre) {
    estado.pantalla = nombre;
    el.pantallaInicio.hidden = nombre !== "inicio";
    el.pantallaJuego.hidden  = nombre !== "jugando" && nombre !== "pausa";
    el.pantallaFin.hidden    = nombre !== "fin";
  }

  /* 
     HUD
      */

    function pintarVida() {
    const total = CONFIG.vidaInicial;
    let html = "";
    for (let i = 0; i < total; i++) {
      const activo = i < estado.vida;
      html += `<span class="cs-corazon ${activo ? "cs-corazon--lleno" : "cs-corazon--vacio"}"
                    aria-hidden="true">${activo ? "❤" : "♡"}</span>`;
    }
    el.hudVida.innerHTML = html;
    el.hudVida.setAttribute("aria-label", `Vida: ${estado.vida} de ${total}`);

    // Clase de vida baja para el aura roja del personaje
    document.querySelector(".cs-root")?.classList.toggle("cs-root--vida-baja", estado.vida <= 2 && estado.vida > 0);
  }

  function pintarRacha() {
    el.hudRacha.textContent = String(estado.racha);
    const pct = Math.min(100, (estado.racha / CONFIG.rachaBono5) * 100);
    el.hudRachaRelleno.style.width = `${pct}%`;

    el.rachaContenedor.classList.toggle("cs-racha--activa", estado.racha > 0);
    el.rachaContenedor.classList.toggle("cs-racha--max", estado.racha >= CONFIG.rachaBono5);
  }

    function pintarHUD() {
    pintarVida();
    pintarRacha();

    // Flash visual cuando cambian los valores
    const nuevosValores = {
      puntuacion: String(estado.puntuacion),
      oleada: String(estado.oleada),
      derrotados: String(estado.enemigosDerrotados)
    };

    if (el.hudPuntuacion.textContent !== nuevosValores.puntuacion) {
      flashHUD(el.hudPuntuacion);
    }
    if (el.hudOleada.textContent !== nuevosValores.oleada) {
      flashHUD(el.hudOleada);
    }
    if (el.hudDerrotados.textContent !== nuevosValores.derrotados) {
      flashHUD(el.hudDerrotados);
    }

    el.hudPuntuacion.textContent = nuevosValores.puntuacion;
    el.hudOleada.textContent     = nuevosValores.oleada;
    el.hudDerrotados.textContent = nuevosValores.derrotados;
  }

  function flashHUD(elemento) {
    if (!elemento) return;
    elemento.classList.remove("cs-flash");
    void elemento.offsetWidth;
    elemento.classList.add("cs-flash");
    programarTimeout(() => {
      if (elemento) elemento.classList.remove("cs-flash");
    }, 400);
  }

  /* 
     SVG de actores
      */

  function svgPersonaje() {
    return `
      <svg class="cs-personaje__svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle class="cs-svg-aura cs-personaje__aura" cx="60" cy="60" r="52" />
        <circle class="cs-svg-cuerpo" cx="60" cy="60" r="34" />
        <path class="cs-svg-rayo" d="M 62 34 L 48 62 L 58 62 L 52 88 L 76 56 L 64 56 Z" />
        <circle class="cs-svg-ojo" cx="50" cy="52" r="3" />
        <circle class="cs-svg-ojo" cx="70" cy="52" r="3" />
      </svg>
    `;
  }

  function svgEnemigo() {
    return `
      <svg class="cs-enemigo__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon class="cs-svg-enemigo-cuerpo"
                 points="50,8 82,28 82,72 50,92 18,72 18,28" />
        <circle class="cs-svg-enemigo-ojo" cx="38" cy="46" r="4" />
        <circle class="cs-svg-enemigo-ojo" cx="62" cy="46" r="4" />
        <path class="cs-svg-enemigo-boca" d="M 38 64 L 50 72 L 62 64" />
      </svg>
    `;
  }

  /* 
     Personaje
      */

  let personajeEl = null;

  function crearPersonaje() {
    personajeEl = document.createElement("div");
    personajeEl.className = "cs-personaje";
    personajeEl.id = "cs-personaje";
    personajeEl.innerHTML = svgPersonaje();
    personajeEl.style.left = "50%";
    personajeEl.style.top = "50%";
    el.capaActores.appendChild(personajeEl);
  }

  /* 
     Enemigos
      */

  function bordeAleatorio() {
    const borde = Math.floor(Math.random() * 4);
    const margen = 0.06;
    switch (borde) {
      case 0: return { x: Math.random(), y: -margen };
      case 1: return { x: 1 + margen, y: Math.random() };
      case 2: return { x: Math.random(), y: 1 + margen };
      default:return { x: -margen, y: Math.random() };
    }
  }

  function crearEnemigo() {
    if (estado.enemigos.length >= CONFIG.maxEnemigos) return null;

    estado.contadorEnemigos++;
    const id = `e_${String(estado.contadorEnemigos).padStart(3, "0")}`;
    const pos = bordeAleatorio();

    const div = document.createElement("div");
    div.className = "cs-enemigo";
    div.dataset.id = id;
    div.innerHTML = svgEnemigo();
    div.style.left = `${pos.x * 100}%`;
    div.style.top  = `${pos.y * 100}%`;

    el.capaActores.appendChild(div);

    const enemigo = {
      id,
      x: pos.x,
      y: pos.y,
      velocidad: velocidadEnemigo(estado.oleada),
      haDanado: false,
      elemento: div
    };
    estado.enemigos.push(enemigo);
    return enemigo;
  }

  function actualizarEnemigos(dt) {
    if (estado.enTransicionOleada) return;

    for (let i = estado.enemigos.length - 1; i >= 0; i--) {
      const e = estado.enemigos[i];

      const dx = 0.5 - e.x;
      const dy = 0.5 - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.radioContactoEnemigo) {
        if (!e.haDanado) {
          e.haDanado = true;
          aplicarDano(1, "contacto");
        }
        eliminarEnemigo(e.id, { efecto: null, silenciarPuntos: true });
        continue;
      }

      if (dist > 0.0001) {
        const paso = e.velocidad * dt;
        e.x += (dx / dist) * paso;
        e.y += (dy / dist) * paso;
      }

      e.elemento.style.left = `${e.x * 100}%`;
      e.elemento.style.top  = `${e.y * 100}%`;
    }
  }

  function eliminarEnemigo(id, opciones = {}) {
    const idx = estado.enemigos.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const e = estado.enemigos[idx];

    if (opciones.efecto === "descarga") {
      efectoDescarga(0.5, 0.5, e.x, e.y);
    }

    if (!opciones.silenciarPuntos) {
      efectoFlotante(e.x, e.y, `+${CONFIG.puntosAcierto}`, "puntos");
    }

    e.elemento.classList.add("cs-enemigo--golpeado");
    const elRef = e.elemento;
    programarTimeout(() => {
      if (elRef && elRef.parentNode) elRef.parentNode.removeChild(elRef);
    }, 350);

    estado.enemigos.splice(idx, 1);

    if (!opciones.silenciarPuntos) {
      estado.enemigosDerrotados++;
      estado.puntuacion += CONFIG.puntosAcierto;
      pintarHUD();
    }

    return e;
  }

  /* 
     Ataques
      */

  function atacarEnemigoMasCercano() {
    if (estado.enemigos.length === 0) return false;
    let cercano = null;
    let mejorDist = Infinity;
    estado.enemigos.forEach((e) => {
      const d = Math.hypot(0.5 - e.x, 0.5 - e.y);
      if (d < mejorDist) { mejorDist = d; cercano = e; }
    });
    if (!cercano) return false;
    eliminarEnemigo(cercano.id, { efecto: "descarga" });
    return true;
  }

  function ataqueEspecial() {
    const ordenados = estado.enemigos
      .map((e) => ({ e, d: Math.hypot(0.5 - e.x, 0.5 - e.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, CONFIG.enemigosPorAtaqueEspecial);

    const flash = document.createElement("div");
    flash.className = "cs-descarga-multiple";
    el.capaEfectos.appendChild(flash);
    programarTimeout(() => {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 1300);

    ordenados.forEach(({ e }) => {
      eliminarEnemigo(e.id, { efecto: "descarga" });
    });

    return ordenados.length;
  }

  /* 
     Daño y fin
      */

  function aplicarDano(cantidad, origen) {
    if (estado.terminado) return;

    estado.vida = Math.max(0, estado.vida - cantidad);
    pintarVida();

    if (personajeEl) {
      personajeEl.classList.remove("cs-personaje--golpeado");
      void personajeEl.offsetWidth;
      personajeEl.classList.add("cs-personaje--golpeado");
    }

    efectoImpacto(0.5, 0.5);
    efectoFlotante(0.5, 0.5, `-${cantidad}`, "dano");

    if (estado.vida <= 0) {
      terminarPartida(origen || "vida");
    }
  }

  function terminarPartida(motivo) {
    if (estado.terminado) return;
    estado.terminado = true;
    estado.pausado = true;
    estado.motivoFin = motivo;

    detenerBucle();
    limpiarTimeouts();

    // Cancelar cualquier operación pendiente
    estado.bloqueandoSiguientePregunta = true;
    estado.respondida = true;

    // Velo breve en la arena antes de pasar a la pantalla de fin
    el.veloFin.hidden = false;

    console.log(`[Circuit Survival] Partida terminada (${motivo}). Puntuación: ${estado.puntuacion}.`);

    // Después de un momento, transición a la pantalla de fin
    programarTimeout(() => {
      rellenarPantallaFin(motivo);
      mostrarPantalla("fin");
    }, 1200);
  }

  function rellenarPantallaFin(motivo) {
    const total = estado.aciertos + estado.errores;
    const precision = total > 0 ? Math.round((estado.aciertos / total) * 100) : 0;

    el.finPuntuacion.textContent = String(estado.puntuacion);
    el.finOleada.textContent     = String(estado.oleada);
    el.finDerrotados.textContent = String(estado.enemigosDerrotados);
    el.finAciertos.textContent   = String(estado.aciertos);
    el.finErrores.textContent    = String(estado.errores);
    el.finPrecision.textContent  = `${precision}%`;
    el.finRacha.textContent      = String(estado.mejorRacha);

    // Título y mensaje según motivo y rendimiento
    const titulos = {
      contacto: "Te alcanzaron los enemigos",
      error:    "Fallaste una pregunta clave",
      tiempo:   "Se agotó el tiempo",
      vida:     "Fin de la partida"
    };
    el.finMotivo.textContent = titulos[motivo] || "Fin de la partida";

    let mensaje = "¡Buen intento!";
    if (estado.puntuacion >= 3000) {
      mensaje = "¡Increíble! Dominas los circuitos bajo presión.";
    } else if (estado.puntuacion >= 1500) {
      mensaje = "¡Excelente partida! Vas por muy buen camino.";
    } else if (estado.puntuacion >= 700) {
      mensaje = "Buen trabajo. Intenta sobrevivir una oleada más.";
    } else if (estado.puntuacion > 0) {
      mensaje = "Vas calentando. ¡La próxima será mejor!";
    }
    el.finMensaje.textContent = mensaje;
  }

  /* 
     Efectos
      */

  function aPixeles(x, y) {
    return {
      px: x * el.arena.clientWidth,
      py: y * el.arena.clientHeight
    };
  }

  function efectoFlotante(x, y, texto, tipo) {
    const { px, py } = aPixeles(x, y);
    const div = document.createElement("div");
    div.className = `cs-flotante cs-flotante--${tipo}`;
    div.textContent = texto;
    div.style.left = `${px}px`;
    div.style.top  = `${py}px`;
    el.capaEfectos.appendChild(div);
    programarTimeout(() => {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 1000);
  }

  function efectoImpacto(x, y) {
    const { px, py } = aPixeles(x, y);
    const div = document.createElement("div");
    div.className = "cs-impacto";
    div.style.left = `${px}px`;
    div.style.top  = `${py}px`;
    el.capaEfectos.appendChild(div);
    programarTimeout(() => {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 550);
  }

  function efectoDescarga(xOrigen, yOrigen, xDestino, yDestino) {
    const o = aPixeles(xOrigen, yOrigen);
    const d = aPixeles(xDestino, yDestino);

    const dx = d.px - o.px;
    const dy = d.py - o.py;
    const largo = Math.hypot(dx, dy);
    if (largo < 1) return;
    const angulo = Math.atan2(dy, dx) * 180 / Math.PI;

    const segmentos = 6;
    let path = "";
    for (let i = 0; i <= segmentos; i++) {
      const t = i / segmentos;
      const cx = t * largo;
      const cy = (i === 0 || i === segmentos) ? 0 : (Math.random() - 0.5) * 12;
      path += (i === 0 ? "M" : "L") + ` ${cx.toFixed(1)} ${cy.toFixed(1)} `;
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "cs-descarga");
    svg.setAttribute("width", String(Math.ceil(largo)));
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", `0 0 ${Math.ceil(largo)} 24`);
    svg.style.left = `${o.px}px`;
    svg.style.top  = `${o.py - 12}px`;
    svg.style.transform = `rotate(${angulo}deg)`;

    const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathEl.setAttribute("d", path);
    pathEl.setAttribute("transform", "translate(0, 12)");
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke", "var(--brand)");
    pathEl.setAttribute("stroke-width", "3");
    pathEl.setAttribute("stroke-linecap", "round");
    pathEl.setAttribute("stroke-linejoin", "round");

    svg.appendChild(pathEl);
    el.capaEfectos.appendChild(svg);
    programarTimeout(() => {
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    }, 300);
  }

  /* 
     Oleadas
      */

  function efectoDestelloOleada() {
    const flash = document.createElement("div");
    flash.className = "cs-destello-oleada";
    el.capaEfectos.appendChild(flash);
    programarTimeout(() => {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 1100);
  }

  function mostrarVeloOleada() {
    const velo = document.createElement("div");
    velo.className = "cs-velo-oleada";
    velo.innerHTML = `
      <p class="cs-velo-oleada__etiqueta">Oleada</p>
      <p class="cs-velo-oleada__numero">${estado.oleada}</p>
      <p class="cs-velo-oleada__sub">
        Los enemigos se mueven más rápido y tienes menos tiempo para responder.
      </p>
    `;
    el.arena.appendChild(velo);

    programarTimeout(() => {
      if (velo.parentNode) velo.parentNode.removeChild(velo);
    }, CONFIG.duracionVeloOleada);
  }

  function subirOleada() {
    if (estado.terminado) return;

    estado.oleada++;
    estado.aciertosEnOleada = 0;
    estado.enTransicionOleada = true;

    pintarHUD();
    efectoDestelloOleada();
    mostrarVeloOleada();

    console.log(`[Circuit Survival] Subiendo a oleada ${estado.oleada}.`);

    programarTimeout(() => {
      estado.enTransicionOleada = false;
    }, CONFIG.duracionVeloOleada);
  }

  /* 
     Sistema de preguntas
      */

  function letraOpcion(i) {
    return ["A", "B", "C", "D"][i] || "?";
  }

  function mostrarPregunta() {
    if (estado.terminado) return;
    if (estado.enTransicionOleada) {
      programarTimeout(mostrarPregunta, 400);
      return;
    }

    const pregunta = estado.bolsa.siguiente();
    if (!pregunta) return;

    estado.preguntaActual = pregunta;
    estado.respondida = false;
    estado.bloqueandoSiguientePregunta = false;
    estado.tiempoTotalPregunta = tiempoDePregunta(estado.oleada);
    estado.tiempoRestante = estado.tiempoTotalPregunta;

    el.pregunta.classList.remove("cs-pregunta--acierto", "cs-pregunta--fallo");
    el.preguntaExplicacion.hidden = true;
    el.preguntaExplicacion.className = "cs-pregunta__explicacion";
    el.preguntaExplicacion.innerHTML = "";

    el.preguntaCategoria.textContent = pregunta.categoria;
    el.preguntaEnunciado.textContent = pregunta.pregunta;

    el.preguntaOpciones.innerHTML = "";
    pregunta.opciones.forEach((texto, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cs-opcion";
      btn.dataset.indice = String(i);
      btn.innerHTML = `
        <span class="cs-opcion__letra">${letraOpcion(i)}</span>
        <span class="cs-opcion__texto">${escapar(texto)}</span>
      `;
      btn.addEventListener("click", () => responder(i));
      el.preguntaOpciones.appendChild(btn);
    });

    actualizarTemporizadorVisual();
  }

  function actualizarTemporizadorVisual() {
    const t = estado.tiempoTotalPregunta;
    const restante = Math.max(0, estado.tiempoRestante);
    const fraccion = t > 0 ? restante / t : 0;

    el.tiempoBarra.style.width = `${(fraccion * 100).toFixed(1)}%`;
    el.tiempoTexto.textContent = `${restante.toFixed(1)} s`;

    el.tiempo.classList.remove("cs-tiempo--aviso", "cs-tiempo--peligro");
    if (fraccion <= 0.25) {
      el.tiempo.classList.add("cs-tiempo--peligro");
    } else if (fraccion <= 0.5) {
      el.tiempo.classList.add("cs-tiempo--aviso");
    }
  }

  function responder(indice) {
    if (!estado.preguntaActual) return;
    if (estado.respondida) return;
    if (estado.terminado) return;
    if (estado.enTransicionOleada) return;
    if (estado.pausado) return;

    estado.respondida = true;

    const correcta = estado.preguntaActual.correcta;
    const acerto = indice === correcta;

    marcarOpciones(indice, correcta);
    el.pregunta.classList.add(acerto ? "cs-pregunta--acierto" : "cs-pregunta--fallo");

    if (acerto) procesarAcierto();
    else procesarFallo();

    estado.bloqueandoSiguientePregunta = true;
    programarTimeout(() => {
      estado.bloqueandoSiguientePregunta = false;
      if (!estado.terminado && estado.pantalla === "jugando") {
        mostrarPregunta();
      }
    }, CONFIG.retardoEntrePreguntas);
  }

  function procesarAcierto() {
    estado.aciertos++;
    estado.aciertosEnOleada++;
    estado.racha++;
    if (estado.racha > estado.mejorRacha) estado.mejorRacha = estado.racha;

    const fraccionRestante = estado.tiempoTotalPregunta > 0
      ? estado.tiempoRestante / estado.tiempoTotalPregunta
      : 0;
    const bonoRapido = Math.round(CONFIG.bonoRapidoMax * fraccionRestante);

    const ataco = atacarEnemigoMasCercano();
    const puntosGanados = CONFIG.puntosAcierto + bonoRapido;

    if (!ataco) {
      estado.puntuacion += puntosGanados;
      efectoFlotante(0.5, 0.5, `+${puntosGanados}`, "puntos");
    } else if (bonoRapido > 0) {
      estado.puntuacion += bonoRapido;
      efectoFlotante(0.5, 0.35, `+${bonoRapido} rápido`, "puntos");
    }

    if (estado.racha === CONFIG.rachaBono3) {
      estado.puntuacion += CONFIG.puntosBono3;
      efectoFlotante(0.5, 0.25, `¡Racha x${CONFIG.rachaBono3}! +${CONFIG.puntosBono3}`, "puntos");
    }

    if (estado.racha >= CONFIG.rachaBono5) {
      ejecutarAtaqueEspecial();
      estado.racha = 0;
    }

    pintarHUD();
    mostrarExplicacion(true);

    if (estado.aciertosEnOleada >= CONFIG.aciertosPorOleada && !estado.terminado) {
      programarTimeout(() => {
        if (!estado.terminado) subirOleada();
      }, CONFIG.retardoEntrePreguntas + 200);
    }
  }

  function procesarFallo() {
    estado.errores++;
    estado.racha = 0;
    aplicarDano(1, "error");
    pintarHUD();
    mostrarExplicacion(false);
  }

  function ejecutarAtaqueEspecial() {
    const aviso = document.createElement("div");
    aviso.className = "cs-aviso-especial";
    aviso.textContent = "¡ATAQUE ESPECIAL!";
    el.capaEfectos.appendChild(aviso);
    programarTimeout(() => {
      if (aviso.parentNode) aviso.parentNode.removeChild(aviso);
    }, 1500);

    const eliminados = ataqueEspecial();
    if (eliminados === 0) {
      estado.puntuacion += 300;
      efectoFlotante(0.5, 0.5, "+300 (sin enemigos)", "puntos");
    }
  }

  function marcarOpciones(elegida, correcta) {
    const botones = el.preguntaOpciones.querySelectorAll(".cs-opcion");
    botones.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correcta) {
        btn.classList.add("cs-opcion--correcta");
      } else if (i === elegida) {
        btn.classList.add("cs-opcion--incorrecta");
      } else {
        btn.classList.add("cs-opcion--atenuada");
      }
    });
  }

  function mostrarExplicacion(acerto) {
    el.preguntaExplicacion.hidden = false;
    el.preguntaExplicacion.className =
      "cs-pregunta__explicacion " +
      (acerto ? "cs-pregunta__explicacion--acierto" : "cs-pregunta__explicacion--fallo");

    const titulo = acerto ? "Correcto" : "Incorrecto";
    el.preguntaExplicacion.innerHTML = `
      <strong>${titulo}</strong>
      ${escapar(estado.preguntaActual.explicacion || "")}
    `;
  }

  function procesarTiempoAgotado() {
    if (estado.respondida) return;
    if (estado.terminado) return;
    if (estado.enTransicionOleada) return;
    if (estado.pausado) return;

    estado.respondida = true;
    estado.errores++;
    estado.racha = 0;

    const correcta = estado.preguntaActual.correcta;
    marcarOpciones(-1, correcta);
    el.pregunta.classList.add("cs-pregunta--fallo");
    mostrarExplicacion(false);

    aplicarDano(1, "tiempo");
    pintarHUD();

    estado.bloqueandoSiguientePregunta = true;
    programarTimeout(() => {
      estado.bloqueandoSiguientePregunta = false;
      if (!estado.terminado && estado.pantalla === "jugando") {
        mostrarPregunta();
      }
    }, CONFIG.retardoEntrePreguntas);
  }

  /* 
     Bucle
      */

  function loop(timestamp) {
    if (estado.pantalla !== "jugando" || estado.pausado || estado.terminado) return;

    if (estado.ultimoFrame === 0) estado.ultimoFrame = timestamp;
    const dt = Math.min((timestamp - estado.ultimoFrame) / 1000, 0.1);
    estado.ultimoFrame = timestamp;

    if (!estado.enTransicionOleada) {
      estado.acumuladorSpawn += dt;
      if (estado.acumuladorSpawn >= intervaloSpawn(estado.oleada)) {
        estado.acumuladorSpawn = 0;
        crearEnemigo();
      }

      actualizarEnemigos(dt);

      if (estado.preguntaActual && !estado.respondida && !estado.bloqueandoSiguientePregunta) {
        estado.tiempoRestante -= dt;
        if (estado.tiempoRestante <= 0) {
          estado.tiempoRestante = 0;
          actualizarTemporizadorVisual();
          procesarTiempoAgotado();
        } else {
          actualizarTemporizadorVisual();
        }
      }
    }

    estado.rafId = requestAnimationFrame(loop);
  }

  function arrancarBucle() {
    estado.ultimoFrame = 0;
    estado.acumuladorSpawn = 0;
    if (estado.rafId != null) cancelAnimationFrame(estado.rafId);
    estado.rafId = requestAnimationFrame(loop);
  }

  /* 
     Limpieza total
      */

  function limpiarTodo() {
    limpiarTimeouts();
    detenerBucle();

    // Vaciar capas de la arena
    el.capaActores.innerHTML = "";
    el.capaEfectos.innerHTML = "";

    // Eliminar velos residuales de la arena
    el.arena.querySelectorAll(".cs-velo-oleada").forEach((v) => v.remove());
    el.arena.querySelectorAll(".cs-destello-oleada").forEach((v) => v.remove());
    el.arena.querySelectorAll(".cs-descarga-multiple").forEach((v) => v.remove());
    el.arena.querySelectorAll(".cs-aviso-especial").forEach((v) => v.remove());
    el.arena.querySelectorAll(".cs-flotante").forEach((v) => v.remove());
    el.arena.querySelectorAll(".cs-impacto").forEach((v) => v.remove());
    el.arena.querySelectorAll(".cs-descarga").forEach((v) => v.remove());

    el.veloPausa.hidden = true;
    el.veloFin.hidden = true;

    personajeEl = null;
  }

  /* 
     Ciclo de partida
      */

  function reiniciarEstado() {
    estado.pantalla = "inicio";
    estado.vida = CONFIG.vidaInicial;
    estado.puntuacion = 0;
    estado.oleada = 1;
    estado.aciertos = 0;
    estado.aciertosEnOleada = 0;
    estado.errores = 0;
    estado.racha = 0;
    estado.mejorRacha = 0;
    estado.enemigosDerrotados = 0;
    estado.enemigos = [];
    estado.preguntaActual = null;
    estado.tiempoRestante = 0;
    estado.tiempoTotalPregunta = 0;
    estado.respondida = false;
    estado.bloqueandoSiguientePregunta = false;
    estado.pausado = false;
    estado.terminado = false;
    estado.enTransicionOleada = false;
    estado.motivoFin = null;
    estado.ultimoFrame = 0;
    estado.acumuladorSpawn = 0;
    estado.contadorEnemigos = 0;
    estado.bolsa = Preguntas.crearBolsa();
  }

  function limpiarPanelPregunta() {
    el.pregunta.classList.remove("cs-pregunta--acierto", "cs-pregunta--fallo");
    el.preguntaCategoria.textContent = "—";
    el.preguntaEnunciado.textContent = "Cargando pregunta…";
    el.preguntaOpciones.innerHTML = "";
    el.preguntaExplicacion.hidden = true;
    el.preguntaExplicacion.innerHTML = "";
    el.tiempoBarra.style.width = "100%";
    el.tiempoTexto.textContent = "-- s";
    el.tiempo.classList.remove("cs-tiempo--aviso", "cs-tiempo--peligro");
  }

  function iniciarPartida() {
    limpiarTodo();
    reiniciarEstado();
    limpiarPanelPregunta();
    crearPersonaje();
    mostrarPantalla("jugando");
    pintarHUD();
    mostrarPregunta();
    arrancarBucle();
    console.log("[Circuit Survival] Partida iniciada (Etapa 6).");
  }

  function pausarPartida() {
    if (estado.pantalla !== "jugando") return;
    if (estado.terminado) return;
    estado.pausado = true;
    mostrarPantalla("pausa");
    el.veloPausa.hidden = false;
    el.btnPausa.textContent = "▶ Reanudar";
  }

  function reanudarPartida() {
    if (estado.pantalla !== "pausa") return;
    estado.pausado = false;
    mostrarPantalla("jugando");
    el.veloPausa.hidden = true;
    el.btnPausa.textContent = "⏸ Pausar";
    estado.ultimoFrame = 0;
    estado.rafId = requestAnimationFrame(loop);
  }

  function alternarPausa() {
    if (estado.pantalla === "jugando") pausarPartida();
    else if (estado.pantalla === "pausa") reanudarPartida();
  }

  function salirAlInicio(confirmar = true) {
    // Confirmación si estamos en partida activa
    if (confirmar &&
        (estado.pantalla === "jugando" || estado.pantalla === "pausa") &&
        !estado.terminado &&
        estado.vida > 0) {
      const ok = window.confirm("¿Seguro que quieres salir? Perderás el progreso de esta partida.");
      if (!ok) return;
    }

    limpiarTodo();
    reiniciarEstado();
    limpiarPanelPregunta();
    mostrarPantalla("inicio");
    el.btnPausa.textContent = "⏸ Pausar";
    console.log("[Circuit Survival] Salida al menú. Estado limpio.");
  }

  /* 
     Init
      */

  function enlazarEventos() {
    el.btnIniciar.addEventListener("click", iniciarPartida);
    el.btnPausa.addEventListener("click", alternarPausa);
    el.btnSalir.addEventListener("click", () => salirAlInicio(true));

    // Botones dentro del velo de pausa
    el.btnReanudar.addEventListener("click", reanudarPartida);
    el.btnSalirPausa.addEventListener("click", () => salirAlInicio(true));

    // Botones de la pantalla de fin
    el.btnReintentar.addEventListener("click", iniciarPartida);
    el.btnSalirFin.addEventListener("click", () => salirAlInicio(false));

        // Atajos de teclado
    document.addEventListener("keydown", (e) => {
      // Escape: alternar pausa
      if (e.key === "Escape") {
        if (estado.pantalla === "jugando" || estado.pantalla === "pausa") {
          e.preventDefault();
          alternarPausa();
        }
        return;
      }

      // 1-4: responder a la opción correspondiente
      if (estado.pantalla === "jugando" &&
          !estado.pausado &&
          !estado.terminado &&
          estado.preguntaActual &&
          !estado.respondida &&
          !estado.enTransicionOleada) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 4) {
          const idx = num - 1;
          if (idx < estado.preguntaActual.opciones.length) {
            e.preventDefault();
            responder(idx);
          }
        }
      }
    });

    // Autopausa al cambiar de pestaña
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && estado.pantalla === "jugando") {
        pausarPartida();
      }
    });

    // Limpieza al salir de la página
    window.addEventListener("beforeunload", () => {
      limpiarTimeouts();
      detenerBucle();
    });
  }

  function init() {
    const bolsa = Preguntas.crearBolsa();
    const total = bolsa.total();
    if (total === 0) {
      console.warn("[Circuit Survival] No hay preguntas válidas.");
    } else {
      console.log(`[Circuit Survival] Banco de preguntas listo: ${total} preguntas.`);
    }

    enlazarEventos();
    pintarHUD();
    limpiarPanelPregunta();
    mostrarPantalla("inicio");
  }

  init();
})();