/** A small, event-driven 2D mesh. No particle system or permanent render loop. */
export function createWorkField(canvas: HTMLCanvasElement, host: HTMLElement) {
  const context = canvas.getContext('2d');
  if (!context) return { setVisible() {}, resize() {} };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0;
  let height = 0;
  let visible = false;
  let frame = 0;
  let color = '';
  let pointer: { x: number; y: number } | undefined;
  let points: Array<{ x: number; y: number; dx: number; dy: number }> = [];
  const columns = 8;
  const rows = 5;

  function draw() {
    frame = 0;
    if (!context || !width || !height) return;
    context.clearRect(0, 0, width, height);
    let moving = false;
    for (const point of points) {
      let dx = 0;
      let dy = 0;
      if (pointer && !reduced.matches && finePointer.matches) {
        const x = point.x - pointer.x;
        const y = point.y - pointer.y;
        const distance = Math.hypot(x, y);
        const influence = Math.max(0, 1 - distance / 230);
        dx = x / Math.max(distance, 1) * influence * 7;
        dy = y / Math.max(distance, 1) * influence * 7;
      }
      point.dx += (dx - point.dx) * .075;
      point.dy += (dy - point.dy) * .075;
      if (Math.abs(dx - point.dx) + Math.abs(dy - point.dy) > .04) moving = true;
    }
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = .65;
    context.globalAlpha = .13;
    const line = (indices: number[]) => {
      context.beginPath();
      indices.forEach((index, step) => {
        const p = points[index]!;
        const x = p.x + p.dx;
        const y = p.y + p.dy;
        if (!step) context.moveTo(x, y);
        else {
          const previous = points[indices[step - 1]!]!;
          context.bezierCurveTo(previous.x + previous.dx + (x - previous.x) * .5, previous.y + previous.dy, x - (x - previous.x) * .3, y, x, y);
        }
      });
      context.stroke();
    };
    for (let r = 0; r < rows; r++) line(Array.from({ length: columns }, (_, c) => r * columns + c));
    for (let c = 0; c < columns; c++) line(Array.from({ length: rows }, (_, r) => r * columns + c));
    context.globalAlpha = .3;
    for (const index of [10, 22, 29]) {
      const p = points[index]!;
      context.beginPath(); context.arc(p.x + p.dx, p.y + p.dy, 1.4, 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = 1;
    if (moving && visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
  }
  const request = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
  function resize() {
    const rect = host.getBoundingClientRect();
    width = Math.round(rect.width);
    // The mobile list can be tall; render a bounded decorative field at its top.
    height = Math.min(1100, Math.round(rect.height));
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;
    context!.setTransform(ratio, 0, 0, ratio, 0, 0);
    color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
    points = Array.from({ length: rows * columns }, (_, i) => {
      const c = i % columns;
      const r = Math.floor(i / columns);
      return { x: width * (.04 + c / (columns - 1) * .92), y: height * (.12 + r / (rows - 1) * .75) + Math.sin(c * .85 + r) * 20, dx: 0, dy: 0 };
    });
    request();
  }
  host.addEventListener('pointermove', event => {
    if (!visible || reduced.matches || !finePointer.matches) return;
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    request();
  }, { passive: true });
  host.addEventListener('pointerleave', () => { pointer = undefined; request(); });
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  new MutationObserver(() => { color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim(); request(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim(); request(); });
  reduced.addEventListener('change', () => { pointer = undefined; points.forEach(p => { p.dx = 0; p.dy = 0; }); request(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else request(); });
  return {
    resize,
    setVisible(value: boolean) {
      visible = value;
      if (value) { if (!width) resize(); request(); }
      else { pointer = undefined; cancelAnimationFrame(frame); frame = 0; }
    },
  };
}
