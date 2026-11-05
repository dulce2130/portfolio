/** Pre-baked spiral texture: one image transform per frame, no per-star loop. */
const instances = new WeakMap<HTMLElement, () => void>();

export function createGalaxyBackground(host: HTMLElement): () => void {
  const existing = instances.get(host);
  if (existing) return existing;
  const canvas = host.querySelector<HTMLCanvasElement>('[data-galaxy-canvas]');
  const scene = host.querySelector<HTMLElement>('[data-galaxy-scene]');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!canvas || !scene || !ctx) return () => {};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 47.999rem)');
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const hardware = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const lowPower = (hardware.hardwareConcurrency > 0 && hardware.hardwareConcurrency <= 4) || (hardware.deviceMemory !== undefined && hardware.deviceMemory <= 4) || !!hardware.connection?.saveData;
  const count = mobile.matches || lowPower ? 850 : 2400;
  // Deterministic and generated only once for this instance.
  let seed = 4193;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const stars = Array.from({ length: count }, () => {
    const r = Math.pow(random(), .72);
    const arm = Math.floor(random() * 3);
    const spread = (random() + random() + random() - 1.5) * (.12 + r * .26);
    const theta = arm * Math.PI * 2 / 3 + r * 6.8 + spread;
    return { x: Math.cos(theta) * r, y: Math.sin(theta) * r, r, size: .4 + Math.pow(random(), 4) * 2, alpha: .22 + random() * .7, color: Math.floor(random() * 4) };
  });
  let texture: HTMLCanvasElement | undefined;
  let width = 0, height = 0, frame = 0, last = 0, phase = .2;
  let visible = false, disposed = false, dirty = false;
  const palette = () => {
    const css = getComputedStyle(document.documentElement);
    return ['--color-accent', '--color-lavender', '--color-blue', '--color-pink'].map(token => css.getPropertyValue(token).trim());
  };
  function bake() {
    const colors = palette();
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && systemDark.matches);
    // Keep the gradient's hue all the way to alpha zero (no grey fringe).
    const transparent = (hex: string) => { const value = hex.replace('#', ''); return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},0)`; };
    const size = lowPower || mobile.matches ? 1000 : 1700;
    texture ??= document.createElement('canvas');
    texture.width = texture.height = size;
    const buffer = texture.getContext('2d');
    if (!buffer) return;
    const center = size / 2, radius = size * .46;
    const haze = buffer.createRadialGradient(center, center, 0, center, center, radius);
    haze.addColorStop(0, colors[1]!); haze.addColorStop(.3, colors[0]!); haze.addColorStop(1, transparent(colors[0]!));
    buffer.globalAlpha = .1; buffer.fillStyle = haze; buffer.fillRect(0, 0, size, size);
    // Broad, translucent strokes make three spiral arms readable, not random stars.
    for (let arm = 0; arm < 3; arm++) {
      buffer.beginPath();
      for (let step = 0; step <= 100; step++) {
        const r = step / 100, a = arm * Math.PI * 2 / 3 + r * 6.8;
        const x = center + Math.cos(a) * r * radius, y = center + Math.sin(a) * r * radius;
        if (!step) buffer.moveTo(x, y); else buffer.lineTo(x, y);
      }
      buffer.strokeStyle = colors[arm]!; buffer.lineCap = 'round';
      for (const [lineWidth, alpha] of [[42, .025], [22, .035], [8, .045]]) { buffer.lineWidth = lineWidth!; buffer.globalAlpha = alpha!; buffer.stroke(); }
    }
    for (const star of stars) {
      const x = center + star.x * radius, y = center + star.y * radius;
      buffer.globalAlpha = star.alpha * (1 - star.r * .32); buffer.fillStyle = colors[star.color]!;
      buffer.beginPath(); buffer.arc(x, y, star.size * size / 1000, 0, Math.PI * 2); buffer.fill();
    }
    const core = buffer.createRadialGradient(center, center, 0, center, center, size * .12);
    core.addColorStop(0, colors[1]!); core.addColorStop(.13, colors[0]!); core.addColorStop(1, transparent(colors[0]!));
    buffer.globalAlpha = dark ? .8 : .28; buffer.fillStyle = core; buffer.fillRect(center - size * .12, center - size * .12, size * .24, size * .24);
    buffer.globalAlpha = 1;
  }
  function draw() {
    if (!ctx || !texture) return;
    ctx.clearRect(0, 0, width, height);
    const diameter = mobile.matches ? Math.max(width * 1.6, 620) : Math.min(width * 1.13, 1750);
    ctx.save(); ctx.translate(width * (mobile.matches ? .65 : .68), height * (mobile.matches ? .52 : .47));
    ctx.rotate(-.28); ctx.scale(1, .57); ctx.rotate(phase);
    ctx.drawImage(texture, -diameter / 2, -diameter / 2, diameter, diameter); ctx.restore();
    scene!.setAttribute('data-galaxy-ready', '');
  }
  const animated = () => !motion.matches && !mobile.matches && !lowPower;
  function tick(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    // Cap work to 30 fps; phase uses time, not frame count.
    if (!last || time - last >= 32) {
      if (last) phase += Math.min(time - last, 80) * .000012;
      last = time;
      if (dirty) { bake(); dirty = false; }
      draw();
    }
    if (animated()) frame = requestAnimationFrame(tick);
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; host.dataset.galaxyRunning = 'false'; }
  function refresh() {
    stop();
    if (disposed || !visible || document.hidden) return;
    if (dirty) { bake(); dirty = false; }
    draw();
    if (animated()) { host.dataset.galaxyRunning = 'true'; frame = requestAnimationFrame(tick); }
  }
  function resize() {
    const w = Math.round(scene!.clientWidth), h = Math.round(scene!.clientHeight);
    if (!w || !h || (w === width && h === height)) return;
    width = w; height = h;
    const dpr = Math.min(devicePixelRatio || 1, lowPower || mobile.matches ? 1 : 1.5);
    canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0); refresh();
  }
  function recolor() { dirty = true; refresh(); }
  const intersection = new IntersectionObserver(entries => { visible = entries[0]!.isIntersecting; refresh(); });
  const resizeObserver = new ResizeObserver(resize);
  const themeObserver = new MutationObserver(recolor);
  const onVisibility = () => refresh();
  const onPageHide = (event: PageTransitionEvent) => { if (event.persisted) stop(); else destroy(); };
  const onPageShow = () => refresh();
  function destroy() {
    if (disposed) return;
    disposed = true; stop(); intersection.disconnect(); resizeObserver.disconnect(); themeObserver.disconnect();
    motion.removeEventListener('change', refresh); mobile.removeEventListener('change', recolor); systemDark.removeEventListener('change', recolor);
    document.removeEventListener('visibilitychange', onVisibility); document.removeEventListener('astro:before-swap', destroy);
    window.removeEventListener('pagehide', onPageHide); window.removeEventListener('pageshow', onPageShow);
    if (texture) { texture.width = texture.height = 0; texture = undefined; }
    stars.length = 0; canvas!.width = canvas!.height = 0; scene!.removeAttribute('data-galaxy-ready'); instances.delete(host);
  }
  bake(); resize(); intersection.observe(host); resizeObserver.observe(scene);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  motion.addEventListener('change', refresh); mobile.addEventListener('change', recolor); systemDark.addEventListener('change', recolor);
  document.addEventListener('visibilitychange', onVisibility); document.addEventListener('astro:before-swap', destroy, { once: true });
  window.addEventListener('pagehide', onPageHide); window.addEventListener('pageshow', onPageShow);
  instances.set(host, destroy); return destroy;
}
