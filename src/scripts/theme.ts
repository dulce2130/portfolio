export type ThemePreference = 'light' | 'dark' | 'system';
const storageKey = 'portfolio-theme';
const root = document.documentElement;
const system = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const status = document.querySelector<HTMLElement>('#theme-status');
let transition: ViewTransition | undefined;
let generation = 0;
let intended: ThemePreference = root.dataset.theme === 'light' || root.dataset.theme === 'dark' ? root.dataset.theme : 'system';

function effectiveTheme(preference = intended): 'light' | 'dark' {
  return preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
}

function syncControl() {
  if (!button) return;
  const dark = effectiveTheme() === 'dark';
  button.setAttribute('aria-pressed', String(dark));
  const state = `${dark ? button.dataset.darkState : button.dataset.lightState} ${intended === 'system' ? button.dataset.autoState : button.dataset.manualState}`;
  button.title = state;
  if (status) status.textContent = state;
}

function apply(preference: ThemePreference) {
  if (preference === 'system') delete root.dataset.theme;
  else root.dataset.theme = preference;
  syncControl();
}

/** Shared entry point: system remains a first-class preference without a third visible link. */
export async function setThemePreference(preference: ThemePreference, origin?: HTMLElement) {
  const previous = effectiveTheme();
  intended = preference;
  const request = ++generation;
  transition?.skipTransition();
  transition = undefined;
  delete root.dataset.themeTransition;
  try {
    if (preference === 'system') localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, preference);
  } catch { /* Still usable for this visit if storage is blocked. */ }

  const canReveal = origin && previous !== effectiveTheme() && !reducedMotion.matches &&
    typeof document.startViewTransition === 'function' &&
    CSS.supports('clip-path', 'circle(1px at 1px 1px)');
  if (!canReveal) { apply(preference); return; }

  const bounds = origin.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.dataset.themeTransition = '';
  try {
    const current = document.startViewTransition(() => {
      if (request === generation) apply(preference);
    });
    transition = current;
    // A skipped transition may reject ready; finished always gets a handler as well.
    void current.finished.catch(() => {});
    await current.ready;
    if (request !== generation) return;
    const styles = getComputedStyle(root);
    // CSS optimizers may serialize 620ms as .62s; WAAPI expects milliseconds.
    const durationToken = styles.getPropertyValue('--duration-theme-reveal').trim();
    const duration = parseFloat(durationToken) * (durationToken.endsWith('ms') ? 1 : 1000);
    const animation = root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: Number.isFinite(duration) ? duration : 620,
        easing: styles.getPropertyValue('--ease-standard').trim(),
        pseudoElement: '::view-transition-new(root)',
      },
    );
    await animation.finished;
    await current.finished;
  } catch {
    // Unsupported pseudo-element animation, interrupted or unavailable snapshot.
    if (request === generation) { transition?.skipTransition(); apply(preference); }
  } finally {
    if (request === generation) { delete root.dataset.themeTransition; transition = undefined; }
  }
}

if (button) {
  button.addEventListener('click', () => { void setThemePreference(effectiveTheme() === 'dark' ? 'light' : 'dark', button); });
  button.addEventListener('keydown', event => {
    if (event.key === 'Delete') {
      event.preventDefault();
      void setThemePreference('system', button);
    }
  });
  button.hidden = false;
}
system.addEventListener('change', () => { if (intended === 'system') syncControl(); });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) transition?.skipTransition(); });
window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  ++generation;
  transition?.skipTransition();
  transition = undefined;
  delete root.dataset.themeTransition;
  intended = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system';
  apply(intended);
});
syncControl();
