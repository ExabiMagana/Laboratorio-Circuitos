# CircuitLab

Aplicación web educativa e interactiva para calcular y analizar circuitos
eléctricos resistivos de corriente continua mediante la Ley de Ohm y las
leyes de Kirchhoff.

## Estado actual

- **Fase 1** — Planificación y preparación (en curso).
- Versión inicial: `0.1`.

## Funcionalidades previstas

- Calculadoras: Ley de Ohm, potencia eléctrica, resistencia equivalente.
- Análisis de circuitos: serie, paralelo y mixtos prediseñados.
- Leyes de Kirchhoff: corrientes, voltajes y resolución de circuitos.
- Sección educativa con lecciones y ejemplos resueltos.
- Desafíos interactivos con puntuación.
- Exportación de resultados a PDF.

## Tecnologías

- HTML5
- CSS3 (variables, grid, flexbox)
- JavaScript (vanilla, sin frameworks)
- SVG para diagramas eléctricos
- jsPDF para exportación (se integrará en la Fase 10)

Sin backend, sin base de datos, sin registro de usuarios.
Todos los cálculos se realizan en el cliente.

## Estructura

CircuitLab/
├── index.html
├── css/
│ └── styles.css
├── js/
│ └── main.js
├── assets/
├── pages/
└── README.md


## Requisitos

- Un navegador moderno (Chrome, Firefox, Edge, Safari).
- Opcional: Visual Studio Code con la extensión *Live Server* para previsualizar.

## Ejecución local

1. Clona o descarga el proyecto.
2. Abre `index.html` directamente en el navegador,
   o usa *Live Server* desde VS Code (clic derecho sobre `index.html` → *Open with Live Server*).

## Publicación

Al ser una aplicación estática, puede publicarse en cualquier servicio de
alojamiento estático: GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.

## Limitaciones conocidas

- Esta versión no incluye todavía cálculos ni diagramas funcionales.
- El constructor libre de circuitos no está previsto para la versión 1.0.