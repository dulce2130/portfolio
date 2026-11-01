import type { Project } from './projects';
import type { Locale } from '../i18n/ui';

// Reserved slugs are not links until the corresponding Astro page exists.
const slugs: Record<string, string> = {
  'catalogo-digital': 'catalogo-digital',
  'edi-salud-infantil': 'prueba-edi',
  'tours-oaxaca': 'yudiza-tours',
  'hotel-real-alma': 'hotel-real-alma',
  'invitacion-digital': 'invitacion-digital',
};
const pages = import.meta.glob('/src/pages/**/*.astro');
export function projectNavigation(project: Project, locale: Locale) {
  const slug = slugs[project.id];
  const path = slug ? `${locale === 'en' ? '/en' : ''}/proyectos/${slug}/` : undefined;
  const exists = path && pages[`/src/pages${path}index.astro`];
  return { plannedPath: path, href: exists ? path : project.url, external: !exists && !!project.url };
}

// Keep the complete, confirmed tags in data; show only three in the deck.
export function projectTags(project: Project, locale: Locale): string[] {
  return project.copy[locale].tags.slice(0, 3);
}