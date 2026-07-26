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
    metaTitle: 'Gelcoat Repair | Best Coatings Solutions',
    metaDescription:
      'Restore damaged gelcoat while protecting the look of your boat’s original finish. Mobile marine repair in South Florida.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Restore damaged gelcoat while preserving the appearance and integrity of your boat’s original finish.',
    overview:
      'Gelcoat takes sun, dock contact, and age hard. We inspect the area, prepare the surface, repair what sits underneath when needed, and match the surrounding finish before the final polish. Work is done at the marina, yard, or home when conditions allow. We do not publish prices online.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Oxidation and chalking',
      'Stress cracks and spider cracks',
      'Chips and gouges',
      'Old repairs that no longer match',
      'Faded accents and boot stripes',
    ],
    processTitle: 'How we approach it',
    processSteps: [
      {
        title: 'Inspect',
        body: 'Look at the damage, the surrounding finish, and access before choosing a method.',
      },
      {
        title: 'Prepare',
        body: 'Protect nearby surfaces, open the damaged area, and fair carefully.',
      },
      {
        title: 'Repair & match',
        body: 'Rebuild the gelcoat system and match color so the repair belongs to the boat.',
      },
      {
        title: 'Finish',
        body: 'Refine gloss and blend edges, then review the result with you.',
      },
    ],
    whyTitle: 'Why proper gelcoat repair matters',
    whyPoints: [
      'A rushed patch often shows in the next season of sun',
      'Color mismatch draws the eye to the repair',
      'Good preparation helps the finish last longer',
      'Clear scope avoids surprises mid-job',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you publish gelcoat repair prices?',
        answer:
          'No. Scope is reviewed per boat. We do not display prices on the website.',
      },
      {
        question: 'Are estimates free?',
        answer:
          'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
      },
      {
        question: 'Can you work at my marina?',
        answer: 'When marina rules and conditions allow, we work on site.',
      },
      {
        question: 'Will the repair be invisible?',
        answer:
          'We aim for the best practical blend. Aging gelcoat and prior mixes can limit perfection. We set that expectation early.',
      },
    ],
  }),
  fiberglassRepair: service({
    title: 'Fiberglass Repair',
    metaTitle: 'Fiberglass Repair | Best Coatings Solutions',
    metaDescription:
      'Repair fiberglass damage with careful preparation so the area can be refinished properly. Mobile marine work in South Florida.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Repair structural and cosmetic fiberglass damage with careful preparation so the area can be refinished properly.',
    overview:
      'Fiberglass damage can be cosmetic or deeper. We inspect first, explain what we see in plain language, then rebuild and finish the area so it is ready for gelcoat or paint. Mobile service where permitted.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Impact cracks and punctures',
      'Soft spots and moisture concerns',
      'Bond failures in prior repairs',
      'Fiber print-through after earlier work',
    ],
    processTitle: 'How we approach it',
    processSteps: [
      {
        title: 'Inspect',
        body: 'Identify how far the damage goes and what access allows.',
      },
      {
        title: 'Stabilize',
        body: 'Remove compromised material and prepare a clean bonding surface.',
      },
      {
        title: 'Rebuild',
        body: 'Laminate or fair with materials suited to the agreed scope.',
      },
      {
        title: 'Finish',
        body: 'Return the area toward the surrounding cosmetic standard.',
      },
    ],
    whyTitle: 'Why proper fiberglass repair matters',
    whyPoints: [
      'Covering damage without fixing what is underneath often fails later',
      'Clean preparation improves the bond of the repair',
      'Honest scope protects you from a cosmetic-only fix when more is needed',
      'A sound repair gives the finish work a fair chance',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Is every fiberglass issue structural?',
        answer:
          'No. Some repairs are cosmetic; others need deeper laminate work. We clarify that before proceeding.',
      },
      {
        question: 'Do you list prices online?',
        answer: 'No. Pricing is never displayed on the public website.',
      },
    ],
  }),
  paintRefinishing: service({
    title: 'Paint & Refinishing',
    metaTitle: 'Marine Paint & Refinishing | Best Coatings Solutions',
    metaDescription:
      'Correct and refinish painted marine surfaces with controlled preparation and honest scope. South Florida mobile service.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Correct and refinish painted surfaces with controlled process and honest scope.',
    overview:
      'Paint work ranges from small corrections to larger cosmetic campaigns. We plan protection, prepare carefully, and apply finish systems suited to the agreed area. Clean process matters as much as the final gloss. No website prices.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Fading and oxidation',
      'Overspray and contamination',
      'Edge failures and peeling',
      'Uneven gloss after prior work',
    ],
    processTitle: 'How we approach it',
    processSteps: [
      {
        title: 'Plan',
        body: 'Define the area, protection needs, and working conditions.',
      },
      {
        title: 'Prepare',
        body: 'Sand, fair, and mask with care for nearby hardware and finishes.',
      },
      {
        title: 'Apply',
        body: 'Apply the finish system suited to the agreed scope.',
      },
      {
        title: 'Review',
        body: 'Check gloss, coverage, and edges with you in good light.',
      },
    ],
    whyTitle: 'Why proper paint work matters',
    whyPoints: [
      'Preparation decides how the finish looks months later',
      'Poor masking shows on hardware and neighboring surfaces',
      'Clear scope keeps the job focused',
      'Honest expectations beat surprise results',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Can you match an existing paint color?',
        answer:
          'Color matching is evaluated per boat and finish system. See Color Matching for more detail.',
      },
    ],
  }),
  hullRestoration: service({
    title: 'Hull Restoration',
    metaTitle: 'Hull Restoration | Best Coatings Solutions',
    metaDescription:
      'Restore tired hull surfaces with careful correction and finish work. Marine repair in South Florida.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Bring tired hull surfaces back toward a clean, reflective appearance through careful correction and finish work.',
    overview:
      'Hull restoration may combine oxidation correction, spot repairs, and finish refinement. Scope is always boat-specific. We walk the hull, set priorities with you, and work methodically — never as a one-size website package.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Heavy oxidation',
      'Waterline staining',
      'Patchwork from prior repairs',
      'Loss of depth in dark colors',
    ],
    processTitle: 'How we approach it',
    processSteps: [
      {
        title: 'Evaluate',
        body: 'Walk the hull and agree on priorities with the owner or captain.',
      },
      {
        title: 'Correct',
        body: 'Address defects and prepare surfaces step by step.',
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
    whyTitle: 'Why proper hull restoration matters',
    whyPoints: [
      'Oxidation left alone keeps dulling the boat’s appearance',
      'Uneven prior patches are hard to ignore in sunlight',
      'A clear plan prevents over-working areas that do not need it',
      'Good light review catches what photos alone can miss',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you restore bottoms and antifouling systems?',
        answer:
          'Our public focus is cosmetic and coatings work in the agreed above-waterline scope. Bottom programs are discussed case by case.',
      },
    ],
  }),
  yachtCosmeticRepair: service({
    title: 'Yacht Cosmetic Repair',
    metaTitle: 'Yacht Cosmetic Repair | Best Coatings Solutions',
    metaDescription:
      'Correct visible cosmetic damage so your yacht presents cleanly — without overstating structural scope.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Correct visible cosmetic issues that affect presentation without overstating structural scope.',
    overview:
      'Dock rash, scuffs, and small voids can make a well-kept yacht look neglected. We prioritize the most visible areas, protect nearby finishes, and blend repairs carefully. Timing can be coordinated when marina access allows.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Dock rash and rub rail marks',
      'Deck and cabin-side scuffs',
      'Hardware installation scars',
      'Small voids and pinholes',
    ],
    processTitle: 'How we approach it',
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
    whyTitle: 'Why cosmetic care matters',
    whyPoints: [
      'Small marks are what guests and buyers notice first',
      'Protecting nearby finishes avoids creating a bigger problem',
      'Honest cosmetic scope stays separate from structural claims',
      'Clear timing helps around season or sale plans',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Can cosmetic work be scheduled around charter calendars?',
        answer:
          'We coordinate timing when access and marina rules allow. Share preferred windows when you request an estimate or contact us.',
      },
    ],
  }),
  structuralCompositeRepair: service({
    title: 'Structural Composite Repair',
    metaTitle: 'Structural Composite Repair | Best Coatings Solutions',
    metaDescription:
      'Assess and repair composite damage with clear scope — cosmetic versus structural explained plainly.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Address composite damage with a clear assessment — never vague website packages or exaggerated claims.',
    overview:
      'Some damage needs more than a cosmetic cover. We inspect, separate structural needs from finish work, and explain findings before repair. If a job needs a broader specialist, we say so plainly.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Laminate cracks from impact',
      'Core concerns in decks or panels',
      'Secondary bond failures',
      'Repair zones that need load-path awareness',
    ],
    processTitle: 'How we approach it',
    processSteps: [
      {
        title: 'Diagnose',
        body: 'Inspect and discuss findings with the decision-makers.',
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
        body: 'Review the workmanship and outline any remaining finish steps.',
      },
    ],
    whyTitle: 'Why honest composite assessment matters',
    whyPoints: [
      'Hiding a structural issue under paint is not a repair',
      'Clear diagnosis protects the boat and the owner',
      'Defined scope keeps everyone aligned',
      'We will not invent capabilities we do not have',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you guarantee every composite issue is minor?',
        answer:
          'No. Some findings need broader intervention or another specialist. We will say so plainly.',
      },
    ],
  }),
  colorMatching: service({
    title: 'Color Matching',
    metaTitle: 'Marine Color Matching | Best Coatings Solutions',
    metaDescription:
      'Match surrounding gelcoat or paint so a repair blends into the boat’s existing finish.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Match surrounding finishes so repairs settle into the boat’s existing color — not sit beside it as a patch.',
    overview:
      'Color matching is often the difference between a quiet repair and a visible one. We sample on the boat, adjust carefully, and test before committing large visible areas. Aging finishes and metallic effects can limit perfection — we say that early.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Repairs that look wrong in sunlight',
      'Aging finishes that no longer match old codes',
      'Metallic and pearl effect mismatch',
      'Accent and stripe discontinuities',
    ],
    processTitle: 'How we approach it',
    processSteps: [
      {
        title: 'Sample',
        body: 'Evaluate color under appropriate light on the boat.',
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
    whyTitle: 'Why color matching matters',
    whyPoints: [
      'The eye finds mismatch before it finds technique',
      'Sunlight reveals what indoor light can hide',
      'Patience here protects the whole repair',
      'Honest limits build trust before work starts',
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
    metaTitle: 'Marine Insurance Repair Support | Best Coatings Solutions',
    metaDescription:
      'Marine cosmetic and coatings repairs with clear scope and documentation habits. Coverage decisions stay with you and your insurer.',
    heroEyebrow: 'Marine repair',
    heroLead:
      'Support insurance-related marine repairs with clear scope, careful documentation habits, and finish quality.',
    overview:
      'Insurance work needs clarity. We help you understand cosmetic and coatings scope through photos, inspection when needed, and a written scope before repair. Coverage decisions belong to you and your insurer. Best Coatings Solutions does not guarantee claim approval, does not act as a public adjuster, and does not display prices online.',
    problemsTitle: 'Problems this solves',
    problems: [
      'Dock damage and collision cosmetics',
      'Storm-related surface damage',
      'Several small repairs across a boat',
      'Need for photo documentation of progress',
      'Need for clear owner communication before authorization',
    ],
    processTitle: 'How we approach it',
    processSteps: [
      {
        title: 'Initial documentation',
        body: 'Review the reported damage and any photos you share.',
      },
      {
        title: 'Inspection when needed',
        body: 'Recommend on-site inspection when photos are not enough for responsible planning.',
      },
      {
        title: 'Scope preparation',
        body: 'Prepare repair scope for agreed cosmetic or coatings work — without promising insurer decisions.',
      },
      {
        title: 'Authorization & repair',
        body: 'Proceed after appropriate authorization, then review completion against the agreed scope.',
      },
    ],
    whyTitle: 'What you should expect',
    whyPoints: [
      'Clear communication with the owner',
      'Photo documentation habits when useful',
      'Marine finish focus',
      'No preferred-vendor or claim-approval promises',
      'No public-adjuster or legal-representation role',
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        question: 'Do you guarantee insurance claim approval?',
        answer:
          'No. Coverage decisions belong to you and your insurer. A repair estimate does not determine policy coverage.',
      },
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
      {
        question: 'Do you act as a public adjuster?',
        answer:
          'No. We do not provide public-adjuster services, legal representation, or authority to interpret insurance policies.',
      },
    ],
  }),
};
