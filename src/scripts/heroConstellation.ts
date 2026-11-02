const hero = document.querySelector<HTMLElement>('.hero');
const constellation =
  hero?.querySelector<SVGSVGElement>('.hero-constellation');

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const hasFinePointer = window.matchMedia(
  '(pointer: fine)'
).matches;

if (
  hero &&
  constellation &&
  !prefersReducedMotion &&
  hasFinePointer
) {
  // Guardamos referencias ya confirmadas como no-null.
  const heroElement = hero;
  const constellationElement = constellation;

  const nodeElements = Array.from(
    constellationElement.querySelectorAll<SVGGElement>('.network-node')
  );

  const nodes = nodeElements.map((element) => ({
    element,
    x: Number(element.dataset.x ?? 0),
    y: Number(element.dataset.y ?? 0),
  }));

  const influenceRadius = 120;
  const hotRadius = 52;
  const maxParallax = 7;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  let animationFrame = 0;

  function startAnimation() {
    if (animationFrame) return;

    animationFrame = requestAnimationFrame(animate);
  }

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    constellationElement.style.setProperty(
      '--field-x',
      `${currentX.toFixed(2)}px`
    );

    constellationElement.style.setProperty(
      '--field-y',
      `${currentY.toFixed(2)}px`
    );

    const moving =
      Math.abs(targetX - currentX) > 0.05 ||
      Math.abs(targetY - currentY) > 0.05;

    if (moving) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      animationFrame = 0;
    }
  }

  function getSvgPoint(event: PointerEvent) {
    const matrix = constellationElement.getScreenCTM();

    if (!matrix) return null;

    const point = new DOMPoint(
      event.clientX,
      event.clientY
    );

    return point.matrixTransform(matrix.inverse());
  }

  function handlePointerMove(event: PointerEvent) {
    const heroRect = heroElement.getBoundingClientRect();

    // Protección por si algún navegador devuelve dimensiones 0.
    const width = heroRect.width || 1;
    const height = heroRect.height || 1;

    const normalizedX =
      ((event.clientX - heroRect.left) / width) * 2 - 1;

    const normalizedY =
      ((event.clientY - heroRect.top) / height) * 2 - 1;

    /*
     * Parallax deliberadamente pequeño.
     * Se mueve en dirección contraria al cursor
     * para dar sensación de profundidad.
     */
    targetX = normalizedX * -maxParallax;
    targetY = normalizedY * -maxParallax * 0.65;

    const point = getSvgPoint(event);

    if (point) {
      nodes.forEach(({ element, x, y }) => {
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.hypot(dx, dy);

        const force =
          distance < influenceRadius
            ? 1 - distance / influenceRadius
            : 0;

        element.style.setProperty(
          '--pointer-force',
          force.toFixed(3)
        );

        element.classList.toggle(
          'is-pointer-hot',
          distance < hotRadius
        );
      });
    }

    startAnimation();
  }

  function handlePointerLeave() {
    targetX = 0;
    targetY = 0;

    nodes.forEach(({ element }) => {
      element.style.setProperty('--pointer-force', '0');
      element.classList.remove('is-pointer-hot');
    });

    startAnimation();
  }

  heroElement.addEventListener(
    'pointermove',
    handlePointerMove,
    { passive: true }
  );

  heroElement.addEventListener(
    'pointerleave',
    handlePointerLeave
  );
}