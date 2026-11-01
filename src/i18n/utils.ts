import { getRelativeLocaleUrl } from 'astro:i18n';
import { ui, type Locale } from './ui';

export function getLocale(currentLocale: string | undefined): Locale {
  return currentLocale === 'en' ? 'en' : 'es';
}

export function getUI(locale: Locale) {
  return ui[locale];
}

// Section IDs remain language-neutral, so hashes are shared between locales.
export function localizedPath(pathname: string, locale: Locale): string {
  const path = pathname.replace(/^\/en(?=\/|$)/, '').replace(/^\/+|\/+$/g, '');
  return getRelativeLocaleUrl(locale, path);
}
