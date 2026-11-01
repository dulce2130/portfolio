import './theme';

const header = document.querySelector<HTMLElement>('[data-header]');
const toggle = header?.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = header?.querySelector<HTMLElement>('#primary-navigation');
const desktop = window.matchMedia('(min-width: 68rem)');

if (header && toggle && nav) {
  header.setAttribute('data-enhanced', '');
  document.documentElement.setAttribute('data-floating-header', '');
  const setOpen = (open: boolean) => {
    if (!open && !desktop.matches && nav.contains(document.activeElement)) toggle.focus();
    toggle.setAttribute('aria-expanded', String(open));
    nav.hidden = !desktop.matches && !open;
  };
  const syncViewport = () => {
    toggle.hidden = desktop.matches;
    if (desktop.matches && document.activeElement === toggle) header.querySelector<HTMLAnchorElement>('[data-language-path]')?.focus();
    setOpen(false);
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) nav.querySelector<HTMLAnchorElement>('a[href]')?.focus();
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !desktop.matches && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  nav.addEventListener('click', event => { if ((event.target as Element).closest('a[href]') && !desktop.matches) setOpen(false); });
  document.addEventListener('pointerdown', event => { if (!header.contains(event.target as Node) && !desktop.matches) setOpen(false); });
  header.addEventListener('focusout', () => {
    queueMicrotask(() => { if (!desktop.matches && !header.contains(document.activeElement)) setOpen(false); });
  });
  let scrollFrame = 0;
  const syncScroll = () => {
    scrollFrame = 0;
    const scrolled = header.hasAttribute('data-scrolled');
    const next = scrolled ? scrollY > 72 : scrollY > 90;
    if (next !== scrolled) header.toggleAttribute('data-scrolled', next);
  };
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll); }, { passive: true });
  syncScroll();
  desktop.addEventListener('change', syncViewport);
  syncViewport();

  const contact = header.querySelector<HTMLAnchorElement>('.header-contact');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let burst: HTMLElement | undefined;
  let sparkAnimations: Animation[] = [];
  const clearBurst = () => { sparkAnimations.forEach(animation => animation.cancel()); sparkAnimations = []; burst?.remove(); burst = undefined; };
  reducedMotion.addEventListener('change', clearBurst);
  contact?.addEventListener('click', () => {
    clearBurst();
    if (reducedMotion.matches || typeof Element.prototype.animate !== 'function') return;
    const button = contact.getBoundingClientRect();
    const bounds = header.getBoundingClientRect();
    const layer = document.createElement('span');
    layer.className = 'contact-burst'; layer.setAttribute('aria-hidden', 'true');
    layer.style.left = `${button.left - bounds.left + button.width / 2}px`;
    layer.style.top = `${button.top - bounds.top + button.height / 2}px`;
    header.append(layer); burst = layer;
    const count = innerWidth < 640 ? 4 : 7;
    sparkAnimations = Array.from({ length: count }, (_, index) => {
      const dot = index % 3 === 1;
      const particle = document.createElement('span');
      particle.className = `contact-spark${dot ? ' contact-spark--dot' : ''}`;
      if (!dot) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 16 16');
        const path = document.createElementNS(svg.namespaceURI, 'path');
        path.setAttribute('d', 'M8 0 10 6 16 8 10 10 8 16 6 10 0 8 6 6Z');
        path.setAttribute('fill', 'currentColor'); svg.append(path); particle.append(svg);
      }
      const angle = -Math.PI * .95 + index * Math.PI * 1.9 / (count - 1);
      const x = Math.cos(angle) * (button.width / 2 - 7);
      const y = Math.sin(angle) * (button.height / 2 - 2);
      const distance = 17 + (index % 4) * 4;
      particle.style.left = `${x}px`; particle.style.top = `${y}px`;
      layer.append(particle);
      return particle.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.25) rotate(-12deg)' },
        { opacity: .85, offset: .22 },
        { opacity: 0, transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(.4) rotate(${16 + index * 7}deg)` },
      ], { duration: 490 + index % 3 * 45, delay: index * 8, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
    });
    void Promise.allSettled(sparkAnimations.map(animation => animation.finished)).then(() => { layer.remove(); if (burst === layer) { burst = undefined; sparkAnimations = []; } });
    // The real anchor performs navigation immediately, even without #contact.
  });
}

// Normal anchors still work without JS; with JS, retain query and neutral section ID.
const syncLanguageLinks = () => {
  document.querySelectorAll<HTMLAnchorElement>('[data-language-path]').forEach(link => {
    link.href = `${link.dataset.languagePath}${location.search}${location.hash}`;
  });
};
window.addEventListener('hashchange', syncLanguageLinks);
syncLanguageLinks();
