import type {
  MarineServiceContentKey,
  ServicePageContent,
} from '@/content/marine-services-en';

function service(partial: ServicePageContent): ServicePageContent {
  return partial;
}

export const marineServiceContentEs: Record<
  MarineServiceContentKey,
  ServicePageContent
> = {
  gelcoatRepair: service({
    title: 'Reparación de gelcoat',
    metaTitle: 'Reparación de gelcoat | Best Coatings Solutions',
    metaDescription:
      'Restaure gelcoat dañado cuidando el aspecto del acabado original. Reparación marina móvil en el sur de Florida.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Restaure gelcoat dañado preservando la apariencia y la integridad del acabado original de su embarcación.',
    overview:
      'El gelcoat sufre con el sol, el atracadero y el tiempo. Inspeccionamos la zona, preparamos la superficie, reparamos lo que hay debajo cuando hace falta y coincidimos el acabado de alrededor antes del pulido final. Trabajamos en marina, astillero o residencia cuando las condiciones lo permiten. No publicamos precios en línea.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Oxidación y tiza',
      'Grietas por estrés y craqueo fino',
      'Astillas y golpes',
      'Reparaciones viejas que ya no coinciden',
      'Acentos y franjas desvanecidos',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Inspeccionar',
        body: 'Revisamos el daño, el acabado de alrededor y el acceso antes de elegir el método.',
      },
      {
        title: 'Preparar',
        body: 'Protegemos superficies cercanas, abrimos la zona dañada y nivelamos con cuidado.',
      },
      {
        title: 'Reparar y coincidir',
        body: 'Reconstruimos el sistema de gelcoat y coincidimos el color para que la reparación pertenezca a la embarcación.',
      },
      {
        title: 'Acabar',
        body: 'Afinamos el brillo y mezclamos los bordes, luego revisamos el resultado con usted.',
      },
    ],
    whyTitle: 'Por qué importa una buena reparación de gelcoat',
    whyPoints: [
      'Un parche apresurado suele notarse en la siguiente temporada de sol',
      'El desajuste de color atrae la mirada a la reparación',
      'Una buena preparación ayuda a que el acabado dure más',
      'Un alcance claro evita sorpresas a mitad del trabajo',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Publican precios de reparación de gelcoat?',
        answer:
          'No. El alcance se revisa por embarcación. No mostramos precios en el sitio web.',
      },
      {
        question: '¿Los estimados son gratuitos?',
        answer:
          'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
      },
      {
        question: '¿Pueden trabajar en mi marina?',
        answer:
          'Cuando las reglas de la marina y las condiciones lo permiten, trabajamos en el sitio.',
      },
      {
        question: '¿La reparación será invisible?',
        answer:
          'Buscamos la mejor mezcla práctica. El gelcoat envejecido y mezclas previas pueden limitar la perfección. Dejamos esa expectativa clara desde el inicio.',
      },
    ],
  }),
  fiberglassRepair: service({
    title: 'Reparación de fibra de vidrio',
    metaTitle: 'Reparación de fibra de vidrio | Best Coatings Solutions',
    metaDescription:
      'Repare daño de fibra con preparación cuidadosa para poder refinir la zona bien. Trabajo marino móvil en el sur de Florida.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Repare daño estructural y cosmético de fibra con preparación cuidadosa para que la zona pueda refinirse bien.',
    overview:
      'El daño de fibra puede ser cosmético o más profundo. Primero inspeccionamos, explicamos lo que vemos en lenguaje claro y luego reconstruimos y acabamos la zona para gelcoat o pintura. Servicio móvil donde está permitido.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Grietas e impactos por golpe',
      'Zonas blandas y preocupaciones de humedad',
      'Fallos de adhesión en reparaciones previas',
      'Marcado de fibra tras trabajos anteriores',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Inspeccionar',
        body: 'Identificamos hasta dónde llega el daño y qué permite el acceso.',
      },
      {
        title: 'Estabilizar',
        body: 'Retiramos material comprometido y preparamos una superficie limpia para adherir.',
      },
      {
        title: 'Reconstruir',
        body: 'Laminamos o nivelamos con materiales adecuados al alcance acordado.',
      },
      {
        title: 'Acabar',
        body: 'Devolvemos la zona hacia el estándar cosmético de alrededor.',
      },
    ],
    whyTitle: 'Por qué importa una buena reparación de fibra',
    whyPoints: [
      'Cubrir el daño sin arreglar lo de debajo suele fallar después',
      'Una preparación limpia mejora la adhesión de la reparación',
      'Un alcance honesto lo protege de un arreglo solo cosmético cuando hace falta más',
      'Una reparación sólida le da una oportunidad justa al trabajo de acabado',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Todo problema de fibra es estructural?',
        answer:
          'No. Algunas reparaciones son cosméticas; otras necesitan laminado más profundo. Lo aclaramos antes de seguir.',
      },
      {
        question: '¿Listan precios en línea?',
        answer: 'No. Nunca mostramos precios en el sitio web público.',
      },
    ],
  }),
  paintRefinishing: service({
    title: 'Pintura y refinación',
    metaTitle: 'Pintura y refinación marina | Best Coatings Solutions',
    metaDescription:
      'Corrija y refinir superficies pintadas marinas con preparación controlada y alcance honesto. Servicio móvil en el sur de Florida.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Corrija y refinir superficies pintadas con proceso controlado y alcance honesto.',
    overview:
      'El trabajo de pintura va desde correcciones pequeñas hasta campañas cosméticas mayores. Planificamos la protección, preparamos con cuidado y aplicamos sistemas de acabado adecuados al área acordada. Un proceso limpio importa tanto como el brillo final. Sin precios en el sitio.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Desvanecimiento y oxidación',
      'Overspray y contaminación',
      'Fallos de borde y desprendimiento',
      'Brillo desigual tras trabajos previos',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Planificar',
        body: 'Definimos el área, las necesidades de protección y las condiciones de trabajo.',
      },
      {
        title: 'Preparar',
        body: 'Lijamos, nivelamos y enmascaramos con cuidado respecto a herrajes y acabados cercanos.',
      },
      {
        title: 'Aplicar',
        body: 'Aplicamos el sistema de acabado adecuado al alcance acordado.',
      },
      {
        title: 'Revisar',
        body: 'Comprobamos brillo, cobertura y bordes con usted bajo buena luz.',
      },
    ],
    whyTitle: 'Por qué importa un buen trabajo de pintura',
    whyPoints: [
      'La preparación decide cómo se ve el acabado meses después',
      'Un mal enmascarado se nota en herrajes y superficies vecinas',
      'Un alcance claro mantiene el trabajo enfocado',
      'Expectativas honestas valen más que resultados sorpresa',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Pueden coincidir un color de pintura existente?',
        answer:
          'La igualación de color se evalúa por embarcación y sistema de acabado. Vea Igualación de color para más detalle.',
      },
    ],
  }),
  hullRestoration: service({
    title: 'Restauración de casco',
    metaTitle: 'Restauración de casco | Best Coatings Solutions',
    metaDescription:
      'Restaure superficies de casco cansadas con corrección cuidadosa y trabajo de acabado. Reparación marina en el sur de Florida.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Devuelva a las superficies de casco cansadas una apariencia limpia y reflectante mediante corrección cuidadosa y trabajo de acabado.',
    overview:
      'La restauración de casco puede combinar corrección de oxidación, reparaciones puntuales y refinación de acabado. El alcance siempre es específico a la embarcación. Recorremos el casco, fijamos prioridades con usted y trabajamos con método — nunca como un paquete genérico del sitio.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Oxidación fuerte',
      'Manchas en la línea de flotación',
      'Parcheado de reparaciones previas',
      'Pérdida de profundidad en colores oscuros',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Evaluar',
        body: 'Recorremos el casco y acordamos prioridades con el propietario o el capitán.',
      },
      {
        title: 'Corregir',
        body: 'Atendemos defectos y preparamos superficies paso a paso.',
      },
      {
        title: 'Restaurar',
        body: 'Reconstruimos la integridad del acabado en las zonas acordadas.',
      },
      {
        title: 'Presentar',
        body: 'Revisión final bajo buena luz para reflexión y uniformidad.',
      },
    ],
    whyTitle: 'Por qué importa una buena restauración de casco',
    whyPoints: [
      'La oxidación sin atender sigue apagando la apariencia de la embarcación',
      'Los parches irregulares previos cuestan ignorar bajo el sol',
      'Un plan claro evita sobretrabajar zonas que no lo necesitan',
      'La revisión con buena luz atrapa lo que las fotos solas pueden pasar por alto',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Restauran fondos y sistemas de antifouling?',
        answer:
          'Nuestro enfoque público es trabajo cosmético y de recubrimientos en el alcance acordado por encima de la línea de flotación. Los programas de fondo se discuten caso por caso.',
      },
    ],
  }),
  yachtCosmeticRepair: service({
    title: 'Reparación cosmética de yates',
    metaTitle: 'Reparación cosmética de yates | Best Coatings Solutions',
    metaDescription:
      'Corrija daño cosmético visible para que su yate se presente limpio — sin exagerar el alcance estructural.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Corrija problemas cosméticos visibles que afectan la presentación sin exagerar el alcance estructural.',
    overview:
      'Marcas de atracadero, rozaduras y pequeños huecos pueden hacer que un yate bien cuidado parezca descuidado. Priorizamos las zonas más visibles, protegemos acabados cercanos y mezclamos las reparaciones con cuidado. El calendario se puede coordinar cuando el acceso a la marina lo permite.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Marcas de atracadero y rozaduras en guardabarros',
      'Rozaduras en cubierta y costados de cabina',
      'Marcas de instalación de herrajes',
      'Pequeños huecos y poros',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Priorizar',
        body: 'Identificamos primero las reparaciones de mayor visibilidad.',
      },
      {
        title: 'Proteger',
        body: 'Enmascaramos y protegemos acabados e interiores adyacentes según haga falta.',
      },
      {
        title: 'Reparar',
        body: 'Ejecutamos correcciones cosméticas precisas.',
      },
      {
        title: 'Mezclar',
        body: 'Pulimos y mezclamos para un aspecto coherente.',
      },
    ],
    whyTitle: 'Por qué importa el cuidado cosmético',
    whyPoints: [
      'Las marcas pequeñas son lo primero que notan invitados y compradores',
      'Proteger acabados cercanos evita crear un problema mayor',
      'Un alcance cosmético honesto se mantiene aparte de afirmaciones estructurales',
      'Un calendario claro ayuda en temporada o planes de venta',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question:
          '¿Se puede programar el trabajo cosmético alrededor de calendarios de charter?',
        answer:
          'Coordinamos el tiempo cuando el acceso y las reglas de la marina lo permiten. Comparta ventanas preferidas al solicitar un estimado o contactarnos.',
      },
    ],
  }),
  structuralCompositeRepair: service({
    title: 'Reparación estructural de compuestos',
    metaTitle: 'Reparación estructural de compuestos | Best Coatings Solutions',
    metaDescription:
      'Evalúe y repare daño de compuestos con alcance claro — cosmético frente a estructural explicado en lenguaje llano.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Atienda daño de compuestos con una evaluación clara — nunca paquetes vagos del sitio ni afirmaciones exageradas.',
    overview:
      'Algunos daños necesitan más que una cubierta cosmética. Inspeccionamos, separamos lo estructural del trabajo de acabado y explicamos los hallazgos antes de reparar. Si un trabajo necesita un especialista más amplio, lo decimos con claridad.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Grietas de laminado por impacto',
      'Preocupaciones de núcleo en cubiertas o paneles',
      'Fallos de adhesión secundaria',
      'Zonas de reparación que requieren conciencia de carga',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Diagnosticar',
        body: 'Inspeccionamos y discutimos los hallazgos con quienes toman las decisiones.',
      },
      {
        title: 'Definir alcance',
        body: 'Separamos las necesidades estructurales del seguimiento cosmético.',
      },
      {
        title: 'Ejecutar',
        body: 'Reparamos con materiales y métodos adecuados a la estructura.',
      },
      {
        title: 'Verificar',
        body: 'Revisamos la mano de obra y delineamos los pasos de acabado que queden.',
      },
    ],
    whyTitle: 'Por qué importa una evaluación honesta de compuestos',
    whyPoints: [
      'Ocultar un problema estructural bajo pintura no es una reparación',
      'Un diagnóstico claro protege a la embarcación y al propietario',
      'Un alcance definido mantiene a todos alineados',
      'No inventamos capacidades que no tenemos',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Garantizan que todo problema de compuestos sea menor?',
        answer:
          'No. Algunos hallazgos necesitan una intervención más amplia u otro especialista. Lo diremos con claridad.',
      },
    ],
  }),
  colorMatching: service({
    title: 'Igualación de color',
    metaTitle: 'Igualación de color marina | Best Coatings Solutions',
    metaDescription:
      'Coincida gelcoat o pintura de alrededor para que una reparación se mezcle con el acabado existente de la embarcación.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Coincida acabados de alrededor para que las reparaciones se asienten en el color existente de la embarcación — no queden al lado como un parche.',
    overview:
      'La igualación de color suele ser la diferencia entre una reparación discreta y una visible. Muestreamos en la embarcación, ajustamos con cuidado y probamos antes de comprometer áreas grandes y visibles. Los acabados envejecidos y los efectos metálicos pueden limitar la perfección — lo decimos temprano.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Reparaciones que se ven mal bajo el sol',
      'Acabados envejecidos que ya no coinciden con códigos viejos',
      'Desajuste de efectos metálicos y perlados',
      'Discontinuidades en acentos y franjas',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Muestrear',
        body: 'Evaluamos el color bajo luz adecuada en la embarcación.',
      },
      {
        title: 'Formular',
        body: 'Ajustamos mezclas hacia el acabado de alrededor.',
      },
      {
        title: 'Probar',
        body: 'Validamos antes de comprometer áreas grandes y visibles.',
      },
      {
        title: 'Aplicar',
        body: 'Integramos el acabado coincidente en la zona de reparación.',
      },
    ],
    whyTitle: 'Por qué importa la igualación de color',
    whyPoints: [
      'El ojo encuentra el desajuste antes que la técnica',
      'El sol revela lo que la luz interior puede ocultar',
      'La paciencia aquí protege toda la reparación',
      'Límites honestos generan confianza antes de empezar',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Se puede coincidir perfectamente todo color?',
        answer:
          'El envejecimiento, los efectos metálicos y mezclas previas pueden limitar la perfección. Buscamos la mejor mezcla práctica y fijamos expectativas temprano.',
      },
    ],
  }),
  insuranceRepair: service({
    title: 'Reparación por seguro',
    metaTitle:
      'Soporte de reparación marina por seguro | Best Coatings Solutions',
    metaDescription:
      'Reparaciones marinas cosméticas y de recubrimientos con alcance claro y hábitos de documentación. Las decisiones de cobertura quedan con usted y su aseguradora.',
    heroEyebrow: 'Reparación marina',
    heroLead:
      'Apoye reparaciones marinas relacionadas con seguro con alcance claro, hábitos de documentación cuidadosos y calidad de acabado.',
    overview:
      'El trabajo de seguro necesita claridad. Le ayudamos a entender el alcance cosmético y de recubrimientos mediante fotos, inspección cuando hace falta y un alcance escrito antes de reparar. Las decisiones de cobertura corresponden a usted y a su aseguradora. Best Coatings Solutions no garantiza la aprobación del reclamo, no actúa como ajustador público y no muestra precios en línea.',
    problemsTitle: 'Problemas que resuelve',
    problems: [
      'Daño por atracadero y cosmética de colisión',
      'Daño superficial relacionado con tormentas',
      'Varias reparaciones pequeñas en una embarcación',
      'Necesidad de documentación fotográfica del progreso',
      'Necesidad de comunicación clara con el propietario antes de la autorización',
    ],
    processTitle: 'Cómo lo abordamos',
    processSteps: [
      {
        title: 'Documentación inicial',
        body: 'Revisamos el daño reportado y cualquier foto que comparta.',
      },
      {
        title: 'Inspección cuando hace falta',
        body: 'Recomendamos inspección en el sitio cuando las fotos no bastan para planificar con responsabilidad.',
      },
      {
        title: 'Preparación del alcance',
        body: 'Preparamos el alcance de reparación para el trabajo cosmético o de recubrimientos acordado — sin prometer decisiones de la aseguradora.',
      },
      {
        title: 'Autorización y reparación',
        body: 'Procedemos tras la autorización apropiada, luego revisamos la finalización frente al alcance acordado.',
      },
    ],
    whyTitle: 'Qué debe esperar',
    whyPoints: [
      'Comunicación clara con el propietario',
      'Hábitos de documentación fotográfica cuando son útiles',
      'Enfoque en acabados marinos',
      'Sin promesas de proveedor preferido ni de aprobación de reclamos',
      'Sin rol de ajustador público ni de representación legal',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Garantizan la aprobación del reclamo de seguro?',
        answer:
          'No. Las decisiones de cobertura corresponden a usted y a su aseguradora. Un estimado de reparación no determina la cobertura de la póliza.',
      },
      {
        question: '¿Facturan directamente a las aseguradoras?',
        answer:
          'Los arreglos de facturación varían. Discutimos opciones prácticas después de aclarar el alcance — nunca como garantía del sitio.',
      },
      {
        question: '¿Los estimados son gratuitos para trabajo de seguro?',
        answer:
          'Los estimados gratuitos aplican solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
      },
      {
        question: '¿Actúan como ajustadores públicos?',
        answer:
          'No. No ofrecemos servicios de ajustador público, representación legal ni autoridad para interpretar pólizas de seguro.',
      },
    ],
  }),
};
