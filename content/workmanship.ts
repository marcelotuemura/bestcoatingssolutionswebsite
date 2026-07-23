/**
 * Workmanship page content — careful warranty language; owner/legal review notice.
 */

export interface WorkmanshipPageContent {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly sections: readonly {
    readonly id: string;
    readonly title: string;
    readonly body: readonly string[];
  }[];
  readonly legalReviewNotice: string;
  readonly warrantyDisclaimer: string;
  readonly coverageDisclaimer: string;
}

export const workmanshipContentEn: WorkmanshipPageContent = {
  metaTitle: 'Workmanship | Best Coatings Solutions',
  metaDescription:
    'How Best Coatings Solutions approaches inspection, written scope, surface preparation, finish evaluation, and workmanship concerns.',
  eyebrow: 'Quality process',
  title: 'Workmanship',
  lead: 'Our workmanship philosophy emphasizes careful inspection, clear written scope, disciplined surface preparation, and honest finish evaluation — without universal warranty marketing claims.',
  legalReviewNotice:
    'Final warranty details remain an owner and legal review decision. This page describes process philosophy and does not publish binding warranty terms for every repair.',
  warrantyDisclaimer:
    'Warranty terms, when applicable, are defined in the approved written repair scope.',
  coverageDisclaimer:
    'Coverage may depend on the repair type, materials, vessel condition, and documented agreement.',
  sections: [
    {
      id: 'philosophy',
      title: 'Workmanship philosophy',
      body: [
        'We aim for careful, professional marine cosmetic and coatings work aligned to an agreed scope. We avoid absolute marketing language such as guaranteed invisible repairs or flawless results every time.',
      ],
    },
    {
      id: 'inspection',
      title: 'Inspection and documentation',
      body: [
        'Inspection and photos help define condition and access. Documentation habits support clarity for owners and, when requested, project files — without inventing insurance outcomes.',
      ],
    },
    {
      id: 'written-scope',
      title: 'Written repair scope',
      body: [
        'A written repair scope, when prepared, documents inclusions, exclusions, and the agreed approach. Website pages do not replace that vessel-specific agreement.',
      ],
    },
    {
      id: 'surface-prep',
      title: 'Surface preparation',
      body: [
        'Surface preparation is treated as foundational. Surrounding finishes are protected, and preparation boundaries are discussed before repair work proceeds.',
      ],
    },
    {
      id: 'materials',
      title: 'Materials and repair-method considerations',
      body: [
        'Materials and methods are selected for the observed condition and agreed goals. Choices are discussed as part of scope — not as universal product claims on this page.',
      ],
    },
    {
      id: 'finish-evaluation',
      title: 'Finish evaluation',
      body: [
        'Finish evaluation considers color, gloss, and transitions within the agreed area. Lighting and surrounding aged finishes can affect perception; expectations are discussed honestly.',
      ],
    },
    {
      id: 'customer-review',
      title: 'Customer review process',
      body: [
        'When work reaches a review point, we discuss the result against the agreed scope. Additional work outside that scope requires separate authorization.',
      ],
    },
    {
      id: 'post-repair',
      title: 'Post-repair care',
      body: [
        'General care guidance may be shared after repair. Post-repair care does not create coverage for unrelated damage, impact, misuse, vessel movement, pre-existing defects, or maintenance failure.',
      ],
    },
    {
      id: 'separate-evaluation',
      title: 'Conditions requiring separate evaluation',
      body: [
        'Potentially structural concerns, moisture issues, or damage outside the original scope require separate evaluation and agreement before additional repair work.',
      ],
    },
    {
      id: 'concerns',
      title: 'Process for workmanship concerns',
      body: [
        'If you have a workmanship concern related to agreed work, contact Best Coatings Solutions with photos and a clear description. Review follows the approved written repair scope and any applicable warranty terms defined there.',
      ],
    },
  ],
};

export const workmanshipContentEs: WorkmanshipPageContent = {
  metaTitle: 'Mano de obra | Best Coatings Solutions',
  metaDescription:
    'Cómo Best Coatings Solutions aborda la inspección, el alcance escrito, la preparación de superficie, la evaluación del acabado y las preocupaciones de mano de obra.',
  eyebrow: 'Proceso de calidad',
  title: 'Mano de obra',
  lead: 'Nuestra filosofía de mano de obra enfatiza la inspección cuidadosa, el alcance escrito claro, la preparación disciplinada de superficie y la evaluación honesta del acabado — sin afirmaciones universales de garantía en marketing.',
  legalReviewNotice:
    'Los detalles finales de garantía siguen siendo una decisión de revisión del propietario y legal. Esta página describe la filosofía del proceso y no publica términos de garantía vinculantes para cada reparación.',
  warrantyDisclaimer:
    'Los términos de garantía, cuando aplican, se definen en el alcance de reparación escrito aprobado.',
  coverageDisclaimer:
    'La cobertura puede depender del tipo de reparación, los materiales, la condición de la embarcación y el acuerdo documentado.',
  sections: [
    {
      id: 'philosophy',
      title: 'Filosofía de mano de obra',
      body: [
        'Buscamos un trabajo cosmético y de recubrimientos marinos cuidadoso y profesional alineado a un alcance acordado. Evitamos lenguaje absoluto de marketing como reparaciones invisibles garantizadas o resultados impecables siempre.',
      ],
    },
    {
      id: 'inspection',
      title: 'Inspección y documentación',
      body: [
        'La inspección y las fotos ayudan a definir la condición y el acceso. Los hábitos de documentación apoyan la claridad para propietarios y, cuando se solicita, para el expediente del proyecto — sin inventar resultados de seguro.',
      ],
    },
    {
      id: 'written-scope',
      title: 'Alcance escrito de reparación',
      body: [
        'Un alcance escrito de reparación, cuando se prepara, documenta inclusiones, exclusiones y el enfoque acordado. Las páginas del sitio no reemplazan ese acuerdo específico de la embarcación.',
      ],
    },
    {
      id: 'surface-prep',
      title: 'Preparación de superficie',
      body: [
        'La preparación de superficie se trata como fundamento. Se protegen los acabados circundantes y se discuten los límites de preparación antes de proceder con la reparación.',
      ],
    },
    {
      id: 'materials',
      title: 'Consideraciones de materiales y método de reparación',
      body: [
        'Los materiales y métodos se seleccionan según la condición observada y los objetivos acordados. Las opciones se discuten como parte del alcance — no como afirmaciones universales de producto en esta página.',
      ],
    },
    {
      id: 'finish-evaluation',
      title: 'Evaluación del acabado',
      body: [
        'La evaluación del acabado considera color, brillo y transiciones dentro del área acordada. La iluminación y los acabados envejecidos circundantes pueden afectar la percepción; las expectativas se discuten con honestidad.',
      ],
    },
    {
      id: 'customer-review',
      title: 'Proceso de revisión del cliente',
      body: [
        'Cuando el trabajo llega a un punto de revisión, discutimos el resultado frente al alcance acordado. El trabajo adicional fuera de ese alcance requiere autorización separada.',
      ],
    },
    {
      id: 'post-repair',
      title: 'Cuidado posterior a la reparación',
      body: [
        'Puede compartirse orientación general de cuidado después de la reparación. El cuidado posterior no crea cobertura para daño no relacionado, impacto, mal uso, movimiento de la embarcación, defectos preexistentes o falla de mantenimiento.',
      ],
    },
    {
      id: 'separate-evaluation',
      title: 'Condiciones que requieren evaluación separada',
      body: [
        'Preocupaciones potencialmente estructurales, problemas de humedad o daño fuera del alcance original requieren evaluación y acuerdo separados antes de trabajo adicional de reparación.',
      ],
    },
    {
      id: 'concerns',
      title: 'Proceso para preocupaciones de mano de obra',
      body: [
        'Si tiene una preocupación de mano de obra relacionada con trabajo acordado, contacte a Best Coatings Solutions con fotos y una descripción clara. La revisión sigue el alcance de reparación escrito aprobado y cualquier término de garantía aplicable definido allí.',
      ],
    },
  ],
};

export function getWorkmanshipContent(
  locale: 'en' | 'es',
): WorkmanshipPageContent {
  return locale === 'es' ? workmanshipContentEs : workmanshipContentEn;
}
