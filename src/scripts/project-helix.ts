export interface HelixView { width: number; height: number; count: number; tablet: boolean; }
export interface HelixPose {
  index: number; theta: number; x: number; y: number; z: number;
  screenX: number; screenY: number; perspective: number;
  yaw: number; pitch: number; roll: number; opacity: number; score: number;
}
export interface Camera { x: number; y: number; focal: number; }
export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export function helixCamera(view: HelixView): Camera {
  return { x: view.width * .55, y: view.height * .47, focal: view.tablet ? 1000 : 1150 };
}

/** A cylindrical helix, not a radial fan. One complete scroll rotates the
 * ribbon through 1.5 turns while translating each project along its axis. */
export function helixPoses(progress: number, view: HelixView): HelixPose[] {
  const camera = helixCamera(view);
  const spacing = Math.PI * 3 / Math.max(1, view.count - 1);
  const phase = progress * Math.PI * 3;
  const rx = view.width * (view.tablet ? .23 : .235);
  const rz = view.tablet ? 220 : 350;
  const axialPitch = view.height * (view.tablet ? .102 : .102);
  const verticalWave = view.height * .025;
  return Array.from({ length: view.count }, (_, index) => {
    const theta = index * spacing - phase;
    const y = -axialPitch * theta + verticalWave * Math.sin(theta);
    const x = rx * Math.sin(theta) - y * .32;
    const z = rz * Math.cos(theta);
    const perspective = camera.focal / (camera.focal - z);
    const depth = (z + rz) / (2 * rz);
    return {
      index, theta, x, y, z, perspective,
      screenX: camera.x + x * perspective,
      screenY: camera.y + y * perspective,
      yaw: Math.sin(theta) * .48,
      pitch: Math.sin(theta) * .07,
      roll: Math.sin(theta) * .045,
      opacity: .3 + .7 * Math.pow(depth, 1.3),
      score: Math.hypot(x / (rx * 1.7), y / (axialPitch * spacing), (rz - z) / rz * .65),
    };
  });
}

export function selectHelixProject(poses: HelixPose[], current: number): number {
  const nearest = poses.reduce((a, b) => a.score < b.score ? a : b);
  const previous = poses[current];
  return !previous || nearest.index === current || nearest.score + .12 < previous.score ? nearest.index : current;
}

interface Texture { source: HTMLCanvasElement; portrait: boolean; }
interface Point { x: number; y: number; }
interface HitRegion { index: number; depth: number; x: number; y: number; width: number; height: number; polygons: Point[][]; }

/** Independent 2D renderer: decodes real images, prepares bounded textures,
 * projects each plane and paints in depth order. It owns no animation loop. */
export function createProjectHelix(canvas: HTMLCanvasElement, cards: HTMLElement[]) {
  const output = canvas.getContext('2d', { alpha: true });
  let ctx = output;
  const plane = document.createElement('canvas');
  const planeContext = plane.getContext('2d', { alpha: true });
  let textures: Texture[] = [];
  let width = 0;
  let height = 0;
  let clipTop = 0;
  let clipBottom = 0;
  let accent = '';
  let border = '';
  let surface = '';
  let regions: HitRegion[] = [];
  const contains = (polygon: Point[], x: number, y: number) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i]!, b = polygon[j]!;
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  };
  function hitTest(x: number, y: number): number | null {
    if (y < clipTop || y > clipBottom) return null;
    // Reverse painter order, so a rear image cannot steal an overlapping hit.
    for (let i = regions.length - 1; i >= 0; i--) {
      const r = regions[i]!;
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height && r.polygons.some(p => contains(p, x, y))) return r.index;
    }
    return null;
  }

  const colors = () => {
    const css = getComputedStyle(document.documentElement);
    accent = css.getPropertyValue('--color-accent').trim();
    border = css.getPropertyValue('--color-border').trim();
    surface = css.getPropertyValue('--color-surface').trim();
  };
  async function load(): Promise<boolean> {
    if (!ctx) return false;
    try {
      textures = await Promise.all(cards.map(async card => {
        const images = await Promise.all([...card.querySelectorAll<HTMLImageElement>('.project-visual img')].map(async original => {
          const image = new Image();
          image.decoding = 'async';
          image.src = original.dataset.canvasSrc || original.currentSrc || original.src;
          await image.decode();
          return image;
        }));
        const portrait = card.dataset.format === 'portrait';
        const source = document.createElement('canvas');
        source.width = portrait ? 560 : Math.min(1000, images[0]!.naturalWidth);
        source.height = portrait ? 620 : Math.round(source.width * images[0]!.naturalHeight / images[0]!.naturalWidth);
        const buffer = source.getContext('2d')!;
        if (portrait) {
          images.forEach((image, index) => {
            const h = index ? 550 : 500;
            const w = h * image.naturalWidth / image.naturalHeight;
            const x = index ? 236 : 40;
            const y = index ? 28 : 86;
            buffer.save(); buffer.translate(x + w / 2, y + h / 2); buffer.rotate(index ? .045 : -.06);
            buffer.drawImage(image, -w / 2, -h / 2, w, h); buffer.restore();
          });
        } else {
          buffer.beginPath(); buffer.roundRect(0, 0, source.width, source.height, 12); buffer.clip();
          buffer.drawImage(images[0]!, 0, 0, source.width, source.height);
        }
        return { source, portrait };
      }));
      colors();
      return true;
    } catch {
      // An unavailable image or Canvas API leaves the complete DOM fallback.
      return false;
    }
  }
  function resize(w: number, h: number, top: number, bottom: number) {
    if (!ctx) return;
    width = w; height = h; clipTop = top; clipBottom = bottom;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
    plane.width = canvas.width; plane.height = canvas.height;
    planeContext?.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    colors();
  }
  function project(pose: HelixPose, localX: number, localY: number, camera: Camera): Point {
    const x = localX * Math.cos(pose.yaw);
    const z = -localX * Math.sin(pose.yaw);
    const y = localY * Math.cos(pose.pitch) - z * Math.sin(pose.pitch);
    const depth = pose.z + localY * Math.sin(pose.pitch) + z * Math.cos(pose.pitch);
    const rotatedX = x * Math.cos(pose.roll) - y * Math.sin(pose.roll);
    const rotatedY = x * Math.sin(pose.roll) + y * Math.cos(pose.roll);
    const ratio = camera.focal / (camera.focal - depth);
    return { x: camera.x + (pose.x + rotatedX) * ratio, y: camera.y + (pose.y + rotatedY) * ratio };
  }
  function triangle(source: HTMLCanvasElement, a: Point, b: Point, c: Point, sa: Point, sb: Point, sc: Point) {
    if (!ctx) return;
    const det = sa.x * (sb.y - sc.y) + sb.x * (sc.y - sa.y) + sc.x * (sa.y - sb.y);
    if (Math.abs(det) < .00001) return;
    const affine = (v1: number, v2: number, v3: number) => [
      (v1 * (sb.y - sc.y) + v2 * (sc.y - sa.y) + v3 * (sa.y - sb.y)) / det,
      (v1 * (sc.x - sb.x) + v2 * (sa.x - sc.x) + v3 * (sb.x - sa.x)) / det,
      (v1 * (sb.x * sc.y - sc.x * sb.y) + v2 * (sc.x * sa.y - sa.x * sc.y) + v3 * (sa.x * sb.y - sb.x * sa.y)) / det,
    ];
    const x = affine(a.x, b.x, c.x); const y = affine(a.y, b.y, c.y);
    // Slight overlap closes antialiasing seams. Composite the entire plane
    // once afterwards, so translucent distant images have no dark joints.
    const center = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
    const expand = (p: Point) => { const d = Math.hypot(p.x - center.x, p.y - center.y); return { x: p.x + (p.x - center.x) / d * .65, y: p.y + (p.y - center.y) / d * .65 }; };
    const aa = expand(a), bb = expand(b), cc = expand(c);
    ctx.save(); ctx.beginPath(); ctx.moveTo(aa.x, aa.y); ctx.lineTo(bb.x, bb.y); ctx.lineTo(cc.x, cc.y); ctx.closePath(); ctx.clip();
    ctx.transform(x[0]!, y[0]!, x[1]!, y[1]!, x[2]!, y[2]!);
    ctx.drawImage(source, 0, 0); ctx.restore();
  }
  function draw(poses: HelixPose[], active: number, entry: number, view: HelixView, emphasis: number[] = []) {
    if (!ctx || !textures.length) return;
    ctx.clearRect(0, 0, width, height);
    regions = [];
    ctx.save(); ctx.beginPath(); ctx.rect(0, clipTop, width, Math.max(0, clipBottom - clipTop)); ctx.clip();
    const camera = helixCamera(view);
    const frontPerspective = camera.focal / (camera.focal - (view.tablet ? 220 : 350));
    // Explicit painter's algorithm: back planes first, front planes last.
    const ordered = [...poses].sort((a, b) => a.z - b.z || b.score - a.score);
    for (const original of ordered) {
      const texture = textures[original.index]!;
      const arrival = clamp((entry - original.index * .025) / (1 - original.index * .025));
      if (arrival < .001) continue;
      const reveal = 1 - Math.pow(1 - arrival, 3);
      const pose = { ...original, z: original.z - (1 - reveal) * 550 };
      const desired = texture.portrait ? Math.min(width * (view.tablet ? .46 : .34), 420) : Math.min(width * (view.tablet ? .62 : .48), 620);
      const hover = emphasis[original.index] ?? 0;
      // Framing only: a continuous focus envelope leaves distant cards at
      // their original size and never changes the helix or scroll phase.
      const focus = Math.exp(-Math.pow(original.theta / .8, 2));
      let worldWidth = desired / frontPerspective * (.85 + .15 * reveal) * (1 + hover * .045) * (1 - .06 * focus);
      let worldHeight = worldWidth * texture.source.height / texture.source.width;
      const safeTop = clipTop + 12;
      const safeBottom = clipBottom - 190;
      const safeHeight = Math.max(100, safeBottom - safeTop);
      const projectedHeight = worldHeight * original.perspective;
      const fit = Math.min(1, safeHeight / (projectedHeight * 1.04));
      worldWidth *= 1 - (1 - fit) * focus;
      worldHeight = worldWidth * texture.source.height / texture.source.width;
      const screenY = camera.y + pose.y * original.perspective;
      const halfHeight = worldHeight * original.perspective * .52;
      const framedY = Math.max(safeTop + halfHeight, Math.min(safeBottom - halfHeight, screenY));
      pose.y += (framedY - screenY) / original.perspective * focus;
      const corners = [project(pose, -worldWidth / 2, -worldHeight / 2, camera), project(pose, worldWidth / 2, -worldHeight / 2, camera), project(pose, worldWidth / 2, worldHeight / 2, camera), project(pose, -worldWidth / 2, worldHeight / 2, camera)];
      if (Math.max(...corners.map(p => p.y)) < clipTop || Math.min(...corners.map(p => p.y)) > clipBottom || Math.max(...corners.map(p => p.x)) < 0 || Math.min(...corners.map(p => p.x)) > width) continue;
      const polygons = texture.portrait ? [0, 1].map(i => {
        const h = i ? 550 : 500, w = h * 818 / 1662, cx = (i ? 236 : 40) + w / 2, cy = (i ? 28 : 86) + h / 2, a = i ? .045 : -.06;
        return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y]) => project(pose, ((cx + x! * Math.cos(a) - y! * Math.sin(a)) / 560 - .5) * worldWidth, ((cy + x! * Math.sin(a) + y! * Math.cos(a)) / 620 - .5) * worldHeight, camera));
      }) : [corners];
      regions.push({ index: original.index, depth: pose.z, x: Math.min(...corners.map(p=>p.x)), y: Math.min(...corners.map(p=>p.y)), width: Math.max(...corners.map(p=>p.x))-Math.min(...corners.map(p=>p.x)), height: Math.max(...corners.map(p=>p.y))-Math.min(...corners.map(p=>p.y)), polygons });
      if (!planeContext || !output) continue;
      ctx = planeContext;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(corners[0]!.x, corners[0]!.y); corners.slice(1).forEach(p => ctx!.lineTo(p.x, p.y)); ctx.closePath();
      if (!texture.portrait) {
        ctx.fillStyle = surface; ctx.fill();
        ctx.strokeStyle = original.index === active ? accent : border;
        ctx.lineWidth = original.index === active ? 1.2 + hover * .6 : .6;
        ctx.shadowColor = accent; ctx.shadowBlur = original.index === active ? 7 + hover * 5 : 0; ctx.stroke(); ctx.shadowBlur = 0;
      }
      // Eight narrow strips approximate a perspective-correct plane with
      // bounded draw cost; original image proportions never change.
      const strips = Math.abs(pose.yaw) < .005 && Math.abs(pose.pitch) < .005 ? 1 : 8;
      for (let strip = 0; strip < strips; strip++) {
        const left = strip / strips; const right = (strip + 1) / strips;
        const x1 = (left - .5) * worldWidth; const x2 = (right - .5) * worldWidth;
        const tl = project(pose, x1, -worldHeight / 2, camera); const tr = project(pose, x2, -worldHeight / 2, camera);
        const br = project(pose, x2, worldHeight / 2, camera); const bl = project(pose, x1, worldHeight / 2, camera);
        const sx = left * texture.source.width; const ex = right * texture.source.width;
        triangle(texture.source, tl, tr, br, { x: sx, y: 0 }, { x: ex, y: 0 }, { x: ex, y: texture.source.height });
        triangle(texture.source, tl, br, bl, { x: sx, y: 0 }, { x: ex, y: texture.source.height }, { x: sx, y: texture.source.height });
      }
      ctx = output;
      const otherEmphasis = Math.max(0, ...emphasis);
      ctx.globalAlpha = (pose.opacity + (1 - pose.opacity) * hover) * reveal * (1 - (otherEmphasis - hover) * .06);
      ctx.shadowColor = accent; ctx.shadowBlur = texture.portrait ? hover * 6 : 0;
      ctx.drawImage(plane, 0, 0, width, height);
      ctx.shadowBlur = 0;
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  return { load, resize, draw, colors, hitTest, clear: () => { regions = []; ctx?.clearRect(0, 0, width, height); } };
}
