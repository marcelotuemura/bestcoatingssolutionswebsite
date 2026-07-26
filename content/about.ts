/**
 * About page — Meet Marcelo.
 * First name only. Story, not résumé. No invented facts.
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
  metaTitle: 'Meet Marcelo | Best Coatings Solutions',
  metaDescription:
    'Meet Marcelo of Best Coatings Solutions — more than 25 years in refinishing, from Japan to marine and aviation work, now caring for boats in South Florida.',
  eyebrow: 'The craftsman',
  title: 'Meet Marcelo',
  lead: 'I repair boats because that is what I have dedicated my career to. Best Coatings Solutions is how that work reaches owners who care about the finish as much as I do.',
  introductionTitle: 'Where the work began',
  introduction: [
    'My career in professional refinishing began in Japan. There I learned that good finish work is not speed — it is preparation, consistency, and respect for the surface in front of you.',
    'I later worked in automotive manufacturing refinishing at Aisin Sin Ei. That environment taught production finishing, metallic paint, surface preparation, quality control, and the habit of doing the same careful job every time. Those companies are part of my background. They are not partners, sponsors, or endorsements of Best Coatings Solutions.',
  ],
  specializationTitle: 'Marine experience',
  specialization: [
    'Gelcoat repair and refinishing',
    'Fiberglass and composite repair',
    'Paint correction and refinishing',
    'Color matching for repairs that must blend in',
    'Cosmetic restoration for boats and yachts',
  ],
  inspectionTitle: 'From shops to the water',
  inspection: [
    'Marine work taught me how finishes live in sun, salt, and real use. Professional experience includes time at MarineMax, Nautical Ventures, and HCB Yachts. I name them only as places where I worked and learned — not as current employers, dealers, or companies that endorse this website.',
    'That chapter ends at HCB Yachts. What came next was simple: take the same discipline onto boats entrusted to Best Coatings Solutions.',
  ],
  workmanshipTitle: 'Aviation in the background',
  workmanship: [
    'My refinishing experience also includes work involving Bombardier business jets and military helicopters. That background raised the standard I hold for masking, material control, and finish review. It does not mean Best Coatings Solutions is an authorized aviation facility, and we are not booking aircraft work on this site today.',
    'Why Best Coatings Solutions exists is straightforward. Owners deserve someone who will inspect carefully, prepare honestly, and finish a repair as if the boat were their own.',
  ],
  communicationTitle: 'Every repair has my attention',
  communication: [
    'I look at the damaged area, repair what sits underneath when needed, and match the surrounding finish before the final polish. I will tell you what a repair can and cannot do. Invisible perfection is not a promise I make.',
    'Sending a form asks for a reply. It does not book an emergency response or create a binding estimate by itself.',
  ],
  valuesTitle: 'How I work',
  valuesIntro: 'These are working habits — not slogans.',
  serviceAreaTitle: 'Where we work',
  serviceArea: [
    'Primary focus: South Florida.',
    'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
    'Naming a region does not mean we serve every marina or every city in South Florida.',
  ],
  projectsCtaTitle: 'Our work',
  projectsCtaBody:
    'Repair stories appear when owners allow publication. Until then, we keep the projects page honest rather than inventing a portfolio.',
  servicesCtaTitle: 'How we can help',
  servicesCtaBody:
    'See gelcoat, fiberglass, paint, hull, yacht cosmetic, composite, color matching, and insurance-related repair pages for what each service means for your boat.',
  estimateCtaTitle: 'Request an Estimate',
  estimateCtaBody:
    'Tell us about your boat and the repair. Free estimates apply only in the Fort Lauderdale area.',
  aviationTitle: 'Aviation — Coming Soon',
  aviationBody:
    'Aviation refinishing is not active for booking or estimates. Marine repair is our focus today.',
  values: [
    {
      id: 'careful-inspection',
      title: 'Inspect first',
      body: 'Look at the damage and access before choosing a repair method.',
    },
    {
      id: 'clear-communication',
      title: 'Plain language',
      body: 'Explain scope, limits, and next steps without pressure.',
    },
    {
      id: 'appropriate-repair-planning',
      title: 'Match the method to the boat',
      body: 'Plan the repair for the condition in front of us — not a one-size package.',
    },
    {
      id: 'surface-preparation',
      title: 'Preparation before paint',
      body: 'Quality is built before the paint is applied.',
    },
    {
      id: 'finish-attention',
      title: 'Color and gloss',
      body: 'Match and finish so the repair belongs to the surrounding surface.',
    },
    {
      id: 'respect-for-vessel',
      title: 'Respect the vessel',
      body: 'Protect nearby finishes and treat the boat as a valuable asset.',
    },
    {
      id: 'honest-scope',
      title: 'Honest scope',
      body: 'Say what is included and what is not — before work begins.',
    },
    {
      id: 'professional-documentation',
      title: 'Clear records',
      body: 'Use photos and notes when they help the owner understand the repair.',
    },
  ],
};

export const aboutContentEs: AboutPageContent = {
  metaTitle: 'Conozca a Marcelo | Best Coatings Solutions',
  metaDescription:
    'Conozca a Marcelo de Best Coatings Solutions — más de 25 años en refinación, desde Japón hasta el trabajo marino y de aviación, ahora cuidando embarcaciones en el Sur de Florida.',
  eyebrow: 'El artesano',
  title: 'Conozca a Marcelo',
  lead: 'Reparo embarcaciones porque a eso he dedicado mi carrera. Best Coatings Solutions es la forma en que ese trabajo llega a dueños que cuidan el acabado tanto como yo.',
  introductionTitle: 'Dónde comenzó el trabajo',
  introduction: [
    'Mi carrera en refinación profesional comenzó en Japón. Allí aprendí que un buen acabado no es velocidad — es preparación, consistencia y respeto por la superficie.',
    'Después trabajé en refinación automotriz de manufactura en Aisin Sin Ei. Ese entorno enseñó acabado de producción, pintura metálica, preparación de superficie, control de calidad y el hábito de hacer el mismo trabajo cuidadoso cada vez. Esas empresas son parte de mi trayectoria. No son socios, patrocinadores ni endosos de Best Coatings Solutions.',
  ],
  specializationTitle: 'Experiencia marina',
  specialization: [
    'Reparación y refinación de gelcoat',
    'Reparación de fibra de vidrio y compuestos',
    'Corrección y refinación de pintura',
    'Igualación de color para reparaciones que deben integrarse',
    'Restauración cosmética de embarcaciones y yates',
  ],
  inspectionTitle: 'De los talleres al agua',
  inspection: [
    'El trabajo marino me enseñó cómo viven los acabados bajo sol, sal y uso real. La experiencia profesional incluye tiempo en MarineMax, Nautical Ventures y HCB Yachts. Los nombro solo como lugares donde trabajé y aprendí — no como empleadores actuales, concesionarios ni empresas que respaldan este sitio.',
    'Ese capítulo termina en HCB Yachts. Lo que siguió fue simple: llevar la misma disciplina a las embarcaciones confiadas a Best Coatings Solutions.',
  ],
  workmanshipTitle: 'Aviación en el historial',
  workmanship: [
    'Mi experiencia en refinación también incluye trabajo relacionado con jets de negocios Bombardier y helicópteros militares. Ese historial elevó el estándar que exijo en enmascarado, control de materiales y revisión del acabado. No significa que Best Coatings Solutions sea una instalación de aviación autorizada, y hoy no estamos reservando trabajo de aeronaves en este sitio.',
    'Best Coatings Solutions existe por una razón sencilla. Los dueños merecen a alguien que inspeccione con cuidado, prepare con honestidad y termine una reparación como si la embarcación fuera propia.',
  ],
  communicationTitle: 'Cada reparación tiene mi atención',
  communication: [
    'Miro el área dañada, reparo lo que hay debajo cuando hace falta e igualo el acabado alrededor antes del pulido final. Le diré lo que una reparación puede y no puede hacer. La perfección invisible no es una promesa que haga.',
    'Enviar un formulario pide una respuesta. No reserva una emergencia ni crea un estimado vinculante por sí solo.',
  ],
  valuesTitle: 'Cómo trabajo',
  valuesIntro: 'Estos son hábitos de trabajo — no eslóganes.',
  serviceAreaTitle: 'Dónde trabajamos',
  serviceArea: [
    'Enfoque principal: Sur de Florida.',
    'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    'Nombrar una región no significa que atendamos cada marina o cada ciudad del Sur de Florida.',
  ],
  projectsCtaTitle: 'Nuestro trabajo',
  projectsCtaBody:
    'Las historias de reparación aparecen cuando los dueños permiten publicarlos. Mientras tanto, mantenemos la página de proyectos honesta en lugar de inventar un portafolio.',
  servicesCtaTitle: 'Cómo podemos ayudar',
  servicesCtaBody:
    'Vea las páginas de gelcoat, fibra, pintura, casco, cosmética de yates, compuestos, igualación de color y reparación relacionada con seguro.',
  estimateCtaTitle: 'Solicitar un estimado',
  estimateCtaBody:
    'Cuéntenos sobre su embarcación y la reparación. Los estimados gratuitos aplican solo en el área de Fort Lauderdale.',
  aviationTitle: 'Aviación — Próximamente',
  aviationBody:
    'La refinación de aviación no está activa para reservas ni estimados. Hoy el enfoque es la reparación marina.',
  values: [
    {
      id: 'careful-inspection',
      title: 'Inspeccionar primero',
      body: 'Ver el daño y el acceso antes de elegir el método de reparación.',
    },
    {
      id: 'clear-communication',
      title: 'Lenguaje claro',
      body: 'Explicar alcance, límites y siguientes pasos sin presión.',
    },
    {
      id: 'appropriate-repair-planning',
      title: 'Método según la embarcación',
      body: 'Planear la reparación para la condición real — no un paquete único.',
    },
    {
      id: 'surface-preparation',
      title: 'Preparación antes de pintar',
      body: 'La calidad se construye antes de aplicar la pintura.',
    },
    {
      id: 'finish-attention',
      title: 'Color y brillo',
      body: 'Igualar y terminar para que la reparación pertenezca a la superficie.',
    },
    {
      id: 'respect-for-vessel',
      title: 'Respeto por la embarcación',
      body: 'Proteger acabados cercanos y tratar la embarcación como un activo valioso.',
    },
    {
      id: 'honest-scope',
      title: 'Alcance honesto',
      body: 'Decir qué está incluido y qué no — antes de comenzar.',
    },
    {
      id: 'professional-documentation',
      title: 'Registros claros',
      body: 'Usar fotos y notas cuando ayuden al dueño a entender la reparación.',
    },
  ],
};

export function getAboutContent(locale: 'en' | 'es'): AboutPageContent {
  return locale === 'es' ? aboutContentEs : aboutContentEn;
}
