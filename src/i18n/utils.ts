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

  let path = pathname;

  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || '/';
  }

  path = path.replace(/^\/en(?=\/|$)/, '');

  const cleanPath = path.replace(/^\/+|\/+$/g, '');

  return getRelativeLocaleUrl(locale, cleanPath);
}