import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dulce2130.github.io',
  base: '/portfolio',
  output: 'static',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});