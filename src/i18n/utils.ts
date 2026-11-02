import { getRelativeLocaleUrl } from 'astro:i18n';
import { ui, type Locale } from './ui';

export function getLocale(currentLocale?: string): Locale {
  return currentLocale === 'en' ? 'en' : 'es';
}

export function getUI(locale: Locale) {
  return ui[locale];
}

export function localizedPath(pathname: string, locale: Locale) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  // Quitamos el base actual antes de calcular la ruta localizada.
  let path = pathname;

  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }

  // Quitamos el locale inglés actual si existe.
  path = path.replace(/^\/en(?=\/|$)/, '');

  // Limpiamos barras para pasarlo a Astro i18n.
  const cleanPath = path.replace(/^\/+|\/+$/g, '');

  const localized = getRelativeLocaleUrl(locale, cleanPath);

  // Astro i18n devuelve /en/...; añadimos /portfolio en producción.
  return `${base}${localized}`;
}