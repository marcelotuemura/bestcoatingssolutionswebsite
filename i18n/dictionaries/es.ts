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
    breadcrumbs: 'Miga de pan',
    beforeAfterSlider: 'Comparación antes y después',
    beforeLabel: 'Antes',
    afterLabel: 'Después',
    /** `{before}` / `{after}` son porcentajes visibles (0–100). */
    beforeAfterValueText: 'Antes {before}%, Después {after}%',
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
    exploreMarine: 'Explorar Marina',
    learnAviation: 'Conocer Aviación',
    viewProjects: 'Ver proyectos',
    viewServices: 'Ver servicios marinos',
    contactUs: 'Contáctenos',
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
    mediaLabel: 'Medio provisional — no es una foto de un proyecto de BCS',
    projectLabel:
      'Estructura de caso de estudio provisional — proyecto real pendiente de aprobación',
    emptyProjects:
      'Aún no hay proyectos publicados. Los casos de estudio aprobados aparecerán aquí.',
  },
  pages: {
    marine: {
      metaTitle: 'División Marina | Best Coatings Solutions',
      metaDescription:
        'Recubrimientos marinos móviles, gelcoat, fibra, pintura y reparación cosmética en el sur de Florida — desde Jupiter hacia el sur.',
      eyebrow: 'División',
      title: 'Marina',
      lead: 'Refinish marino móvil de precisión y cuidado de compuestos en la embarcación — gelcoat, fibra, pintura y restauración cosmética.',
      overviewTitle: 'Descripción general',
      overview:
        'Best Coatings Solutions atiende yates y embarcaciones con restauración disciplinada de superficies. Trabajamos donde las condiciones lo permiten — marinas, astilleros y residencias — con comunicación clara y sin precios en el sitio.',
      capabilitiesTitle: 'Capacidades',
      capabilities: [
        'Reparación y refinamiento de gelcoat',
        'Reparación de fibra y compuestos',
        'Sistemas de pintura y refinamiento',
        'Restauración de casco y trabajo cosmético de yates',
        'Coincidencia de color y reparaciones relacionadas con seguro',
      ],
      servicesCtaTitle: 'Servicios marinos',
      servicesCtaBody:
        'Explore páginas de servicio individuales para problemas que resolvemos, nuestro proceso y cómo solicitar un estimado.',
    },
    aviation: {
      metaTitle: 'División Aviación — Próximamente | BCS',
      metaDescription:
        'Vista previa de recubrimientos de aviación de Best Coatings Solutions. Las operaciones aún no están activas — solo filosofía de calidad y capacidades futuras.',
      eyebrow: 'División',
      title: 'Aviación',
      lead: 'Una división futura para refinish de aeronaves y cuidado de compuestos — preparada con la misma disciplina de acabado que nuestro trabajo marino.',
      overviewTitle: 'Descripción general',
      overview:
        'Aviación permanece como vista previa. Estamos preparando capacidades para hangares e instalaciones asociadas donde esté permitido. No se ofrecen operaciones de aviación activas en este momento.',
      futureTitle: 'Capacidades futuras',
      future: [
        'Refinish de aeronaves',
        'Reparación de compuestos y pintura puntual',
        'Refinamiento metálico y protección cerámica',
        'Refinamiento de componentes interiores',
        'Servicio móvil o en instalación asociada donde esté permitido',
      ],
      qualityTitle: 'Filosofía de calidad',
      quality:
        'La misma mesura que define nuestros acabados marinos guiará el trabajo de aviación: preparación cuidadosa, alcance honesto y nunca inventar capacidades que aún no estamos listos para entregar.',
      contactTitle: 'Manténgase en contacto',
      contactBody:
        '¿Preguntas sobre el trabajo futuro de aviación? Contáctenos. No programaremos trabajos activos de aviación hasta que el propietario confirme que las operaciones estén listas.',
      notice:
        'Próximamente — las operaciones de aviación no están activas actualmente. Esta página es solo una vista previa.',
    },
    services: {
      metaTitle: 'Servicios marinos | Best Coatings Solutions',
      metaDescription:
        'Índice de servicios marinos: gelcoat, fibra, pintura, restauración de casco, cosmética de yates, coincidencia de color y reparación por seguro.',
      eyebrow: 'Marina',
      title: 'Servicios marinos',
      lead: 'Páginas detalladas de los servicios marinos que realizamos hoy. Aviación no tiene catálogo público mientras permanece como próximamente.',
      indexNote:
        'Seleccione un servicio para leer problemas comunes, nuestro proceso, por qué BCS y cómo solicitar un estimado.',
    },
    projects: {
      metaTitle: 'Proyectos | Best Coatings Solutions',
      metaDescription:
        'Marco de proyectos y casos de estudio para Best Coatings Solutions. Los proyectos reales aparecen solo tras aprobación — sin trabajo inventado.',
      eyebrow: 'Marco de portafolio',
      title: 'Proyectos',
      lead: 'Esta página define cómo se presentarán futuros casos de estudio. No inventamos proyectos ni presentamos fotografía incompleta como trabajo de BCS.',
      frameworkTitle: 'Marco de caso de estudio',
      frameworkBody:
        'Cada proyecto futuro puede incluir título, categoría, problema, reparación, materiales, cronograma, imágenes, resultados y una llamada a la acción clara.',
      labels: {
        category: 'Categoría',
        problem: 'Problema',
        repair: 'Reparación',
        materials: 'Materiales',
        timeline: 'Cronograma',
        results: 'Resultados',
        images: 'Imágenes',
        cta: 'Solicitar un estimado para un trabajo similar',
      },
    },
    estimateShared: {
      title: 'Solicitar un estimado',
      body: 'Cuéntenos sobre la embarcación y la ubicación. Respondemos con claridad — nunca con precios en el sitio.',
      notice:
        'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    },
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
  home: {
    hero: {
      headline:
        'Recubrimientos de precisión para embarcaciones que exigen excelencia.',
      support:
        'Refinish marino móvil y cuidado de compuestos en el sur de Florida — desde Jupiter hacia el sur.',
      logoAlt: 'Logo temporal de Best Coatings Solutions',
    },
    whoWeAre: {
      title: 'Quiénes somos',
      body: 'Best Coatings Solutions es un especialista móvil premium en recubrimientos marinos, refinish y reparación de compuestos. Llevamos oficio disciplinado a marinas, astilleros y residencias — con capacidades de aviación preparándose para hangares e instalaciones asociadas donde esté permitido.',
      languages:
        'Trabajamos con clientes en inglés, español, portugués y japonés.',
    },
    marine: {
      title: 'Marina',
      body: 'Gelcoat, fibra de vidrio, pintura, refinish metálico, protección cerámica y reparaciones cosméticas — en la embarcación cuando las condiciones lo permiten.',
      points: [
        'Reparación de fibra y compuestos',
        'Reparación y refinish de gelcoat',
        'Pintura marina y trabajo metálico',
        'Recubrimiento cerámico',
        'Servicio móvil para yates y botes',
      ],
    },
    aviation: {
      title: 'Aviación',
      body: 'Refinish de aeronaves, reparación de compuestos y pintura puntual, restauración metálica, protección cerámica y componentes interiores están planificados para servicio móvil o en instalaciones asociadas donde esté permitido.',
      notice:
        'Las operaciones de aviación no están activas actualmente. Esta sección es una vista previa de la división que estamos preparando.',
    },
    whyBcs: {
      title: 'Por qué BCS',
      body: 'La confianza nace de cómo trabajamos — no de reseñas ni afirmaciones inventadas.',
    },
    featured: {
      title: 'Proyecto destacado',
      eyebrow: 'Estructura de caso de estudio',
      projectTitle: 'Restauración de gelcoat — marco de ejemplo',
      problem:
        'Problema: Gelcoat oxidado y desparejo en un área de alta visibilidad del casco.',
      repair:
        'Reparación: Preparación controlada de superficie y refinish con coincidencia de color.',
      process:
        'Proceso: Evaluar → proteger → restaurar → acabar → revisar con el cliente.',
      time: 'Tiempo: Por confirmar con un proyecto real aprobado.',
      result:
        'Resultado: Un acabado uniforme de alto brillo listo para presentación.',
      customer:
        'Cliente: Atribución reservada hasta contar con permiso por escrito.',
      cta: 'Ver marco de proyectos',
    },
    beforeAfter: {
      title: 'Antes y después',
      body: 'Aquí pertenece la prueba visual. Hasta que llegue fotografía aprobada, esta muestra interactiva demuestra la experiencia — claramente marcada como provisional.',
      beforeCaption: 'Antes (provisional)',
      afterCaption: 'Después (provisional)',
    },
    process: {
      title: 'Nuestro proceso',
      body: 'Un camino calmado y predecible desde el primer contacto hasta el trabajo terminado.',
      steps: [
        {
          title: 'Consulta',
          body: 'Comparte detalles de la embarcación, ubicación y objetivos. Aclaramos el alcance sin presión.',
        },
        {
          title: 'Evaluación',
          body: 'Revisión en sitio o por fotos cuando corresponda. Los estimados gratuitos aplican solo en el área de Fort Lauderdale.',
        },
        {
          title: 'Proteger y restaurar',
          body: 'Trabajo móvil con enmascarado cuidadoso, cuidado de superficie y disciplina de acabado.',
        },
        {
          title: 'Entrega',
          body: 'Recorrido del resultado y guía de cuidado — dejamos el activo listo.',
        },
      ],
    },
    serviceArea: {
      title: 'Área de servicio',
      body: 'Sur de Florida, desde Jupiter hacia el sur. Proyectos fuera del área habitual pueden considerarse por arreglo.',
      travel:
        'Los desplazamientos se planifican con cuidado para que la calidad nunca se convierta en logística apresurada.',
    },
    estimate: {
      title: 'Solicitar un estimado',
      body: 'Cuéntanos la necesidad de la embarcación o aeronave. Respondemos con claridad — nunca con precios en el sitio.',
      notice:
        'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    },
  },
} as const satisfies DictionaryShape<typeof en>;
