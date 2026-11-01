import type { ImageMetadata } from 'astro';
import type { Locale } from '../i18n/ui';
import catalogo from '../assets/projects/catalogo-digital/catalogo-digital-cover.webp';
import edi from '../assets/projects/edi-salud-infantil/edi-salud-infantil-cover.webp';
import amda from '../assets/projects/amda-oaxaca/amda-oaxaca-cover.webp';
import tours from '../assets/projects/tours-oaxaca/tours-oaxaca-cover.webp';
import galerias from '../assets/projects/galerias-oaxaca-suites/galerias-oaxaca-suites-cover.webp';
import fletes from '../assets/projects/fletes-mudanzas-jimenez/fletes-mudanzas-jimenez-cover.webp';
import invitationCover from '../assets/projects/invitacion-digital/invitacion-cover.webp';
import invitationMain from '../assets/projects/invitacion-digital/invitacion-main.webp';

interface ProjectText { category: string; description: string; tags: string[]; }
export interface Project {
  id: string;
  name: string;
  year?: number;
  url?: string;
  kind: 'collaboration' | 'personal';
  format: 'web' | 'portrait';
  images: ImageMetadata[];
  copy: Record<Locale, ProjectText>;
}

// Years are omitted unless confirmed. Only the invitation is a personal project.
export const projects: Project[] = [
  { id: 'catalogo-digital', name: 'Catálogo Digital', kind: 'collaboration', url: 'https://catalogo-digital.extendevs.com/', format: 'web', images: [catalogo], copy: {
    es: { category: 'Producto digital', tags: ['Astro', 'Frontend', 'UX/UI', 'Responsive'], description: 'Colaboré en el diseño e implementación frontend de una landing responsive para una plataforma de catálogos digitales y pedidos por WhatsApp.' },
    en: { category: 'Digital product', tags: ['Astro', 'Frontend', 'UX/UI', 'Responsive'], description: 'I collaborated on the design and frontend implementation of a responsive landing page for a digital catalogue and WhatsApp ordering platform.' },
  } },
  { id: 'edi-salud-infantil', name: 'Prueba EDI', kind: 'collaboration', url: 'https://pruebaedi.com/', format: 'web', images: [edi], copy: {
    es: { category: 'Plataforma de salud', tags: ['Astro', 'Frontend', 'Web Design', 'Responsive'], description: 'Colaboré en el diseño e implementación de una landing informativa para profesionales de salud infantil, trabajando jerarquía visual, presentación del producto y adaptación responsive.' },
    en: { category: 'Healthcare platform', tags: ['Astro', 'Frontend', 'Web Design', 'Responsive'], description: 'I collaborated on the design and implementation of a landing page for child health professionals, working on visual hierarchy, product presentation and responsive adaptation.' },
  } },
  { id: 'amda-oaxaca', name: 'AMDA Oaxaca', kind: 'collaboration', format: 'web', images: [amda], copy: {
    es: { category: 'Web institucional', tags: ['WordPress', 'Web institucional', 'Contenido'], description: 'Presencia web de una asociación del sector automotriz.' },
    en: { category: 'Institutional website', tags: ['WordPress', 'Institutional Website', 'Content'], description: 'A website for an automotive industry association.' },
  } },
  { id: 'tours-oaxaca', name: 'Yudiza Tours', kind: 'collaboration', url: 'https://yudizatours.com/es/inicio/', format: 'web', images: [tours], copy: {
    es: { category: 'Turismo', tags: ['WordPress', 'Rediseño web', 'Bilingüe', 'Responsive'], description: 'Participé en el rediseño e implementación de un sitio turístico bilingüe enfocado en recorridos locales y contenido cultural.' },
    en: { category: 'Travel', tags: ['WordPress', 'Web Redesign', 'Bilingual', 'Responsive'], description: 'I contributed to the redesign and implementation of a bilingual tourism website focused on local tours and cultural content.' },
  } },
  { id: 'galerias-oaxaca-suites', name: 'Galerías Oaxaca Suites', kind: 'collaboration', url: 'https://galeriasoaxaca.com/', format: 'web', images: [galerias], copy: {
    es: { category: 'Hospitalidad', tags: ['WordPress', 'Web Design', 'Hospitality'], description: 'Una web de alojamiento y hospitalidad en Oaxaca.' },
    en: { category: 'Hospitality', tags: ['WordPress', 'Web Design', 'Hospitality'], description: 'A website for accommodation and hospitality in Oaxaca.' },
  } },
  { id: 'fletes-mudanzas-jimenez', name: 'Fletes y Mudanzas Jiménez', kind: 'collaboration', url: 'https://fletesymudanzasjimenez.com/', format: 'web', images: [fletes], copy: {
    es: { category: 'Web de servicios', tags: ['WordPress', 'Web de servicios', 'Responsive'], description: 'Presencia digital para servicios de transporte y mudanzas.' },
    en: { category: 'Service website', tags: ['WordPress', 'Service Website', 'Responsive'], description: 'A digital presence for freight and moving services.' },
  } },
  { id: 'invitacion-digital', name: 'Invitación Digital — Lala & José', kind: 'personal', year: 2025, url: 'https://dulce2130.github.io/invitacion-Lala-Jose.io/', format: 'portrait', images: [invitationCover, invitationMain], copy: {
    es: { category: 'Experiencia mobile-first', tags: ['HTML', 'CSS', 'JavaScript', 'Mobile-first'], description: 'Proyecto personal diseñado y desarrollado como una experiencia web mobile-first para boda, con información del evento, ubicaciones, cuenta regresiva e interacción.' },
    en: { category: 'Mobile-first experience', tags: ['HTML', 'CSS', 'JavaScript', 'Mobile-first'], description: 'A personal project designed and developed as a mobile-first wedding experience, with event information, locations, a countdown and interactive details.' },
  } },
];
