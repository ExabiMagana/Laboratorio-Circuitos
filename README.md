# CircuitLab

Aplicación web educativa e interactiva para calcular y analizar circuitos
eléctricos resistivos de corriente continua mediante la Ley de Ohm y las
leyes de Kirchhoff.

## Estado

**Versión 1.0** — Proyecto completo.

## Funcionalidades

### 1. Inicio

Portada con presentación, accesos rápidos a los módulos e introducción a las
magnitudes eléctricas.

### 2. Calculadoras eléctricas

- **Ley de Ohm**: calcula V, I o R a partir de las otras dos.
- **Potencia eléctrica**: P = V×I, P = I²×R, P = V²/R.
- **Resistencia equivalente**: serie o paralelo, con lista dinámica.

Cada una muestra fórmula, sustitución, procedimiento y comprobación.

### 3. Análisis de circuitos

- **Serie**: fuente + N resistencias.
- **Paralelo**: fuente + N ramas.
- **Mixto**: 3 topologías prediseñadas.

Incluye diagrama SVG, tabla por componente, procedimiento paso a paso y
verificación de KVL/KCL y balance de potencia.

### 4. Leyes de Kirchhoff

- **Ley de corrientes (KCL)**: comprobar o calcular corriente faltante.
- **Ley de voltajes (KVL)**: comprobar o calcular caída faltante.
- **Resolución por mallas**: circuito de dos mallas resuelto por determinantes.

### 5. Aprender

Nueve lecciones con definición, explicación, fórmulas, ejemplo resuelto y
enlace a la herramienta relacionada:

1. Magnitudes eléctricas
2. Ley de Ohm
3. Potencia eléctrica
4. Circuitos en serie
5. Circuitos en paralelo
6. Circuitos mixtos
7. Primera ley de Kirchhoff (KCL)
8. Segunda ley de Kirchhoff (KVL)
9. Unidades y conversiones

### 6. Desafíos

Seis categorías con cinco preguntas de opción múltiple cada una (30 en total).
Validación inmediata, explicación, puntuación y revisión de respuestas.

### Exportación a PDF

Todos los módulos con resultados exportan un PDF con:
cabecera, datos de entrada, diagrama (si aplica), resultado, fórmulas,
procedimiento, verificaciones y pie con paginación.

## Tecnologías

- HTML5
- CSS3 (variables, grid, flexbox)
- JavaScript (vanilla, sin frameworks)
- SVG generado dinámicamente
- jsPDF + svg2pdf.js para exportación a PDF

Sin backend, sin base de datos, sin registro de usuarios.
Todos los cálculos se realizan en el cliente.

## Estructura

CircuitLab/
├── index.html
├── css/
│ └── styles.css
├── js/
│ ├── main.js (navegación y utilidades)
│ ├── calculos.js (motor matemático)
│ ├── calculadoras.js (UI calculadoras)
│ ├── diagramas.js (SVG de circuitos)
│ ├── analisis.js (UI análisis)
│ ├── juegos.js (UI del minijuego)
│ ├── kirchhoff.js (UI Kirchhoff)
│ ├── lecciones.js (contenido educativo)
│ ├── aprender.js (UI aprender)
│ ├── preguntas.js (banco de preguntas)
│ ├── preguntas-juegos.js (adaptador del banco de preguntas)
│ ├── desafios.js (UI desafíos)
│ └── pdf.js (exportación a PDF)
├── pages/
│ ├── calculadoras.html
│ ├── juegos.html
│ ├── analisis.html
│ ├── kirchhoff.html
│ ├── aprender.html
│ └── desafios.html
└── README.md


## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari).
- Conexión a internet **solo la primera vez** que se usa el PDF
  (jsPDF y svg2pdf se cargan desde CDN; después quedan en caché).
- Opcional: Visual Studio Code con Live Server.

## Ejecución local

1. Clona o descarga el proyecto.
2. Abre `index.html` en el navegador, o usa Live Server desde VS Code.

### Verificar el motor matemático

Abre `index.html` con la consola abierta (F12). Verás el informe
de las pruebas del motor matemático, todas con ✔.

## Publicación

Es una aplicación estática. Puede publicarse en:

- **GitHub Pages**: sube el proyecto a un repositorio y activa Pages en
  *Settings → Pages → Deploy from branch → main*.
- **Netlify**: arrastra la carpeta al panel de Netlify, o conéctala a un repo Git.
- **Vercel**: `vercel deploy` o conéctala a un repo Git.
- **Cloudflare Pages**: equivalente a Netlify.


## Dependencias externas

- **jsPDF** `2.5.1` — generación de PDF en cliente.
- **svg2pdf.js** `2.2.1` — conversión de SVG a PDF vectorial.

Se cargan por CDN **solo** en las páginas que exportan PDF.

Si se necesita funcionar sin conexión, descarga los dos archivos a
`assets/vendor/` y cambia las rutas en `pages/calculadoras.html`,
`pages/analisis.html` y `pages/kirchhoff.html`.

## Limitaciones conocidas

- No hay constructor libre de circuitos. Los circuitos mixtos usan
  3 topologías prediseñadas.
- La resolución por mallas está limitada a un circuito específico de
  2 mallas.
- Los desafíos no guardan puntuación entre sesiones (por diseño).
- La exportación a PDF requiere conexión la primera vez.

## Autor

Proyecto educativo desarrollado como aplicación web interactiva.