export {};

const hero =
  document.querySelector<HTMLElement>(
    '.hero'
  );

const constellation =
  hero?.querySelector<SVGSVGElement>(
    '.hero-constellation'
  );

const prefersReducedMotion =
  window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

const hasFinePointer =
  window.matchMedia(
    '(pointer: fine)'
  );

if (
  hero &&
  constellation
) {
  const heroElement =
    hero;

  const constellationElement =
    constellation;

  const nodeElements =
    Array.from(
      constellationElement.querySelectorAll<SVGGElement>(
        '.network-node'
      )
    );

  const nodes =
    nodeElements.map(
      (element) => ({
        element,

        x: Number(
          element.dataset.x ??
            0
        ),

        y: Number(
          element.dataset.y ??
            0
        ),
      })
    );

  const influenceRadius =
    120;

  const hotRadius =
    52;

  const maxParallax =
    7;

  let targetX = 0;
  let targetY = 0;

  let currentX = 0;
  let currentY = 0;

  let animationFrame = 0;
  let pointerFrame = 0;
  let visible = false;
  const canAnimate = () => visible && !document.hidden && !prefersReducedMotion.matches && hasFinePointer.matches;

  function startAnimation() {
    if (animationFrame || !canAnimate()) {
      return;
    }

    animationFrame =
      requestAnimationFrame(
        animate
      );
  }

  function animate() {
    if (!canAnimate()) { animationFrame = 0; return; }
    currentX +=
      (targetX -
        currentX) *
      .08;

    currentY +=
      (targetY -
        currentY) *
      .08;

    constellationElement
      .style
      .setProperty(
        '--field-x',
        `${currentX.toFixed(
          2
        )}px`
      );

    constellationElement
      .style
      .setProperty(
        '--field-y',
        `${currentY.toFixed(
          2
        )}px`
      );

    const moving =
      Math.abs(
        targetX -
          currentX
      ) > .05 ||
      Math.abs(
        targetY -
          currentY
      ) > .05;

    if (moving) {
      animationFrame =
        requestAnimationFrame(
          animate
        );
    } else {
      animationFrame = 0;
    }
  }

  function getSvgPoint(
    event: PointerEvent
  ) {
    const matrix =
      constellationElement
        .getScreenCTM();

    if (!matrix) {
      return null;
    }

    const point =
      new DOMPoint(
        event.clientX,
        event.clientY
      );

    return point
      .matrixTransform(
        matrix.inverse()
      );
  }

  function handlePointerMove(
    event: PointerEvent
  ) {
    const heroRect =
      heroElement
        .getBoundingClientRect();

    const width =
      heroRect.width ||
      1;

    const height =
      heroRect.height ||
      1;

    const normalizedX =
      (
        (event.clientX -
          heroRect.left) /
        width
      ) *
        2 -
      1;

    const normalizedY =
      (
        (event.clientY -
          heroRect.top) /
        height
      ) *
        2 -
      1;

    targetX =
      normalizedX *
      -maxParallax;

    targetY =
      normalizedY *
      -maxParallax *
      .65;

    const point =
      getSvgPoint(event);

    if (point) {
      nodes.forEach(
        ({
          element,
          x,
          y,
        }) => {
          const dx =
            point.x - x;

          const dy =
            point.y - y;

          const distance =
            Math.hypot(
              dx,
              dy
            );

          const force =
            distance <
            influenceRadius
              ? 1 -
                distance /
                  influenceRadius
              : 0;

          element
            .style
            .setProperty(
              '--pointer-force',
              force.toFixed(3)
            );

          element
            .classList
            .toggle(
              'is-pointer-hot',
              distance <
                hotRadius
            );
        }
      );
    }

    startAnimation();
  }

  function handlePointerLeave() {
    targetX = 0;
    targetY = 0;

    nodes.forEach(
      ({ element }) => {
        element
          .style
          .setProperty(
            '--pointer-force',
            '0'
          );

        element
          .classList
          .remove(
            'is-pointer-hot'
          );
      }
    );

    startAnimation();
  }

  const suspend = () => {
    cancelAnimationFrame(animationFrame); cancelAnimationFrame(pointerFrame);
    animationFrame = pointerFrame = 0; targetX = targetY = currentX = currentY = 0;
    constellationElement.style.setProperty('--field-x', '0px');
    constellationElement.style.setProperty('--field-y', '0px');
    nodes.forEach(({ element }) => { element.style.setProperty('--pointer-force', '0'); element.classList.remove('is-pointer-hot'); });
  };
  const queuePointerMove = (event: PointerEvent) => {
    if (!canAnimate() || pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => { pointerFrame = 0; if (canAnimate()) handlePointerMove(event); });
  };
  const visibility = new IntersectionObserver(entries => { visible = entries[0]!.isIntersecting; if (!visible) suspend(); });
  visibility.observe(heroElement);
  const onPreference = () => { if (!canAnimate()) suspend(); };
  document.addEventListener('visibilitychange', onPreference);
  prefersReducedMotion.addEventListener('change', onPreference);
  hasFinePointer.addEventListener('change', onPreference);
  document.addEventListener('astro:before-swap', () => {
    suspend(); visibility.disconnect();
    document.removeEventListener('visibilitychange', onPreference);
    prefersReducedMotion.removeEventListener('change', onPreference);
    hasFinePointer.removeEventListener('change', onPreference);
    heroElement.removeEventListener('pointermove', queuePointerMove);
    heroElement.removeEventListener('pointerleave', handlePointerLeave);
  }, { once: true });
  heroElement.addEventListener(
    'pointermove',
    queuePointerMove,
    {
      passive: true,
    }
  );

  heroElement.addEventListener(
    'pointerleave',
    handlePointerLeave
  );
}