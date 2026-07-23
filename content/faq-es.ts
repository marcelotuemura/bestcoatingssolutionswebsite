/**
 * Central FAQ answers (Spanish) — mirrors English structure and ids.
 */

import type { FaqCategoryContent } from '@/content/faq-en';

export const faqContentEs: readonly FaqCategoryContent[] = [
  {
    id: 'estimates',
    title: 'Estimados',
    description:
      'Cómo funcionan los estimados de reparación marina en Best Coatings Solutions.',
    items: [
      {
        id: 'estimates-free',
        question: '¿Los estimados son gratuitos?',
        answer:
          'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje. Una solicitud de estimado no confirma una cita ni un precio final.',
      },
      {
        id: 'estimates-instant',
        question: '¿Puedo obtener un estimado instantáneo en línea?',
        answer:
          'No. No ofrecemos precios instantáneos en el sitio web. El alcance depende de la condición de la embarcación, el acceso, los materiales y el método de reparación, que se revisan después de compartir detalles y fotos cuando sea útil.',
      },
      {
        id: 'estimates-what-needed',
        question: '¿Qué información ayuda para solicitar un estimado?',
        answer:
          'Detalles útiles incluyen el tipo de embarcación, la ubicación general, una descripción clara del daño y fotografías bien iluminadas. Puede solicitarse información adicional o una inspección antes de preparar un alcance escrito.',
      },
    ],
  },
  {
    id: 'inspections',
    title: 'Inspecciones',
    description:
      'Cuándo y cómo las inspecciones apoyan la planificación de la reparación.',
    items: [
      {
        id: 'inspections-when',
        question: '¿Cuándo se necesita una inspección en el sitio?',
        answer:
          'Algunas reparaciones cosméticas pueden comenzar con fotos claras. La igualación de color, el daño en capas, las limitaciones de acceso o condiciones inciertas del sustrato a menudo se benefician de una evaluación en el sitio antes del alcance final.',
      },
      {
        id: 'inspections-diagnosis',
        question: '¿Un FAQ del sitio diagnostica mi embarcación?',
        answer:
          'No. El contenido general del sitio es educativo. Los requisitos reales de reparación dependen de la inspección y de la condición de la embarcación. El daño incierto o potencialmente estructural debe recibir evaluación profesional.',
      },
    ],
  },
  {
    id: 'gelcoat-repair',
    title: 'Reparación de gelcoat',
    description: 'Preguntas frecuentes sobre restauración de gelcoat.',
    items: [
      {
        id: 'gelcoat-what',
        question: '¿Qué tipos de problemas de gelcoat se pueden abordar?',
        answer:
          'El trabajo cosmético típico de gelcoat incluye astillas, ranuras, oxidación y refinación localizada cuando las condiciones lo permiten. El alcance se confirma después de la revisión — no a partir de supuestos del sitio.',
      },
      {
        id: 'gelcoat-invisible',
        question: '¿La reparación será invisible?',
        answer:
          'Trabajamos con cuidado hacia un acabado cohesivo, pero no garantizamos reparaciones invisibles. Los resultados dependen de la extensión del daño, la condición del acabado circundante, la iluminación y el alcance acordado.',
      },
    ],
  },
  {
    id: 'fiberglass-repair',
    title: 'Reparación de fibra de vidrio',
    description:
      'Preguntas sobre reparación cosmética y de compuestos de fibra de vidrio.',
    items: [
      {
        id: 'fiberglass-cosmetic-vs-structural',
        question: '¿Todo el daño de fibra de vidrio es cosmético?',
        answer:
          'No. Parte del daño es principalmente cosmético; otras condiciones pueden involucrar la integridad del laminado. Cuando el daño es incierto o potencialmente estructural, corresponde una evaluación profesional antes de planificar la reparación.',
      },
      {
        id: 'fiberglass-diy',
        question:
          '¿Debo intentar una reparación estructural de fibra de vidrio por mi cuenta?',
        answer:
          'No proporcionamos instrucciones peligrosas de bricolaje para reparaciones estructurales. El lijado, el laminado y trabajos relacionados pueden implicar riesgos de seguridad y estructurales. Busque evaluación profesional ante daño incierto.',
      },
    ],
  },
  {
    id: 'paint-refinishing',
    title: 'Pintura y refinación',
    description: 'Preguntas sobre sistemas de pintura y refinación marina.',
    items: [
      {
        id: 'paint-scope',
        question: '¿Cómo se decide el alcance de pintura o refinación?',
        answer:
          'El alcance depende de la condición del recubrimiento existente, las necesidades de preparación, los objetivos de color y el acceso. Un alcance de reparación escrito, cuando se prepara, define el trabajo acordado — las páginas del sitio no reemplazan ese acuerdo.',
      },
    ],
  },
  {
    id: 'structural-composite-repair',
    title: 'Reparación estructural de compuestos',
    description:
      'Preguntas sobre trabajo de compuestos que puede ir más allá de lo cosmético.',
    items: [
      {
        id: 'structural-evaluation',
        question: '¿Confirman conclusiones de ingeniería estructural en línea?',
        answer:
          'No. El contenido del sitio no es asesoría de ingeniería estructural. Las condiciones que puedan afectar la integridad requieren evaluación profesional, y los métodos de reparación se planifican a partir de la inspección — no de artículos generales.',
      },
    ],
  },
  {
    id: 'color-matching',
    title: 'Igualación de color',
    description:
      'Por qué el trabajo de color a menudo requiere evaluación cuidadosa.',
    items: [
      {
        id: 'color-inspection',
        question: '¿Por qué la igualación de color puede requerir inspección?',
        answer:
          'Los acabados marinos envejecen de forma desigual bajo el sol, el agua y reparaciones previas. Las fotos ayudan, pero la iluminación, la textura y los paneles circundantes a menudo requieren evaluación en persona para planificar un enfoque de igualación adecuado.',
      },
      {
        id: 'color-guarantee',
        question: '¿Garantizan una igualación de color perfecta?',
        answer:
          'No. Prestamos atención cuidadosa al color y al acabado, pero no garantizamos una igualación de color perfecta o permanente. Los resultados dependen del sustrato, el envejecimiento, los materiales y el enfoque acordado.',
      },
    ],
  },
  {
    id: 'insurance-related-repairs',
    title: 'Reparaciones relacionadas con seguro',
    description:
      'Cómo BCS apoya conversaciones de reparación marina relacionadas con seguro.',
    items: [
      {
        id: 'insurance-coverage',
        question: '¿BCS garantiza la aprobación del reclamo de seguro?',
        answer:
          'No. Las decisiones de cobertura corresponden al cliente y a la aseguradora. Un estimado de reparación no determina la cobertura de la póliza, y BCS no garantiza la aprobación del reclamo.',
      },
      {
        id: 'insurance-adjuster',
        question: '¿Actúan como ajustadores públicos o representantes legales?',
        answer:
          'No. BCS no ofrece servicios de ajustador público, representación legal ni autoridad para interpretar pólizas de seguro. Nos enfocamos en el alcance de reparación, hábitos de documentación y la mano de obra acordada.',
      },
      {
        id: 'insurance-preferred',
        question: '¿Son proveedor preferido de todas las aseguradoras?',
        answer:
          'No reclamamos estatus de proveedor preferido para todas las aseguradoras, ni prometemos facturación directa a todas. Los arreglos de facturación y documentación se discuten después de aclarar el alcance.',
      },
    ],
  },
  {
    id: 'vessel-preparation',
    title: 'Preparación de la embarcación',
    description:
      'Cómo los propietarios pueden prepararse para visitas de inspección o reparación.',
    items: [
      {
        id: 'prep-access',
        question: '¿Cómo debo preparar la embarcación para una visita?',
        answer:
          'Facilite acceso claro al área de reparación, asegure la embarcación según lo requiera el muelle o la ubicación, y comparta cualquier regla del sitio con anticipación. Los pasos específicos se confirman cuando se coordina una visita.',
      },
    ],
  },
  {
    id: 'vessel-access',
    title: 'Acceso a la embarcación',
    description: 'Reglas de marinas, astilleros y condiciones de trabajo.',
    items: [
      {
        id: 'access-marina',
        question: '¿Pueden trabajar en mi marina?',
        answer:
          'Cuando las reglas de la marina, el clima y las condiciones lo permiten, el servicio móvil puede ser posible en el sitio. Mencionar el Sur de la Florida no significa que cada marina o ubicación esté disponible para cada trabajo.',
      },
    ],
  },
  {
    id: 'damage-photography',
    title: 'Fotografía del daño',
    description: 'Prácticas útiles de foto al solicitar un estimado.',
    items: [
      {
        id: 'photos-tips',
        question: '¿Cómo debo fotografiar el daño de la embarcación?',
        answer:
          'Use luz natural cuando sea posible, incluya tomas amplias de contexto y detalles cercanos, mantenga la cámara estable y evite filtros fuertes. Las fotos apoyan la revisión; no reemplazan la inspección cuando las condiciones no son claras.',
      },
    ],
  },
  {
    id: 'scheduling',
    title: 'Programación',
    description: 'Cómo se discuten las visitas y los tiempos.',
    items: [
      {
        id: 'scheduling-confirm',
        question: '¿Enviar un formulario confirma una cita?',
        answer:
          'No. El envío del formulario solicita una respuesta — no confirma una cita, respuesta de emergencia ni un tiempo de entrega garantizado. El tiempo depende del alcance, el acceso, el clima y la disponibilidad.',
      },
    ],
  },
  {
    id: 'workmanship',
    title: 'Mano de obra',
    description: 'Cómo se maneja el lenguaje de mano de obra y garantía.',
    items: [
      {
        id: 'workmanship-warranty',
        question: '¿Qué garantía aplica a las reparaciones?',
        answer:
          'Los términos de garantía, cuando aplican, se definen en el alcance de reparación escrito aprobado. La cobertura puede depender del tipo de reparación, los materiales, la condición de la embarcación y el acuerdo documentado. Las páginas del sitio no crean un período de garantía universal.',
      },
      {
        id: 'workmanship-lifetime',
        question: '¿Ofrecen garantía de por vida?',
        answer:
          'No publicamos una garantía de por vida ni una duración de garantía universal en el sitio. Los detalles finales de garantía siguen siendo una decisión de revisión del propietario y legal para cada alcance aprobado.',
      },
    ],
  },
  {
    id: 'service-area',
    title: 'Área de servicio',
    description:
      'Dónde BCS enfoca hoy las conversaciones de reparación marina.',
    items: [
      {
        id: 'service-area-where',
        question: '¿Dónde prestan servicio?',
        answer:
          'Best Coatings Solutions se enfoca en el Sur de la Florida, desde Jupiter hacia el sur. Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Los proyectos fuera del área normal pueden considerarse por acuerdo.',
      },
      {
        id: 'service-area-address',
        question: '¿Cuál es la dirección del taller?',
        answer:
          'No se publica una dirección física pública en este sitio a menos que el propietario lo apruebe. Contacte a BCS por teléfono o correo para detalles de ubicación y acceso relevantes a su embarcación.',
      },
    ],
  },
] as const;
