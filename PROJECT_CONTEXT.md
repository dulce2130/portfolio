# Contexto del proyecto — Portafolio de Dulce González

Fecha del escaneo: 2026-10-31. Directorio de trabajo: `C:\Users\dulce\Documents\Portafolio`.

Documento de traspaso basado en los archivos fuente y la configuración existentes. No se inspeccionaron dependencias instaladas, salida de compilación, repositorios Git ni caches. Las funcionalidades descritas son implementación observada en código; este escaneo no constituye una nueva prueba visual, de navegador ni una auditoría completa de accesibilidad. Cuando no hay evidencia suficiente se indica **No confirmado**.

## 1. Resumen general

- Nombre en `package.json`: `portafolio`, versión `0.0.1`, privado, módulos ESM.
- Identidad: Dulce González, Frontend Developer / Web & UX/UI Designer, México, remoto y freelance.
- Objetivo expresado en metadata: portafolio profesional para proyectos freelance y oportunidades de empleo remoto.
- Stack: Astro nativo, TypeScript estricto, HTML semántico, CSS propio, SVG y Canvas 2D con TypeScript nativo. Salida estática; no backend configurado.
- Gestor: `pnpm@11.20.0`, declarado en `packageManager`; existe `pnpm-lock.yaml`.
- Idiomas: español por defecto en `/`, inglés en `/en/`. Ambas entradas usan los mismos componentes.
- Temas: claro, oscuro y preferencia del sistema (Auto). El Header muestra un único botón geométrico, no tres opciones visibles.
- Arquitectura: entradas Astro → `HomePage` → `BaseLayout` con Header y atmósfera global → Hero y FeaturedWork. Contenido de proyectos separado en datos; lógica interactiva en scripts TS.
- Accesibilidad: skip link, landmarks, un H1, títulos asociados, lista real de proyectos, enlaces HTML, foco visible, controles con labels/estados accesibles, decoraciones ocultas a lectores de pantalla y alternativas con reduced motion.
- Responsive: CSS fluido y breakpoints específicos por componente. FeaturedWork tiene hélice Canvas para pantallas suficientemente anchas/altas, snap DOM en móvil y lista estática con reduced motion o cuando no puede activar Canvas.

## 2. Estructura real relevante

Se omiten directorios de dependencias, caches y build. El árbol incluye este nuevo documento.

```text
Portafolio/
├── PROJECT_CONTEXT.md
├── README.md
├── .gitignore
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── assets/
    │   └── projects/
    │       ├── amda-oaxaca/
    │       │   └── amda-oaxaca-cover.webp
    │       ├── catalogo-digital/
    │       │   └── catalogo-digital-cover.webp
    │       ├── edi-salud-infantil/
    │       │   └── edi-salud-infantil-cover.webp
    │       ├── fletes-mudanzas-jimenez/
    │       │   └── fletes-mudanzas-jimenez-cover.webp
    │       ├── galerias-oaxaca-suites/
    │       │   └── galerias-oaxaca-suites-cover.webp
    │       ├── invitacion-digital/
    │       │   ├── invitacion-cover.webp
    │       │   └── invitacion-main.webp
    │       └── tours-oaxaca/
    │           └── tours-oaxaca-cover.webp
    ├── components/
    │   ├── BackgroundAtmosphere.astro
    │   ├── FeaturedWork.astro
    │   ├── Header.astro
    │   ├── Hero.astro
    │   ├── HomePage.astro
    │   ├── LogoDG.astro
    │   └── ProjectPreview.astro
    ├── data/
    │   ├── project-navigation.ts
    │   └── projects.ts
    ├── i18n/
    │   ├── ui.ts
    │   └── utils.ts
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/
    │   ├── index.astro
    │   └── en/
    │       └── index.astro
    ├── scripts/
    │   ├── featured-work.ts
    │   ├── header.ts
    │   ├── project-helix.ts
    │   ├── theme.ts
    │   └── work-field.ts
    └── styles/
        ├── global.css
        └── tokens.css
```

No se encontraron otras entradas en `src/pages/`. No hay fuentes externas ni archivos de fuentes en el árbol fuente actual.

## 3. Rutas, documento y SEO

- `/`: `src/pages/index.astro` importa `../components/HomePage.astro`.
- `/en/`: `src/pages/en/index.astro` importa `../../components/HomePage.astro`.
- Ambas renderizan `HomePage` sin props, que compone `BaseLayout`, `Hero` y `FeaturedWork`, en ese orden.
- `astro.config.mjs`: `output: 'static'`; i18n `defaultLocale: 'es'`, `locales: ['es', 'en']`, `prefixDefaultLocale: false`.
- No existen páginas de proyectos/case studies ni rutas de About, servicios o contacto.
- `#work` sí existe. `#contact` todavía no tiene destino en el documento. About y Qué hago aparecen deshabilitados y sin `href` en el Header.
- `BaseLayout` recibe opcionalmente `title`, `description`, `theme?: 'light' | 'dark'` y un slot. Resuelve idioma y defaults localizados.
- Incluye charset, viewport, title, description, generator, favicon, alternates `es`/`en`/`x-default`, Open Graph localizado y `twitter:card=summary`.
- Canónica y `og:url` sólo se emiten si existe `Astro.site`. Actualmente no se configura `site` en `astro.config.mjs`: dominio de producción **No confirmado**. Los alternates son relativos mientras no exista ese valor. No hay imagen social configurada.
- Body: `BackgroundAtmosphere`, enlace `#contenido`, `Header`, `<main id="contenido" class="container" tabindex="-1">` con slot.

## 4. Componentes y dependencias

### `src/components/HomePage.astro`

Composición compartida de inicio. No tiene props ni lógica propia. Utiliza `BaseLayout`, `Hero`, `FeaturedWork`. Es la única composición de ambas páginas.

### `src/layouts/BaseLayout.astro`

Documento HTML y SEO descritos arriba. Importa `global.css`, `Header`, `BackgroundAtmosphere` e i18n. Restaura el tema guardado mediante script inline en el head antes de pintar. No usa router de cliente de Astro.

### `src/components/Header.astro`

No recibe props. Consulta locale y traducciones; usa `LogoDG`. Importa `src/scripts/header.ts`, que a su vez importa `theme.ts`. Renderiza identidad, navegación, idiomas, control de tema y menú responsive. Tiene estilos scoped y una regla global de separación del Header respecto al pin de FeaturedWork.

### `src/components/LogoDG.astro`

SVG decorativo sin props. Monograma vectorial DG con órbita y nodo viajero; estilos y animación CSS propios. Los detalles de espaciado no dependen de fuentes.

### `src/components/Hero.astro`

No recibe props. Consulta i18n. Renderiza propuesta de valor, perfil, descripción, dos CTAs, metadatos y constelación SVG. Los arrays `networkNodes` y `connections` viven en su frontmatter. No importa scripts de cliente: entrada, señales y pulsos se resuelven con CSS.

### `src/components/BackgroundAtmosphere.astro`

No recibe props ni scripts. Una capa fija decorativa con pseudo-elementos y `span.ambient-cloud`; depende de tokens y tema. Se monta una sola vez en el layout y queda detrás de todo el contenido, no exclusivamente dentro del Hero.

### `src/components/FeaturedWork.astro`

No recibe props. Importa `projects`, i18n y `ProjectPreview`; monta ambos canvases, intro, lista semántica, controles y scroll-room. Importa `featured-work.ts`. No hay modal de ampliación actualmente.

### `src/components/ProjectPreview.astro`

Props: `{ project: Project; locale: Locale; index: number }`. Usa `Image` de `astro:assets`, `projectNavigation`, `projectTags`, `getUI`. Renderiza cada `<li data-project>` con `<article>`, imágenes y metadata/enlace. El mismo DOM alimenta Canvas y sirve de lista/snap/fallback accesible. No tiene script independiente.

## 5. Header actual

### Estado inicial y scroll

- `.site-header[data-header]` siempre es fijo, centrado con `left:50%` y `translateX(-50%)`; al inicio ocupa `100%`, top `0`, radio `0`, fondo mezclado con `--color-bg` al 85%, borde inferior tenue y sin sombra visible. Con soporte, backdrop blur de 5px.
- `.header-inner` limita su contenido a `77.5rem` (1240px con base 16px), aunque la barra exterior inicial sea completa.
- `header.ts` añade `data-enhanced` y `html[data-floating-header]`. `syncScroll()` usa un único RAF pendiente por evento scroll y sólo modifica el atributo si cambia el estado.
- Histéresis: entra en `[data-scrolled]` al superar 90px; sale al volver a 72px o menos.
- Scrolled: ancho `min(calc(100% - 48px), 77.5rem)`, top `1rem`, radio `1.25rem`, fondo 96%, borde acentuado sutil, blur 11px, sombra/glow suaves. Padding vertical interior baja de `.5rem` a `.3rem`.
- Morph de 480ms con `cubic-bezier(.22,1,.36,1)` sobre ancho, top, radio, colores, sombra, blur y padding.
- `.header-reserve` mantiene una reserva constante de `--header-clearance`: 7rem, o 5.25rem por debajo de 40rem. Esa variable también controla `scroll-padding-block-start` y, mediante regla global del Header, el padding superior del pin de FeaturedWork.

### Identidad, navegación e idiomas

- Identidad enlazada al inicio localizado: símbolo DG y nombre pequeño «Dulce González», sin punto final.
- ES: Proyectos (`#work`), Sobre mí y Qué hago; EN: Work, About y What I do. Los dos últimos no tienen href, llevan `role=link`, `aria-disabled=true` y descripción de sección en preparación.
- Contacto no está en la lista normal. CTA `.header-contact`: Hablemos / Let's talk, href `#contact`.
- ES/EN usa enlaces HTML con `lang`, `hreflang`, `aria-current` y `data-language-path`. `syncLanguageLinks()` conserva query y hash al inicio y en `hashchange`; no intercepta navegación de idioma.
- Control de tema `.theme-toggle[data-theme-toggle]`: SVG de círculo dividido; `aria-pressed` representa tema oscuro efectivo. Ayuda y estado localizados con `aria-describedby` y `role=status`. Inicialmente hidden hasta activar JS.

### Logo y CTA

- Logo `viewBox="0 0 112 80"`, tamaño CSS 4.5 × 3.25rem. Letras con `translate(3.36 2.46) scale(.94)`: más aire respecto a la órbita sin agrandar el SVG completo.
- `.dg-traveller` recorre el mismo path que `.dg-orbit` con CSS `offset-path` y `offset-distance` de 18% a 118%, 10s lineales infinitos. Halo respira en 4.7s. La órbita no rota entera.
- Hover/focus ilumina órbita, núcleo y halo. La velocidad de recorrido no cambia en el código actual.
- CTA de radio 1.1rem, fondo `color-mix(--color-text 88%, --color-accent)`, texto `--color-bg`, borde lavanda y glow suave. La mezcla se adapta a Light/Dark; no usa blanco puro explícito.
- Flecha SVG inline de 16px, stroke 1.6; hover/focus desplaza 2px a derecha y arriba y ajusta fondo/borde/glow.
- Click: `clearBurst()` elimina el anterior; genera `.contact-burst[aria-hidden=true]` en el Header, fuera del nav. Crea 7 destellos o 4 con viewport menor de 640px, combinando SVG de cuatro puntas y puntos CSS. Recorrido 17–29px, duración 490/535/580ms, delays de 8ms por índice, mediante `Element.animate()`.
- Paleta: accent/lavender/blue y el último destello pink. Capa sin pointer events. `Promise.allSettled(animation.finished)` limpia nodos; no timers. No previene el enlace nativo ni espera la animación. No hay smooth scroll adicional implementado aquí. La ausencia actual de `#contact` no lanza error desde este handler.

### Menú y reduced motion

- Desktop de navegación: mínimo 68rem. Debajo, botón de menú con `aria-expanded`/`aria-controls`; el nav alterna `hidden`.
- Abrir enfoca el primer enlace real; Escape, click en enlace, click fuera o salida de foco cierran el menú. `setOpen()` devuelve foco al toggle si corresponde. No overlay ni focus trap.
- Por debajo de 40rem: nombre oculto, logo 3.75 × 2.75rem, controles compactos, links en columna. Pastilla scrolled: ancho `100% - 24px`, top `.75rem`, radio 1rem. CTA dentro del nav.
- Reduced motion: morph y desplazamiento de flecha desactivados; logo estático; burst no se genera y se limpia si cambia la preferencia. Si no existe WAAPI, el CTA funciona sin destellos.

## 6. Hero actual

### Estructura y copy exacto

`section.hero.grid-12` → eyebrow e índice decorativo 01 → único H1 de tres spans `.headline-line > .headline-reveal` → `.hero-introduction` con perfil, descripción y CTAs → `.hero-notes` → constelación SVG absoluta, `aria-hidden`.

ES:

- Eyebrow: `Portfolio / 2026` (CSS en mayúsculas).
- H1: `Diseño y desarrollo` / `experiencias digitales` / `con intención.`
- «experiencias» es `<em>` serif itálica; resto sans.
- Perfil: `Frontend Developer · Web & UX/UI Designer`.
- Descripción: `Diseño interfaces y experiencias web cuidando tanto cómo se ven como cómo funcionan.`
- CTAs: `Ver proyectos` → `#work`; `Contacto` → `#contact`.
- Notas: `México / Remoto`; `Disponible para freelance`.

EN:

- Eyebrow: `Portfolio / 2026`.
- H1: `Designing and building` / `digital experiences` / `with intention.`
- «experiences» es el fragmento serif itálico.
- Perfil: `Front-End Developer · Web & UX/UI Designer`.
- Descripción: `I design web interfaces and experiences with equal attention to how they look and how they work.`
- CTAs: `View work` → `#work`; `Contact` → `#contact`.
- Notas: `Mexico / Remote`; `Available for freelance`.

### Entrada y constelación

- Con no-preference: eyebrow 280ms; líneas H1 520ms con delays 120/280/440ms, reveal vertical desde 115% con clip-path de la línea.
- `serif-arrive`: 540ms desde 300ms, opacity y translateX/skewX(-1.5deg).
- Perfil desde 650ms, descripción 730ms, CTAs 860/940ms, metadata 1020/1080ms. El contenido termina aproximadamente a 1300ms. Foco visible cancela la entrada del CTA.
- Constelación: 9 nodos configurados y 9 conexiones declaradas, incluyendo una alternativa sólo móvil. Desktop muestra 8 conexiones; tablet/móvil ocultan subconjuntos.
- Nodos con jerarquías main/secondary/distant, halo desenfocado y pequeño núcleo. El principal tiene flash suave. Activación una vez por carga: 300–1620ms en desktop, escala .6→1 y opacity; líneas con `pathLength=1`, dashoffset 1→0 en 140ms, delays secuenciales.
- Después: deriva de 3px (2px móvil), halo con periodos distintos de 4–12s según nodo, núcleo más lento y líneas respirando 12/17s. No se repite el recorrido inicial.
- Desktop: SVG al lado derecho, ancho 44%, alto 72%, top 18%. Tablet 40–67.999rem: 40% × 42%, top 44%, sin nodos desktop-only. Móvil <40rem: 42% × 8rem al fondo, 4 nodos y 3 conexiones, menor opacidad.
- Light usa saturación .65 y opacidad de red .85; Dark usa 1/1, también cuando Auto resuelve oscuro. Reduced motion deja la composición estática, sin secuencia ni pulsos.
- Hero desktop: H1 columnas 2–11, sans `clamp(2.5rem,6.25vw,5.625rem)`, altura mínima `100svh - 12.5rem`. Tablet usa todo el ancho del grid, mínimo `100svh - 11rem`. Móvil abandona altura mínima, H1 `clamp(1.875rem,9vw,3.5rem)`, notas apiladas y CTAs con wrap.

### Nebulosa compartida

La aporta `BackgroundAtmosphere`, no una segunda capa del Hero. Capa fija con overflow hidden, z-index -1 y sin interacción. `::before` es iluminación azul base; `::after` combina dos radiales lavanda/periwinkle; `.ambient-cloud` combina radiales rosa/terciario. Blur `clamp(2rem,5vw,5rem)`.

- Light: intensidad .92, saturación .55, opacidad base .24 y tamaño de fondo principal 106%.
- Dark explícito o del sistema: intensidad 1.4, saturación 1, opacidad base .36, tamaño de fondo 100%.
- Movimiento automático CSS: `ambient-cloud-drift` 29s y 35s con diferentes delays/direcciones, y `ambient-cloud-sway` 23s/31s. Waypoints 0/14/29/43/58/72/86/100%, translate/scale/rotate más una pequeña traslación independiente.
- Rango desktop 14vw/12svh; móvil <40rem 5vw/5svh, blur 2rem, opacidades menores. Reduced motion conserva las capas estáticas. No Canvas, partículas ni JS para esta nebulosa.

## 7. FeaturedWork: arquitectura detallada

### Capas y DOM

`FeaturedWork.astro` tiene `section#work[data-featured-work]`. Dentro de `.work-pin[data-work-pin]`:

1. Canvas `.work-field[data-work-field]`: fondo gráfico, z-index -1.
2. Canvas `.work-spiral[data-work-spiral]`: imágenes de proyectos, z-index 0, inicialmente hidden.
3. Intro y UI DOM: título H2, contador, `.work-stage` con lista real `<ol class="work-list">` de `ProjectPreview`, controles anterior/siguiente y estado para lector de pantalla.

Ambos canvases son decorativos (`aria-hidden`) y `pointer-events:none`. Los eventos se escuchan en el pin; el contenido textual nunca se pinta en Canvas. Después del pin está `.work-scroll-room`.

Con `[data-deck]`, pin sticky top 0 y alto 100svh, overflow clip; scroll-room 320svh (sección aproximadamente 420svh en conjunto). Sin enhancement no hay scroll-room visible ni posición absoluta de las piezas. La lista sigue siendo el contenido base si falla JS/carga de Canvas.

### Archivo orquestador: `src/scripts/featured-work.ts`

`initFeaturedWork(section)` sólo inicializa el primer `[data-featured-work]` encontrado. Funciones clave: `select`, `render`, `measure`, `updateTargets`, `tick`, `schedule`, `goTo`, `configure`.

- `configure()` activa hélice sólo si ancho ≥48rem, alto ≥36rem, reduced motion no-preference y las texturas se han cargado (`ready`). Marca `data-deck`, muestra Canvas y controles. `loadStarted` evita precargar repetidamente.
- Móvil: ancho <48rem y no-preference marca `data-mobile`. Los estados no dependen sólo del ancho: una pantalla ancha de poca altura recibe lista estática.
- `measure()` mide pin/intro/controles, cachea inicio de sección, desplazamiento horizontal y recorrido `travel=max(1, section.offsetHeight-pin.offsetHeight)`. Canvas se recorta desde 14px bajo el intro hasta 8px antes de controles. Se ejecuta en resize/observers/configuración, no en cada frame de movimiento.
- `updateTargets()`: `targetProgress=clamp((scrollY-start)/travel)`. Entrada independiente: `entryTarget=clamp((scrollY+viewportHeight-start)/(viewportHeight*.72))`; al superar .08 marca `data-work-entered` para revelar la intro.
- `tick()` suaviza progreso y entrada con `factor=1-exp(-dt/160)`, dt limitado a 50ms. Equivale a una inercia ligera dependiente del tiempo, no autoplay.
- Realce hover/focus interpola con constante de 80ms. El loop RAF sólo continúa hasta estabilizar progreso, entrada y realce, o si queda puntero por procesar.
- `IntersectionObserver` sobre la sección, rootMargin 200px, pausa fuera de proximidad y comunica visibilidad al fondo. También pausa con documento oculto. ResizeObserver del pin y listeners de tema/sistema solicitan redibujado.
- Intro con opacity/translateY en 360/480ms y delay 80ms para H2; las cards emergen con profundidad extra y stagger por índice antes de seguir sólo el scroll.

### Matemática: `src/scripts/project-helix.ts`

Exporta `HelixView`, `HelixPose`, `Camera`, `clamp`, `helixCamera`, `helixPoses`, `selectHelixProject`, `createProjectHelix`.

La cámara tiene centro `(width*.55, height*.47)` y focal 1150px, o 1000 en modo tablet (ancho del pin <1000px). Por cada índice:

```text
spacing = 3π / max(1, count-1)
phase = progress * 3π
theta = index * spacing - phase
y = -(height*.102)*theta + (height*.025)*sin(theta)
x = rx*sin(theta) - y*.32
z = rz*cos(theta)
perspective = focal / (focal-z)
screen = cameraCenter + (x,y)*perspective
```

`rx=width*.235` desktop, `.23` tablet; `rz=350` desktop, 220 tablet. El recorrido útil es 1.5 vueltas. La componente axial Y y el término diagonal en X hacen que la cinta rodee un eje inclinado en profundidad, no un abanico centrado.

- Orientación de planos: yaw `sin(theta)*.48`, pitch `sin(theta)*.07`, roll `sin(theta)*.045`, en radianes; todos se aproximan a cero en el foco.
- Opacidad por profundidad normalizada: `.3 + .7 * depth^1.3`. Se mantiene diversidad de tamaño por perspectiva.
- `selectHelixProject()` minimiza un score de distancia X/Y normalizadas y distancia al frente Z. Histéresis de .12: el candidato debe mejorar suficientemente al anterior.
- Orden de pintado explícito: sort por Z ascendente; empate por score descendente. Fondos primero, frentes al final, sin depender del orden del array.

### Renderer Canvas 2D, texturas y framing

`createProjectHelix(canvas,cards)` devuelve `load`, `resize`, `draw`, `colors`, `hitTest`, `clear`; no posee loop RAF propio.

- `load()` lee imágenes del DOM `.project-visual img`, usa `data-canvas-src` (asset original), crea `Image`, espera `decode()` mediante Promise.all. Un fallo devuelve false y conserva el fallback DOM.
- Texturas auxiliares no montadas en DOM: web ancho máximo 1000px y alto por proporción original, clipping redondeado de 12px. No se recortan todas a un aspect-ratio único.
- Invitación usa textura transparente 560×620, con ambas capturas portrait conservando proporción: alturas 500 y 550, posiciones diferentes y giros -.06/.045 radianes. En DOM también son dos piezas verticales ligeramente solapadas. No hay conversión a landscape.
- Canvas visible y buffer intermedio usan DPR limitado a 2. `resize()` actualiza backing size, transform y colores desde tokens.
- `project()` rota las coordenadas locales del plano y proyecta cada esquina con su profundidad real. `triangle()` aproxima el mapeo en perspectiva mediante ocho tiras, dos triángulos afines por tira; frontal casi exacto usa una tira. Solapamiento .65px cierra juntas de antialiasing.
- Cada pieza se compone primero en un buffer de plano y luego una sola vez con su opacidad sobre la escena, evitando juntas oscuras entre triángulos de piezas translúcidas.
- Ancho frontal deseado web: `min(width*(tablet?.62:.48),620)`. Portrait: `min(width*(tablet?.46:.34),420)`. Se convierte a unidades de mundo dividiendo por perspectiva frontal.
- Ajuste fino de encuadre: `focus=exp(-(theta/.8)^2)`. Reduce el tamaño hasta un 6% cerca del foco; lejos tiende a cero la corrección. Una zona segura entre `clipTop+12` y `clipBottom-190` limita adicionalmente tamaño y corrige Y de manera ponderada por focus. Reserva 190px para metadata; no mide dinámicamente cada caption. La fórmula base de la hélice no cambia.
- Entrada: `arrival` escalonado por índice*.025, easing cúbico, hasta -550px adicionales en Z y factor de escala .85→1. Fuera del rectángulo visible no se pinta.
- Borde Canvas fino y glow accent en la pieza seleccionada. Hover aumenta escala 4.5%, opacidad hacia 1 y brillo de borde/halo; el resto sólo baja hasta un 6% adicional. No hay blur de imágenes ni tilt siguiendo el cursor.

### Selección e interacción

- Estado independiente: `scrollActiveProject`, `hoverActiveProject`, `focusActiveProject`. Prioridad UI real: **focus → hover → scroll**. `selected` es el índice presentado.
- `select()` actualiza `data-active` de la pieza, `data-active-index`, contador, live status y estado disabled de botones. `data-scroll-active`, `data-hover-active` y `data-rendered` facilitan observar el estado.
- Metadata visible abajo a la izquierda: número/categoría, H3, año sólo si existe, autoría, hasta tres tags y CTA. Sin panel opaco ni descripción larga. En tablet se permite mayor ancho de caption. Proyecto personal usa `.project-kind--personal` con `--color-link`.
- Las imágenes originales y captions inactivos se ocultan visualmente con clipping de 1px, **no** con `display:none` ni `inert`: siguen en lista semántica y los enlaces son enfocables.
- En cada `draw()` se guardan regiones con índice, profundidad, bounds y polígonos proyectados. Portrait usa polígonos para ambas pantallas. `hitTest()` descarta fuera del clipping, filtra bounds y usa punto-en-polígono; recorre las regiones en orden inverso de pintado para elegir la más cercana en superposición.
- `pointermove` del pin almacena coordenadas relativas, usa posición horizontal cacheada y `pinTop()` para corregir el desplazamiento sticky; hit testing se procesa en RAF. Ignora touch y los targets de UI `a`, `button`, `.project-caption`.
- Al dejar el pin se borra hover. Al mover sobre espacio vacío, hitTest devuelve null y la UI vuelve a scroll, salvo que haya foco. Scroll también limpia hover/puntero. Pasar de una imagen al caption no borra el hover inmediatamente porque ese target se ignora: permite usar su CTA.
- Cursor pointer sólo sobre piezas con enlace real. Click sobre Canvas se resuelve en el pin mediante hitTest y dispara `.click()` del enlace HTML correspondiente. AMDA no tiene enlace y no navega.
- Focusin de un proyecto en desktop selecciona y realza, sin cambiar trayectoria ni scroll. Focusout restaura selección al salir de todos los proyectos. Orden de tabulación = orden DOM de proyectos navegables.
- Botones anterior/siguiente llaman `goTo()` según scrollActive en hélice, o selected en móvil. En desktop modifican posición de scroll hacia `chosen/(count-1)` y mantienen smoothing. En móvil desplazan la lista.

### Móvil, fallback y reduced motion

- `.work-list` horizontal con scroll-snap mandatory; cada pieza ocupa 88%, por lo que se percibe una siguiente/anterior parcial. Imágenes y captions normales en DOM, sin hélice Canvas.
- Índice activo móvil = round(scrollLeft/mobileStep), con RAF; `mobileStep` se mide entre los offsetLeft de las primeras dos piezas. Foco navega a la pieza con scroll instantáneo; flechas usan smooth.
- Con reduced motion: ni data-deck ni data-mobile, Canvas visual oculto, controles ocultos y lista vertical editorial con todos los textos/enlaces visibles. Lo mismo como fallback visual si la pantalla ancha no cumple altura o si falla el preload. Sin JS permanece el contenido DOM.
- El borde DOM usa conic-gradient y `@property --work-rim-angle`; pieza activa con no-preference anima 12s. Está desactivado en DOM oculto del deck y en reduced motion.

### Fondo reactivo separado: `src/scripts/work-field.ts`

`createWorkField(canvas,host)` retorna `resize` y `setVisible`. Malla Canvas 2D de 8 columnas × 5 filas; curvas Bézier finas y tres intersecciones marcadas. Usa accent, alpha .13 para líneas y .3 para puntos.

Sólo puntero fino y hover, sin reduced motion: influencia hasta 230px, desplazamiento máximo 7px e interpolación .075 para deformación/retorno. DPR máximo 2; altura decorativa máxima 1100px. ResizeObserver, observadores de tema y visibilitychange actualizan/pausan. No loop permanente cuando no hay deformación pendiente; no partículas ni WebGL. Es independiente de la hélice y de la constelación SVG del Hero.

## 8. Datos de proyectos y navegación

Fuente: `src/data/projects.ts`. Tipo `Project`: `id`, `name`, `year?`, `url?`, `kind`, `format`, `images: ImageMetadata[]`, `copy: Record<Locale,ProjectText>`. `ProjectText` tiene category, description y tags. Las descripciones siguen en datos para uso futuro aunque ya no se imprimen en FeaturedWork.

Orden DOM/deck real: Catálogo Digital, Prueba EDI, AMDA Oaxaca, Yudiza Tours, Galerías Oaxaca Suites, Fletes y Mudanzas Jiménez, Invitación Digital. No reordenar por la lista de este documento.

Los seis primeros son `kind:'collaboration'`: **COLABORACIÓN PROFESIONAL / PROFESSIONAL COLLABORATION**. Sólo Invitación es `personal`: **PROYECTO PERSONAL / PERSONAL PROJECT**. Años omitidos salvo Invitación 2025; no hay placeholders de año.

### Catálogo Digital

- ID/slug reservado: `catalogo-digital`.
- Categoría ES/EN: Producto digital / Digital product.
- Participación: colaboración profesional.
- Tags completos ambos idiomas: Astro, Frontend, UX/UI, Responsive. Visibles: Astro · Frontend · UX/UI.
- Imagen: `src/assets/projects/catalogo-digital/catalogo-digital-cover.webp`.
- URL: `https://catalogo-digital.extendevs.com/`.
- Página interna actual: no. Reservas `/proyectos/catalogo-digital/` y `/en/proyectos/catalogo-digital/`.

### Prueba EDI

- ID existente `edi-salud-infantil`; slug futuro **prueba-edi** (no confundirlos).
- Categoría: Plataforma de salud / Healthcare platform.
- Participación: colaboración profesional.
- Tags: Astro, Frontend, Web Design, Responsive. Visibles: Astro · Frontend · Web Design.
- Imagen: `src/assets/projects/edi-salud-infantil/edi-salud-infantil-cover.webp`.
- URL: `https://pruebaedi.com/`.
- Página interna: no. Reservas `/proyectos/prueba-edi/` y `/en/proyectos/prueba-edi/`.

### Yudiza Tours

- ID `tours-oaxaca`; slug futuro **yudiza-tours**.
- Categoría: Turismo / Travel.
- Participación: colaboración profesional.
- ES tags: WordPress, Rediseño web, Bilingüe, Responsive.
- EN tags: WordPress, Web Redesign, Bilingual, Responsive. Visibles: los tres primeros localizados.
- Imagen: `src/assets/projects/tours-oaxaca/tours-oaxaca-cover.webp`.
- URL: `https://yudizatours.com/es/inicio/` (se usa esta misma URL pública también desde EN).
- Página interna: no. Reservas `/proyectos/yudiza-tours/` y `/en/proyectos/yudiza-tours/`.

### Hotel Real Alma

No está incluido en `projects`, no tiene imágenes en el árbol de assets ni página. Existe únicamente entrada reservada `hotel-real-alma` en el mapa de slugs de `project-navigation.ts`; no crea una ruta ni un elemento del deck. Nombre completo, categoría, participación, tags y URL como datos del código actual: **No confirmado**. No incorporarlo desde conversaciones o supuestos como si ya existiera.

### Galerías Oaxaca Suites

- ID: `galerias-oaxaca-suites`; sin slug de case study en el mapa actual.
- Categoría: Hospitalidad / Hospitality.
- Participación: colaboración profesional.
- Tags ambos idiomas: WordPress · Web Design · Hospitality.
- Imagen: `src/assets/projects/galerias-oaxaca-suites/galerias-oaxaca-suites-cover.webp`.
- URL: `https://galeriasoaxaca.com/`.
- Página interna: no; usa URL pública.

### Fletes y Mudanzas Jiménez

- ID: `fletes-mudanzas-jimenez`; sin slug reservado de case study.
- Categoría: Web de servicios / Service website.
- Participación: colaboración profesional.
- ES tags: WordPress · Web de servicios · Responsive.
- EN tags: WordPress · Service Website · Responsive.
- Imagen: `src/assets/projects/fletes-mudanzas-jimenez/fletes-mudanzas-jimenez-cover.webp`.
- URL: `https://fletesymudanzasjimenez.com/`.
- Página interna: no; usa URL pública.

### AMDA Oaxaca

- ID: `amda-oaxaca`; sin slug reservado de case study.
- Categoría: Web institucional / Institutional website.
- Participación: colaboración profesional.
- ES tags: WordPress · Web institucional · Contenido.
- EN tags: WordPress · Institutional Website · Content.
- Imagen: `src/assets/projects/amda-oaxaca/amda-oaxaca-cover.webp`.
- URL pública: no definida en datos. Página interna: no. Muestra Próximamente / Coming soon en lugar de enlace.

### Invitación Digital — Lala & José

- ID/slug reservado: `invitacion-digital`.
- Categoría: Experiencia mobile-first / Mobile-first experience.
- Participación: proyecto personal. Año confirmado en datos: 2025.
- Tags completos: HTML, CSS, JavaScript, Mobile-first. Visibles: HTML · CSS · JavaScript.
- Imágenes: `src/assets/projects/invitacion-digital/invitacion-cover.webp` y `invitacion-main.webp` en la misma carpeta. Formato `portrait`; se utilizan juntas, conservando su proporción.
- URL: `https://dulce2130.github.io/invitacion-Lala-Jose.io/`.
- Página interna: no. Reservas `/proyectos/invitacion-digital/` y `/en/proyectos/invitacion-digital/`.

### Resolución de enlaces

`src/data/project-navigation.ts` contiene el mapa ID→slug, `projectNavigation()` y `projectTags()`.

- `import.meta.glob('/src/pages/**/*.astro')` determina qué páginas Astro existen al compilar.
- Sólo habilita el destino interno si encuentra exactamente `/src/pages${path}index.astro`. La convención actual exige carpeta/`index.astro`; un futuro `[slug].astro` o `slug.astro` no se detectaría automáticamente con este chequeo.
- Prefijo inglés actual: `/en/proyectos/`, no `/en/projects/`.
- Devuelve `plannedPath`, `href`, `external`. Si no existe página interna, href es `project.url`; no se generan enlaces 404 hacia slugs reservados.
- Hoy todos los CTAs navegables Ver proyecto / View project abren las URLs públicas con `target=_blank` y `rel=noopener noreferrer`. El aria-label aclara Visitar sitio / Visit site. Cuando se habilite una página interna se quitará ese target automáticamente.
- `projectTags()` muestra `copy[locale].tags.slice(0,3)`. El array completo no debe recortarse en datos.

## 9. Assets

El árbol de la sección 2 enumera todos los archivos presentes en `src/assets/projects/`: siete carpetas, ocho WebP. Se importan directamente en `projects.ts`, no se duplican en public. No hay asset de Hotel Real Alma.

`ProjectPreview` usa `astro:assets/Image` con variantes de anchura y sizes responsive, lazy loading, async decoding y WebP. `data-canvas-src` conserva la URL del recurso original para el preload del renderer. La hélice sí precarga todos sus recursos al habilitarse, aunque los `<img>` DOM sean lazy.

`public/favicon.svg` es un placeholder vectorial cuadrado con una P, independiente del logo DG. No contiene la identidad orbital del Header. No se inspeccionaron binarios ni se midieron nuevamente dimensiones de imagen durante este escaneo; el hit testing portrait incorpora explícitamente razón 818/1662 en código.

## 10. I18N

- `src/i18n/ui.ts`: objetos `es` y `en` `as const`; exporta `Locale=keyof typeof ui` y `TranslationKey=keyof typeof ui.es`. Incluye SEO, Hero, Header, ayuda accesible, tema y UI de proyectos.
- `src/i18n/utils.ts`: `getLocale(Astro.currentLocale)` devuelve en sólo si recibe en; cualquier otro valor cae a es. `getUI(locale)` retorna su diccionario.
- `localizedPath(pathname,locale)` elimina prefijo /en y barras exteriores y llama `getRelativeLocaleUrl` de `astro:i18n`.
- Astro resuelve el locale desde las rutas/configuración. No se usa traducción automática del navegador, localStorage de idioma ni duplicación de componentes.
- Las descripciones/categorías/tags de proyectos se localizan en `projects.ts`, no en `ui.ts`.
- `lang` del documento y metadata se resuelven en BaseLayout; Header marca enlace de idioma actual. IDs de secciones compartidos entre idiomas.
- Quedan claves de UI de anteriores vistas (workPreview, workClose, workYearPending) que no implican que exista actualmente modal, ampliación o placeholder de año.

## 11. Theming

Archivos responsables: `tokens.css`, `global.css`, script inline del head en `BaseLayout`, `src/scripts/theme.ts`, marcado del Header y estilos temáticos de atmósfera/Hero.

- API exportada: `setThemePreference(preference, origin?)`, `ThemePreference='light'|'dark'|'system'`. Auto corresponde internamente a system, no a `data-theme="auto"`.
- Manual: `html[data-theme=light|dark]`. Auto: ausencia de ese atributo y CSS `prefers-color-scheme:dark`.
- Persistencia clave `portfolio-theme`: guarda light/dark; para Auto elimina la clave. El inline sólo restaura valores válidos, con try/catch por almacenamiento bloqueado.
- `effectiveTheme`, `syncControl`, `apply` resuelven estado efectivo, aria-pressed, title y live status localizado. Click alterna tema efectivo; Delete con foco vuelve a system. Cambio del SO actualiza estado cuando Auto; evento storage sincroniza pestañas y clear de almacenamiento.
- Reveal circular progresivo: requiere origin, cambio efectivo de tema, no reduced motion, `document.startViewTransition` y soporte CSS circle. Origen = centro del botón; radio = distancia a la esquina más lejana del viewport.
- `data-theme-transition` suspende transiciones CSS y crossfade; old/new root snapshots con orden 1/2 y sin mix blending. WAAPI anima `::view-transition-new(root)` con clip-path circular desde 0, duración token 620ms y ease-standard.
- `generation`/request evita resultados obsoletos en clicks rápidos; `skipTransition()` interrumpe la anterior. Maneja rechazos/errores de snapshots; sin soporte o con reduced motion aplica normalmente. Conversión de duración soporta serialización ms o s.
- No usa ClientRouter de Astro. El cambio de idioma es navegación normal; el head restaura el tema persistido.

## 12. CSS y design system

`src/styles/global.css` importa `tokens.css`. CSS scoped en cada componente para presentación específica. Sin preprocesador, Tailwind ni framework de utilidades propio extenso.

### Tokens de color

- Light: bg #F5F2EC, surface #FBFAF7, elevated #FFFFFF; text #11162F, muted #59658F; accent #7064D9, link/focus #6356C5, border #DCD8E3; lavender #B5A8EF, pink #C76A9C, blue #668FE3.
- Dark: bg #090A16, surface #121522, elevated #19172A; text #F4F1F7, muted #9B98A8; accent/link/focus #AFA6FF, border #2D2C40; lavender #D0A8E5, pink #E58AB9, blue #91B7FF.
- Tokens de atmósfera propios por tema: `--atmosphere-primary/secondary/tertiary/opacity`. Light opacity .24, Dark .36. Los valores oscuros se duplican deliberadamente para Dark explícito y media query del SO.

### Tipografía, espacio y capas

- Display: Iowan Old Style → Palatino Linotype → Georgia → serif.
- Cuerpo/UI: Segoe UI → Helvetica Neue → Arial → sans-serif.
- Metadata mono: Cascadia Code → Consolas → monospace. No cargas externas.
- Tamaños: xs .75rem, sm .875rem, base 1rem, lg 1.25rem, xl fluido; display global clamp(2.5rem,1.5rem+4vw,6rem). Los titulares del Hero/Work sobrescriben según composición.
- Spacing: pasos 1/2/3/4/5/6/8/12/16/24 equivalentes .25/.5/.75/1/1.25/1.5/2/3/4/6rem.
- Radios: .25rem, .75rem y pill 999px; Header/CTA tienen radios específicos.
- Container: máximo 82rem y gutter clamp(1.25rem,4vw,4rem); gap grid clamp(1rem,2vw,2rem).
- Duración fast160ms, normal240ms; ease-standard cubic-bezier(.2,0,0,1), ease-out cubic-bezier(.16,1,.3,1); Header usa easing propio de 480ms.
- Z tokens: header10, menu20, skip-link100. Aislamiento del body y del work-pin separa capas decorativas negativas.

### Utilidades y responsive

- `.container`, `.grid-12` (12 columnas minmax(0,1fr)), `.metadata`, `.sr-only`, `.skip-link`.
- Border-box universal, wrap de palabras, tamaño mínimo 0 para hijos del grid; medios fluidos y `[hidden]{display:none!important}`.
- Foco visible global: outline 3px color-focus, offset4px. Target mínimo token 2.75rem en controles/enlaces principales.
- Breakpoints clave: 40rem (~640px) Hero/logo/atmósfera/Header compacto; 48rem (~768px) Work móvil/hélice; 68rem (~1088px) navegación desktop y variantes tablet. Renderer tablet se basa en **1000px de ancho del pin**, no exactamente en media query viewport.
- Reduced motion global reduce duraciones/iteraciones y fuerza scroll-behavior auto; componentes deshabilitan explícitamente movimientos y el deck cambia a lista real. No asumir que sólo modificar la media query global desactiva toda la lógica JS.

## 13. JavaScript / TypeScript

- `header.ts`: menú, foco/Escape, morph por scroll, destellos WAAPI, query/hash de idioma. Importa `theme.ts`.
- `theme.ts`: tema efectivo/manual/sistema, persistencia/sincronización, accesibilidad y View Transition circular.
- `featured-work.ts`: modo responsive, scroll/entrada/RAF, selección scroll/hover/focus, navegación Canvas→enlace HTML, controles y observers.
- `project-helix.ts`: geometría/proyección, score de foco, carga/decodificación/texturas, framing, pintado y hit testing.
- `work-field.ts`: malla Canvas reactiva independiente, resize/DPR y pausa por visibilidad.
- `BaseLayout.astro` tiene además script inline mínimo para evitar flash de tema. Hero, Logo y atmósfera se animan sólo con CSS.
- Scripts de Header y Work asumen una sola instancia del componente por página. No hay lifecycle de navegación SPA ni API de montaje/desmontaje compartida.

## 14. Dependencias y configuración

Dependencias declaradas reales de `package.json`:

- Producción: `astro: ^7.4.4`.
- Desarrollo: `@astrojs/check: ^0.9.12`, `typescript: ^6.0.3`.

Son rangos declarados, no una inspección de paquetes instalados. TypeScript extiende `astro/tsconfigs/strict`; include `.astro/types.d.ts` y `**/*`, exclude `dist`. El archivo de tipos generado no se inspeccionó.

No se usan React, Vue, Tailwind, GSAP, Three.js, WebGL ni librerías de carrusel/scroll/i18n/animación. No integrations/adaptador configurados. La interacción gráfica usa SVG, Canvas 2D, CSS y Web APIs nativas.

## 15. Estado actual del proyecto

### Terminados / funcionales

Implementados en código: ambas entradas de inicio, composición/layout, metadata localizada, i18n compartido, tokens, Light/Dark/Auto con persistencia y reveal circular progresivo, Header responsive con morph/logo/CTA/destellos, Hero editorial y constelación, atmósfera animada, FeaturedWork de siete proyectos con hélice Canvas/fondo separado, hover/foco, enlaces públicos seguros y alternativas móvil/reduced motion. Tags y autoría provienen de datos confirmados.

«Funcional» aquí indica que existe la implementación; las pruebas visuales anteriores de la conversación no se vuelven a certificar en este escaneo. Sólo se solicita ejecutar build después de crear el documento.

### En refinamiento

No hay TODO/FIXME explícitos encontrados en `src` que definan una tarea de refinamiento abierta. El renderer documenta un ajuste de framing del foco y el código muestra tratamiento específico de metadata/hover, pero aprobación final o trabajo pendiente adicional: **No confirmado**. No inferir nuevas tareas ni rediseñar elementos aprobados a partir de este documento.

### Pendientes

- Páginas individuales de proyectos: slugs reservados y comentarios existentes prevén habilitarlas después; no están construidas.
- About/Sobre mí y Qué hago: links explícitamente deshabilitados y texto de preparación. No hay componentes de estas secciones.
- Contacto: anchors presentes pero sin `#contact`, sección, formulario ni envío implementados.
- No hay footer ni sección de experiencia en el árbol actual. Alcance futuro preciso: **No confirmado**.
- Hotel Real Alma: únicamente slug reservado, no datos/asset/listado.
- Dominio de producción/site: sin configurar; canónicas absolutas no se emiten.
- Favicon provisional según README y contenido SVG.
- README tiene texto histórico desactualizado (menciona work/assets futuros, entrada Hero menor a700ms y atmósfera anterior de dos pseudo-elementos). Para continuar, priorizar el código y este inventario, no esas descripciones históricas. No se modificó README.
- No hay comando de tests ni suite dedicada en el árbol fuente escaneado. Cobertura de navegadores, métricas de rendimiento, cumplimiento WCAG auditado, hosting/despliegue y dominio: **No confirmado**.

## 16. Puntos delicados para continuar

1. **No sustituir Canvas por cards DOM como visual principal** si se quiere conservar el resultado actual. El DOM existe por accesibilidad, datos y fallback; el renderer es una capa independiente.
2. **Pintado e hit testing deben coincidir**: mismo orden Z y polígonos tras framing/hover. No usar sólo bounds o índice del array para decidir clicks en superposiciones.
3. **Separar selección y geometría**: foco/hover no deben cambiar phase ni progress. `scrollActiveProject` usa histéresis; foco tiene prioridad real sobre hover.
4. **Framing**: safeBottom reserva190px fijos, no altura medida de metadata. Cambiar fuentes/copy/altura de controles podría invalidar esa reserva. La corrección depende de theta cerca del foco, no de la etiqueta activa por hover de una pieza lejana.
5. **Doble portrait**: texture layout y polígonos de hit testing comparten dimensiones/giros; estos últimos usan razón818/1662 explícita. Cambiar assets o composición exige revisar ambos. No recortar a landscape.
6. **Proyección afín y alpha**: las tiras solapadas y buffer intermedio evitan juntas visibles. Quitar el buffer o componer cada triángulo con alpha de profundidad puede reintroducirlas.
7. **Mediciones y sticky**: start/travel dependen de altura real de sección/pin. No mezclar scroll-room con altura sticky ni recalcular layout en cada frame. Alto mínimo36rem es parte del fallback desktop.
8. **Header y Work están acoplados por CSS global**: `html[data-floating-header] [data-featured-work][data-deck] [data-work-pin]` usa `--header-clearance`. Cambiar atributos o reserva puede hacer que la navbar tape la intro; no depende sólo del CSS de Work.
9. **Foco y lista semántica**: no ocultar entradas inactivas con display:none/inert ni quitar sus enlaces. La UI seleccionada debe hacerse visible al enfocar. AMDA permanece sin enlace.
10. **Routing futuro**: el glob de case studies reconoce páginas `.../index.astro` concretas; no publicar plannedPath como href antes de existir. No asumir slug=id ni renombrar `/en/proyectos/` sin revisar el helper.
11. **Tema**: mantener alineados inline del head, clave de storage, ausencia de atributo para Auto y reglas explícitas/media queries de tokens/atmósfera. La duración WAAPI necesita convertir ms/s. Respetar generation al interrumpir transiciones.
12. **Observadores y rendimiento**: renderer y field tienen loops distintos y event-driven. Preservar pausa por visibilidad/estabilización y DPR2. No crear RAF permanente ni nuevas mediciones en hover sin necesidad.
13. **Sin SPA actual**: scripts usan querySelector y listeners globales una vez. Añadir router de cliente o múltiples instancias requeriría diseñar lifecycle; hoy no está resuelto.
14. **Fuente de verdad de contenido**: tags completos en projects, sólo primeros3 visibles; autoría6 colaboraciones+1 personal; año sólo2025. No inventar métricas, tecnologías, autoría o años adicionales.

## 17. Comandos reales

Ejecutar desde la raíz del proyecto:

```bash
pnpm dev
pnpm check
pnpm build
pnpm preview
pnpm astro
```

- `dev` → `astro dev`.
- `check` → `astro check` (Astro/TypeScript).
- `build` → `pnpm check && astro build`: comprueba tipos y genera sitio estático.
- `preview` → `astro preview`, sirve la compilación existente.
- `astro` → CLI Astro para comandos explícitos.
- README documenta `pnpm install` para instalación inicial; **no se ejecutó ni se solicitó instalar nada durante este escaneo**.
- No iniciar otro servidor ni detener uno existente como efecto de documentar. Si `pnpm dev` informa que ya hay una instancia activa, usar su URL o coordinar reinicio en una tarea autorizada.

## 18. Alcance de este documento y verificación

Único archivo de autoría creado por esta tarea: `PROJECT_CONTEXT.md`. No se refactoriza ni corrige código y no se modifica diseño, datos, imágenes, configuración o archivos existentes. No se inspeccionan `node_modules`, `dist`, `.git`, caches ni archivos generados. La ejecución solicitada de `pnpm build` puede actualizar su propia salida/caches de forma normal; no implica edición manual de esos archivos ni análisis de su contenido.

Comprobación solicitada al finalizar: ejecutar `pnpm build` y reportar el resultado en la respuesta de entrega. No se requieren cambios ni nuevas pruebas de navegador para este escaneo documental.
