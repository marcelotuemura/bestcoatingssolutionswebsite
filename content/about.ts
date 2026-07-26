/**
 * About page — Meet Marcelo / craftsman culmination (Phase 5G).
 * First name only. Story, not résumé. No invented facts.
 * Employer/OEM names are factual background only — never endorsement.
 */

export interface AboutStandard {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface AboutBackgroundEntry {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
}

export interface AboutPageContent {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly photoNote: string;
  readonly beganTitle: string;
  readonly began: readonly string[];
  readonly industriesTitle: string;
  readonly industries: readonly string[];
  readonly whyExistsTitle: string;
  readonly whyExists: readonly string[];
  readonly standardsTitle: string;
  readonly standardsIntro: string;
  readonly standards: readonly AboutStandard[];
  readonly backgroundTitle: string;
  readonly backgroundIntro: string;
  readonly backgroundEntries: readonly AboutBackgroundEntry[];
  readonly disclaimerHeading: string;
  readonly disclaimer: string;
  readonly invitationTitle: string;
  readonly invitationBody: string;
}

export const aboutContentEn: AboutPageContent = {
  metaTitle: 'Meet Marcelo | Best Coatings Solutions',
  metaDescription:
    'Meet Marcelo of Best Coatings Solutions — professional refinishing from Japan to marine and aviation, now caring for finishes in South Florida.',
  eyebrow: 'The craftsman',
  title: 'Meet Marcelo',
  lead: 'Best Coatings Solutions is built on standards you can feel in the finish. Marcelo is the craftsman behind that discipline — bringing decades of refinishing care to every project entrusted to the company.',
  photoNote:
    'Authentic photography of Marcelo in a workshop or project environment will replace this space when approved. We do not use stock photos to invent a shop floor.',
  beganTitle: 'Where it began',
  began: [
    "Marcelo's career in professional refinishing began in Japan. There he developed an appreciation for precision, consistency, and respect for the surface in front of him.",
    'Good finish work is not speed. It is preparation, patience, and the habit of doing the careful job the same way every time.',
  ],
  industriesTitle: 'Experience across industries',
  industries: [
    'Automotive manufacturing refinishing taught production discipline — metallic paint, surface preparation, and quality control under exacting standards.',
    'Marine work taught how finishes live in sun, salt, and real use — and how owners trust someone with a vessel they care about deeply.',
    'Aviation cosmetic refinishing raised the bar for masking, material control, and finish review. That background informs the standards Best Coatings Solutions holds today. It does not mean the company is an authorized aviation facility, and aircraft work is not booked as regulated maintenance on this site.',
  ],
  whyExistsTitle: 'Why Best Coatings Solutions exists',
  whyExists: [
    'Owners deserve careful preparation, honest recommendations, and respect for the investment they have already made.',
    'Best Coatings Solutions exists to put craftsmanship over shortcuts — to inspect before promising, prepare before finishing, and treat every surface as if the vessel or aircraft belonged to the person doing the work.',
  ],
  standardsTitle: 'Standards that guide every project',
  standardsIntro:
    'These are working principles — the habits behind every repair and refinishing project.',
  standards: [
    {
      id: 'diagnose',
      title: 'Diagnose before repairing',
      body: 'Understand the damage and the correct method before work begins.',
    },
    {
      id: 'prepare',
      title: 'Prepare before finishing',
      body: 'Quality is built in the steps no one photographs — cleaning, fairing, and surface readiness.',
    },
    {
      id: 'match',
      title: 'Match the surrounding surface carefully',
      body: 'Color, gloss, and texture should belong to what is already there.',
    },
    {
      id: 'communicate',
      title: 'Communicate honestly',
      body: 'Explain scope, limits, and realistic expectations without pressure.',
    },
    {
      id: 'inspect',
      title: 'Inspect before completion',
      body: 'Review the finished repair carefully before the project is considered done.',
    },
  ],
  backgroundTitle: 'Professional background',
  backgroundIntro:
    'The following names describe professional background and experience only. They are listed factually and without decorative emphasis.',
  backgroundEntries: [
    {
      id: 'japan-manufacturing',
      label: 'Japan · manufacturing refinishing',
      detail:
        'Professional refinishing began in Japan, including manufacturing refinishing work performed while employed by Aisin Sin Ei, with associated automotive environments including Toyota, Honda, and Mitsubishi.',
    },
    {
      id: 'marine-employers',
      label: 'Marine · employers',
      detail:
        'Marine refinishing experience includes work performed while employed by MarineMax, Nautical Ventures, and HCB Yachts.',
    },
    {
      id: 'vessel-manufacturers',
      label: 'Marine · vessel manufacturers',
      detail:
        'Professional refinishing experience includes work involving vessels from manufacturers such as Azimut, Viking, Riva, Ferretti, De Antonio, Beneteau, Axopar, Sheaffer, and HCB.',
    },
    {
      id: 'aviation-background',
      label: 'Aviation · cosmetic refinishing background',
      detail:
        'Career contributions include refinishing work involving Bombardier business jets and military helicopters. That chapter ends at HCB Yachts — before Best Coatings Solutions.',
    },
  ],
  disclaimerHeading: 'Background disclaimer',
  disclaimer:
    "Employer and manufacturer names are referenced solely to describe Marcelo's professional background and experience. Their inclusion does not imply endorsement, affiliation, authorization, or partnership with Best Coatings Solutions.",
  invitationTitle: 'Discuss a project',
  invitationBody:
    'If you have a finish that needs careful attention, we are glad to talk through what you are seeing and what a responsible next step looks like — without pressure.',
};

export const aboutContentEs: AboutPageContent = {
  metaTitle: 'Conozca a Marcelo | Best Coatings Solutions',
  metaDescription:
    'Conozca a Marcelo de Best Coatings Solutions — refinación profesional desde Japón hasta marina y aviación, ahora cuidando acabados en el Sur de Florida.',
  eyebrow: 'El artesano',
  title: 'Conozca a Marcelo',
  lead: 'Best Coatings Solutions se construye sobre estándares que se sienten en el acabado. Marcelo es el artesano detrás de esa disciplina — aportando décadas de cuidado en refinación a cada proyecto confiado a la empresa.',
  photoNote:
    'La fotografía auténtica de Marcelo en un taller o entorno de proyecto reemplazará este espacio cuando se apruebe. No usamos fotos de banco para inventar un taller.',
  beganTitle: 'Dónde comenzó',
  began: [
    'La carrera de Marcelo en refinación profesional comenzó en Japón. Allí desarrolló aprecio por la precisión, la consistencia y el respeto por la superficie frente a él.',
    'Un buen acabado no es velocidad. Es preparación, paciencia y el hábito de hacer el trabajo cuidadoso de la misma manera cada vez.',
  ],
  industriesTitle: 'Experiencia en distintas industrias',
  industries: [
    'La refinación en manufactura automotriz enseñó disciplina de producción — pintura metálica, preparación de superficie y control de calidad bajo estándares exigentes.',
    'El trabajo marino enseñó cómo viven los acabados bajo sol, sal y uso real — y cómo los dueños confían a alguien una embarcación que les importa profundamente.',
    'La refinación cosmética en aviación elevó el nivel de enmascarado, control de materiales y revisión del acabado. Ese historial informa los estándares que Best Coatings Solutions sostiene hoy. No significa que la empresa sea una instalación de aviación autorizada, y el trabajo de aeronaves no se reserva en este sitio como mantenimiento regulado.',
  ],
  whyExistsTitle: 'Por qué existe Best Coatings Solutions',
  whyExists: [
    'Los dueños merecen preparación cuidadosa, recomendaciones honestas y respeto por la inversión que ya han hecho.',
    'Best Coatings Solutions existe para poner la artesanía por encima de los atajos — inspeccionar antes de prometer, preparar antes de terminar y tratar cada superficie como si la embarcación o la aeronave perteneciera a quien hace el trabajo.',
  ],
  standardsTitle: 'Estándares que guían cada proyecto',
  standardsIntro:
    'Estos son principios de trabajo — los hábitos detrás de cada reparación y proyecto de refinación.',
  standards: [
    {
      id: 'diagnose',
      title: 'Diagnosticar antes de reparar',
      body: 'Entender el daño y el método correcto antes de comenzar.',
    },
    {
      id: 'prepare',
      title: 'Preparar antes de terminar',
      body: 'La calidad se construye en los pasos que nadie fotografía — limpieza, nivelación y preparación de superficie.',
    },
    {
      id: 'match',
      title: 'Igualar con cuidado la superficie alrededor',
      body: 'El color, el brillo y la textura deben pertenecer a lo que ya está allí.',
    },
    {
      id: 'communicate',
      title: 'Comunicar con honestidad',
      body: 'Explicar alcance, límites y expectativas realistas sin presión.',
    },
    {
      id: 'inspect',
      title: 'Inspeccionar antes de concluir',
      body: 'Revisar con cuidado la reparación terminada antes de considerar el proyecto completo.',
    },
  ],
  backgroundTitle: 'Trayectoria profesional',
  backgroundIntro:
    'Los siguientes nombres describen únicamente trayectoria y experiencia profesional. Se enumeran de forma factual y sin énfasis decorativo.',
  backgroundEntries: [
    {
      id: 'japan-manufacturing',
      label: 'Japón · refinación en manufactura',
      detail:
        'La refinación profesional comenzó en Japón, incluyendo trabajo de refinación en manufactura realizado mientras estuvo empleado en Aisin Sin Ei, con entornos automotrices asociados que incluyen Toyota, Honda y Mitsubishi.',
    },
    {
      id: 'marine-employers',
      label: 'Marina · empleadores',
      detail:
        'La experiencia en refinación marina incluye trabajo realizado mientras estuvo empleado en MarineMax, Nautical Ventures y HCB Yachts.',
    },
    {
      id: 'vessel-manufacturers',
      label: 'Marina · fabricantes de embarcaciones',
      detail:
        'La experiencia profesional en refinación incluye trabajo con embarcaciones de fabricantes como Azimut, Viking, Riva, Ferretti, De Antonio, Beneteau, Axopar, Sheaffer y HCB.',
    },
    {
      id: 'aviation-background',
      label: 'Aviación · historial de refinación cosmética',
      detail:
        'Las contribuciones de carrera incluyen trabajo de refinación relacionado con jets de negocios Bombardier y helicópteros militares. Ese capítulo termina en HCB Yachts — antes de Best Coatings Solutions.',
    },
  ],
  disclaimerHeading: 'Aviso sobre trayectoria',
  disclaimer:
    'Los nombres de empleadores y fabricantes se mencionan únicamente para describir la trayectoria y experiencia profesional de Marcelo. Su inclusión no implica respaldo, afiliación, autorización ni asociación con Best Coatings Solutions.',
  invitationTitle: 'Conversemos sobre un proyecto',
  invitationBody:
    'Si tiene un acabado que necesita atención cuidadosa, con gusto hablamos de lo que está viendo y de cuál sería un siguiente paso responsable — sin presión.',
};

export function getAboutContent(locale: 'en' | 'es'): AboutPageContent {
  return locale === 'es' ? aboutContentEs : aboutContentEn;
}
