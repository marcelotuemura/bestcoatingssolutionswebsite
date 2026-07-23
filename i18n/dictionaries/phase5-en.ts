/**
 * Phase 5 UI strings — English.
 * Imported into the main dictionary so components stay locale-driven.
 */

export const phase5En = {
  educationalDisclaimer: {
    title: 'Educational disclaimer',
    body: 'General website content is educational. It is not a vessel-specific diagnosis, engineering advice, insurance advice, legal advice, or guaranteed repair guidance. Actual repair requirements depend on inspection and vessel condition. Structural or uncertain damage should receive professional evaluation.',
  },
  about: {
    ownerFactsPending:
      'Additional company facts (founding year, certifications, team biographies, and similar) appear only after owner approval.',
  },
  projects: {
    metaTitle: 'Projects | Best Coatings Solutions',
    metaDescription:
      'Marine repair project portfolio from Best Coatings Solutions. Approved case studies appear only with owner and customer consent.',
    eyebrow: 'Portfolio',
    title: 'Projects',
    lead: 'Documented marine repair projects will appear here after owner approval and customer consent. We do not invent portfolio work or present placeholders as completed BCS customer projects.',
    emptyTitle: 'Project documentation in preparation',
    emptyBody:
      'We are preparing approved project documentation for publication. In the meantime, explore marine services, educational resources, or request an estimate for your vessel.',
    emptyLinksHeading: 'Helpful next steps',
    linkServices: 'Marine services',
    linkEstimate: 'Request estimate',
    linkContact: 'Contact BCS',
    linkResources: 'Resources',
    frameworkTitle: 'How future case studies will be presented',
    frameworkBody:
      'Each published project can include overview, damage and repair notes, before-and-after photography, related services, and clear calls to action — only with approval and consent.',
    labels: {
      category: 'Category',
      overview: 'Project overview',
      damage: 'Initial damage or condition',
      repairScope: 'Repair scope',
      process: 'Repair process',
      materials: 'Materials notes',
      finish: 'Finish notes',
      before: 'Before',
      after: 'After',
      during: 'During repair',
      relatedServices: 'Related services',
      relatedProjects: 'Related projects',
      vessel: 'Vessel',
      location: 'General location',
      completed: 'Completion',
      testFixtureBadge: 'Test fixture — not a real BCS customer project',
      placeholderImage: 'Placeholder image — not real BCS repair photography',
    },
    detailEstimateTitle: 'Request an estimate for similar work',
    detailEstimateBody:
      'Share photos and vessel details to start a marine repair estimate conversation.',
  },
  testimonials: {
    heading: 'Customer feedback',
    emptyNote:
      'Approved customer testimonials will appear here when written publication consent is on file. We do not invent reviews or ratings.',
  },
  faq: {
    metaTitle: 'FAQ | Best Coatings Solutions',
    metaDescription:
      'Frequently asked questions about marine repair estimates, gelcoat, fiberglass, color matching, insurance-related repairs, and service area.',
    eyebrow: 'Help center',
    title: 'FAQ Center',
    lead: 'Answers about estimates, inspections, marine repair topics, workmanship, and service area — written carefully without unsupported promises.',
    categoriesHeading: 'Categories',
    relatedServices: 'Related services',
    contactCta: 'Contact BCS',
    estimateCta: 'Request estimate',
    expandHint: 'Select a question to expand the answer.',
  },
  workmanship: {
    metaTitle: 'Workmanship | Best Coatings Solutions',
    metaDescription:
      'Workmanship philosophy, written scope, surface preparation, finish evaluation, and concern process at Best Coatings Solutions.',
    contactCta: 'Contact BCS',
    estimateCta: 'Request estimate',
  },
  serviceArea: {
    metaTitle: 'Service Area | Best Coatings Solutions',
    metaDescription:
      'Best Coatings Solutions marine repair service area: South Florida from Jupiter southward, with free estimates in Fort Lauderdale.',
    eyebrow: 'Locations',
    title: 'Service area',
    lead: 'Approved service-area information for Best Coatings Solutions. We publish only owner-approved locations and notes — not invented city or marina directories.',
    primaryHeading: 'Primary area',
    additionalHeading: 'Approved locations',
    notesHeading: 'Travel, inspection, and limitations',
    mapHeading: 'Map',
    marinaPending:
      'A marina directory will appear only when approved real references exist. Listing a marina does not imply partnership or endorsement.',
    linkServices: 'Marine services',
    linkFaq: 'FAQ',
    linkContact: 'Contact',
    linkEstimate: 'Request estimate',
  },
  resources: {
    metaTitle: 'Marine Resources | Best Coatings Solutions',
    metaDescription:
      'Educational marine repair resources from Best Coatings Solutions — estimates, photography, gelcoat, color matching, and written scope guidance.',
    eyebrow: 'Education',
    title: 'Marine resources',
    lead: 'Educational articles to help vessel owners prepare for estimates, inspections, and repair conversations. Content is not vessel-specific diagnosis.',
    emptyTitle: 'Resources coming soon',
    emptyBody: 'Published educational articles will appear here after review.',
    relatedServices: 'Related services',
    relatedResources: 'Related resources',
    linkFaq: 'FAQ Center',
    linkContact: 'Contact',
    linkEstimate: 'Request estimate',
    updatedLabel: 'Updated',
    publishedLabel: 'Published',
    authorLabel: 'Author',
    categoryLabel: 'Category',
  },
  beforeAfter: {
    before: 'Before',
    after: 'After',
    pairLabel: 'Before and after comparison',
  },
  insuranceExpanded: {
    processTitle: 'Insurance-related repair process',
    steps: [
      {
        title: 'Initial documentation',
        body: 'Gather a clear description of the reported damage and any photos the owner can share.',
      },
      {
        title: 'Customer-provided photos',
        body: 'Review photos for context and detail. Additional angles may be requested.',
      },
      {
        title: 'Inspection where appropriate',
        body: 'Recommend on-site inspection when photos are insufficient for responsible scope planning.',
      },
      {
        title: 'Scope preparation',
        body: 'Prepare a repair scope focused on the agreed cosmetic or coatings work — without promising insurer decisions.',
      },
      {
        title: 'Communication with the vessel owner',
        body: 'Discuss inclusions, exclusions, and documentation needs with the owner or authorized representative.',
      },
      {
        title: 'Additional information requests',
        body: 'Request clarifications, more photos, or access notes when needed before authorization.',
      },
      {
        title: 'Authorization before repair',
        body: 'Proceed with repair work only after appropriate authorization for the agreed scope.',
      },
      {
        title: 'Repair documentation',
        body: 'Support clear visual or written records when requested for the project file.',
      },
      {
        title: 'Completion review',
        body: 'Review completed work against the agreed scope with the owner or representative.',
      },
    ],
    disclaimersTitle: 'Important insurance disclaimers',
    disclaimers: [
      'Coverage decisions belong to the customer and the insurer.',
      'BCS does not guarantee claim approval.',
      'A repair estimate does not determine policy coverage.',
      'BCS does not claim preferred-vendor status for every insurer.',
      'BCS does not provide public-adjuster services or legal representation.',
      'BCS does not claim authority to interpret insurance policies.',
    ],
  },
} as const;
