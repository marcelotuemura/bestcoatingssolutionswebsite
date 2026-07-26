import { en } from '@/i18n/dictionaries/en';
import { conversionEs } from '@/i18n/dictionaries/conversion-es';
import { phase5Es } from '@/i18n/dictionaries/phase5-es';
import type { DictionaryShape } from '@/i18n/dictionary-types';

export const es = {
  conversion: conversionEs,
  phase5: phase5Es,
  meta: {
    titleDefault: 'Best Coatings Solutions — Refinación marina',
    titleTemplate: '%s | BCS',
    description:
      'Reparación de gelcoat, fibra, pintura y cosmética marina en el Sur de Florida. Preparación cuidadosa y acabado que se nota.',
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
    about: 'Acerca de',
    serviceArea: 'Área de servicio',
    scheduleVisit: 'Programar visita',
    estimateRequest: 'Solicitar estimado',
    thankYou: 'Gracias',
    contact: 'Contacto',
    privacy: 'Privacidad',
    terms: 'Términos',
    accessibility: 'Accesibilidad',
    process: 'Proceso',
    gallery: 'Galería',
    blog: 'Blog',
    portal: 'Portal del cliente',
    faq: 'Preguntas frecuentes',
    workmanship: 'Mano de obra',
    resources: 'Recursos',
    designSystem: 'Identidad visual',
  },
  cta: {
    estimate: 'Solicitar un estimado',
    schedule: 'Programar visita',
    viewWork: 'Ver nuestro trabajo',
    call: 'Llamar',
    callBcs: 'Llamar a Best Coatings Solutions',
    exploreMarine: 'Explorar Marina',
    learnAviation: 'Conocer Aviación',
    viewProjects: 'Ver nuestro trabajo',
    viewServices: 'Cómo podemos ayudar',
    contactUs: 'Cuéntenos sobre su proyecto',
  },
  divisionStatus: {
    active: 'Activo',
    preview: 'Vista previa',
    'coming-soon': 'Próximamente',
  },
  header: {
    /** Vacío a propósito — encabezado limpio; la marca la llevan el logo y el hero. */
    tagline: '',
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
    comingSoonBody:
      'Próximamente — el contenido de esta página aún no está listo.',
    mediaLabel:
      'Imagen provisional — no es una foto de un proyecto de BCS ni trabajo real',
    projectLabel:
      'Proyecto futuro — solo marco provisional; no es un caso de estudio completado de BCS',
    emptyProjects:
      'Próximamente — aún no hay proyectos publicados. Los casos de estudio aprobados aparecerán aquí.',
  },
  pages: {
    marine: {
      metaTitle: 'Refinación marina | Best Coatings Solutions',
      metaDescription:
        'Reparación móvil de gelcoat, fibra, pintura y cosmética marina en el Sur de Florida. Preparación cuidadosa en la embarcación.',
      eyebrow: 'Marina',
      title: 'Refinación marina',
      lead: 'Reparamos y refinamos embarcaciones donde el trabajo puede hacerse con cuidado — en la marina, el astillero o en casa cuando las condiciones lo permiten.',
      overviewTitle: 'De qué se trata este trabajo',
      overview:
        'Best Coatings Solutions se enfoca en gelcoat, fibra, pintura y reparación cosmética. Hablamos el alcance en lenguaje claro, protegemos el área alrededor de la reparación y terminamos el trabajo para que pertenezca a la embarcación. No publicamos precios en el sitio.',
      capabilitiesTitle: 'Cómo podemos ayudar',
      capabilities: [
        'Reparación y refinación de gelcoat',
        'Reparación de fibra y compuestos',
        'Pintura y refinación',
        'Trabajo cosmético de casco y yates',
        'Igualación de color y reparaciones relacionadas con seguro',
      ],
      servicesCtaTitle: 'Cómo podemos ayudar',
      servicesCtaBody:
        'Lea cada servicio para ver el problema que resuelve, cómo lo abordamos y qué esperar.',
    },
    aviation: {
      metaTitle: 'Aviación — Próximamente | BCS',
      metaDescription:
        'La refinación de aviación aún no está activa. Best Coatings Solutions comparte los mismos estándares de preparación previstos para trabajo futuro en aeronaves.',
      eyebrow: 'Próximamente',
      title: 'Aviación',
      lead: 'Hoy no ofrecemos refinación de aviación. Cuando esté lista, seguirá la misma preparación cuidadosa que usamos en embarcaciones.',
      overviewTitle: 'Estado honesto',
      overview:
        'Esta página es solo una vista previa. No reservamos trabajo de aeronaves ni aceptamos estimados de aviación. La reparación marina sigue siendo el enfoque activo.',
      futureTitle: 'Lo que estamos preparando',
      future: [
        'Refinación de aeronaves',
        'Reparación de compuestos y pintura puntual',
        'Refinación metálica y protección cerámica',
        'Refinación de componentes interiores',
        'Trabajo en hangares o instalaciones asociadas donde esté permitido',
      ],
      qualityTitle: 'Los mismos estándares',
      quality:
        'No inventaremos servicios de aviación que no estemos listos para entregar. Primero van la preparación, el alcance honesto y la disciplina de acabado.',
      contactTitle: 'Preguntas',
      contactBody:
        'Para preguntas generales, contacte a Best Coatings Solutions. Las reservas y estimados de aviación no están disponibles mientras esta división permanece como Próximamente.',
      noBookingNotice:
        'Próximamente — no hay reservas ni solicitudes de estimado de aviación.',
      notice:
        'Próximamente — el trabajo de aviación no está activo. Esta página es solo una vista previa.',
    },
    services: {
      metaTitle: 'Cómo podemos ayudar | Best Coatings Solutions',
      metaDescription:
        'Gelcoat, fibra, pintura, casco, cosmética de yates, igualación de color y reparación relacionada con seguro en el Sur de Florida.',
      eyebrow: 'Marina',
      title: 'Cómo podemos ayudar',
      lead: 'Cada servicio explica el problema, cómo abordamos la reparación y qué puede esperar. Aviación no aparece mientras permanece como Próximamente.',
      indexNote:
        'Elija un servicio para saber cómo tratamos ese tipo de reparación — luego solicite un estimado cuando esté listo.',
      relatedTitle: 'Servicios relacionados',
      relatedBody:
        'Otros servicios marinos que a menudo acompañan este trabajo.',
      links: {
        heading: 'Páginas relacionadas',
        marineDivision: 'Refinación marina',
        servicesIndex: 'Todos los servicios marinos',
        contact: 'Contacto',
      },
    },
    projects: {
      metaTitle: 'Nuestro trabajo | Best Coatings Solutions',
      metaDescription:
        'Historias reales de reparación marina de Best Coatings Solutions. Los proyectos aparecen solo con aprobación — no inventamos portafolio.',
      eyebrow: 'Nuestro trabajo',
      title: 'Proyectos',
      lead: 'Publicamos historias de reparación solo cuando el dueño y el cliente lo permiten. Mientras tanto, esta página se mantiene honesta en lugar de llenarse de trabajo falso.',
      frameworkTitle: 'Cómo contamos una reparación',
      frameworkBody:
        'Cada proyecto puede incluir el tipo de embarcación, qué ocurrió, cómo se reparó, materiales y fotos de antes / durante / después — nunca resultados inventados.',
      labels: {
        category: 'Categoría',
        problem: 'Qué ocurrió',
        repair: 'Cómo se reparó',
        materials: 'Materiales',
        timeline: 'Cronograma',
        results: 'Resultado final',
        images: 'Fotos',
        cta: 'Solicitar un estimado para un trabajo similar',
      },
    },
    estimateShared: {
      title: 'Solicitar un estimado',
      body: 'Cuéntenos sobre la embarcación y la reparación. Seguiremos con pasos claros — no con una lista de precios en el sitio.',
      notice:
        'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    },
  },
  trust: {
    'mobile-service': 'Trabajo en la embarcación',
    'professional-finish': 'Acabado que pertenece a la embarcación',
    'marine-specialists': 'Enfoque en refinación marina',
    'aircraft-specialists': 'Experiencia de aviación en el historial',
    'modern-equipment': 'Las herramientas adecuadas para la reparación',
    'fair-pricing': 'Alcance claro antes de comenzar',
    'fast-response': 'Seguimiento cuidadoso',
    'attention-to-detail': 'Preparación cuidadosa',
    'multilingual-team': 'Inglés, español, portugués, japonés',
  },
  home: {
    hero: {
      headline: 'Oficio que se nota en cada acabado',
      support:
        'Durante más de 25 años he trabajado en refinación profesional en las industrias automotriz, de aviación y marina. Hoy llevo esa misma atención al detalle a cada embarcación confiada a Best Coatings Solutions.',
      logoAlt: 'Logo de Best Coatings Solutions',
    },
    whoWeAre: {
      title: 'Conozca a Marcelo',
      body: 'Reparo embarcaciones porque a eso he dedicado mi carrera. Best Coatings Solutions es la forma en que ese trabajo llega a dueños que cuidan el acabado tanto como yo.',
      languages:
        'Trabajamos con clientes en inglés, español, portugués y japonés.',
      cta: 'Conozca a Marcelo',
      photoNote:
        'El retrato y las fotos del taller aparecerán aquí cuando se aprueben — no usamos imágenes de banco.',
    },
    philosophy: {
      title: 'La calidad se construye antes de aplicar la pintura',
      body: 'El acabado que la gente nota es el último paso. El trabajo que protege su embarcación ocurre antes — inspección, preparación y paciencia. No apresuro esos pasos solo para que una reparación parezca terminada antes de tiempo.',
    },
    marine: {
      title: 'Cómo podemos ayudar',
      body: 'Gelcoat, fibra, pintura y reparación cosmética — en la embarcación cuando las condiciones lo permiten, protegiendo el acabado alrededor e igualando la superficie final tanto como sea práctico.',
      points: [
        'Reparación y refinación de gelcoat',
        'Reparación de fibra y compuestos',
        'Pintura y refinación',
        'Igualación de color',
        'Servicio móvil en la embarcación',
      ],
    },
    aviation: {
      title: 'Aviación',
      body: 'La refinación de aviación aún no está activa en este sitio. La experiencia previa con acabados de aeronaves informa lo cuidadosos que somos — no es una oferta de reserva actual.',
      notice:
        'Próximamente — las operaciones de aviación no están disponibles. La reparación marina es el enfoque activo.',
    },
    whyBcs: {
      title: 'Basado en experiencia. Impulsado por el detalle.',
      body: 'Me tomo el tiempo de inspeccionar el área dañada, reparar lo que hay debajo cuando hace falta, igualar el acabado alrededor y pulir con paciencia. Eso es detalle aquí — no un eslogan.',
    },
    craftPrinciples: {
      title: 'Cada reparación comienza de la misma manera',
      intro:
        'Antes de que comience cualquier reparación, me hago cuatro preguntas:',
      questions: [
        '¿Qué causó el daño?',
        '¿Cuál es el método correcto de reparación?',
        '¿Cómo se puede preservar el acabado original?',
        '¿Qué esperaría yo si esta fuera mi propia embarcación?',
      ],
      closing:
        'Esas preguntas guían cada proyecto, ya sea una pequeña reparación de gelcoat o una restauración cosmética completa.',
    },
    featured: {
      title: 'Trabajo destacado',
      eyebrow: 'Historias de reparación',
      projectTitle: 'Los proyectos reales aparecen aquí cuando se aprueban',
      problem:
        'Qué ocurrió: Publicamos la condición que trajo la embarcación — no una historia inventada.',
      repair:
        'Cómo se reparó: Preparación, materiales y pasos de acabado descritos con claridad.',
      process:
        'Proceso: Inspeccionar → preparar → reparar → igualar → acabar → revisar con el dueño.',
      time: 'Tiempos: Solo para proyectos reales y aprobados.',
      result: 'Resultado: Lo que el dueño puede ver cuando el trabajo termina.',
      customer:
        'Nombres de clientes y embarcaciones aparecen solo con permiso por escrito.',
      cta: 'Ver nuestro trabajo',
    },
    beforeAfter: {
      title: 'Antes y después',
      body: 'Aquí pertenece la prueba lado a lado. Hasta que haya fotos aprobadas, esta muestra muestra la experiencia y está claramente marcada como provisional — no es trabajo de BCS.',
      beforeCaption: 'Antes (provisional)',
      afterCaption: 'Después (provisional)',
    },
    process: {
      title: 'Qué puede esperar',
      body: 'Los dueños de embarcaciones a menudo se preguntan cómo es trabajar con un taller de reparación. Este es el camino sencillo que seguimos.',
      steps: [
        {
          title: 'Contáctenos',
          body: 'Cuéntenos sobre su embarcación y el daño. Un formulario pide una respuesta — no reserva trabajo de emergencia por sí solo.',
        },
        {
          title: 'Revisamos el daño',
          body: 'Miramos las fotos y los detalles que comparte para entender la condición antes de recomendar los siguientes pasos.',
        },
        {
          title: 'Inspección cuando hace falta',
          body: 'Si la reparación necesita verse en persona, programamos una inspección en un momento y lugar prácticos.',
        },
        {
          title: 'Estimado',
          body: 'Ofrecemos un estimado según lo que podamos verificar. Los estimados gratuitos aplican solo en el área de Fort Lauderdale.',
        },
        {
          title: 'Opciones de reparación',
          body: 'Hablamos de métodos, límites y cómo puede verse razonablemente la reparación terminada — sin presión.',
        },
        {
          title: 'Actualizaciones durante el proyecto',
          body: 'Lo mantenemos informado mientras avanza el trabajo para que nunca tenga que adivinar qué ocurre con su embarcación.',
        },
        {
          title: 'Inspección final',
          body: 'Inspeccionamos la reparación terminada antes de la entrega y revisamos el resultado con usted.',
        },
      ],
    },
    serviceArea: {
      title: 'Área de servicio',
      body: 'Sur de Florida. Proyectos fuera del área habitual pueden considerarse por arreglo.',
      travel:
        'Los viajes se planifican para que el trabajo siga siendo cuidadoso — nunca apresurado por logística.',
    },
    estimate: {
      title: 'Solicitar un estimado',
      body: 'Cuéntenos sobre su embarcación y la reparación. Seguiremos con claridad — sin precios en el sitio ni presión.',
      notice:
        'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    },
  },
} as const satisfies DictionaryShape<typeof en>;
