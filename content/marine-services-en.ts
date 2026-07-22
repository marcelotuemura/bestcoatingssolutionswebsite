export interface ServicePageContent {
  readonly title: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heroEyebrow: string;
  readonly heroLead: string;
  readonly overview: string;
  readonly problemsTitle: string;
  readonly problems: readonly string[];
  readonly processTitle: string;
  readonly processSteps: readonly {
    readonly title: string;
    readonly body: string;
  }[];
  readonly whyTitle: string;
  readonly whyPoints: readonly string[];
  readonly faqTitle: string;
  readonly faqs: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
}

export type MarineServiceContentKey =
  | 'gelcoatRepair'
  | 'fiberglassRepair'
  | 'paintRefinishing'
  | 'hullRestoration'
  | 'yachtCosmeticRepair'
  | 'structuralCompositeRepair'
  | 'colorMatching'
  | 'insuranceRepair';

function service(partial: ServicePageContent): ServicePageContent {
  return partial;
}

export const marineServiceContentEn: Record<
  MarineServiceContentKey,
  ServicePageContent
> = {
  gelcoatRepair: service({
    title: 'Gelcoat Repair',
    metaTitle: 'Gelcoat Repair | Marine | BCS',
    metaDescription:
      'Mobile gelcoat repair and refinishing for yachts and boats in South Florida. Color-matched finishes without showing prices online.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Restore gloss, color continuity, and surface integrity where gelcoat has oxidized, cracked, or mismatched.',
    overview:
      'Best Coatings Solutions provides mobile gelcoat repair at marinas, boatyards, and homes where conditions allow. We focus on careful preparation, color discipline, and a finish that respects the vessel — never on website pricing.',
    problemsTitle: 'Common problems',
    problems: [
      'Oxidation and chalking on exposed surfaces',
      'Stress cracks and spidering',
      'Impact chips and gouges',
      'Poor previous repairs or color mismatch',
      'Faded accents and boot stripes',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Assess',
        body: 'Review damage, substrate condition, and access at the vessel.',
      },
      {
        title: 'Prepare',
        body: 'Protect surrounding finishes, open damaged areas, and fair carefully.',
      },
      {
        title: 'Match & restore',
        body: 'Build gelcoat or fairing systems with disciplined color matching.',
      },
      {
        title: 'Finish',
        body: 'Refine gloss and blend transitions for a cohesive presentation.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Mobile service where permitted',
      'Attention to color and reflection',
      'Clear communication with captains and owners',
      'No invented claims — real craftsmanship',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you publish gelcoat repair prices?',
        answer:
          'No. We do not display prices on the website. Scope is reviewed per vessel.',
      },
      {
        question: 'Are estimates free?',
        answer:
          'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
      },
      {
        question: 'Can you work at my marina?',
        answer:
          'When marina rules and conditions allow, we provide mobile service on site.',
      },
    ],
  }),
  fiberglassRepair: service({
    title: 'Fiberglass Repair',
    metaTitle: 'Fiberglass Repair | Marine | BCS',
    metaDescription:
      'Mobile fiberglass repair for boats and yachts in South Florida — cosmetic and small structural care with disciplined process.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Repair laminate damage with controlled preparation and finish work suited to marine environments.',
    overview:
      'Fiberglass repair addresses impact damage, delamination concerns, and surface failures. We work mobile where permitted, coordinating with owners, captains, and yards.',
    problemsTitle: 'Common problems',
    problems: [
      'Impact fractures and punctures',
      'Soft spots and moisture-related concerns',
      'Tabbing and secondary bond failures',
      'Cosmetic fiber print-through after prior work',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Inspect',
        body: 'Identify extent of damage and access constraints on the vessel.',
      },
      {
        title: 'Stabilize',
        body: 'Remove compromised material and prepare a clean bonding surface.',
      },
      {
        title: 'Rebuild',
        body: 'Laminate or fair with materials appropriate to the repair scope.',
      },
      {
        title: 'Finish',
        body: 'Return the area toward the surrounding cosmetic standard.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Marine-focused repair mindset',
      'Mobile convenience',
      'Respect for surrounding finishes',
      'Honest scope — no fabricated project claims',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Is every fiberglass issue structural?',
        answer:
          'No. Some repairs are cosmetic; others require deeper laminate work. We clarify scope before proceeding.',
      },
      {
        question: 'Do you list prices online?',
        answer: 'No. Pricing is never displayed on the public website.',
      },
    ],
  }),
  paintRefinishing: service({
    title: 'Paint & Refinishing',
    metaTitle: 'Marine Paint & Refinishing | BCS',
    metaDescription:
      'Marine paint and refinishing for South Florida vessels — mobile where permitted, focused on finish quality.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Refine marine paint systems with careful masking, surface prep, and finish discipline.',
    overview:
      'Paint and refinishing work ranges from localized corrections to broader cosmetic campaigns. We emphasize control, cleanliness, and a premium result without publishing prices.',
    problemsTitle: 'Common problems',
    problems: [
      'Fading and oxidation',
      'Overspray and contamination',
      'Edge failures and peeling',
      'Uneven gloss after prior refinishing',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Plan',
        body: 'Define areas, protection needs, and environmental constraints.',
      },
      {
        title: 'Prep',
        body: 'Sand, fair, and mask with attention to adjacent hardware and teak.',
      },
      {
        title: 'Apply',
        body: 'Apply finish systems suited to the agreed scope.',
      },
      {
        title: 'Inspect',
        body: 'Review gloss, coverage, and edges with the client.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Premium finish standards',
      'Mobile or yard-friendly workflow',
      'Clear communication',
      'No fake reviews or invented statistics',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Can you match an existing paint color?',
        answer:
          'Color matching is evaluated per vessel and finish system. See our Color Matching service for dedicated detail.',
      },
    ],
  }),
  hullRestoration: service({
    title: 'Hull Restoration',
    metaTitle: 'Hull Restoration | Marine | BCS',
    metaDescription:
      'Hull restoration and cosmetic recovery for yachts and boats served from Jupiter southward.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Bring tired hull surfaces back toward a clean, reflective, presentation-ready state.',
    overview:
      'Hull restoration may combine oxidation correction, spot repairs, and finish refinement. Scope is always vessel-specific — never a one-size website package price.',
    problemsTitle: 'Common problems',
    problems: [
      'Heavy oxidation',
      'Waterline staining and growth marks',
      'Patchwork from prior repairs',
      'Loss of depth in dark colors',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Evaluate',
        body: 'Walk the hull and document priorities with the owner or captain.',
      },
      {
        title: 'Correct',
        body: 'Address defects and prepare surfaces methodically.',
      },
      {
        title: 'Restore',
        body: 'Rebuild finish integrity in the agreed zones.',
      },
      {
        title: 'Present',
        body: 'Final review in good light for reflection and uniformity.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Marine specialist focus',
      'Mobile service advantage',
      'Detail-oriented finishing',
      'Transparent estimate policy',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you restore bottoms and antifouling systems?',
        answer:
          'Primary public focus is cosmetic and coatings work above the agreed waterline scope. Specific bottom programs are discussed case by case.',
      },
    ],
  }),
  yachtCosmeticRepair: service({
    title: 'Yacht Cosmetic Repair',
    metaTitle: 'Yacht Cosmetic Repair | BCS',
    metaDescription:
      'Cosmetic repairs for yachts — gelcoat, paint, and finish corrections with mobile service in South Florida.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Correct visible cosmetic issues that affect presentation without overstating structural scope.',
    overview:
      'Yacht cosmetic repair covers chips, scrapes, localized refinishing, and blend work. Ideal for owners and captains preparing for season, sale, or charter presentation.',
    problemsTitle: 'Common problems',
    problems: [
      'Dock rash and rub rail marks',
      'Deck and cabin-side scuffs',
      'Hardware installation scars',
      'Small voids and pinholes',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Prioritize',
        body: 'Identify the highest-visibility repairs first.',
      },
      {
        title: 'Protect',
        body: 'Mask and shield adjacent finishes and interiors as needed.',
      },
      {
        title: 'Repair',
        body: 'Execute precise cosmetic corrections.',
      },
      {
        title: 'Blend',
        body: 'Polish and blend for a coherent look.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Presentation-minded craftsmanship',
      'Mobile convenience',
      'Respect for yacht interiors and hardware',
      'Honest placeholder policy for portfolio media',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Can cosmetic work be scheduled around charter calendars?',
        answer:
          'We coordinate timing when access and marina rules allow. Use Schedule Visit to share preferred windows.',
      },
    ],
  }),
  structuralCompositeRepair: service({
    title: 'Structural Composite Repair',
    metaTitle: 'Structural Composite Repair | Marine | BCS',
    metaDescription:
      'Composite and small structural marine repairs — assessed carefully, executed with process discipline.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Address composite damage with a clear assessment — never exaggerated claims or vague website packages.',
    overview:
      'Structural composite repairs require sober evaluation. We clarify what is cosmetic versus structural, then proceed with a defined plan. No fabricated case studies are shown.',
    problemsTitle: 'Common problems',
    problems: [
      'Laminate cracks from impact',
      'Core concerns in decks or panels',
      'Secondary bond failures',
      'Repair zones needing load-path awareness',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Diagnose',
        body: 'Inspect and discuss findings with decision-makers.',
      },
      {
        title: 'Define scope',
        body: 'Separate structural needs from cosmetic follow-through.',
      },
      {
        title: 'Execute',
        body: 'Repair with materials and methods suited to the structure.',
      },
      {
        title: 'Verify',
        body: 'Review workmanship and outline any remaining cosmetic steps.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Technical credibility over hype',
      'Clear communication',
      'Mobile or facility-friendly when required',
      'No fake certifications or invented history',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you guarantee every composite issue is minor?',
        answer:
          'No. Some findings require broader intervention or partner specialists. We will say so plainly.',
      },
    ],
  }),
  colorMatching: service({
    title: 'Color Matching',
    metaTitle: 'Marine Color Matching | BCS',
    metaDescription:
      'Marine color matching for gelcoat and paint repairs — disciplined matching for cohesive vessel appearance.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Match surrounding finishes so repairs disappear into the vessel’s existing color story.',
    overview:
      'Color matching is often the difference between a visible patch and a discreet repair. We treat matching as a core craft step, not an afterthought.',
    problemsTitle: 'Common problems',
    problems: [
      'Repairs that read as different hues in sunlight',
      'Aging finishes that no longer match OEM codes',
      'Metallic and pearl effect mismatch',
      'Accent and stripe discontinuities',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Sample',
        body: 'Evaluate color under appropriate light on the vessel.',
      },
      {
        title: 'Formulate',
        body: 'Adjust mixtures toward the surrounding finish.',
      },
      {
        title: 'Test',
        body: 'Validate before committing large visible areas.',
      },
      {
        title: 'Apply',
        body: 'Integrate the matched finish into the repair zone.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Finish-sensitive eye',
      'Patience with matching',
      'Marine lighting awareness',
      'Transparent process',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Can every color be matched perfectly?',
        answer:
          'Aging, metallic effects, and prior mixes can limit perfection. We aim for the best practical blend and set expectations early.',
      },
    ],
  }),
  insuranceRepair: service({
    title: 'Insurance Repair',
    metaTitle: 'Marine Insurance Repair Support | BCS',
    metaDescription:
      'Marine cosmetic and coatings repairs coordinated for insurance-related work — clear documentation mindset, no website prices.',
    heroEyebrow: 'Marine service',
    heroLead:
      'Support insurance-related marine repairs with clear scope, careful documentation habits, and finish quality.',
    overview:
      'Insurance repair work requires clarity. We help owners and managers understand cosmetic and coatings scope. We do not display prices online or invent claim outcomes.',
    problemsTitle: 'Common problems',
    problems: [
      'Dock damage and collision cosmetics',
      'Storm-related surface damage',
      'Multiple small repairs across a vessel',
      'Need for photo documentation of progress',
    ],
    processTitle: 'Our process',
    processSteps: [
      {
        title: 'Review',
        body: 'Understand the reported damage and access conditions.',
      },
      {
        title: 'Scope',
        body: 'Define repair areas without promising insurer decisions.',
      },
      {
        title: 'Repair',
        body: 'Execute agreed work with professional finish standards.',
      },
      {
        title: 'Document',
        body: 'Provide clear visual records when requested for the file.',
      },
    ],
    whyTitle: 'Why Choose BCS',
    whyPoints: [
      'Professional communication',
      'Photo-friendly process when needed',
      'Marine finish expertise',
      'No fabricated testimonials',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you bill insurance companies directly?',
        answer:
          'Billing arrangements vary. We discuss practical options after scope is clear — never as a website guarantee.',
      },
      {
        question: 'Are estimates free for insurance work?',
        answer:
          'Free estimates apply only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
      },
    ],
  }),
};
