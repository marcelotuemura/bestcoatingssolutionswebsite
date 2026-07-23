import type { ConversionCopy } from '@/i18n/dictionaries/conversion-en';
import type { DictionaryShape } from '@/i18n/dictionary-types';

/** Phase 4 conversion / forms / legal UI copy (Spanish). */
export const conversionEs: DictionaryShape<ConversionCopy> = {
  common: {
    optional: 'opcional',
    required: 'obligatorio',
    next: 'Continuar',
    back: 'Atrás',
    submit: 'Enviar solicitud',
    submitting: 'Enviando solicitud…',
    preparing: 'Preparando solicitud…',
    errorSummary: 'Corrija lo siguiente:',
    demoBanner:
      'Modo demostración: las solicitudes se preparan localmente hasta configurar las credenciales de entrega en producción.',
    liveBanner:
      'Su solicitud se enviará de forma segura a Best Coatings Solutions. Nunca mostramos precios en el sitio.',
    demoSuccess:
      'Su solicitud se preparó correctamente. La entrega directa se habilita cuando se configuran las credenciales de producción.',
    deliveredSuccess:
      'Su solicitud fue enviada a Best Coatings Solutions. Le daremos seguimiento con los datos de contacto que proporcionó.',
    demoFailure:
      'No pudimos preparar su solicitud. Su información sigue aquí — intente de nuevo.',
    deliveryFailed:
      'No pudimos enviar su solicitud. Su información sigue aquí — intente de nuevo en breve.',
    rateLimited:
      'Se enviaron demasiadas solicitudes. Espere un momento e intente de nuevo.',
    botCheckFailed:
      'La verificación antibot falló o expiró. Complete la verificación e intente de nuevo.',
    validationFailed: 'Corrija los campos indicados e intente de nuevo.',
    turnstileLabel: 'Verificación de seguridad',
    retry: 'Reintentar',
  },
  validation: {
    required: 'Este campo es obligatorio.',
    email: 'Ingrese un correo válido.',
    phone: 'Ingrese un teléfono válido.',
    messageMin: 'Escriba al menos 10 caracteres.',
    descriptionMin: 'Describa el daño con al menos 20 caracteres.',
    consent: 'Confirme este reconocimiento para continuar.',
    year: 'Ingrese un año de embarcación válido.',
    length: 'Ingrese la eslora en pies.',
    servicesMin: 'Seleccione al menos un servicio marino.',
    maxFiles: 'Demasiadas fotos. Elimine algunas para continuar.',
    maxSize: 'Una foto supera el tamaño máximo.',
    fileType: 'Uno o más archivos tienen un formato no admitido.',
  },
  contact: {
    metaTitle: 'Contacto | Best Coatings Solutions',
    metaDescription:
      'Contacte a Best Coatings Solutions para consultas de recubrimientos marinos en el sur de Florida. Llame, escriba o envíe un mensaje.',
    eyebrow: 'Contacto',
    title: 'Contacte a Best Coatings Solutions',
    lead: 'Comuníquese con nuestro equipo sobre refinish marino. Aviación permanece Próximamente y no está disponible para estimados ni reservas.',
    directTitle: 'Contacto directo',
    hoursTitle: 'Horario',
    closed: 'Cerrado',
    weekdays: 'Lunes – Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    areaTitle: 'Área de servicio',
    areaBody:
      'Servimos el sur de Florida desde Jupiter hacia el sur. Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale.',
    formTitle: 'Enviar un mensaje',
    formLead:
      'Cuéntenos cómo podemos ayudar. Este formulario es para consultas generales y marinas — no estimados de aviación.',
    mapTitle: 'Ubicación',
    mapPlaceholder:
      'Imagen provisional — mapa no configurado. No se publica dirección postal en este sitio.',
    nextTitle: 'Qué sigue',
    nextSteps: [
      'Revisamos su mensaje.',
      'Un miembro del equipo responde por su método preferido cuando esté disponible.',
      'Si corresponde un estimado o visita, hablamos los siguientes pasos — este formulario no confirma nada por sí solo.',
    ],
    fields: {
      name: 'Nombre completo',
      email: 'Correo',
      phone: 'Teléfono',
      inquiryType: 'Tipo de consulta',
      message: 'Mensaje',
      preferredContactMethod: 'Método de contacto preferido',
      consent:
        'Entiendo que este mensaje no crea una cita ni un estimado vinculante.',
    },
    inquiryTypes: {
      general: 'Pregunta general',
      'marine-service': 'Pregunta de servicio marino',
      'estimate-follow-up': 'Seguimiento de estimado',
      partnership: 'Alianza o proveedor',
      other: 'Otro',
    },
    preferred: {
      phone: 'Teléfono',
      email: 'Correo',
      either: 'Teléfono o correo',
    },
  },
  estimate: {
    metaTitle: 'Solicitar estimado | Best Coatings Solutions',
    metaDescription:
      'Solicite una revisión de estimado marino con Best Coatings Solutions. Estimados gratuitos solo en Fort Lauderdale. Sin precios en línea.',
    eyebrow: 'Solicitud de estimado marino',
    title: 'Solicitar revisión de estimado marino',
    lead: 'Comparta detalles de la embarcación y el daño para que podamos dar seguimiento. No es una cotización instantánea, precio vinculante ni cita confirmada.',
    policyNote:
      'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    noAviation:
      'No hay solicitudes de estimado de aviación. Aviación permanece Próximamente.',
    progress: 'Paso {current} de {total}: {label}',
    steps: {
      customer: 'Cliente',
      vessel: 'Embarcación',
      services: 'Servicios',
      damage: 'Daño',
      photos: 'Fotos',
      review: 'Revisión',
    },
    fields: {
      fullName: 'Nombre completo',
      email: 'Correo',
      phone: 'Teléfono',
      preferredContactMethod: 'Método de contacto preferido',
      manufacturer: 'Fabricante',
      model: 'Modelo',
      year: 'Año',
      lengthFeet: 'Eslora (pies)',
      vesselName: 'Nombre de la embarcación',
      hin: 'HIN',
      currentLocation: 'Ubicación actual',
      marinaName: 'Nombre de la marina',
      services: 'Servicios marinos necesarios',
      damageDescription: 'Descripción del daño',
      affectedArea: 'Área aproximada afectada',
      damageOccurred: 'Cuándo ocurrió el daño',
      operability: 'Operatividad de la embarcación',
      insuranceRelated: '¿Está relacionado con seguro?',
      urgency: 'Preferencia de tiempo',
      photos: 'Fotos',
      acknowledgeNotQuote:
        'Entiendo que esta solicitud no es una cotización final.',
      acknowledgeInspection:
        'Entiendo que BCS puede necesitar inspección o más información.',
      acknowledgeNoAppointment:
        'Entiendo que enviar este formulario no confirma una cita.',
    },
    services: {
      'gelcoat-repair': 'Reparación de gelcoat',
      'fiberglass-repair': 'Reparación de fibra de vidrio',
      'paint-refinishing': 'Pintura y refinamiento',
      'hull-restoration': 'Restauración de casco',
      'yacht-cosmetic-repair': 'Reparación cosmética de yates',
      'structural-composite-repair': 'Reparación estructural de compuestos',
      'color-matching': 'Coincidencia de color',
      'insurance-repair': 'Reparación por seguro',
      'other-marine-repair': 'Otra reparación marina',
    },
    affected: {
      small: 'Área pequeña',
      medium: 'Área mediana',
      large: 'Área grande',
      unsure: 'No estoy seguro',
    },
    operability: {
      'fully-operational': 'Totalmente operativa',
      limited: 'Operación limitada',
      'not-operational': 'No operativa',
      unknown: 'Desconocido',
    },
    insurance: {
      yes: 'Sí',
      no: 'No',
      unsure: 'No estoy seguro',
    },
    urgency: {
      flexible: 'Tiempo flexible',
      soon: 'Prefiero pronto si es posible',
      'time-sensitive': 'Urgente — hablar disponibilidad',
    },
    urgencyHint:
      'Las preferencias de tiempo ayudan a planificar. No prometemos tiempos de respuesta de emergencia en este sitio.',
    photosHint:
      'Seleccione hasta {max} fotos (JPEG, PNG, WebP, HEIC). Máx. {size} MB cada una. En esta demostración las fotos no se suben ni se almacenan.',
    photosSelected: '{count} foto(s) seleccionada(s)',
    photosRemove: 'Eliminar {name}',
    reviewTitle: 'Revise su solicitud',
    reviewPhotos: 'Fotos adjuntas',
    preferred: {
      phone: 'Teléfono',
      email: 'Correo',
      either: 'Teléfono o correo',
    },
  },
  schedule: {
    metaTitle: 'Programar visita | Best Coatings Solutions',
    metaDescription:
      'Cómo Best Coatings Solutions programa inspecciones marinas después de revisar estimados o contacto. Sin calendario en línea.',
    eyebrow: 'Visitas',
    title: 'Cómo se programan las visitas',
    lead: 'Enviar una solicitud no confirma una visita. BCS revisa los detalles y lo contacta antes de coordinar una inspección.',
    processTitle: 'Proceso previsto',
    process: [
      'El cliente envía una solicitud de estimado o contacto.',
      'BCS revisa los detalles del proyecto.',
      'BCS contacta al cliente.',
      'Se puede programar una inspección o visita cuando corresponda.',
    ],
    noConfirm:
      'No hay calendario en línea, selector de horarios ni reserva de citas confirmadas en este sitio.',
    checklistTitle: 'Lista de preparación',
    checklist: [
      'Fotos claras de las áreas afectadas',
      'Ubicación de la embarcación y notas de acceso',
      'Fabricante, modelo, año y eslora aproximada',
      'Si el trabajo puede estar relacionado con seguro',
    ],
    accessTitle: 'Orientación de acceso',
    accessBody:
      'Comparta detalles de marina o almacenamiento, acceso al muelle y cualquier limitación para trabajo móvil.',
    photoTitle: 'Fotos e información del daño',
    photoBody:
      'Fotos claras de día desde varios ángulos ayudan la revisión. Incluya primeros planos y una toma de contexto cuando sea posible.',
  },
  thankYou: {
    metaTitle: 'Gracias | Best Coatings Solutions',
    metaDescription:
      'Gracias por contactar a Best Coatings Solutions. Revise los siguientes pasos para solicitudes marinas.',
    contactTitle: 'Mensaje preparado',
    estimateTitle: 'Solicitud de estimado preparada',
    contactDeliveredTitle: 'Mensaje enviado',
    estimateDeliveredTitle: 'Solicitud de estimado enviada',
    fallbackTitle: 'Gracias',
    contactBody:
      'Su mensaje de contacto se preparó en modo demostración. La entrega directa se habilita cuando se configuran las credenciales de producción.',
    estimateBody:
      'Su solicitud de estimado marino se preparó en modo demostración. La entrega directa se habilita cuando se configuran las credenciales de producción.',
    contactDeliveredBody:
      'Su mensaje de contacto fue enviado a Best Coatings Solutions. Daremos seguimiento con su método de contacto preferido cuando esté disponible.',
    estimateDeliveredBody:
      'Su solicitud de estimado marino fue enviada a Best Coatings Solutions. Revisaremos los detalles y daremos seguimiento — el formulario no confirma una cita ni un precio.',
    fallbackBody:
      'Si acaba de enviar un formulario, gracias. Para ayuda ahora, llame a Best Coatings Solutions o vuelva a Contacto.',
    nextTitle: 'Qué sigue',
    nextSteps: [
      'BCS revisa las solicitudes de contacto y estimado entrantes.',
      'El seguimiento usa su método de contacto preferido cuando está disponible.',
      'Una inspección se discute solo cuando corresponde — el formulario solo no confirma nada.',
    ],
    nextStepsDemo: [
      'Cuando se configuren las credenciales de entrega en producción, BCS recibe las solicitudes por correo.',
      'El seguimiento usa su método de contacto preferido cuando está disponible.',
      'Una inspección se discute solo cuando corresponde — el formulario solo no confirma nada.',
    ],
    noFixedTime: 'No prometemos un tiempo de respuesta fijo en este sitio.',
  },
  privacy: {
    metaTitle: 'Política de privacidad | Best Coatings Solutions',
    metaDescription:
      'Información de privacidad del sitio de Best Coatings Solutions, formularios de contacto y solicitudes de estimado marino.',
    title: 'Política de privacidad',
    lead: 'Cómo describimos la información que puede compartir en este sitio. Se requiere revisión del propietario y legal antes del lanzamiento.',
    reviewBadge:
      'Requiere revisión del propietario / legal antes de producción',
    sections: [
      {
        title: 'Información que puede proporcionar',
        body: 'Datos de contacto, información de la embarcación, descripciones de daño, preferencias y fotos opcionales seleccionadas en formularios.',
      },
      {
        title: 'Contacto y solicitudes de estimado',
        body: 'Se usan para responder consultas y evaluar proyectos marinos. Los formularios no crean contratos ni citas.',
      },
      {
        title: 'Fotos e información de la embarcación',
        body: 'Las fotos del estimado pueden cargarse a almacenamiento seguro de objetos cuando se configuran las credenciales de carga en producción. No incluya identificadores privados innecesarios en las fotos.',
      },
      {
        title: 'Uso previsto',
        body: 'Para comunicarnos sobre servicios marinos y seguimiento relacionado. No vendemos información personal.',
      },
      {
        title: 'Retención de datos',
        body: 'Los períodos de retención se definirán con el propietario y asesoría legal antes de producción. Provisional — no finalizado.',
      },
      {
        title: 'Servicios de terceros',
        body: 'Cuando la entrega de producción esté habilitada, Resend (correo), Cloudflare Turnstile (bots), Upstash (límites de tasa) y opcionalmente Vercel Blob (fotos de estimado) pueden procesar datos de solicitudes. La analítica permanece limitada por privacidad. CRM y portal no están activados en este sitio de marketing.',
      },
      {
        title: 'Limitaciones de seguridad',
        body: 'Ningún sitio garantiza seguridad absoluta. Los envíos de producción usan validación en servidor, límites de tasa y protección antibot cuando están configurados.',
      },
      {
        title: 'Sus opciones',
        body: 'Puede contactarnos para actualizar o discutir información que proporcionó. Teléfono y correo están en Contacto.',
      },
      {
        title: 'Privacidad de menores',
        body: 'Este sitio no está dirigido a menores de 13 años. No recopilamos conscientemente su información.',
      },
      {
        title: 'Actualizaciones de la política',
        body: 'Podemos actualizar esta página. La versión publicada en este sitio es la declaración vigente.',
      },
      {
        title: 'Contacto',
        body: 'Preguntas de privacidad pueden enviarse por Contacto o por el teléfono publicado en este sitio.',
      },
    ],
  },
  terms: {
    metaTitle: 'Términos y condiciones | Best Coatings Solutions',
    metaDescription:
      'Términos del sitio de Best Coatings Solutions, incluidas limitaciones de solicitudes de estimado y uso aceptable.',
    title: 'Términos y condiciones',
    lead: 'Términos para usar este sitio. Se requiere revisión del propietario y legal antes del lanzamiento.',
    reviewBadge:
      'Requiere revisión del propietario / legal antes de producción',
    sections: [
      {
        title: 'Sitio informativo',
        body: 'El contenido es información general sobre servicios marinos de Best Coatings Solutions y temas relacionados.',
      },
      {
        title: 'Limitaciones de solicitud de estimado',
        body: 'Enviar un formulario solo solicita revisión y seguimiento. No es cotización, factura ni compromiso de precio.',
      },
      {
        title: 'Sin cotización vinculante por formularios',
        body: 'Cualquier discusión de precio ocurre después de la revisión y se confirma por separado — nunca como precios públicos del sitio.',
      },
      {
        title: 'Sin cita confirmada por formularios',
        body: 'El envío del formulario no programa ni confirma visita, inspección ni fecha de trabajo.',
      },
      {
        title: 'Propiedad intelectual',
        body: 'El contenido, marca y materiales del sitio pertenecen a Best Coatings Solutions o licenciantes salvo indicación contraria.',
      },
      {
        title: 'Uso aceptable',
        body: 'No use mal los formularios, no intente acceso no autorizado ni envíe contenido ilícito, abusivo o dañino.',
      },
      {
        title: 'Enlaces de terceros',
        body: 'Los enlaces externos, si existen, no son controlados por BCS. No somos responsables del contenido de terceros.',
      },
      {
        title: 'Exención de garantía',
        body: 'El contenido del sitio se ofrece tal cual, sin garantías de exhaustividad para cada situación. Provisional pendiente de revisión legal.',
      },
      {
        title: 'Limitación de responsabilidad',
        body: 'El lenguaje de limitación se finalizará con asesoría legal. Provisional — no es un término legal final.',
      },
      {
        title: 'Ley aplicable',
        body: 'La ley y el foro aplicables se confirmarán con el propietario y el abogado. No se inventan en este borrador.',
      },
      {
        title: 'Cambios',
        body: 'Podemos actualizar estos términos. El uso continuo implica revisar la versión publicada más reciente.',
      },
      {
        title: 'Contacto',
        body: 'Preguntas sobre estos términos pueden enviarse por Contacto o llamando al teléfono comercial publicado.',
      },
    ],
  },
  notFound: {
    metaTitle: 'Página no encontrada | Best Coatings Solutions',
    title: 'Página no encontrada',
    body: 'Esa página no existe o ya no está disponible.',
  },
  error: {
    title: 'Algo salió mal',
    body: 'Ocurrió un problema inesperado. Puede reintentar o volver al inicio.',
    retry: 'Reintentar',
  },
  a11y: {
    stepStatus: 'Progreso del formulario',
    submitting: 'Enviando formulario',
    fileInput: 'Seleccionar fotos del daño',
  },
};
