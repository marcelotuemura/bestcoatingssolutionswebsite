import { en } from '@/i18n/dictionaries/en';
import type { DictionaryShape } from '@/i18n/dictionary-types';

export const es = {
  meta: {
    titleDefault:
      'Best Coatings Solutions — Recubrimientos Marinos y de Aviación',
    titleTemplate: '%s | BCS',
    description:
      'Recubrimientos móviles premium para marina y aviación, refinish y reparación de compuestos. Servimos el sur de Florida desde Jupiter hacia el sur.',
  },
  a11y: {
    skipToContent: 'Saltar al contenido principal',
    mainNav: 'Principal',
    mobileNav: 'Móvil',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    language: 'Idioma',
    home: 'Inicio de Best Coatings Solutions',
  },
  nav: {
    home: 'Inicio',
    marine: 'Marina',
    aviation: 'Aviación',
    services: 'Servicios',
    projects: 'Proyectos',
    beforeAfter: 'Antes y después',
    about: 'Nosotros',
    serviceArea: 'Área de servicio',
    scheduleVisit: 'Programar visita',
    estimateRequest: 'Solicitar estimado',
    contact: 'Contacto',
    privacy: 'Privacidad',
    terms: 'Términos',
    accessibility: 'Accesibilidad',
    process: 'Proceso',
    gallery: 'Galería',
    blog: 'Blog',
    portal: 'Portal del cliente',
  },
  cta: {
    estimate: 'Solicitar estimado',
    schedule: 'Programar visita',
    call: 'Llamar',
  },
  divisionStatus: {
    active: 'Activo',
    preview: 'Vista previa',
    'coming-soon': 'Próximamente',
  },
  header: {
    tagline: 'Marina y Aviación',
  },
  footer: {
    rights: 'Todos los derechos reservados.',
    spokenLanguages: 'Idiomas',
    serviceArea: 'Área de servicio',
    contact: 'Contacto',
    estimateNotice:
      'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    socialHeading: 'Síguenos',
    socialUnavailable: 'Canales sociales próximamente.',
  },
  placeholder: {
    phaseBadge: 'Fase 1 — estructura',
    homeTitle: 'Best Coatings Solutions',
    homeLead:
      'Recubrimientos móviles premium para marina y aviación. La interfaz compartida, la navegación y la arquitectura en inglés/español ya están listas. La página de inicio premium llega después.',
    pageLead:
      'Esta ruta está registrada para el lanzamiento. El contenido completo llega en una fase posterior.',
    comingSoonBody: 'El contenido de esta página llegará pronto.',
  },
  trust: {
    'mobile-service': 'Servicio móvil',
    'professional-finish': 'Acabado profesional',
    'marine-specialists': 'Especialistas marinos',
    'aircraft-specialists': 'Especialistas en aeronaves',
    'modern-equipment': 'Equipo moderno',
    'fair-pricing': 'Precios justos',
    'fast-response': 'Respuesta rápida',
    'attention-to-detail': 'Atención al detalle',
    'multilingual-team': 'Equipo multilingüe',
  },
} as const satisfies DictionaryShape<typeof en>;
