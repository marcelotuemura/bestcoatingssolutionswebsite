/**
 * About page — Meet Marcelo / Trust Experience.
 * First name only. Story, not résumé. No invented facts.
 * Employer/OEM names are factual background only — never endorsement.
 */

export interface AboutPageContent {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly introductionTitle: string;
  readonly introduction: readonly string[];
  readonly careerTitle: string;
  readonly career: readonly string[];
  readonly philosophyTitle: string;
  readonly philosophy: readonly string[];
  readonly craftPrinciplesTitle: string;
  readonly craftPrinciplesIntro: string;
  readonly craftPrinciplesQuestions: readonly string[];
  readonly craftPrinciplesClosing: string;
  readonly expectTitle: string;
  readonly expectIntro: string;
  readonly expectSteps: readonly {
    readonly title: string;
    readonly body: string;
  }[];
  readonly specializationTitle: string;
  readonly specialization: readonly string[];
  readonly communicationTitle: string;
  readonly communication: readonly string[];
  readonly valuesTitle: string;
  readonly valuesIntro: string;
  readonly disclaimer: string;
  readonly serviceAreaTitle: string;
  readonly serviceArea: readonly string[];
  readonly projectsCtaTitle: string;
  readonly projectsCtaBody: string;
  readonly estimateCtaTitle: string;
  readonly estimateCtaBody: string;
  readonly aviationTitle: string;
  readonly aviationBody: string;
  readonly photoNote: string;
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
  lead: "For more than 25 years, I've dedicated my career to professional refinishing. Best Coatings Solutions is how that work reaches boat owners who care about the finish as much as I do.",
  introductionTitle: 'Where the work began',
  introduction: [
    'My career in professional refinishing began in Japan. There I learned that good finish work is not speed — it is preparation, consistency, and respect for the surface in front of you.',
    'I later contributed to manufacturing refinishing work while employed by Aisin Sin Ei. That environment taught production finishing, metallic paint, surface preparation, quality control, and the habit of doing the same careful job every time.',
  ],
  careerTitle: 'From shops to the water',
  career: [
    'Marine work taught me how finishes live in sun, salt, and real use. My professional experience includes work performed while employed by MarineMax, Nautical Ventures, and HCB Yachts.',
    'Throughout my career, I have also contributed to refinishing work involving Bombardier business jets and military helicopters. That background raised the standard I hold for masking, material control, and finish review. It does not mean Best Coatings Solutions is an authorized aviation facility, and we are not booking aircraft work on this site today.',
    'That chapter ends at HCB Yachts. What came next was simple: take the same discipline onto boats entrusted to Best Coatings Solutions.',
  ],
  philosophyTitle: 'Quality Is Built Before the Paint Is Applied',
  philosophy: [
    'The finish people notice is the last step. The work that protects your boat happens earlier — inspection, preparation, and patience.',
    'Why Best Coatings Solutions exists is straightforward. Owners deserve someone who will inspect carefully, prepare honestly, and finish a repair as if the boat were their own.',
  ],
  craftPrinciplesTitle: 'Every Repair Begins the Same Way',
  craftPrinciplesIntro: 'Before any repair starts, I ask four questions:',
  craftPrinciplesQuestions: [
    'What caused the damage?',
    'What is the correct repair method?',
    'How can the original finish be preserved?',
    'What would I expect if this were my own boat?',
  ],
  craftPrinciplesClosing:
    "Those questions guide every project, whether it's a small gelcoat repair or a complete cosmetic restoration.",
  expectTitle: 'What You Can Expect',
  expectIntro:
    'Boat owners often wonder what working with a repair shop is like. Here is the path we follow.',
  expectSteps: [
    {
      title: 'Contact us',
      body: 'Tell us about your boat and the damage.',
    },
    {
      title: 'We review the damage',
      body: 'We look at what you share before recommending next steps.',
    },
    {
      title: 'Inspection when needed',
      body: 'If the repair needs to be seen in person, we schedule an inspection.',
    },
    {
      title: 'Estimate',
      body: 'We provide an estimate based on what we can verify. Free estimates apply only in the Fort Lauderdale area.',
    },
    {
      title: 'Repair options',
      body: 'We discuss methods, limits, and realistic finish expectations — without pressure.',
    },
    {
      title: 'Updates during the project',
      body: 'We keep you informed so you are never guessing what is happening to your boat.',
    },
    {
      title: 'Final inspection',
      body: 'We inspect the finished repair before delivery and review the result with you.',
    },
  ],
  specializationTitle: 'Marine work I focus on',
  specialization: [
    'Gelcoat repair and refinishing',
    'Fiberglass and composite repair',
    'Paint correction and refinishing',
    'Color matching for repairs that must blend in',
    'Cosmetic restoration for boats and yachts',
  ],
  communicationTitle: 'Every repair has my attention',
  communication: [
    'I look at the damaged area, repair what sits underneath when needed, and match the surrounding finish before the final polish. I will tell you what a repair can and cannot do. Invisible perfection is not a promise I make.',
    'Sending a form asks for a reply. It does not book an emergency response or create a binding estimate by itself.',
  ],
  valuesTitle: 'How I work',
  valuesIntro: 'These are working habits — not slogans.',
  disclaimer:
    "Manufacturer and employer names are referenced solely to describe Marcelo's professional background and experience. Their inclusion does not imply endorsement, affiliation, or partnership with Best Coatings Solutions.",
  serviceAreaTitle: 'Where we work',
  serviceArea: [
    'Primary focus: South Florida.',
    'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
    'Naming a region does not mean we serve every marina or every city in South Florida.',
  ],
  projectsCtaTitle: 'Our work',
  projectsCtaBody:
    'Repair stories appear when owners allow publication. Until then, we keep the projects page honest rather than inventing a portfolio.',
  estimateCtaTitle: 'Request an Estimate',
  estimateCtaBody:
    'Tell us about your boat and the repair. Free estimates apply only in the Fort Lauderdale area.',
  aviationTitle: 'Aviation — Coming Soon',
  aviationBody:
    'Aviation refinishing is not active for booking or estimates. Marine repair is our focus today.',
  photoNote:
    'Authentic photography of Marcelo and the work will replace this space when approved. We do not use stock photos to invent a shop floor.',
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
  lead: 'Durante más de 25 años he dedicado mi carrera a la refinación profesional. Best Coatings Solutions es la forma en que ese trabajo llega a dueños de embarcaciones que cuidan el acabado tanto como yo.',
  introductionTitle: 'Dónde comenzó el trabajo',
  introduction: [
    'Mi carrera en refinación profesional comenzó en Japón. Allí aprendí que un buen acabado no es velocidad — es preparación, consistencia y respeto por la superficie.',
    'Después contribuí a trabajo de refinación en manufactura mientras estuve empleado en Aisin Sin Ei. Ese entorno enseñó acabado de producción, pintura metálica, preparación de superficie, control de calidad y el hábito de hacer el mismo trabajo cuidadoso cada vez.',
  ],
  careerTitle: 'De los talleres al agua',
  career: [
    'El trabajo marino me enseñó cómo viven los acabados bajo sol, sal y uso real. Mi experiencia profesional incluye trabajo realizado mientras estuve empleado en MarineMax, Nautical Ventures y HCB Yachts.',
    'A lo largo de mi carrera, también he contribuido a trabajo de refinación relacionado con jets de negocios Bombardier y helicópteros militares. Ese historial elevó el estándar que exijo en enmascarado, control de materiales y revisión del acabado. No significa que Best Coatings Solutions sea una instalación de aviación autorizada, y hoy no estamos reservando trabajo de aeronaves en este sitio.',
    'Ese capítulo termina en HCB Yachts. Lo que siguió fue simple: llevar la misma disciplina a las embarcaciones confiadas a Best Coatings Solutions.',
  ],
  philosophyTitle: 'La calidad se construye antes de aplicar la pintura',
  philosophy: [
    'El acabado que la gente nota es el último paso. El trabajo que protege su embarcación ocurre antes — inspección, preparación y paciencia.',
    'Best Coatings Solutions existe por una razón sencilla. Los dueños merecen a alguien que inspeccione con cuidado, prepare con honestidad y termine una reparación como si la embarcación fuera propia.',
  ],
  craftPrinciplesTitle: 'Cada reparación comienza de la misma manera',
  craftPrinciplesIntro:
    'Antes de que comience cualquier reparación, me hago cuatro preguntas:',
  craftPrinciplesQuestions: [
    '¿Qué causó el daño?',
    '¿Cuál es el método correcto de reparación?',
    '¿Cómo se puede preservar el acabado original?',
    '¿Qué esperaría yo si esta fuera mi propia embarcación?',
  ],
  craftPrinciplesClosing:
    'Esas preguntas guían cada proyecto, ya sea una pequeña reparación de gelcoat o una restauración cosmética completa.',
  expectTitle: 'Qué puede esperar',
  expectIntro:
    'Los dueños de embarcaciones a menudo se preguntan cómo es trabajar con un taller de reparación. Este es el camino que seguimos.',
  expectSteps: [
    {
      title: 'Contáctenos',
      body: 'Cuéntenos sobre su embarcación y el daño.',
    },
    {
      title: 'Revisamos el daño',
      body: 'Miramos lo que comparte antes de recomendar los siguientes pasos.',
    },
    {
      title: 'Inspección cuando hace falta',
      body: 'Si la reparación necesita verse en persona, programamos una inspección.',
    },
    {
      title: 'Estimado',
      body: 'Ofrecemos un estimado según lo que podamos verificar. Los estimados gratuitos aplican solo en el área de Fort Lauderdale.',
    },
    {
      title: 'Opciones de reparación',
      body: 'Hablamos de métodos, límites y expectativas realistas de acabado — sin presión.',
    },
    {
      title: 'Actualizaciones durante el proyecto',
      body: 'Lo mantenemos informado para que nunca tenga que adivinar qué ocurre con su embarcación.',
    },
    {
      title: 'Inspección final',
      body: 'Inspeccionamos la reparación terminada antes de la entrega y revisamos el resultado con usted.',
    },
  ],
  specializationTitle: 'Trabajo marino en el que me enfoco',
  specialization: [
    'Reparación y refinación de gelcoat',
    'Reparación de fibra de vidrio y compuestos',
    'Corrección y refinación de pintura',
    'Igualación de color para reparaciones que deben integrarse',
    'Restauración cosmética de embarcaciones y yates',
  ],
  communicationTitle: 'Cada reparación tiene mi atención',
  communication: [
    'Miro el área dañada, reparo lo que hay debajo cuando hace falta e igualo el acabado alrededor antes del pulido final. Le diré lo que una reparación puede y no puede hacer. La perfección invisible no es una promesa que haga.',
    'Enviar un formulario pide una respuesta. No reserva una emergencia ni crea un estimado vinculante por sí solo.',
  ],
  valuesTitle: 'Cómo trabajo',
  valuesIntro: 'Estos son hábitos de trabajo — no eslóganes.',
  disclaimer:
    'Los nombres de fabricantes y empleadores se mencionan únicamente para describir la trayectoria y experiencia profesional de Marcelo. Su inclusión no implica respaldo, afiliación ni asociación con Best Coatings Solutions.',
  serviceAreaTitle: 'Dónde trabajamos',
  serviceArea: [
    'Enfoque principal: Sur de Florida.',
    'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
    'Nombrar una región no significa que atendamos cada marina o cada ciudad del Sur de Florida.',
  ],
  projectsCtaTitle: 'Nuestro trabajo',
  projectsCtaBody:
    'Las historias de reparación aparecen cuando los dueños permiten publicarlos. Mientras tanto, mantenemos la página de proyectos honesta en lugar de inventar un portafolio.',
  estimateCtaTitle: 'Solicitar un estimado',
  estimateCtaBody:
    'Cuéntenos sobre su embarcación y la reparación. Los estimados gratuitos aplican solo en el área de Fort Lauderdale.',
  aviationTitle: 'Aviación — Próximamente',
  aviationBody:
    'La refinación de aviación no está activa para reservas ni estimados. Hoy el enfoque es la reparación marina.',
  photoNote:
    'La fotografía auténtica de Marcelo y del trabajo reemplazará este espacio cuando se apruebe. No usamos fotos de banco para inventar un taller.',
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
