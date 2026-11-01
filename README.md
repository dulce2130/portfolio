# Portafolio

Astro nativo, TypeScript estricto y CSS propio. Sin frameworks de UI, fuentes externas ni dependencias de animación o i18n.

## Desarrollo

```sh
pnpm install
pnpm dev
```

`pnpm check` valida TypeScript y Astro. `pnpm build` valida y genera `dist/`. `pnpm preview` sirve la compilación localmente.

## Idiomas

Astro configura español como idioma por defecto sin prefijo: `/`. Inglés vive en `/en/`. Ambas rutas renderizan `HomePage.astro`, `BaseLayout.astro` y `Header.astro`; no se duplican componentes.

`src/i18n/ui.ts` contiene las traducciones editoriales y accesibles. `utils.ts` resuelve el locale y utiliza `getRelativeLocaleUrl` de Astro para las rutas equivalentes. Los identificadores de sección futuros serán compartidos (`work`, `contact`, etc.). ES / EN conserva el fragmento y query con JavaScript; sin JavaScript sigue siendo navegación normal entre rutas.

El layout localiza `lang`, título, descripción, metadatos sociales y enlaces alternativos. Cuando se conozca el dominio, configura `site` en `astro.config.mjs` para generar canónicas y URLs absolutas sin inventar un dominio.

## Tema y transición

Sin elección guardada se respeta el sistema, incluso si cambia durante la visita. El botón geométrico alterna claro/oscuro y guarda `portfolio-theme` en localStorage. Su estado se expresa con `aria-pressed`, descripción accesible y texto de estado localizado. Con foco en el botón, Supr (Delete) vuelve a Auto; el lector de pantalla anuncia esta instrucción. Internamente `setThemePreference('system')` ofrece el mismo restablecimiento.

El script inline del head restaura la elección antes del primer render. Si el almacenamiento está bloqueado, el tema sigue funcionando durante la visita. Se sincroniza entre pestañas y se conserva al cambiar idioma.

`src/scripts/theme.ts` calcula el centro del control y el radio hasta la esquina más lejana del viewport. View Transition API captura ambos temas; se revela el nuevo snapshot con `clip-path: circle()` durante 620 ms. Los clics sucesivos interrumpen la transición anterior. Sin soporte de la API, ante un fallo de captura o con reduced motion se aplica el tema sin expansión circular. No se usa el router de cliente de Astro ni se interceptan los enlaces de idioma.

## Atmósfera y estructura

`BackgroundAtmosphere.astro` aporta tres campos de iluminación con gradientes radiales en dos pseudo-elementos. Usa colores y opacidad propios para cada tema. El movimiento de 28–33 segundos es solo transform; con reduced motion permanece estático. La capa es decorativa, fija, recortada y no intercepta interacción.

- `src/components/`: Header, atmósfera y página compartida.
- `src/layouts/`: documento y metadatos.
- `src/pages/`: entradas ES/EN.
- `src/scripts/`: comportamiento del Header y temas.
- `src/styles/tokens.css`: sistema visual y variables de atmósfera.
- `src/styles/global.css`: base responsive, retícula `.grid-12`, foco y transiciones globales.
- `src/assets/`: futuros recursos procesados por Astro.
- `public/`: favicon provisional y archivos directos.

`Hero.astro` presenta la propuesta de valor en una retícula de doce columnas: sans para el titular y una palabra en serif itálica. Comparte componente y traducciones ES/EN. Los CTAs apuntan a `#work` y `#contact`, reservados para las secciones futuras. La entrada CSS finaliza en menos de 700 ms y se desactiva con reduced motion. La atmósfera existente permanece como único fondo, sin interacción adicional de puntero ni JavaScript en el Hero. La navegación de secciones permanece deshabilitada hasta que existan destinos reales.

Referencias: [i18n de Astro](https://docs.astro.build/en/guides/internationalization/) y [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition).
