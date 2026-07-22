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
    metaTitle: 'Reparación de gelcoat | Marina | BCS',
    metaDescription:
      'Reparación y refinamiento móvil de gelcoat para yates y embarcaciones en el sur de Florida. Acabados con coincidencia de color sin precios en el sitio.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Restituya brillo, continuidad de color e integridad de superficie donde el gelcoat se ha oxidado, craqueado o desajustado.',
    overview:
      'Best Coatings Solutions ofrece reparación móvil de gelcoat en marinas, astilleros y residencias cuando las condiciones lo permiten. Nos enfocamos en preparación cuidadosa, disciplina de color y un acabado que respete la embarcación — nunca en precios publicados.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Oxidación y tiza en superficies expuestas',
      'Grietas por estrés y craqueo fino',
      'Astillas y golpes por impacto',
      'Reparaciones previas deficientes o desajuste de color',
      'Acentos y franjas desvanecidos',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Evaluar',
        body: 'Revisamos el daño, el sustrato y el acceso en la embarcación.',
      },
      {
        title: 'Preparar',
        body: 'Protegemos acabados adyacentes, abrimos áreas dañadas y nivelamos con cuidado.',
      },
      {
        title: 'Coincidir y restaurar',
        body: 'Aplicamos gelcoat o sistemas de relleno con coincidencia de color disciplinada.',
      },
      {
        title: 'Acabar',
        body: 'Refinamos el brillo y mezclamos transiciones para una presentación cohesiva.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'Servicio móvil donde está permitido',
      'Atención al color y a la reflexión',
      'Comunicación clara con capitanes y propietarios',
      'Sin afirmaciones inventadas — oficio real',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Pueden coincidir el color del gelcoat existente?',
        answer:
          'Sí. Coincidimos tono y brillo con las superficies adyacentes lo más cerca posible. Los resultados dependen de la edad del acabado, la exposición y los materiales disponibles.',
      },
      {
        question: '¿El daño de gelcoat es solo cosmético?',
        answer:
          'No siempre. Algunas grietas son superficiales; otras indican estrés o daño más profundo. Evaluamos antes de recomendar el alcance.',
      },
      {
        question: '¿Ofrecen estimados gratuitos?',
        answer:
          'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
      },
    ],
  }),
  fiberglassRepair: service({
    title: 'Reparación de fibra de vidrio',
    metaTitle: 'Reparación de fibra de vidrio | Marina | BCS',
    metaDescription:
      'Reparación móvil de fibra y compuestos marinos en el sur de Florida. Laminado, refuerzo y preparación para acabado — sin precios en el sitio.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Restaure laminados dañados, delaminación y zonas de impacto con reparación de compuestos disciplinada.',
    overview:
      'La reparación de fibra exige diagnóstico correcto: cosmético vs. estructural. BCS repara compuestos marinos con secuencias de laminado adecuadas y preparación lista para gelcoat o pintura.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Delaminación tras impacto o entrada de agua',
      'Agujeros, grietas y roturas',
      'Laminado debilitado en zonas de estrés',
      'Daño en cubierta, casco o superestructura',
      'Reparaciones previas que fallaron o se ven mal',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Diagnosticar',
        body: 'Identificamos la profundidad del daño y el riesgo de humedad.',
      },
      {
        title: 'Remover',
        body: 'Retiramos material comprometido hasta un límite sólido.',
      },
      {
        title: 'Laminar',
        body: 'Reconstruimos con refuerzo y resina adecuados.',
      },
      {
        title: 'Contornear y acabar',
        body: 'Nivelamos, sellamos y preparamos para gelcoat o pintura.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'Pensamiento de reparación compuesto, no solo relleno',
      'Preparación limpia y transición de acabado',
      'Coordinación con gelcoat, pintura o coincidencia de color',
      'Documentación clara para propietarios y aseguradoras',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Pueden reparar daño estructural de fibra?',
        answer:
          'Sí, cuando es apropiado. Algunas reparaciones requieren evaluación adicional. Seremos claros si el alcance supera una reparación cosmético/compuesta estándar.',
      },
      {
        question: '¿La reparación se verá igual que el original?',
        answer:
          'Buscamos una coincidencia cercana en contorno y acabado. El resultado final a menudo se combina con gelcoat o pintura.',
      },
      {
        question: '¿Trabajan con reclamos de seguro?',
        answer:
          'Sí. Podemos apoyar reclamos de reparación marina con evaluación, documentación y ejecución profesional.',
      },
    ],
  }),
  paintRefinishing: service({
    title: 'Pintura y refinamiento',
    metaTitle: 'Pintura y refinamiento marino | Marina | BCS',
    metaDescription:
      'Refinamiento de pintura marina en el sur de Florida: preparación, aplicación y control de brillo — sin precios publicados.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Sistemas de pintura marina de alto control—desde preparación hasta acabado—para cascos, cubiertas y superficies de yates.',
    overview:
      'Un refinamiento duradero depende más de la preparación que de la capa final. BCS se enfoca en control de sustrato, disciplina de enmascarado y aplicación consistente.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Desvanecimiento, oxidación y pérdida de brillo',
      'Decapado, ampollas o falla de adhesión',
      'Pintura despareja o retoques visibles',
      'Desgaste en zonas de alto tráfico',
      'Refinamiento parcial que no coincide con el resto',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Evaluar superficie',
        body: 'Revisamos condición, adhesión y alcance.',
      },
      {
        title: 'Preparar',
        body: 'Lijado, relleno, imprimación y enmascarado según se requiera.',
      },
      {
        title: 'Aplicar',
        body: 'Sistemas de pintura marina aplicados con control.',
      },
      {
        title: 'Inspeccionar',
        body: 'Revisión de brillo, cobertura y calidad de borde.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'Énfasis en preparación sobre atajos cosméticos',
      'Acabados limpios y uniformes con control de color',
      'Adecuado para trabajo parcial o de sección completa',
      'Presupuesto transparente sin precios publicados',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Pueden pintar solo una sección?',
        answer:
          'Sí. El refinamiento parcial es común. Planificamos transiciones y coincidencia de color para evitar un resultado de “parche”.',
      },
      {
        question: '¿Qué sistemas de pintura usan?',
        answer:
          'Seleccionamos sistemas adecuados a la superficie, exposición y alcance. Los materiales se confirman durante el estimado.',
      },
      {
        question: '¿Cuánto dura el refinamiento?',
        answer:
          'La vida útil depende de exposición UV, mantenimiento y uso. Explicamos expectativas de cuidado en el proceso de estimado.',
      },
    ],
  }),
  hullRestoration: service({
    title: 'Restauración de casco',
    metaTitle: 'Restauración de casco | Marina | BCS',
    metaDescription:
      'Restauración de casco marino: corrección de superficie, gelcoat/pintura y recuperación de brillo — sin precios en el sitio.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Recupere la apariencia y protección de la superficie del casco con restauración disciplinada—no solo un pulido rápido.',
    overview:
      'La restauración de casco puede incluir corrección de oxidación, reparación de gelcoat, refinamiento de pintura y recuperación de brillo. BCS define el alcance honestamente.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Oxidación severa y tiza',
      'Gelcoat o pintura desgastados',
      'Arañazos, marcas de atracadero y daño cosmético',
      'Pérdida de brillo y profundidad de color',
      'Restauraciones previas incompletas',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Inspeccionar',
        body: 'Evaluamos oxidación, daño y viabilidad del acabado.',
      },
      {
        title: 'Corregir',
        body: 'Reparamos y preparamos la superficie según el alcance.',
      },
      {
        title: 'Refinar',
        body: 'Aplicamos gelcoat, pintura o corrección según lo planeado.',
      },
      {
        title: 'Proteger',
        body: 'Acabamos con brillo controlado y orientación de cuidado.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'Alcance honesto basado en la condición real del casco',
      'Equilibrio entre cosmética y protección',
      'Acabado consistente en superficies grandes',
      'Servicio en el sur de Florida con estimado claro',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Es suficiente un pulido o necesitamos pintura?',
        answer:
          'Depende de la condición. Después de la inspección recomendamos el camino menos invasivo que cumpla sus objetivos.',
      },
      {
        question: '¿Pueden restaurar solo la obra viva o muerta?',
        answer:
          'Sí. El alcance de sección es común. Planificamos coincidencia de color y líneas de transición con cuidado.',
      },
      {
        question: '¿Incluyen antifouling?',
        answer:
          'Los recubrimientos bajo la línea de flotación pueden discutirse durante la evaluación. Confirmamos el alcance exacto en el estimado.',
      },
    ],
  }),
  yachtCosmeticRepair: service({
    title: 'Reparación cosmética de yates',
    metaTitle: 'Reparación cosmética de yates | Marina | BCS',
    metaDescription:
      'Reparación cosmética de yates en el sur de Florida: gelcoat, pintura, coincidencia de color y acabados de presentación.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Acabado cosmético preciso para yates donde la presentación, la coincidencia de color y la limpieza de detalle importan.',
    overview:
      'El trabajo cosmético de yates exige disciplina: bordes limpios, coincidencia cercana de color y acabados que se sostengan bajo inspección cercana.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Arañazos y marcas visibles en zonas de presentación',
      'Desajuste de color por retoques previos',
      'Gelcoat o pintura desgastados en áreas de alto tráfico',
      'Daño cosmético en cubierta o pasamanos',
      'Detalles que no cumplen estándares de yate',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Revisar',
        body: 'Identificamos áreas visibles y prioridades de presentación.',
      },
      {
        title: 'Corregir',
        body: 'Reparamos, nivelamos y coincidimos color con control.',
      },
      {
        title: 'Mezclar',
        body: 'Integramos reparaciones en superficies adyacentes.',
      },
      {
        title: 'Detallar',
        body: 'Refinamos brillo y limpieza para inspección cercana.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'Estándares de presentación para superficies visibles',
      'Coincidencia de color y mezcla de acabado',
      'Atención al detalle en zonas de alto impacto visual',
      'Estimado claro sin precios en el sitio',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Es diferente de la reparación general de gelcoat?',
        answer:
          'El proceso es similar, pero el trabajo cosmético de yates enfatiza la calidad de presentación en superficies altamente visibles.',
      },
      {
        question: '¿Pueden trabajar mientras el yate está en uso?',
        answer:
          'Según acceso y alcance. Confirmamos logística durante el estimado.',
      },
      {
        question: '¿Cubren interiores?',
        answer:
          'Nuestro enfoque principal es acabados exteriores marinos. Pregunte si su necesidad es adyacente a ese alcance.',
      },
    ],
  }),
  structuralCompositeRepair: service({
    title: 'Reparación estructural de compuestos',
    metaTitle: 'Reparación estructural de compuestos | Marina | BCS',
    metaDescription:
      'Reparación estructural de compuestos marinos: refuerzo de laminado e integridad del compuesto — sin precios publicados.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Reparación de laminado y compuestos cuando la integridad importa tanto como la cosmética—con alcance claro y honestidad.',
    overview:
      'Las reparaciones estructurales requieren más que relleno superficial. BCS aborda daño de laminado y refuerzo con evaluación cuidadosa y comunicación clara.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Falla de laminado tras impacto',
      'Delaminación o entrada de humedad',
      'Áreas de refuerzo debilitadas',
      'Daño compuesto alrededor de herrajes o penetraciones',
      'Reparaciones previas que no restauraron la integridad',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Evaluar',
        body: 'Determinamos alcance, profundidad y riesgos.',
      },
      {
        title: 'Estabilizar',
        body: 'Retiramos material fallido y preparamos el límite.',
      },
      {
        title: 'Reconstruir',
        body: 'Re-laminamos y reforzamos según el plan de reparación.',
      },
      {
        title: 'Verificar',
        body: 'Revisamos contorno, transición y preparación de acabado.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'Prioridad en integridad del compuesto sobre atajos cosméticos',
      'Alcance honesto y comunicación de riesgos',
      'Coordinación con acabado y coincidencia de color',
      'Documentación adecuada para propietarios y aseguradoras',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Todas las grietas son estructurales?',
        answer:
          'No. Muchas son cosméticas. Inspeccionamos antes de clasificar el trabajo como estructural.',
      },
      {
        question: '¿Necesitaré ingeniería o encuesta?',
        answer:
          'Algunas reparaciones lo requieren. Se lo diremos temprano si el alcance lo justifica.',
      },
      {
        question: '¿Puede combinarse con refinamiento cosmético?',
        answer:
          'Sí. La reparación estructural a menudo va seguida de gelcoat o pintura.',
      },
    ],
  }),
  colorMatching: service({
    title: 'Coincidencia de color',
    metaTitle: 'Coincidencia de color marina | Marina | BCS',
    metaDescription:
      'Coincidencia de color marina para gelcoat y pintura: correcciones de tono, brillo y mezcla en el sur de Florida.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Coincidencia precisa de color y brillo para que las reparaciones se mezclen con el acabado existente.',
    overview:
      'La coincidencia de color es oficio y juicio: tonos desvanecidos, diferencias de brillo y variación de lote. BCS la trata como disciplina central.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Parches de reparación que no coinciden con el casco o la cubierta',
      'Diferencias de brillo que hacen visibles las reparaciones',
      'Colores desvanecidos difíciles de igualar',
      'Desajustes de lote entre secciones',
      'Retoques previos con color incorrecto',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Referencia',
        body: 'Evaluamos color adyacente bajo condiciones de luz consistentes.',
      },
      {
        title: 'Formular',
        body: 'Desarrollamos una coincidencia para el sistema de acabado.',
      },
      {
        title: 'Probar',
        body: 'Verificamos tono y brillo antes del acabado completo.',
      },
      {
        title: 'Mezclar',
        body: 'Integramos la reparación en las superficies circundantes.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'La coincidencia de color se trata como un oficio',
      'Atención a brillo y mezcla, no solo tono',
      'Aplicable en gelcoat, pintura y cosmético',
      'Expectativas honestas cuando los acabados envejecidos limitan la coincidencia perfecta',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Pueden igualar perfectamente un acabado muy desvanecido?',
        answer:
          'Buscamos la coincidencia más cercana posible. Los acabados muy envejecidos a veces requieren mezcla o un alcance de sección más amplio.',
      },
      {
        question: '¿Es un servicio independiente?',
        answer:
          'Puede serlo, y también está integrado en la mayoría de las reparaciones de gelcoat y pintura.',
      },
      {
        question: '¿Igualan colores metálicos o personalizados?',
        answer:
          'Muchos acabados personalizados se pueden abordar. La factibilidad se confirma durante la evaluación.',
      },
    ],
  }),
  insuranceRepair: service({
    title: 'Reparación por seguro',
    metaTitle: 'Soporte de reparación marina por seguro | BCS',
    metaDescription:
      'Reparaciones marinas cosméticas y de recubrimientos coordinadas para trabajo relacionado con seguro — sin precios en el sitio.',
    heroEyebrow: 'Servicio marino',
    heroLead:
      'Apoyo profesional de reparación marina para reclamos — alcance claro, hábitos de documentación cuidadosos y calidad de acabado.',
    overview:
      'Las reparaciones por seguro necesitan claridad. Ayudamos a propietarios y gestores a entender el alcance cosmético y de recubrimientos. No mostramos precios en línea ni inventamos resultados de reclamos.',
    problemsTitle: 'Problemas comunes',
    problems: [
      'Daño por atracadero y cosmética de colisión',
      'Daño superficial relacionado con tormentas',
      'Múltiples reparaciones pequeñas en una embarcación',
      'Necesidad de documentación fotográfica del progreso',
    ],
    processTitle: 'Nuestro proceso',
    processSteps: [
      {
        title: 'Revisar',
        body: 'Entendemos el daño reportado y las condiciones de acceso.',
      },
      {
        title: 'Definir alcance',
        body: 'Definimos áreas de reparación sin prometer decisiones del asegurador.',
      },
      {
        title: 'Reparar',
        body: 'Ejecutamos el trabajo acordado con estándares profesionales.',
      },
      {
        title: 'Documentar',
        body: 'Proporcionamos registros visuales claros cuando se solicitan.',
      },
    ],
    whyTitle: 'Por qué elegir BCS',
    whyPoints: [
      'Comunicación profesional',
      'Proceso apto para fotos cuando se necesita',
      'Experiencia en acabados marinos',
      'Sin testimonios fabricados',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Facturan directamente a las aseguradoras?',
        answer:
          'Los arreglos de facturación varían. Discutimos opciones prácticas después de aclarar el alcance — nunca como garantía del sitio.',
      },
      {
        question: '¿Los estimados gratuitos aplican a trabajo de seguro?',
        answer:
          'Los estimados gratuitos aplican solo en el área de Fort Lauderdale. Otras ubicaciones pueden requerir revisión o arreglos de viaje.',
      },
    ],
  }),
};
