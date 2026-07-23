/**
 * About page content — qualified language only; no unsupported statistics.
 */

export interface AboutPageContent {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly introductionTitle: string;
  readonly introduction: readonly string[];
  readonly specializationTitle: string;
  readonly specialization: readonly string[];
  readonly inspectionTitle: string;
  readonly inspection: readonly string[];
  readonly workmanshipTitle: string;
  readonly workmanship: readonly string[];
  readonly communicationTitle: string;
  readonly communication: readonly string[];
  readonly valuesTitle: string;
  readonly valuesIntro: string;
  readonly serviceAreaTitle: string;
  readonly serviceArea: readonly string[];
  readonly projectsCtaTitle: string;
  readonly projectsCtaBody: string;
  readonly servicesCtaTitle: string;
  readonly servicesCtaBody: string;
  readonly estimateCtaTitle: string;
  readonly estimateCtaBody: string;
  readonly aviationTitle: string;
  readonly aviationBody: string;
  readonly values: readonly {
    readonly id: string;
    readonly title: string;
    readonly body: string;
  }[];
}

export const aboutContentEn: AboutPageContent = {
  metaTitle: 'About Best Coatings Solutions | Marine Repair',
  metaDescription:
    'Learn how Best Coatings Solutions approaches marine cosmetic repair, gelcoat, fiberglass, and refinishing across South Florida.',
  eyebrow: 'Company',
  title: 'About Best Coatings Solutions',
  lead: 'A marine-focused coatings and cosmetic repair specialist serving South Florida — from Jupiter southward — with careful inspection, clear communication, and disciplined finish work.',
  introductionTitle: 'Company introduction',
  introduction: [
    'Best Coatings Solutions provides marine cosmetic repair, fiberglass and composite repair, gelcoat repair, paint and refinishing, and color and finish attention for vessels where conditions allow.',
    'We focus on careful project evaluation, clear scope communication, and professional documentation. We do not invent founding years, project counts, certifications, or awards on this website.',
  ],
  specializationTitle: 'Marine repair specialization',
  specialization: [
    'Gelcoat repair and refinishing',
    'Fiberglass and composite repair',
    'Paint and refinishing systems',
    'Hull and yacht cosmetic restoration',
    'Color matching support and insurance-related repair conversations',
  ],
  inspectionTitle: 'Inspection and planning approach',
  inspection: [
    'We begin with the information you share — photos, vessel details, and location notes — and recommend inspection when color, access, or substrate conditions need closer review.',
    'Planning emphasizes appropriate repair methods for the observed condition rather than one-size-fits-all promises.',
  ],
  workmanshipTitle: 'Surface preparation and workmanship',
  workmanship: [
    'Surface preparation and finish attention are central to our approach. Surrounding finishes are respected, and repair boundaries are discussed honestly before work proceeds.',
    'Warranty terms, when applicable, are defined in the approved written repair scope — not as universal claims on marketing pages.',
  ],
  communicationTitle: 'Communication process',
  communication: [
    'We aim for clear, professional communication with owners, captains, and managers throughout evaluation, scope discussion, and repair documentation.',
    'Form submissions request a response; they do not confirm appointments, emergency response, or instant estimates.',
  ],
  valuesTitle: 'Company values',
  valuesIntro:
    'These themes guide how we work. They are commitments to process — not absolute ranking claims.',
  serviceAreaTitle: 'Service area summary',
  serviceArea: [
    'Primary focus: South Florida, from Jupiter southward.',
    'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
    'Listing a region does not mean BCS serves every marina or every city in South Florida.',
  ],
  projectsCtaTitle: 'Projects',
  projectsCtaBody:
    'Approved project documentation will appear in our portfolio when owner and customer consent allow. Until then, the Projects page explains how case studies will be presented.',
  servicesCtaTitle: 'Marine services',
  servicesCtaBody:
    'Explore gelcoat, fiberglass, paint, hull, yacht cosmetic, structural composite, color matching, and insurance-related repair pages.',
  estimateCtaTitle: 'Request an estimate',
  estimateCtaBody:
    'Share vessel details and photos to start a marine repair estimate conversation. Free estimates apply only in the Fort Lauderdale area.',
  aviationTitle: 'Aviation — Coming Soon',
  aviationBody:
    'Aviation coatings capabilities are preparing for a future launch. Aviation booking and aviation-specific estimates are not available while the division remains Coming Soon.',
  values: [
    {
      id: 'careful-inspection',
      title: 'Careful inspection',
      body: 'Evaluate damage and access carefully before committing to a repair approach.',
    },
    {
      id: 'clear-communication',
      title: 'Clear communication',
      body: 'Explain scope, limitations, and next steps in plain language.',
    },
    {
      id: 'appropriate-repair-planning',
      title: 'Appropriate repair planning',
      body: 'Match the method to the vessel condition and agreed goals.',
    },
    {
      id: 'surface-preparation',
      title: 'Surface preparation',
      body: 'Respect preparation as the foundation of durable finish work.',
    },
    {
      id: 'finish-attention',
      title: 'Finish attention',
      body: 'Give careful attention to color, gloss, and transitions within the agreed scope.',
    },
    {
      id: 'respect-for-vessel',
      title: 'Respect for the vessel',
      body: 'Protect surrounding finishes and treat the vessel as a valuable asset.',
    },
    {
      id: 'honest-scope',
      title: 'Honest scope discussion',
      body: 'Discuss inclusions and exclusions openly — without absolute marketing claims.',
    },
    {
      id: 'professional-documentation',
      title: 'Professional documentation',
      body: 'Support clear records when photos or written notes help the project file.',
    },
  ],
};

export const aboutContentEs: AboutPageContent = {
  metaTitle: 'Acerca de Best Coatings Solutions | Reparación marina',
  metaDescription:
    'Conozca cómo Best Coatings Solutions aborda la reparación cosmética marina, gelcoat, fibra de vidrio y refinación en el Sur de la Florida.',
  eyebrow: 'Empresa',
  title: 'Acerca de Best Coatings Solutions',
  lead: 'Especialista en recubrimientos y reparación cosmética marina que sirve al Sur de la Florida — desde Jupiter hacia el sur — con inspección cuidadosa, comunicación clara y trabajo de acabado disciplinado.',
  introductionTitle: 'Presentación de la empresa',
  introduction: [
    'Best Coatings Solutions ofrece reparación cosmética marina, reparación de fibra de vidrio y compuestos, reparación de gelcoat, pintura y refinación, y atención al color y al acabado en embarcaciones cuando las condiciones lo permiten.',
    'Nos enfocamos en la evaluación cuidadosa del proyecto, la comunicación clara del alcance y la documentación profesional. No inventamos años de fundación, conteos de proyectos, certificaciones ni premios en este sitio.',
  ],
  specializationTitle: 'Especialización en reparación marina',
  specialization: [
    'Reparación y refinación de gelcoat',
    'Reparación de fibra de vidrio y compuestos',
    'Sistemas de pintura y refinación',
    'Restauración cosmética de casco y yates',
    'Apoyo de igualación de color y conversaciones de reparación relacionadas con seguro',
  ],
  inspectionTitle: 'Enfoque de inspección y planificación',
  inspection: [
    'Comenzamos con la información que usted comparte — fotos, detalles de la embarcación y notas de ubicación — y recomendamos inspección cuando el color, el acceso o las condiciones del sustrato requieren una revisión más cercana.',
    'La planificación enfatiza métodos de reparación apropiados para la condición observada en lugar de promesas únicas para todos.',
  ],
  workmanshipTitle: 'Preparación de superficie y mano de obra',
  workmanship: [
    'La preparación de superficie y la atención al acabado son centrales en nuestro enfoque. Se respetan los acabados circundantes y se discuten con honestidad los límites de la reparación antes de proceder.',
    'Los términos de garantía, cuando aplican, se definen en el alcance de reparación escrito aprobado — no como afirmaciones universales en páginas de marketing.',
  ],
  communicationTitle: 'Proceso de comunicación',
  communication: [
    'Buscamos una comunicación clara y profesional con propietarios, capitanes y gestores durante la evaluación, la discusión del alcance y la documentación de la reparación.',
    'El envío de formularios solicita una respuesta; no confirma citas, respuesta de emergencia ni estimados instantáneos.',
  ],
  valuesTitle: 'Valores de la empresa',
  valuesIntro:
    'Estos temas guían cómo trabajamos. Son compromisos de proceso — no afirmaciones absolutas de ranking.',
  serviceAreaTitle: 'Resumen del área de servicio',
  serviceArea: [
    'Enfoque principal: Sur de la Florida, desde Jupiter hacia el sur.',
    'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    'Mencionar una región no significa que BCS atienda cada marina o cada ciudad del Sur de la Florida.',
  ],
  projectsCtaTitle: 'Proyectos',
  projectsCtaBody:
    'La documentación de proyectos aprobados aparecerá en nuestro portafolio cuando el consentimiento del propietario y del cliente lo permitan. Mientras tanto, la página de Proyectos explica cómo se presentarán los casos.',
  servicesCtaTitle: 'Servicios marinos',
  servicesCtaBody:
    'Explore páginas de gelcoat, fibra de vidrio, pintura, casco, cosmética de yates, compuestos estructurales, igualación de color y reparación relacionada con seguro.',
  estimateCtaTitle: 'Solicitar un estimado',
  estimateCtaBody:
    'Comparta detalles de la embarcación y fotos para iniciar una conversación de estimado de reparación marina. Los estimados gratuitos aplican solo en el área de Fort Lauderdale.',
  aviationTitle: 'Aviación — Próximamente',
  aviationBody:
    'Las capacidades de recubrimientos de aviación se preparan para un lanzamiento futuro. La reserva de aviación y los estimados específicos de aviación no están disponibles mientras la división permanece como Próximamente.',
  values: [
    {
      id: 'careful-inspection',
      title: 'Inspección cuidadosa',
      body: 'Evaluar el daño y el acceso con cuidado antes de comprometer un enfoque de reparación.',
    },
    {
      id: 'clear-communication',
      title: 'Comunicación clara',
      body: 'Explicar el alcance, las limitaciones y los siguientes pasos en lenguaje sencillo.',
    },
    {
      id: 'appropriate-repair-planning',
      title: 'Planificación de reparación apropiada',
      body: 'Alinear el método con la condición de la embarcación y los objetivos acordados.',
    },
    {
      id: 'surface-preparation',
      title: 'Preparación de superficie',
      body: 'Respetar la preparación como base de un trabajo de acabado durable.',
    },
    {
      id: 'finish-attention',
      title: 'Atención al acabado',
      body: 'Prestar atención cuidadosa al color, el brillo y las transiciones dentro del alcance acordado.',
    },
    {
      id: 'respect-for-vessel',
      title: 'Respeto por la embarcación',
      body: 'Proteger los acabados circundantes y tratar la embarcación como un activo valioso.',
    },
    {
      id: 'honest-scope',
      title: 'Discusión honesta del alcance',
      body: 'Discutir inclusiones y exclusiones abiertamente — sin afirmaciones absolutas de marketing.',
    },
    {
      id: 'professional-documentation',
      title: 'Documentación profesional',
      body: 'Apoyar registros claros cuando fotos o notas escritas ayuden al expediente del proyecto.',
    },
  ],
};

export function getAboutContent(locale: 'en' | 'es'): AboutPageContent {
  return locale === 'es' ? aboutContentEs : aboutContentEn;
}
