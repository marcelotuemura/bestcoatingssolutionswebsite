import { en } from '@/i18n/dictionaries/en';
import { conversionEs } from '@/i18n/dictionaries/conversion-es';
import { phase5Es } from '@/i18n/dictionaries/phase5-es';
import type { DictionaryShape } from '@/i18n/dictionary-types';

export const es = {
  conversion: conversionEs,
  phase5: phase5Es,
  meta: {
    titleDefault: 'Best Coatings Solutions — Refinación marina y de aviación',
    titleTemplate: '%s | BCS',
    description:
      'Refinación marina y de aviación premium en el Sur de Florida. Preparación cuidadosa y acabado que se nota.',
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
    privacy: 'Política de privacidad',
    terms: 'Términos de uso',
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
    learnAviation: 'Explorar servicios de aviación',
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
    explore: 'Explorar',
    legal: 'Legal',
    brandBlurb:
      'Best Coatings Solutions es una empresa de refinación premium con divisiones especializadas de Marina y Aviación — preparación cuidadosa, alcance honesto y acabados que se notan en el Sur de Florida.',
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
        'Restauración de gelcoat, reparación de fibra, refinación de pintura y trabajo cosmético de superficie en el Sur de Florida — preparación cuidadosa en la embarcación.',
      eyebrow: 'División marina',
      title: 'Refinación marina',
      lead: 'Restauración, refinación y reparación cosmética para embarcaciones que merecen un acabado cuidadoso — en la marina, el astillero o en casa cuando las condiciones lo permiten.',
      overviewTitle: 'De qué se trata este trabajo',
      overview:
        'Best Coatings Solutions se enfoca en la profundidad del gelcoat, la integridad superficial de la fibra, la refinación de pintura y la reparación cosmética. Hablamos el alcance en lenguaje claro, protegemos el área alrededor de la reparación y terminamos el trabajo para que pertenezca a la embarcación. No publicamos precios en el sitio.',
      atmosphere:
        'La atmósfera marina es luz cálida sobre el agua, brillo del casco, curvas de fibra y sol sobre un acabado premium — mostrada con fotografía real cuando esté disponible.',
      processEyebrow: 'Mostrar el proceso',
      processTitle: 'Cómo avanza un proyecto de refinación marina',
      processLead:
        'No todo dueño ve lo que ocurre bajo una superficie terminada. Este es el camino disciplinado que seguimos antes de que regrese el brillo.',
      processSteps: [
        {
          title: 'Inspección',
          body: 'Evaluamos el área dañada, el acabado alrededor y lo que una reparación cuidadosa puede lograr de forma razonable.',
        },
        {
          title: 'Preparación',
          body: 'Las superficies se enmascaran, limpian y preparan para que la reparación quede contenida y el acabado alrededor protegido.',
        },
        {
          title: 'Reparación',
          body: 'El trabajo de gelcoat, fibra o pintura se reconstruye en secuencia — atendiendo lo que hay debajo cuando la superficie lo necesita.',
        },
        {
          title: 'Acabado de superficie',
          body: 'Niveles, texturas y transiciones se refinan para que la reparación se integre al casco en lugar de llamar la atención.',
        },
        {
          title: 'Igualación de color',
          body: 'El color y el brillo se igualan tanto como sea práctico al acabado alrededor bajo luz real.',
        },
        {
          title: 'Inspección final',
          body: 'Revisamos la superficie terminada antes de la entrega y repasamos el resultado con usted.',
        },
      ],
      capabilitiesTitle: 'Cómo podemos ayudar',
      capabilities: [
        'Restauración y refinación de gelcoat',
        'Reparación superficial de fibra y compuestos',
        'Refinación de pintura y reparación cosmética',
        'Trabajo de calidad superficial en cascos y yates',
        'Igualación de color y reparaciones relacionadas con seguro',
      ],
      servicesCtaTitle: 'Servicios marinos',
      servicesCtaBody:
        'Cada servicio explica el problema, cómo abordamos la restauración o refinación, y qué puede esperar — luego puede solicitar un estimado cuando esté listo.',
    },
    aviation: {
      metaTitle: 'Refinación de aviación | Best Coatings Solutions',
      metaDescription:
        'Refinación cosmética exterior de aviación, restauración de pintura, superficies compuestas y corrección de acabado — con alcance cuidadoso en el Sur de Florida.',
      eyebrow: 'División de aviación',
      title: 'Refinación de aviación',
      lead: 'La misma disciplina de preparación que en Marina — expresada en superficies de precisión, materiales compuestos y trabajo de acabado exterior cuidadosamente controlado.',
      overviewTitle: 'Una división especializada',
      overview:
        'Best Coatings Solutions es una empresa con dos divisiones. Marina es el enfoque comercial principal. Aviación es una división especializada de refinación para trabajo cosmético y de acabado exterior con alcance cuidadoso — no trabajo de sistemas mecánicos.',
      atmosphere:
        'La atmósfera de aviación es precisión, reflejo metálico, piel de compuesto, geometría limpia y luz controlada — mostrada con fotografía auténtica cuando esté disponible.',
      processEyebrow: 'Mostrar el proceso',
      processTitle: 'Cómo avanza un proyecto de refinación de aviación',
      processLead:
        'El trabajo cosmético exterior sigue una secuencia disciplinada. Nos mantenemos en restauración de acabado y superficie — y explicamos los límites con claridad antes de comenzar.',
      processSteps: [
        {
          title: 'Evaluación',
          body: 'Revisamos la condición exterior, las fotos y los objetivos para determinar si el trabajo encaja en el alcance de refinación cosmética.',
        },
        {
          title: 'Preparación de superficie',
          body: 'Las superficies se limpian, enmascaran y preparan para que la refinación sea precisa y el acabado alrededor quede protegido.',
        },
        {
          title: 'Refinamiento de compuestos',
          body: 'Cuando aplica, las superficies exteriores de compuesto se refinan con cuidado antes de continuar con pintura o restauración de acabado.',
        },
        {
          title: 'Restauración de pintura',
          body: 'La restauración de pintura exterior y la corrección de acabado avanzan con atención al color, el brillo y las transiciones limpias.',
        },
        {
          title: 'Inspección de acabado',
          body: 'Inspeccionamos el acabado exterior completado y revisamos el resultado con usted antes de cerrar el proyecto.',
        },
      ],
      capabilitiesTitle: 'Capacidades que comentamos',
      capabilitiesLead:
        'Estos son temas de refinación cosmética exterior — no un menú de servicios de mantenimiento regulado.',
      capabilities: [
        'Refinación cosmética exterior',
        'Restauración de pintura',
        'Restauración de superficies compuestas',
        'Preparación de superficie',
        'Igualación de color',
        'Corrección de acabado',
        'Restauración de acabado',
        'Reparaciones cosméticas exteriores',
      ],
      qualityTitle: 'Cómo trabajamos',
      quality:
        'Evaluamos la superficie, preparamos con cuidado e igualamos el acabado alrededor antes de la revisión final. Explicamos lo que la refinación cosmética puede y no puede hacer — sin implicar resultados de mantenimiento regulado.',
      scopeTitle: 'Alcance importante',
      scope:
        'Esta división cubre refinación cosmética y trabajo de superficie exterior. No es una oferta de estación de reparación FAA y no incluye trabajo estructural de fuselaje, mantenimiento mecánico, motores, aviónica ni reparaciones críticas para el vuelo.',
      contactTitle: 'Cuéntenos sobre su proyecto de aviación',
      contactBody:
        'Comparta fotos y detalles a través de Contacto. Revisaremos si el trabajo encaja en nuestro alcance de refinación cosmética y responderemos con claridad.',
      contactNotice:
        'Las consultas de aviación son bienvenidas a través de Contacto. Las reservas de estimado en línea siguen enfocadas en proyectos marinos.',
      notice:
        'Solo refinación cosmética y exterior — no mantenimiento estructural ni mecánico de aeronaves.',
    },
    services: {
      metaTitle: 'Cómo podemos ayudar | Best Coatings Solutions',
      metaDescription:
        'Gelcoat, fibra, pintura, casco, cosmética de yates, igualación de color y reparación relacionada con seguro en el Sur de Florida.',
      eyebrow: 'Marina',
      title: 'Cómo podemos ayudar',
      lead: 'Cada servicio marino explica el problema, cómo abordamos la reparación y qué puede esperar. Las capacidades de aviación están en la página de la división de Aviación.',
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
        'Aquí aparecerán fotos del taller o del proyecto cuando se aprueben — preferiblemente en el trabajo, no un retrato de estudio. Sin imágenes de banco.',
    },
    philosophy: {
      title: 'La calidad se construye antes de aplicar la pintura',
      body: 'El acabado que la gente nota es el último paso. El trabajo que protege su embarcación ocurre antes — inspección, preparación y paciencia. No apresuro esos pasos solo para que una reparación parezca terminada antes de tiempo.',
    },
    divisions: {
      eyebrow: 'Dos divisiones',
      title: 'Marina y Aviación',
      lead: 'Una empresa. Dos caminos especializados de refinación — elegidos por el trabajo, no por marcas separadas.',
      marineLabel: 'Enfoque principal',
      aviationLabel: 'División especializada',
      marineAtmosphere:
        'Luz cálida sobre el agua, brillo del casco, curvas de fibra — la atmósfera marina del trabajo exterior cuidadoso.',
      aviationAtmosphere:
        'Superficies metálicas frías, piel de compuesto, reflejos controlados — la atmósfera de aviación del acabado cosmético preciso.',
    },
    marine: {
      title: 'Marina',
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
      body: 'Trabajo selecto de refinación cosmética de aeronaves y superficies exteriores — con la misma preparación y control de acabado que en nuestros proyectos marinos.',
      notice:
        'Alcance de refinación cosmética solamente. Cuéntenos sobre su proyecto a través de Contacto.',
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
      eyebrow: 'Prueba en el acabado',
      lead: 'Solo historias de reparación auténticas — antes, durante y después — publicadas con consentimiento del dueño y del cliente. Sin relleno de galería genérica.',
      projectTitle: 'Los proyectos reales aparecen aquí cuando se aprueban',
      stageBefore: 'Antes',
      stageBeforeNote: 'La condición que trajo la embarcación.',
      stageDuring: 'Durante',
      stageDuringNote: 'Preparación y reparación en curso.',
      stageAfter: 'Después',
      stageAfterNote: 'La superficie terminada que el dueño puede evaluar.',
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
      body: 'Los dueños de embarcaciones a menudo se preguntan cómo es trabajar con un artesano de la refinación. Este es el camino sencillo que seguimos.',
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
