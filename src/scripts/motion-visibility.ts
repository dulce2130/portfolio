/** Pause section CSS animations while offscreen; preserve their playhead. */
const root = document.documentElement;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll<HTMLElement>('main > section, [data-galaxy-footer]')];
const atmosphere = document.querySelector<HTMLElement>('.background-atmosphere');
const pending = new Set<number>();
const animatedElements = new Set<Element>();
function discoverAnimations(scope: Element) {
  for (const animation of scope.getAnimations({ subtree: true })) {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    if (target instanceof Element && animation.effect?.getTiming().iterations === Infinity && target.closest('main') && !animatedElements.has(target)) {
      animatedElements.add(target); target.setAttribute('data-motion-element', ''); observer.observe(target);
    }
  }
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    entry.target.toggleAttribute('data-motion-visible', entry.isIntersecting);
    if (entry.target.matches('.hero')) atmosphere?.toggleAttribute('data-motion-visible', entry.isIntersecting);
    if (entry.isIntersecting && entry.target.hasAttribute('data-motion-section')) {
      // content-visibility:auto can create effects only after a section enters.
      const frame = requestAnimationFrame(() => { pending.delete(frame); discoverAnimations(entry.target); });
      pending.add(frame);
    }
    if (entry.target instanceof SVGSVGElement && entry.target.querySelector('animate, animateMotion, animateTransform')) {
      if (entry.isIntersecting && !document.hidden && !motionPreference.matches) entry.target.unpauseAnimations(); else entry.target.pauseAnimations();
    }
  }
});
for (const section of sections) { section.setAttribute('data-motion-section', ''); observer.observe(section); }
atmosphere?.setAttribute('data-motion-section', '');
// Tall sections can remain visible while their individual animated parts are
// far offscreen. Observe infinite effects as well, without a polling loop.
discoverAnimations(document.querySelector('main')!);
const smil = [...document.querySelectorAll<SVGSVGElement>('main svg')].filter(svg => svg.querySelector('animate, animateMotion, animateTransform'));
smil.forEach(svg => observer.observe(svg));
const syncVisibility = () => {
  root.toggleAttribute('data-document-hidden', document.hidden);
  for (const svg of smil) { if (!document.hidden && !motionPreference.matches && svg.hasAttribute('data-motion-visible')) svg.unpauseAnimations(); else svg.pauseAnimations(); }
};
const syncPreference = () => { syncVisibility(); sections.filter(section => section.hasAttribute('data-motion-visible')).forEach(discoverAnimations); };
motionPreference.addEventListener('change', syncPreference);
document.addEventListener('visibilitychange', syncVisibility);
syncVisibility();
document.addEventListener('astro:before-swap', () => { observer.disconnect(); pending.forEach(cancelAnimationFrame); document.removeEventListener('visibilitychange', syncVisibility); motionPreference.removeEventListener('change', syncPreference); }, { once: true });
