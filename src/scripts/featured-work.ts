import { createWorkField } from './work-field';
import { clamp, createProjectHelix, helixPoses, selectHelixProject, type HelixView } from './project-helix';

const section = document.querySelector<HTMLElement>('[data-featured-work]');
if (section) initFeaturedWork(section);

function initFeaturedWork(section: HTMLElement) {
  const pin = section.querySelector<HTMLElement>('[data-work-pin]')!;
  const list = section.querySelector<HTMLOListElement>('.work-list')!;
  const cards = [...section.querySelectorAll<HTMLElement>('[data-project]')];
  const controls = section.querySelector<HTMLElement>('[data-work-controls]')!;
  const previous = section.querySelector<HTMLButtonElement>('[data-work-step="-1"]')!;
  const next = section.querySelector<HTMLButtonElement>('[data-work-step="1"]')!;
  const counter = section.querySelector<HTMLElement>('[data-work-current]')!;
  const status = section.querySelector<HTMLElement>('[data-work-status]')!;
  const canvas = section.querySelector<HTMLCanvasElement>('[data-work-spiral]')!;
  const field = createWorkField(section.querySelector<HTMLCanvasElement>('[data-work-field]')!, pin);
  const renderer = createProjectHelix(canvas, cards);
  const media = matchMedia('(min-width: 48rem) and (min-height: 36rem) and (prefers-reduced-motion: no-preference)');
  const mobileMedia = matchMedia('(max-width: 47.999rem) and (prefers-reduced-motion: no-preference)');
  let enhanced = false;
  let mobile = false;
  let ready = false;
  let loadStarted = false;
  let visible = false;
  let frame = 0;
  let mobileFrame = 0;
  let start = 0;
  let travel = 1;
  let viewportHeight = innerHeight;
  let selected = -1;
  let scrollActiveProject = 0;
  let hoverActiveProject: number | null = null;
  let focusActiveProject: number | null = null;
  const emphasis = cards.map(() => 0);
  let pointer: { x: number; y: number } | null = null;
  let pointerDirty = false;
  let pinLeft = 0;
  const pinTop = () => Math.min(Math.max(start - scrollY, 0), start + travel - scrollY);
  let targetProgress = 0;
  let currentProgress = 0;
  let entry = 0;
  let entryTarget = 0;
  let previousTime = 0;
  let mobileStep = 1;
  let view: HelixView = { width: 0, height: 0, count: cards.length, tablet: false };

  function select(index: number) {
    if (index === selected) return;
    selected = index;
    cards.forEach((card, i) => card.toggleAttribute('data-active', i === index));
    section.dataset.activeIndex = String(index);
    counter.textContent = String(index + 1).padStart(2, '0');
    status.textContent = `${index + 1} / ${cards.length} - ${cards[index]!.dataset.name}`;
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
  }
  function render() {
    if (!enhanced || !ready) return;
    const poses = helixPoses(currentProgress, view);
    scrollActiveProject = selectHelixProject(poses, scrollActiveProject);
    if (pointerDirty && pointer) {
      hoverActiveProject = renderer.hitTest(pointer.x, pointer.y);
      pointerDirty = false;
    }
    const interaction = focusActiveProject ?? hoverActiveProject;
    select(interaction ?? scrollActiveProject);
    section.dataset.scrollActive = String(scrollActiveProject);
    section.dataset.hoverActive = hoverActiveProject === null ? '' : String(hoverActiveProject);
    pin.style.cursor = hoverActiveProject !== null && cards[hoverActiveProject]!.querySelector('[data-project-link]') ? 'pointer' : '';
    renderer.draw(poses, selected, entry, view, emphasis);
    canvas.dataset.rendered = 'true';
  }
  function measure() {
    viewportHeight = innerHeight;
    if (enhanced) {
      const rect = pin.getBoundingClientRect();
      pinLeft = rect.left;
      const intro = section.querySelector<HTMLElement>('.work-intro')!.getBoundingClientRect();
      const footer = controls.getBoundingClientRect();
      start = section.getBoundingClientRect().top + scrollY;
      travel = Math.max(1, section.offsetHeight - pin.offsetHeight);
      view = { width: pin.clientWidth, height: pin.clientHeight, count: cards.length, tablet: pin.clientWidth < 1000 };
      renderer.resize(view.width, view.height, intro.bottom - rect.top + 14, footer.top - rect.top - 8);
    } else if (mobile && cards.length > 1) {
      mobileStep = Math.max(1, cards[1]!.offsetLeft - cards[0]!.offsetLeft);
    }
  }
  function updateTargets() {
    if (!enhanced) return;
    targetProgress = clamp((scrollY - start) / travel);
    entryTarget = clamp((scrollY + viewportHeight - start) / (viewportHeight * .72));
    if (entryTarget > .08) section.setAttribute('data-work-entered', '');
  }
  function tick(time: number) {
    frame = 0;
    if (!enhanced || !visible || document.hidden) return;
    const dt = previousTime ? Math.min(50, time - previousTime) : 16.7;
    previousTime = time;
    const factor = 1 - Math.exp(-dt / 160);
    currentProgress += (targetProgress - currentProgress) * factor;
    entry += (entryTarget - entry) * factor;
    const interaction = focusActiveProject ?? hoverActiveProject;
    let hoverSettling = false;
    emphasis.forEach((value, i) => {
      const goal = interaction === i ? 1 : 0;
      emphasis[i] = value + (goal - value) * (1 - Math.exp(-dt / 80));
      if (Math.abs(goal - emphasis[i]!) > .001) hoverSettling = true;
      else emphasis[i] = goal;
    });
    const settling = Math.abs(targetProgress - currentProgress) > .00003 || Math.abs(entryTarget - entry) > .0001 || hoverSettling || pointerDirty;
    if (!settling) { currentProgress = targetProgress; entry = entryTarget; }
    render();
    if (settling) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (enhanced && visible && !frame && !document.hidden) { previousTime = 0; frame = requestAnimationFrame(tick); }
  }
  function goTo(index: number, immediate = false) {
    const chosen = Math.round(clamp(index, 0, cards.length - 1));
    if (enhanced) {
      targetProgress = chosen / Math.max(1, cards.length - 1);
      entryTarget = 1;
      if (immediate) { currentProgress = targetProgress; entry = 1; select(chosen); render(); }
      window.scrollTo({ top: start + targetProgress * travel, behavior: 'instant' });
      schedule();
    } else if (mobile) {
      select(chosen);
      list.scrollTo({ left: chosen * mobileStep, behavior: immediate ? 'instant' : 'smooth' });
    }
  }
  function configure() {
    const wasEnhanced = enhanced;
    enhanced = media.matches && ready;
    mobile = mobileMedia.matches;
    hoverActiveProject = null; focusActiveProject = null; pointer = null; pointerDirty = false;
    emphasis.fill(0); pin.style.cursor = '';
    section.toggleAttribute('data-deck', enhanced);
    section.toggleAttribute('data-mobile', mobile);
    canvas.hidden = !enhanced;
    controls.hidden = !(enhanced || mobile);
    cancelAnimationFrame(frame); frame = 0;
    cards.forEach(card => card.removeAttribute('style'));
    if (enhanced) {
      measure(); updateTargets();
      if (!wasEnhanced) { currentProgress = targetProgress; entry = 0; }
      render(); schedule();
    } else {
      renderer.clear();
      select(Math.max(0, selected));
      measure();
      if (mobile) list.scrollTo({ left: Math.max(0, selected) * mobileStep, behavior: 'instant' });
    }
    field.resize();
    if (media.matches && !loadStarted) {
      loadStarted = true;
      void renderer.load().then(success => { ready = success; if (success) configure(); });
    }
  }
  window.addEventListener('scroll', () => { hoverActiveProject = null; pointer = null; updateTargets(); schedule(); }, { passive: true });
  window.addEventListener('resize', () => { measure(); updateTargets(); schedule(); }, { passive: true });
  media.addEventListener('change', configure);
  mobileMedia.addEventListener('change', configure);
  new ResizeObserver(() => { measure(); schedule(); }).observe(pin);
  new IntersectionObserver(entries => {
    visible = entries[0]!.isIntersecting;
    section.toggleAttribute('data-work-visible', visible);
    field.setVisible(visible);
    if (visible) { measure(); updateTargets(); schedule(); }
    else { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
  }, { rootMargin: '200px' }).observe(section);
  new MutationObserver(() => { renderer.colors(); schedule(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { renderer.colors(); schedule(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { updateTargets(); schedule(); }
  });
  list.addEventListener('scroll', () => {
    if (!mobile || mobileFrame) return;
    mobileFrame = requestAnimationFrame(() => { mobileFrame = 0; select(Math.round(clamp(list.scrollLeft / mobileStep, 0, cards.length - 1))); });
  }, { passive: true });
  controls.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-work-step]');
    if (button) { hoverActiveProject = null; focusActiveProject = null; goTo((enhanced ? scrollActiveProject : selected) + Number(button.dataset.workStep)); }
  });
  section.addEventListener('focusin', event => {
    const card = (event.target as Element).closest<HTMLElement>('[data-project]');
    if (card && enhanced) { focusActiveProject = cards.indexOf(card); schedule(); }
    else if (card && mobile) goTo(cards.indexOf(card), true);
  });
  section.addEventListener('focusout', () => queueMicrotask(() => {
    if (!cards.some(card => card.contains(document.activeElement))) { focusActiveProject = null; schedule(); }
  }));
  pin.addEventListener('pointermove', event => {
    if (!enhanced || !visible || event.pointerType === 'touch') return;
    if ((event.target as Element).closest('a, button, .project-caption')) return;
    // The pin is sticky at top:0; only its horizontal inset is cached on resize.
    pointer = { x: event.clientX - pinLeft, y: event.clientY - pinTop() };
    pointerDirty = true; schedule();
  }, { passive: true });
  pin.addEventListener('pointerleave', () => { pointer = null; pointerDirty = false; hoverActiveProject = null; schedule(); });
  pin.addEventListener('click', event => {
    if (!enhanced || !visible || (event.target as Element).closest('a, button, .project-caption')) return;
    const index = renderer.hitTest(event.clientX - pinLeft, event.clientY - pinTop());
    if (index !== null) cards[index]!.querySelector<HTMLAnchorElement>('[data-project-link]')?.click();
  });

  configure();
}
