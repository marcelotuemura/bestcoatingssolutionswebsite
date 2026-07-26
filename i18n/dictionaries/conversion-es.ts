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
    errorSummary: 'Corrija lo siguiente:',
    submitSuccess:
      'Su solicitud se envió correctamente. Best Coatings Solutions dará seguimiento con su método de contacto preferido cuando esté disponible.',
    submitFailure:
      'No pudimos enviar su solicitud en este momento. Su información sigue aquí — intente de nuevo o llámenos.',
    configError:
      'No pudimos enviar su solicitud porque la entrega no está disponible temporalmente. Llame a Best Coatings Solutions o intente más tarde.',
    rateLimited:
      'Se enviaron demasiadas solicitudes recientemente. Espere unos minutos e intente de nuevo, o llámenos.',
    retry: 'Reintentar',
  },
  formConsent: {
    before:
      'Al enviar este formulario, usted acepta que Best Coatings Solutions pueda contactarlo sobre su solicitud. Consulte nuestra',
    privacy: 'Política de privacidad',
    and: ' y los ',
    terms: 'Términos de uso',
    after: '.',
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
      'Contacte a Best Coatings Solutions sobre refinación marina o de aviación en el Sur de Florida. Llame, escriba o envíe un mensaje.',
    eyebrow: 'Contacto',
    title: 'Cuéntenos sobre su proyecto',
    lead: 'Escríbanos sobre refinación marina o de aviación. Los proyectos marinos pueden usar el formulario de estimado; las consultas de aviación son bienvenidas a través de Contacto.',
    directTitle: 'Contacto directo',
    hoursTitle: 'Horario',
    closed: 'Cerrado',
    weekdays: 'Lunes – Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    areaTitle: 'Área de servicio',
    areaBody:
      'Servimos el Sur de Florida. Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale.',
    formTitle: 'Enviar un mensaje',
    formLead:
      'Cuéntenos cómo podemos ayudar. Para proyectos de aviación, describa la necesidad de refinación cosmética aquí — daremos seguimiento. Los estimados marinos también usan el formulario dedicado.',
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
    title: 'Solicitar un estimado',
    lead: 'Comparta detalles de la embarcación y el daño para que podamos dar seguimiento. No es una cotización instantánea, precio vinculante ni cita confirmada.',
    policyNote:
      'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    noAviation:
      'Este formulario de estimado es para proyectos marinos. Para consultas de refinación cosmética de aviación, use Contacto.',
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
      'paint-refinishing': 'Pintura y refinación',
      'hull-restoration': 'Restauración de casco',
      'yacht-cosmetic-repair': 'Reparación cosmética de yates',
      'structural-composite-repair': 'Reparación estructural de compuestos',
      'color-matching': 'Igualación de color',
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
      'Seleccione hasta {max} fotos (JPEG, PNG, WebP, HEIC). Máx. {size} MB cada una. En esta versión las fotos permanecen en su dispositivo — el sitio no las sube ni las almacena.',
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
    contactTitle: 'Mensaje recibido',
    estimateTitle: 'Solicitud de estimado recibida',
    fallbackTitle: 'Gracias',
    contactBody:
      'Gracias. Su mensaje de contacto se envió a Best Coatings Solutions. Daremos seguimiento con su método de contacto preferido cuando esté disponible.',
    estimateBody:
      'Gracias. Su solicitud de estimado marino se envió a Best Coatings Solutions. Revisaremos los detalles y daremos seguimiento cuando esté disponible.',
    fallbackBody:
      'Si acaba de enviar un formulario, su solicitud se envió para revisión. Para ayuda ahora, llame a Best Coatings Solutions o vuelva a Contacto.',
    nextTitle: 'Qué sigue',
    nextSteps: [
      'Best Coatings Solutions revisa las solicitudes entrantes.',
      'El seguimiento usa su método de contacto preferido cuando esté disponible.',
      'Una inspección o discusión de estimado ocurre solo cuando corresponde — el formulario solo no confirma nada.',
    ],
    noFixedTime: 'No prometemos un tiempo de respuesta fijo en este sitio.',
  },
  privacy: {
    metaTitle: 'Política de privacidad | Best Coatings Solutions',
    metaDescription:
      'Política de privacidad del sitio de Best Coatings Solutions, formularios de contacto y solicitudes de estimado marino.',
    title: 'Política de privacidad',
    lead: 'Esta Política de privacidad explica cómo Best Coatings Solutions trata la información enviada a través de este sitio web.',
    lastUpdatedLabel: 'Última actualización',
    sections: [
      {
        title: 'Operador del sitio',
        body: 'Best Coatings Solutions opera este sitio web. La entidad legal referida en avisos del sitio es Best Coatings Solutions LLC. Operamos en Florida, Estados Unidos. No se publica una dirección física en este sitio. [Owner to provide mailing address if a postal address is required.]',
      },
      {
        title: 'Información que puede enviar',
        body: 'Mediante los formularios de contacto y estimado puede proporcionar nombre, correo, teléfono, método de contacto preferido, tipo de consulta, contenido del mensaje, detalles de embarcación o aeronave cuando se incluyan, descripciones del proyecto o daño, preferencias de servicio y reconocimientos relacionados. El formulario de estimado también permite seleccionar fotos localmente para su propia revisión; en esta versión los archivos de fotos no se cargan ni se almacenan en el sitio. Los nombres de archivo o cantidades pueden mencionarse en notificaciones internas si selecciona fotos.',
      },
      {
        title: 'Información técnica',
        body: 'Como la mayoría de los sitios, la infraestructura de hosting puede procesar registros técnicos básicos como dirección IP, tipo de navegador, ruta de solicitud y marcas de tiempo para operar y proteger el sitio. No operamos un banner separado de cookies de marketing. Este sitio usa Vercel Analytics para información agregada de tráfico; no se usa para crear perfiles publicitarios en este sitio, y no instalamos píxeles de marketing de terceros ni rastreadores publicitarios en la experiencia pública.',
      },
      {
        title: 'Finalidad de la recopilación',
        body: 'Usamos la información enviada para responder consultas, preparar evaluaciones de estimado, programar o discutir comunicaciones de servicio cuando corresponda, mejorar la confiabilidad y seguridad del sitio, y operar la comunicación cotidiana relacionada con su solicitud.',
      },
      {
        title: 'Proveedores de servicios',
        body: 'Usamos proveedores para alojar el sitio y entregar correo transaccional, incluidos Vercel (hosting / despliegue) y Resend (entrega de correo para notificaciones de formularios). Estos proveedores procesan información solo según sea necesario para prestar sus servicios. No vendemos su información personal.',
      },
      {
        title: 'Retención de datos',
        body: 'Conservamos información de consultas y solicitudes de estimado durante el tiempo razonablemente necesario para responder, evaluar proyectos, mantener registros comerciales y cumplir obligaciones legales o de seguridad. Los períodos pueden variar según el tipo de solicitud. Puede contactarnos para preguntar sobre información que envió.',
      },
      {
        title: 'Seguridad de los datos',
        body: 'Usamos medidas administrativas y técnicas razonables según la naturaleza de la información, incluido HTTPS, validación en el servidor y herramientas de entrega con acceso limitado. Ningún método de transmisión o almacenamiento es completamente seguro, y no podemos garantizar seguridad absoluta.',
      },
      {
        title: 'Solicitudes de privacidad',
        body: 'Para preguntas de privacidad, solicitar una actualización o discutir información enviada, contacte a Best Coatings Solutions con el teléfono o correo publicados en Contacto (info@bestcoatingssolutions.com / 305-747-8352).',
      },
      {
        title: 'Privacidad de menores',
        body: 'Este sitio no está dirigido a menores de 13 años y no recopilamos conscientemente su información personal. Si cree que un menor envió información, contáctenos para eliminarla.',
      },
      {
        title: 'Enlaces de terceros',
        body: 'Este sitio puede enlazar a sitios de terceros. No somos responsables de sus prácticas de privacidad ni de su contenido. Revise sus políticas antes de proporcionar información.',
      },
      {
        title: 'Cambios a la política',
        body: 'Podemos actualizar esta Política de privacidad. La fecha de “Última actualización” refleja la versión vigente. El uso continuo del sitio después de cambios implica revisar la política publicada.',
      },
      {
        title: 'Contacto',
        body: 'Preguntas de privacidad: Best Coatings Solutions — correo info@bestcoatingssolutions.com, teléfono 305-747-8352, o use Contacto. Contexto de ubicación: Florida, Estados Unidos. [Owner to provide mailing address if a postal address is required.]',
      },
    ],
  },
  terms: {
    metaTitle: 'Términos de uso | Best Coatings Solutions',
    metaDescription:
      'Términos de uso del sitio de Best Coatings Solutions, incluidas limitaciones de solicitudes de estimado y uso aceptable.',
    title: 'Términos de uso',
    lead: 'Estos Términos de uso rigen el acceso y uso del sitio web de Best Coatings Solutions.',
    lastUpdatedLabel: 'Última actualización',
    sections: [
      {
        title: 'Aceptación de los términos',
        body: 'Al acceder o usar este sitio, usted acepta estos Términos de uso. Si no está de acuerdo, no use el sitio.',
      },
      {
        title: 'Uso permitido del sitio',
        body: 'Puede usar este sitio para consultas lícitas personales o comerciales relacionadas con los servicios de Best Coatings Solutions. No debe hacer mal uso del sitio, interferir con su operación ni intentar acceso no autorizado.',
      },
      {
        title: 'Naturaleza informativa del contenido',
        body: 'El contenido del sitio se ofrece como información general sobre Best Coatings Solutions y sus servicios de refinación marina y de aviación. El contenido puede cambiar y puede no cubrir cada situación.',
      },
      {
        title: 'Descargo de solicitud de estimado',
        body: 'Una consulta o solicitud de estimado en el sitio web es solo una petición de evaluación. No es un estimado vinculante, contrato, autorización de reparación, garantía ni compromiso de realizar trabajo. El precio final, si corresponde, puede depender de inspección, materiales, condición, alcance, acceso, programación y otros factores. Best Coatings Solutions no garantiza que se acepte cada proyecto solicitado.',
      },
      {
        title: 'Inspección y autorización escrita',
        body: 'Cualquier trabajo requiere revisión aparte y autorización escrita según se acuerde con Best Coatings Solutions. El envío del formulario por sí solo no programa una visita, confirma una cita, autoriza reparaciones ni crea un contrato de servicio.',
      },
      {
        title: 'Propiedad intelectual',
        body: 'El contenido, marca, logotipos, textos y materiales del sitio pertenecen a Best Coatings Solutions o a sus licenciantes salvo indicación contraria. No puede copiar, modificar ni redistribuir materiales del sitio con fines comerciales sin permiso.',
      },
      {
        title: 'Conducta prohibida',
        body: 'No puede enviar contenido ilícito, abusivo, engañoso o dañino; intentar saturar o interrumpir el sitio; recolectar datos; ni usar medios automatizados para enviar formularios salvo permiso expreso.',
      },
      {
        title: 'Enlaces de terceros',
        body: 'Los enlaces a sitios de terceros, si existen, se ofrecen por conveniencia. Best Coatings Solutions no controla ni es responsable del contenido o prácticas de terceros.',
      },
      {
        title: 'Descargo de fabricantes y marcas',
        body: 'Las referencias a fabricantes, embarcaciones, aeronaves, marcas, empleadores anteriores o experiencia profesional son solo descriptivas y no implican patrocinio, afiliación, autorización ni respaldo.',
      },
      {
        title: 'Disponibilidad del sitio',
        body: 'Procuramos mantener el sitio disponible, pero no garantizamos operación ininterrumpida ni libre de errores. El acceso puede suspenderse por mantenimiento, seguridad u operación.',
      },
      {
        title: 'Exención de garantías',
        body: 'EL SITIO Y SU CONTENIDO SE OFRECEN “TAL CUAL” Y “SEGÚN DISPONIBILIDAD”, SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS O IMPLÍCITAS, INCLUIDAS COMERCIABILIDAD, IDONEIDAD PARA UN FIN PARTICULAR O NO INFRACCIÓN, EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY.',
      },
      {
        title: 'Limitación de responsabilidad',
        body: 'EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, BEST COATINGS SOLUTIONS Y SUS PROPIETARIOS, EMPLEADOS Y AGENTES NO SON RESPONSABLES DE DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS DERIVADOS DEL USO DEL SITIO O DE LA CONFIANZA EN SU CONTENIDO. NUESTRA RESPONSABILIDAD TOTAL POR RECLAMOS RELACIONADOS CON EL SITIO SE LIMITA AL MAYOR ENTRE CINCUENTA DÓLARES ESTADOUNIDENSES (US $50) O LO QUE NOS HAYA PAGADO, SI CORRESPONDE, POR ACCESO AL SITIO EN LOS DOCE MESES ANTERIORES AL RECLAMO.',
      },
      {
        title: 'Indemnización',
        body: 'Usted acepta indemnizar y eximir de responsabilidad a Best Coatings Solutions frente a reclamos, pérdidas y gastos (incluidos honorarios razonables de abogados) derivados del mal uso del sitio, del envío de contenido ilícito o de la violación de estos Términos.',
      },
      {
        title: 'Ley aplicable',
        body: 'Estos Términos se rigen por las leyes del Estado de Florida, Estados Unidos, sin perjuicio de principios de conflicto de leyes. Los tribunales ubicados en Florida tienen jurisdicción exclusiva sobre controversias derivadas de estos Términos o del sitio, en la medida permitida por la ley.',
      },
      {
        title: 'Cambios a los términos',
        body: 'Podemos actualizar estos Términos de uso. La fecha de “Última actualización” refleja la versión vigente. El uso continuo del sitio después de cambios constituye aceptación de los Términos actualizados.',
      },
      {
        title: 'Divisibilidad',
        body: 'Si alguna disposición de estos Términos se considera inaplicable, las demás disposiciones permanecen vigentes.',
      },
      {
        title: 'Contacto',
        body: 'Preguntas sobre estos Términos: Best Coatings Solutions — correo info@bestcoatingssolutions.com, teléfono 305-747-8352, o use Contacto. Florida, Estados Unidos. [Owner to provide mailing address if a postal address is required.]',
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
