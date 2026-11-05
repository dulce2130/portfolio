export {};

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
};

type FieldKind =
  | 'design'
  | 'frontend'
  | 'wordpress'
  | 'delivery';

const cards =
  document.querySelectorAll<HTMLElement>(
    '.capability-card'
  );

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

cards.forEach((card, cardIndex) => {
  const canvas =
    card.querySelector<HTMLCanvasElement>(
      '.capability-field'
    );

  if (!canvas) return;

  const context =
    canvas.getContext('2d');

  if (!context) return;

  /*
   * Referencias confirmadas como no-null.
   * Las funciones internas usarán estas referencias
   * para evitar warnings de TypeScript.
   */
  const canvasElement = canvas;
  const ctx = context;

  const kind =
    (card.dataset.capability ??
      'design') as FieldKind;

  let width = 0;
  let height = 0;

  let points: Point[] = [];

  let frame = 0;
  let running = false;
  let visible = false;
  let hovered = false;
  let focused = false;
  let cachedColors: ReturnType<typeof getColors> | undefined;
  const lifecycle = new AbortController();
  let phase = 0;

  let seed =
    8127 +
    cardIndex * 1879;

  function random() {
    seed =
      (seed * 9301 + 49297) %
      233280;

    return seed / 233280;
  }

  function createPoint(
    x: number,
    y: number,
    importance = false
  ): Point {
    return {
      x,
      y,

      vx:
        (random() - 0.5) *
        0.1,

      vy:
        (random() - 0.5) *
        0.1,

      radius:
        importance
          ? random() * 1.4 + 1.8
          : random() * 0.9 + 0.55,

      alpha:
        importance
          ? random() * 0.25 + 0.55
          : random() * 0.3 + 0.2,
    };
  }

  function createDesignField() {
    const created: Point[] = [];

    const columns = 5;
    const rows = 4;

    for (
      let row = 0;
      row < rows;
      row++
    ) {
      for (
        let column = 0;
        column < columns;
        column++
      ) {
        const x =
          width *
            ((column + 1) /
              (columns + 1)) +
          (random() - 0.5) * 18;

        const y =
          height *
            ((row + 1) /
              (rows + 1)) +
          (random() - 0.5) * 18;

        created.push(
          createPoint(
            x,
            y,
            (row + column) % 5 === 0
          )
        );
      }
    }

    return created;
  }

  function createFrontendField() {
    const created: Point[] = [];

    const count =
      width < 450
        ? 16
        : 22;

    for (
      let index = 0;
      index < count;
      index++
    ) {
      const progress =
        index /
        Math.max(count - 1, 1);

      const x =
        width *
        (0.12 + progress * 0.78);

      const y =
        height *
          (
            0.5 +
            Math.sin(
              progress *
                Math.PI *
                3
            ) *
              0.26
          ) +
        (random() - 0.5) * 40;

      created.push(
        createPoint(
          x,
          y,
          index % 6 === 0
        )
      );
    }

    return created;
  }

  function createWordPressField() {
    const created: Point[] = [];

    const centres = [
      {
        x: width * 0.3,
        y: height * 0.35,
      },
      {
        x: width * 0.7,
        y: height * 0.42,
      },
      {
        x: width * 0.5,
        y: height * 0.72,
      },
    ];

    centres.forEach(
      (centre, groupIndex) => {
        created.push(
          createPoint(
            centre.x,
            centre.y,
            true
          )
        );

        const satellites =
          groupIndex === 2
            ? 6
            : 5;

        for (
          let index = 0;
          index < satellites;
          index++
        ) {
          const angle =
            (
              Math.PI *
              2 *
              index
            ) /
              satellites +
            random() * 0.3;

          const radius =
            35 +
            random() * 30;

          created.push(
            createPoint(
              centre.x +
                Math.cos(angle) *
                  radius,

              centre.y +
                Math.sin(angle) *
                  radius
            )
          );
        }
      }
    );

    return created;
  }

  function createDeliveryField() {
    const created: Point[] = [];

    const count = 18;

    for (
      let index = 0;
      index < count;
      index++
    ) {
      const progress =
        index /
        (count - 1);

      const x =
        width *
        (
          0.1 +
          progress * 0.8
        );

      const y =
        height *
          (
            0.72 -
            progress * 0.42
          ) +
        Math.sin(
          progress *
            Math.PI *
            4
        ) *
          25;

      created.push(
        createPoint(
          x,
          y,
          index % 4 === 0
        )
      );
    }

    return created;
  }

  function createPoints() {
    /*
     * Reiniciamos la semilla para que
     * resize no cambie completamente
     * el patrón.
     */
    seed =
      8127 +
      cardIndex * 1879;

    switch (kind) {
      case 'frontend':
        points =
          createFrontendField();
        break;

      case 'wordpress':
        points =
          createWordPressField();
        break;

      case 'delivery':
        points =
          createDeliveryField();
        break;

      case 'design':
      default:
        points =
          createDesignField();
        break;
    }
  }

  function resize() {
    const rectangle =
      canvasElement
        .getBoundingClientRect();

    if (
      rectangle.width <= 0 ||
      rectangle.height <= 0
    ) {
      return;
    }

    const ratio =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    width =
      rectangle.width;

    height =
      rectangle.height;

    canvasElement.width =
      Math.round(
        width * ratio
      );

    canvasElement.height =
      Math.round(
        height * ratio
      );

    ctx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

    createPoints();

    draw();
  }

  function getColors() {
    const styles =
      getComputedStyle(
        document.documentElement
      );

    return {
      primary:
        styles
          .getPropertyValue(
            '--color-link'
          )
          .trim() ||
        '#afa6ff',

      lavender:
        styles
          .getPropertyValue(
            '--color-lavender'
          )
          .trim() ||
        '#d0a8e5',

      blue:
        styles
          .getPropertyValue(
            '--color-blue'
          )
          .trim() ||
        '#91b7ff',

      pink:
        styles
          .getPropertyValue(
            '--color-pink'
          )
          .trim() ||
        '#e58ab9',
    };
  }

  function update() {
    phase += 0.006;

    points.forEach(
      (point, index) => {
        point.x += point.vx;
        point.y += point.vy;

        point.x +=
          Math.sin(
            phase +
              index * 0.83
          ) *
          0.025;

        point.y +=
          Math.cos(
            phase * 0.8 +
              index * 1.11
          ) *
          0.02;

        const padding = 30;

        if (
          point.x < -padding ||
          point.x >
            width + padding
        ) {
          point.vx *= -1;
        }

        if (
          point.y < -padding ||
          point.y >
            height + padding
        ) {
          point.vy *= -1;
        }
      }
    );
  }

  function drawConnections(
    primaryColor: string
  ) {
    const maxDistance =
      kind === 'design'
        ? 125
        : kind === 'wordpress'
          ? 105
          : 118;

    points.forEach(
      (point, index) => {
        for (
          let otherIndex =
            index + 1;
          otherIndex <
          points.length;
          otherIndex++
        ) {
          const other =
            points[otherIndex];

          const dx =
            point.x -
            other.x;

          const dy =
            point.y -
            other.y;

          const distance =
            Math.hypot(
              dx,
              dy
            );

          if (
            distance >
            maxDistance
          ) {
            continue;
          }

          const opacity =
            (
              1 -
              distance /
                maxDistance
            ) *
            0.15;

          ctx.beginPath();

          ctx.moveTo(
            point.x,
            point.y
          );

          ctx.lineTo(
            other.x,
            other.y
          );

          ctx.strokeStyle =
            primaryColor;

          ctx.globalAlpha =
            opacity;

          ctx.lineWidth =
            0.65;

          ctx.stroke();
        }
      }
    );
  }

  function drawPoints(
    colors: ReturnType<
      typeof getColors
    >
  ) {
    points.forEach(
      (point, index) => {
        const pulse =
          1 +
          Math.sin(
            phase * 3 +
              index
          ) *
            0.12;

        const radius =
          point.radius *
          pulse;

        const color =
          index % 11 === 0
            ? colors.pink
            : index % 5 === 0
              ? colors.blue
              : index % 3 === 0
                ? colors.lavender
                : colors.primary;

        /*
         * Halo sólo en nodos principales.
         */
        if (
          point.radius >
          1.7
        ) {
          const halo =
            ctx.createRadialGradient(
              point.x,
              point.y,
              0,
              point.x,
              point.y,
              20
            );

          halo.addColorStop(
            0,
            color
          );

          halo.addColorStop(
            1,
            'transparent'
          );

          ctx.beginPath();

          ctx.arc(
            point.x,
            point.y,
            20,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            halo;

          ctx.globalAlpha =
            0.12;

          ctx.fill();
        }

        /*
         * Núcleo del nodo.
         */
        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          color;

        ctx.globalAlpha =
          point.alpha;

        ctx.fill();
      }
    );

    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    const colors = cachedColors ??= getColors();

    drawConnections(
      colors.primary
    );

    drawPoints(
      colors
    );

    ctx.globalAlpha = 1;
  }

  function animate() {
    if (!running) {
      frame = 0;
      return;
    }

    update();

    draw();

    frame =
      requestAnimationFrame(
        animate
      );
  }

  function start() {
    if (
      running ||
      motionPreference.matches || !finePointer.matches || !visible || document.hidden || !(hovered || focused)
    ) {
      return;
    }

    running = true;

    frame =
      requestAnimationFrame(
        animate
      );
  }

  function stop() {
    running = false;

    if (frame) {
      cancelAnimationFrame(
        frame
      );

      frame = 0;
    }

    /*
     * Dejamos la última composición
     * dibujada como ambientación.
     */
    draw();
  }

  const eventOptions = { signal: lifecycle.signal };
  // Touch focus can persist after a tap: keep its decorative field static.
  const sync = () => { if (visible && !document.hidden && !motionPreference.matches && finePointer.matches && (hovered || focused)) start(); else stop(); };
  card.addEventListener('pointerenter', event => { hovered = event.pointerType !== 'touch'; sync(); }, eventOptions);
  card.addEventListener('pointerleave', () => { hovered = false; sync(); }, eventOptions);
  card.addEventListener('focusin', () => { focused = true; sync(); }, eventOptions);
  card.addEventListener('focusout', () => queueMicrotask(() => { focused = card.contains(document.activeElement); sync(); }), eventOptions);
  const visibility = new IntersectionObserver(entries => { visible = entries[0]!.isIntersecting; sync(); });
  visibility.observe(card);
  document.addEventListener('visibilitychange', sync, eventOptions);
  motionPreference.addEventListener('change', sync, eventOptions);
  finePointer.addEventListener('change', sync, eventOptions);
  const recolor = () => { cachedColors = undefined; if (visible) draw(); };
  const themes = new MutationObserver(recolor);
  themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor, eventOptions);
  const resizeObserver =
    new ResizeObserver(
      resize
    );

  resizeObserver.observe(
    card
  );

  document.addEventListener('astro:before-swap', () => {
    running = false; cancelAnimationFrame(frame); lifecycle.abort();
    visibility.disconnect(); themes.disconnect(); resizeObserver.disconnect();
    canvasElement.width = canvasElement.height = 0; points = [];
  }, { once: true });
  resize();
});
