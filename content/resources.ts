/**
 * Published educational resource catalogue (blog-ready static model).
 * Safe educational topics only — no hazardous DIY structural instructions.
 */

import {
  includeTestFixtures,
  isPubliclyPublishable,
} from '@/config/publication';
import {
  isValidResourceSlug,
  type ResourceRecord as ResourceRecordType,
} from '@/config/resources';

export {
  isValidResourceSlug,
  type ResourceRecord,
  type ResourceCategory,
  type ResourceLocalizedCopy,
  type ResourceSection,
} from '@/config/resources';

function article(partial: ResourceRecordType): ResourceRecordType {
  return partial;
}

export const resourceCatalog: readonly ResourceRecordType[] = [
  article({
    id: 'estimate-information',
    slug: 'information-needed-marine-repair-estimate',
    status: 'published',
    category: 'estimates',
    tags: ['estimates', 'preparation'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: ['gelcoat-repair', 'insurance-repair'],
    relatedResourceSlugs: [
      'how-to-photograph-vessel-damage',
      'questions-before-approving-marine-repair',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'Information needed when requesting a marine repair estimate',
        summary:
          'A practical checklist of details that help BCS review marine cosmetic repair requests clearly — without website pricing.',
        metaTitle: 'Marine Repair Estimate Information | BCS Resources',
        metaDescription:
          'What to share when requesting a marine repair estimate from Best Coatings Solutions in South Florida.',
        sections: [
          {
            id: 'why',
            heading: 'Why clear details matter',
            body: [
              'Marine repair scope depends on vessel condition, access, materials, and the repair method. Sharing clear information helps BCS respond thoughtfully. An estimate request does not confirm an appointment or a final price.',
            ],
          },
          {
            id: 'checklist',
            heading: 'Helpful information to include',
            body: [
              'Vessel type and a general description of size or style when known.',
              'General location (for example, Fort Lauderdale or another South Florida area) — not a private slip number.',
              'A plain-language description of the damage or finish concern.',
              'Well-lit photographs that show context and detail.',
              'Any known access constraints, marina rules, or timing preferences.',
            ],
          },
          {
            id: 'next',
            heading: 'What happens next',
            body: [
              'BCS may request additional photos, ask clarifying questions, or recommend an inspection when appropriate. Free estimates are available only in the Fort Lauderdale area; other locations may require review or travel arrangements.',
            ],
          },
        ],
      },
      es: {
        title:
          'Información necesaria al solicitar un estimado de reparación marina',
        summary:
          'Una lista práctica de detalles que ayudan a BCS a revisar solicitudes de reparación cosmética marina con claridad — sin precios en el sitio.',
        metaTitle:
          'Información para estimado de reparación marina | Recursos BCS',
        metaDescription:
          'Qué compartir al solicitar un estimado de reparación marina a Best Coatings Solutions en el Sur de la Florida.',
        sections: [
          {
            id: 'why',
            heading: 'Por qué importan los detalles claros',
            body: [
              'El alcance de una reparación marina depende de la condición de la embarcación, el acceso, los materiales y el método. Compartir información clara ayuda a BCS a responder con cuidado. Una solicitud de estimado no confirma una cita ni un precio final.',
            ],
          },
          {
            id: 'checklist',
            heading: 'Información útil para incluir',
            body: [
              'Tipo de embarcación y una descripción general del tamaño o estilo cuando se conozca.',
              'Ubicación general (por ejemplo, Fort Lauderdale u otra área del Sur de la Florida) — no un número de atracadero privado.',
              'Una descripción sencilla del daño o la preocupación de acabado.',
              'Fotografías bien iluminadas que muestren contexto y detalle.',
              'Cualquier limitación de acceso, reglas de marina o preferencias de tiempo conocidas.',
            ],
          },
          {
            id: 'next',
            heading: 'Qué ocurre después',
            body: [
              'BCS puede solicitar fotos adicionales, hacer preguntas de aclaración o recomendar una inspección cuando corresponda. Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale; otras ubicaciones pueden requerir revisión o arreglos de viaje.',
            ],
          },
        ],
      },
    },
  }),
  article({
    id: 'photograph-damage',
    slug: 'how-to-photograph-vessel-damage',
    status: 'published',
    category: 'photography',
    tags: ['photography', 'estimates'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: [
      'gelcoat-repair',
      'fiberglass-repair',
      'color-matching',
    ],
    relatedResourceSlugs: [
      'information-needed-marine-repair-estimate',
      'preparing-for-vessel-inspection',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'How to photograph vessel damage',
        summary:
          'Simple photo practices that support estimate review without replacing professional inspection.',
        metaTitle: 'How to Photograph Vessel Damage | BCS Resources',
        metaDescription:
          'Practical guidance for photographing marine cosmetic damage before requesting an estimate.',
        sections: [
          {
            id: 'goals',
            heading: 'What good photos help with',
            body: [
              'Clear photos help BCS understand location, scale, and surface condition. They support conversation — they do not replace inspection when color matching, layered damage, or uncertain substrate conditions need closer review.',
            ],
          },
          {
            id: 'practices',
            heading: 'Helpful practices',
            body: [
              'Use natural light when possible and avoid heavy filters.',
              'Include a wide shot for context and close shots for detail.',
              'Keep the camera steady and shoot from a few angles.',
              'Show nearby panels when color continuity matters.',
              'Do not include private documents, claim numbers, or unnecessary personal information in the frame.',
            ],
          },
          {
            id: 'limits',
            heading: 'Limits of photography',
            body: [
              'Photos may not reveal soft spots, moisture concerns, or structural issues. If damage looks uncertain or potentially structural, request professional evaluation rather than relying on photos alone.',
            ],
          },
        ],
      },
      es: {
        title: 'Cómo fotografiar el daño de una embarcación',
        summary:
          'Prácticas simples de fotografía que apoyan la revisión de estimados sin reemplazar una inspección profesional.',
        metaTitle: 'Cómo fotografiar el daño de una embarcación | Recursos BCS',
        metaDescription:
          'Orientación práctica para fotografiar daño cosmético marino antes de solicitar un estimado.',
        sections: [
          {
            id: 'goals',
            heading: 'Para qué ayudan las buenas fotos',
            body: [
              'Las fotos claras ayudan a BCS a entender la ubicación, la escala y la condición de la superficie. Apoyan la conversación — no reemplazan la inspección cuando la igualación de color, el daño en capas o condiciones inciertas del sustrato necesitan una revisión más cercana.',
            ],
          },
          {
            id: 'practices',
            heading: 'Prácticas útiles',
            body: [
              'Use luz natural cuando sea posible y evite filtros fuertes.',
              'Incluya una toma amplia para contexto y tomas cercanas para detalle.',
              'Mantenga la cámara estable y fotografíe desde varios ángulos.',
              'Muestre paneles cercanos cuando importe la continuidad del color.',
              'No incluya documentos privados, números de reclamo ni información personal innecesaria en el encuadre.',
            ],
          },
          {
            id: 'limits',
            heading: 'Límites de la fotografía',
            body: [
              'Las fotos pueden no revelar zonas blandas, humedad o problemas estructurales. Si el daño parece incierto o potencialmente estructural, solicite evaluación profesional en lugar de confiar solo en las fotos.',
            ],
          },
        ],
      },
    },
  }),
  article({
    id: 'cosmetic-vs-structural',
    slug: 'cosmetic-versus-structural-fiberglass-damage',
    status: 'published',
    category: 'damage-assessment',
    tags: ['fiberglass', 'safety'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: ['fiberglass-repair', 'structural-composite-repair'],
    relatedResourceSlugs: [
      'common-signs-of-gelcoat-damage',
      'questions-before-approving-marine-repair',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'Cosmetic versus potentially structural fiberglass damage',
        summary:
          'Educational distinctions to help owners know when professional evaluation is especially important.',
        metaTitle: 'Cosmetic vs Structural Fiberglass Damage | BCS',
        metaDescription:
          'Educational overview of cosmetic versus potentially structural fiberglass concerns — not engineering advice.',
        sections: [
          {
            id: 'cosmetic',
            heading: 'Often cosmetic concerns',
            body: [
              'Surface chips, shallow scratches, and localized gelcoat issues are often primarily cosmetic. Even then, scope should be confirmed after review — website content is not a vessel-specific diagnosis.',
            ],
          },
          {
            id: 'caution',
            heading: 'When extra caution is warranted',
            body: [
              'Deep cracks, impact areas with soft feel, moisture staining, delamination signs, or damage near structural members deserve professional evaluation. Do not treat general articles as structural engineering conclusions.',
            ],
          },
          {
            id: 'diy',
            heading: 'Why we avoid DIY structural instructions',
            body: [
              'This resource does not provide instructions for grinding fiberglass, spraying coatings, structural laminate repair, resin catalyst ratios, hazardous chemical handling, or confined-space coating work. Those activities can involve serious safety and structural risks.',
            ],
          },
        ],
      },
      es: {
        title:
          'Daño cosmético frente a daño potencialmente estructural en fibra de vidrio',
        summary:
          'Distinciones educativas para ayudar a los propietarios a saber cuándo la evaluación profesional es especialmente importante.',
        metaTitle: 'Daño cosmético vs estructural en fibra de vidrio | BCS',
        metaDescription:
          'Resumen educativo de preocupaciones cosméticas frente a potencialmente estructurales — no es asesoría de ingeniería.',
        sections: [
          {
            id: 'cosmetic',
            heading: 'Preocupaciones a menudo cosméticas',
            body: [
              'Astillas superficiales, rayones poco profundos y problemas localizados de gelcoat suelen ser principalmente cosméticos. Aun así, el alcance debe confirmarse después de la revisión — el contenido del sitio no es un diagnóstico específico de la embarcación.',
            ],
          },
          {
            id: 'caution',
            heading: 'Cuándo conviene mayor precaución',
            body: [
              'Grietas profundas, zonas de impacto con sensación blanda, manchas de humedad, signos de delaminación o daño cerca de miembros estructurales merecen evaluación profesional. No trate artículos generales como conclusiones de ingeniería estructural.',
            ],
          },
          {
            id: 'diy',
            heading:
              'Por qué evitamos instrucciones estructurales de bricolaje',
            body: [
              'Este recurso no proporciona instrucciones para moler fibra de vidrio, pulverizar recubrimientos, reparación estructural de laminados, proporciones de catalizador de resina, manejo de químicos peligrosos ni trabajo de recubrimiento en espacios confinados. Esas actividades pueden implicar riesgos serios de seguridad y estructurales.',
            ],
          },
        ],
      },
    },
  }),
  article({
    id: 'gelcoat-signs',
    slug: 'common-signs-of-gelcoat-damage',
    status: 'published',
    category: 'gelcoat',
    tags: ['gelcoat'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: ['gelcoat-repair', 'color-matching'],
    relatedResourceSlugs: [
      'why-color-matching-may-require-inspection',
      'cosmetic-versus-structural-fiberglass-damage',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'Common signs of gelcoat damage',
        summary:
          'An educational overview of gelcoat wear and damage patterns owners often notice.',
        metaTitle: 'Common Signs of Gelcoat Damage | BCS Resources',
        metaDescription:
          'Learn common gelcoat damage signs and when to request a professional marine repair review.',
        sections: [
          {
            id: 'signs',
            heading: 'Signs owners often notice',
            body: [
              'Oxidation or chalking on exposed surfaces.',
              'Spider cracks or stress cracking.',
              'Chips, gouges, and impact marks.',
              'Faded accents or mismatched previous repairs.',
              'Loss of gloss compared with protected areas.',
            ],
          },
          {
            id: 'next-step',
            heading: 'Recommended next step',
            body: [
              'If you notice these signs, share clear photos and request a review. BCS can discuss whether cosmetic gelcoat repair is appropriate after evaluating the area — without inventing outcomes from a webpage alone.',
            ],
          },
        ],
      },
      es: {
        title: 'Señales comunes de daño en el gelcoat',
        summary:
          'Un resumen educativo de patrones de desgaste y daño del gelcoat que los propietarios suelen notar.',
        metaTitle: 'Señales comunes de daño en gelcoat | Recursos BCS',
        metaDescription:
          'Conozca señales comunes de daño en gelcoat y cuándo solicitar una revisión profesional de reparación marina.',
        sections: [
          {
            id: 'signs',
            heading: 'Señales que suelen notar los propietarios',
            body: [
              'Oxidación o aspecto tizado en superficies expuestas.',
              'Grietas tipo telaraña o agrietamiento por estrés.',
              'Astillas, ranuras y marcas de impacto.',
              'Acentos desteñidos o reparaciones previas desparejas.',
              'Pérdida de brillo en comparación con áreas protegidas.',
            ],
          },
          {
            id: 'next-step',
            heading: 'Siguiente paso recomendado',
            body: [
              'Si nota estas señales, comparta fotos claras y solicite una revisión. BCS puede discutir si una reparación cosmética de gelcoat es apropiada después de evaluar el área — sin inventar resultados solo desde una página web.',
            ],
          },
        ],
      },
    },
  }),
  article({
    id: 'color-matching-inspection',
    slug: 'why-color-matching-may-require-inspection',
    status: 'published',
    category: 'color-matching',
    tags: ['color-matching', 'inspections'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: [
      'color-matching',
      'gelcoat-repair',
      'paint-refinishing',
    ],
    relatedResourceSlugs: [
      'common-signs-of-gelcoat-damage',
      'preparing-for-vessel-inspection',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'Why color matching may require inspection',
        summary:
          'How aging, lighting, and surrounding panels influence marine color work planning.',
        metaTitle: 'Why Color Matching May Require Inspection | BCS',
        metaDescription:
          'Educational guidance on why marine color matching often benefits from on-site evaluation.',
        sections: [
          {
            id: 'why',
            heading: 'Why photos are not always enough',
            body: [
              'Marine finishes age unevenly. Lighting, camera white balance, texture, and nearby panels can make a photo look different from the vessel in person. Inspection helps plan an appropriate color approach.',
            ],
          },
          {
            id: 'expectations',
            heading: 'Setting careful expectations',
            body: [
              'BCS gives careful attention to color and finish, but does not guarantee perfect or permanent color matching. Outcomes depend on substrate condition, aging, materials, and the agreed repair scope.',
            ],
          },
        ],
      },
      es: {
        title: 'Por qué la igualación de color puede requerir inspección',
        summary:
          'Cómo el envejecimiento, la iluminación y los paneles circundantes influyen en la planificación del trabajo de color marino.',
        metaTitle:
          'Por qué la igualación de color puede requerir inspección | BCS',
        metaDescription:
          'Orientación educativa sobre por qué la igualación de color marina a menudo se beneficia de una evaluación en el sitio.',
        sections: [
          {
            id: 'why',
            heading: 'Por qué las fotos no siempre bastan',
            body: [
              'Los acabados marinos envejecen de forma desigual. La iluminación, el balance de blancos de la cámara, la textura y los paneles cercanos pueden hacer que una foto se vea distinta a la embarcación en persona. La inspección ayuda a planificar un enfoque de color adecuado.',
            ],
          },
          {
            id: 'expectations',
            heading: 'Expectativas cuidadosas',
            body: [
              'BCS presta atención cuidadosa al color y al acabado, pero no garantiza una igualación de color perfecta o permanente. Los resultados dependen de la condición del sustrato, el envejecimiento, los materiales y el alcance de reparación acordado.',
            ],
          },
        ],
      },
    },
  }),
  article({
    id: 'prepare-inspection',
    slug: 'preparing-for-vessel-inspection',
    status: 'published',
    category: 'inspections',
    tags: ['inspections', 'preparation'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: [
      'gelcoat-repair',
      'fiberglass-repair',
      'hull-restoration',
    ],
    relatedResourceSlugs: [
      'how-to-photograph-vessel-damage',
      'understanding-written-marine-repair-scope',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'Preparing for a vessel inspection',
        summary:
          'Practical preparation tips that support a clear on-site review when inspection is appropriate.',
        metaTitle: 'Preparing for a Vessel Inspection | BCS Resources',
        metaDescription:
          'How to prepare your vessel for a marine repair inspection with Best Coatings Solutions.',
        sections: [
          {
            id: 'before',
            heading: 'Before the visit',
            body: [
              'Share marina or site rules early.',
              'Confirm general location and access instructions without publishing private slip details on public pages.',
              'Clear personal items from the immediate work area when safe and appropriate.',
              'Have prior photos or notes ready if damage has changed over time.',
            ],
          },
          {
            id: 'during',
            heading: 'During the review',
            body: [
              'Expect questions about history of the damage, previous repairs, and goals for the finish. Inspection supports scope planning — it does not by itself approve insurance coverage or confirm a final appointment calendar entry unless separately arranged.',
            ],
          },
        ],
      },
      es: {
        title: 'Preparación para una inspección de embarcación',
        summary:
          'Consejos prácticos de preparación que apoyan una revisión clara en el sitio cuando la inspección es apropiada.',
        metaTitle: 'Preparación para inspección de embarcación | Recursos BCS',
        metaDescription:
          'Cómo preparar su embarcación para una inspección de reparación marina con Best Coatings Solutions.',
        sections: [
          {
            id: 'before',
            heading: 'Antes de la visita',
            body: [
              'Comparta con anticipación las reglas de la marina o del sitio.',
              'Confirme la ubicación general y las instrucciones de acceso sin publicar detalles privados de atracadero en páginas públicas.',
              'Retire objetos personales del área inmediata de trabajo cuando sea seguro y apropiado.',
              'Tenga listas fotos o notas previas si el daño ha cambiado con el tiempo.',
            ],
          },
          {
            id: 'during',
            heading: 'Durante la revisión',
            body: [
              'Espere preguntas sobre el historial del daño, reparaciones previas y objetivos de acabado. La inspección apoya la planificación del alcance — por sí sola no aprueba cobertura de seguro ni confirma una cita en el calendario salvo que se coordine por separado.',
            ],
          },
        ],
      },
    },
  }),
  article({
    id: 'questions-before-approve',
    slug: 'questions-before-approving-marine-repair',
    status: 'published',
    category: 'scope',
    tags: ['scope', 'communication'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: ['yacht-cosmetic-repair', 'insurance-repair'],
    relatedResourceSlugs: [
      'understanding-written-marine-repair-scope',
      'information-needed-marine-repair-estimate',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'Questions to ask before approving marine repair work',
        summary:
          'A communication checklist for owners reviewing a proposed marine repair scope.',
        metaTitle: 'Questions Before Approving Marine Repair | BCS',
        metaDescription:
          'Helpful questions to ask before approving a written marine repair scope.',
        sections: [
          {
            id: 'questions',
            heading: 'Useful questions',
            body: [
              'What areas are included — and what is intentionally excluded?',
              'What preparation steps are planned for the surrounding finish?',
              'How will color and gloss goals be approached?',
              'What access, weather, or marina constraints could affect timing?',
              'Where are warranty terms, when applicable, documented?',
              'What photos or notes will be shared during or after the work?',
            ],
          },
          {
            id: 'honesty',
            heading: 'Honest scope discussion',
            body: [
              'Clear questions help avoid misunderstandings. BCS values honest scope discussion over absolute promises such as guaranteed invisible repairs or fixed turnaround guarantees on a webpage.',
            ],
          },
        ],
      },
      es: {
        title: 'Preguntas antes de aprobar un trabajo de reparación marina',
        summary:
          'Una lista de comunicación para propietarios que revisan un alcance propuesto de reparación marina.',
        metaTitle: 'Preguntas antes de aprobar reparación marina | BCS',
        metaDescription:
          'Preguntas útiles antes de aprobar un alcance escrito de reparación marina.',
        sections: [
          {
            id: 'questions',
            heading: 'Preguntas útiles',
            body: [
              '¿Qué áreas están incluidas — y qué queda intencionalmente excluido?',
              '¿Qué pasos de preparación se planean para el acabado circundante?',
              '¿Cómo se abordarán los objetivos de color y brillo?',
              '¿Qué limitaciones de acceso, clima o marina podrían afectar el tiempo?',
              '¿Dónde se documentan los términos de garantía, cuando aplican?',
              '¿Qué fotos o notas se compartirán durante o después del trabajo?',
            ],
          },
          {
            id: 'honesty',
            heading: 'Discusión honesta del alcance',
            body: [
              'Las preguntas claras ayudan a evitar malentendidos. BCS valora la discusión honesta del alcance por encima de promesas absolutas como reparaciones invisibles garantizadas o plazos fijos garantizados en una página web.',
            ],
          },
        ],
      },
    },
  }),
  article({
    id: 'written-scope',
    slug: 'understanding-written-marine-repair-scope',
    status: 'published',
    category: 'scope',
    tags: ['scope', 'documentation'],
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: ['insurance-repair', 'yacht-cosmetic-repair'],
    relatedResourceSlugs: [
      'questions-before-approving-marine-repair',
      'information-needed-marine-repair-estimate',
    ],
    ownerApprovalStatus: 'approved',
    copy: {
      en: {
        title: 'Understanding a written marine repair scope',
        summary:
          'What a written repair scope is for — and what website pages are not.',
        metaTitle: 'Understanding a Written Marine Repair Scope | BCS',
        metaDescription:
          'Educational overview of written marine repair scopes, documentation, and warranty wording boundaries.',
        sections: [
          {
            id: 'purpose',
            heading: 'Purpose of a written scope',
            body: [
              'A written repair scope documents the agreed work, materials considerations, and boundaries of the project. Website education pages explain concepts; they do not replace the approved written agreement for a specific vessel.',
            ],
          },
          {
            id: 'warranty',
            heading: 'Warranty wording',
            body: [
              'Warranty terms, when applicable, are defined in the approved written repair scope. Coverage may depend on the repair type, materials, vessel condition, and documented agreement. This website does not publish a lifetime warranty or a universal warranty duration.',
            ],
          },
          {
            id: 'insurance',
            heading: 'Insurance note',
            body: [
              'A repair estimate or written scope does not determine insurance policy coverage. Coverage decisions belong to the customer and the insurer.',
            ],
          },
        ],
      },
      es: {
        title: 'Cómo entender un alcance escrito de reparación marina',
        summary:
          'Para qué sirve un alcance escrito de reparación — y qué no son las páginas del sitio.',
        metaTitle:
          'Cómo entender un alcance escrito de reparación marina | BCS',
        metaDescription:
          'Resumen educativo de alcances escritos de reparación marina, documentación y límites del lenguaje de garantía.',
        sections: [
          {
            id: 'purpose',
            heading: 'Propósito de un alcance escrito',
            body: [
              'Un alcance escrito de reparación documenta el trabajo acordado, consideraciones de materiales y los límites del proyecto. Las páginas educativas del sitio explican conceptos; no reemplazan el acuerdo escrito aprobado para una embarcación específica.',
            ],
          },
          {
            id: 'warranty',
            heading: 'Lenguaje de garantía',
            body: [
              'Los términos de garantía, cuando aplican, se definen en el alcance de reparación escrito aprobado. La cobertura puede depender del tipo de reparación, los materiales, la condición de la embarcación y el acuerdo documentado. Este sitio no publica una garantía de por vida ni una duración de garantía universal.',
            ],
          },
          {
            id: 'insurance',
            heading: 'Nota sobre seguro',
            body: [
              'Un estimado de reparación o un alcance escrito no determina la cobertura de la póliza de seguro. Las decisiones de cobertura corresponden al cliente y a la aseguradora.',
            ],
          },
        ],
      },
    },
  }),
] as const;

/** Draft / coming-soon samples for filtering tests — never public. */
export const resourceStatusSamples: readonly ResourceRecordType[] = [
  article({
    id: 'draft-sample',
    slug: 'draft-sample-resource',
    status: 'draft',
    category: 'general',
    tags: ['draft'],
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: [],
    relatedResourceSlugs: [],
    ownerApprovalStatus: 'pending',
    copy: {
      en: {
        title: 'Draft sample resource',
        summary: 'Draft — not public',
        metaTitle: 'Draft',
        metaDescription: 'Draft resource excluded from sitemap.',
        sections: [],
      },
      es: {
        title: 'Recurso de muestra en borrador',
        summary: 'Borrador — no público',
        metaTitle: 'Borrador',
        metaDescription: 'Recurso en borrador excluido del sitemap.',
        sections: [],
      },
    },
  }),
  article({
    id: 'coming-soon-sample',
    slug: 'coming-soon-sample-resource',
    status: 'coming-soon',
    category: 'general',
    tags: ['coming-soon'],
    authorDisplayName: 'Best Coatings Solutions',
    relatedServiceSlugs: [],
    relatedResourceSlugs: [],
    ownerApprovalStatus: 'pending',
    copy: {
      en: {
        title: 'Coming soon sample resource',
        summary: 'Coming soon — not public',
        metaTitle: 'Coming soon',
        metaDescription: 'Coming-soon resource excluded from sitemap.',
        sections: [],
      },
      es: {
        title: 'Recurso de muestra próximamente',
        summary: 'Próximamente — no público',
        metaTitle: 'Próximamente',
        metaDescription: 'Recurso próximamente excluido del sitemap.',
        sections: [],
      },
    },
  }),
] as const;

export const resourceTestFixture: ResourceRecordType = article({
  id: 'test-fixture-resource',
  slug: 'test-fixture-resource',
  status: 'published',
  category: 'general',
  tags: ['test'],
  authorDisplayName: 'Best Coatings Solutions',
  relatedServiceSlugs: ['gelcoat-repair'],
  relatedResourceSlugs: [],
  ownerApprovalStatus: 'approved',
  isTestFixture: true,
  publishedAt: '2026-01-01',
  updatedAt: '2026-01-01',
  copy: {
    en: {
      title: 'TEST FIXTURE — Resource (not public content)',
      summary: 'Test-only resource fixture excluded from production sitemap.',
      metaTitle: 'Test Fixture Resource',
      metaDescription: 'Test fixture resource — not for production listing.',
      sections: [
        {
          id: 'note',
          heading: 'Test only',
          body: ['This fixture exists for automated tests only.'],
        },
      ],
    },
    es: {
      title: 'FIXTURE DE PRUEBA — Recurso (no es contenido público)',
      summary: 'Fixture de recurso solo para pruebas; excluido del sitemap.',
      metaTitle: 'Recurso fixture de prueba',
      metaDescription: 'Recurso fixture — no para listado de producción.',
      sections: [
        {
          id: 'note',
          heading: 'Solo prueba',
          body: ['Este fixture existe solo para pruebas automatizadas.'],
        },
      ],
    },
  },
});

export function getPublishedResources(): readonly ResourceRecordType[] {
  return resourceCatalog.filter(isPubliclyPublishable);
}

export function getVisibleResources(): readonly ResourceRecordType[] {
  const published = getPublishedResources();
  if (includeTestFixtures()) {
    return [...published, resourceTestFixture];
  }
  return published;
}

export function getResourceBySlug(
  slug: string,
): ResourceRecordType | undefined {
  if (!isValidResourceSlug(slug)) {
    return undefined;
  }
  const published = resourceCatalog.find(
    (resource) => resource.slug === slug && isPubliclyPublishable(resource),
  );
  if (published) {
    return published;
  }
  if (includeTestFixtures() && resourceTestFixture.slug === slug) {
    return resourceTestFixture;
  }
  return undefined;
}

export function getRelatedResources(
  resource: ResourceRecordType,
  limit = 3,
): readonly ResourceRecordType[] {
  const bySlug = resource.relatedResourceSlugs
    .map((slug) => getResourceBySlug(slug))
    .filter((item): item is ResourceRecordType => item !== undefined);
  if (bySlug.length > 0) {
    return bySlug.slice(0, limit);
  }
  return getPublishedResources()
    .filter(
      (candidate) =>
        candidate.id !== resource.id &&
        candidate.category === resource.category,
    )
    .slice(0, limit);
}

export function getSitemapResources(): readonly ResourceRecordType[] {
  return getPublishedResources();
}
