/**
 * Central FAQ answers (English) — single source of truth.
 * Service pages should reuse these answers where appropriate to avoid conflicts.
 */

import type { FaqCategoryId } from '@/config/faq';

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface FaqCategoryContent {
  readonly id: FaqCategoryId;
  readonly title: string;
  readonly description: string;
  readonly items: readonly FaqItem[];
}

export const faqContentEn: readonly FaqCategoryContent[] = [
  {
    id: 'estimates',
    title: 'Estimates',
    description: 'How marine repair estimates work at Best Coatings Solutions.',
    items: [
      {
        id: 'estimates-free',
        question: 'Are estimates free?',
        answer:
          'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements. An estimate request does not confirm an appointment or a final price.',
      },
      {
        id: 'estimates-instant',
        question: 'Can I get an instant online estimate?',
        answer:
          'No. We do not provide instant website pricing. Scope depends on vessel condition, access, materials, and repair method, which are reviewed after you share details and photos when helpful.',
      },
      {
        id: 'estimates-what-needed',
        question: 'What information helps with an estimate request?',
        answer:
          'Useful details include vessel type, general location, a clear description of the damage, and well-lit photographs. Additional information or an inspection may be requested before a written scope is prepared.',
      },
    ],
  },
  {
    id: 'inspections',
    title: 'Inspections',
    description: 'When and how vessel inspections support repair planning.',
    items: [
      {
        id: 'inspections-when',
        question: 'When is an on-site inspection needed?',
        answer:
          'Some cosmetic repairs can begin from clear photos. Color matching, layered damage, access constraints, or uncertain substrate conditions often benefit from on-site evaluation before final scope.',
      },
      {
        id: 'inspections-diagnosis',
        question: 'Does a website FAQ diagnose my vessel?',
        answer:
          'No. General website content is educational. Actual repair requirements depend on inspection and vessel condition. Uncertain or potentially structural damage should receive professional evaluation.',
      },
    ],
  },
  {
    id: 'gelcoat-repair',
    title: 'Gelcoat repair',
    description: 'Common questions about gelcoat restoration.',
    items: [
      {
        id: 'gelcoat-what',
        question: 'What kinds of gelcoat issues can be addressed?',
        answer:
          'Typical cosmetic gelcoat work includes chips, gouges, oxidation concerns, and localized refinishing where conditions allow. Scope is confirmed after review — not from website assumptions.',
      },
      {
        id: 'gelcoat-invisible',
        question: 'Will the repair be invisible?',
        answer:
          'We work carefully toward a cohesive finish, but we do not guarantee invisible repairs. Results depend on damage extent, surrounding finish condition, lighting, and the agreed scope.',
      },
    ],
  },
  {
    id: 'fiberglass-repair',
    title: 'Fiberglass repair',
    description: 'Cosmetic and composite fiberglass repair questions.',
    items: [
      {
        id: 'fiberglass-cosmetic-vs-structural',
        question: 'Is all fiberglass damage cosmetic?',
        answer:
          'No. Some damage is primarily cosmetic; other conditions may involve laminate integrity. When damage is uncertain or potentially structural, professional evaluation is appropriate before repair planning.',
      },
      {
        id: 'fiberglass-diy',
        question: 'Should I attempt structural fiberglass repair myself?',
        answer:
          'We do not provide hazardous DIY structural repair instructions. Grinding, laminating, and related work can involve safety and structural risks. Seek professional evaluation for uncertain damage.',
      },
    ],
  },
  {
    id: 'paint-refinishing',
    title: 'Paint and refinishing',
    description: 'Questions about marine paint and refinishing systems.',
    items: [
      {
        id: 'paint-scope',
        question: 'How is paint or refinishing scope decided?',
        answer:
          'Scope depends on existing coating condition, preparation needs, color goals, and access. A written repair scope, when prepared, defines the agreed work — website pages do not replace that agreement.',
      },
    ],
  },
  {
    id: 'structural-composite-repair',
    title: 'Structural composite repair',
    description: 'Questions about composite work that may go beyond cosmetics.',
    items: [
      {
        id: 'structural-evaluation',
        question: 'Do you confirm structural engineering conclusions online?',
        answer:
          'No. Website content is not structural engineering advice. Conditions that may affect integrity require professional evaluation, and repair methods are planned from inspection — not from general articles.',
      },
    ],
  },
  {
    id: 'color-matching',
    title: 'Color matching',
    description: 'Why color work often needs careful evaluation.',
    items: [
      {
        id: 'color-inspection',
        question: 'Why might color matching require inspection?',
        answer:
          'Marine finishes age unevenly under sun, water, and previous repairs. Photos help, but lighting, texture, and surrounding panels often require in-person evaluation to plan an appropriate match approach.',
      },
      {
        id: 'color-guarantee',
        question: 'Do you guarantee a perfect color match?',
        answer:
          'No. We give careful attention to color and finish, but we do not guarantee perfect or permanent color matching. Outcomes depend on substrate, aging, materials, and the agreed approach.',
      },
    ],
  },
  {
    id: 'insurance-related-repairs',
    title: 'Insurance-related repairs',
    description:
      'How BCS supports insurance-related marine repair conversations.',
    items: [
      {
        id: 'insurance-coverage',
        question: 'Does BCS guarantee insurance claim approval?',
        answer:
          'No. Coverage decisions belong to the customer and the insurer. A repair estimate does not determine policy coverage, and BCS does not guarantee claim approval.',
      },
      {
        id: 'insurance-adjuster',
        question: 'Do you act as a public adjuster or legal representative?',
        answer:
          'No. BCS does not provide public-adjuster services, legal representation, or authority to interpret insurance policies. We focus on repair scope, documentation habits, and agreed workmanship.',
      },
      {
        id: 'insurance-preferred',
        question: 'Are you a preferred vendor for every insurer?',
        answer:
          'We do not claim preferred-vendor status for every insurer, and we do not promise direct billing to every insurer. Billing and documentation arrangements are discussed after scope is clear.',
      },
    ],
  },
  {
    id: 'vessel-preparation',
    title: 'Vessel preparation',
    description: 'How owners can prepare for inspection or repair visits.',
    items: [
      {
        id: 'prep-access',
        question: 'How should I prepare the vessel for a visit?',
        answer:
          'Clear access to the repair area, secure the vessel as required by the marina or location, and share any site rules in advance. Specific preparation steps are confirmed when a visit is arranged.',
      },
    ],
  },
  {
    id: 'vessel-access',
    title: 'Vessel access',
    description: 'Marina rules, boatyards, and working conditions.',
    items: [
      {
        id: 'access-marina',
        question: 'Can you work at my marina?',
        answer:
          'When marina rules, weather, and conditions allow, mobile service may be possible on site. Listing South Florida does not mean every marina or every location is available for every job.',
      },
    ],
  },
  {
    id: 'damage-photography',
    title: 'Damage photography',
    description: 'Helpful photo practices when requesting an estimate.',
    items: [
      {
        id: 'photos-tips',
        question: 'How should I photograph vessel damage?',
        answer:
          'Use natural light when possible, include wide context shots and close details, keep the camera steady, and avoid heavy filters. Photos support review; they do not replace inspection when conditions are unclear.',
      },
    ],
  },
  {
    id: 'scheduling',
    title: 'Scheduling',
    description: 'How visits and timing are discussed.',
    items: [
      {
        id: 'scheduling-confirm',
        question: 'Does submitting a form confirm an appointment?',
        answer:
          'No. Form submission requests a response — it does not confirm an appointment, emergency response, or a guaranteed turnaround time. Timing depends on scope, access, weather, and availability.',
      },
    ],
  },
  {
    id: 'workmanship',
    title: 'Workmanship',
    description: 'How workmanship and warranty language are handled.',
    items: [
      {
        id: 'workmanship-warranty',
        question: 'What warranty applies to repairs?',
        answer:
          'Warranty terms, when applicable, are defined in the approved written repair scope. Coverage may depend on the repair type, materials, vessel condition, and documented agreement. Website pages do not create a universal warranty period.',
      },
      {
        id: 'workmanship-lifetime',
        question: 'Do you offer a lifetime warranty?',
        answer:
          'We do not publish a lifetime warranty or a single universal warranty duration on the website. Final warranty details remain an owner and legal review decision for each approved scope.',
      },
    ],
  },
  {
    id: 'service-area',
    title: 'Service area',
    description: 'Where BCS focuses marine repair conversations today.',
    items: [
      {
        id: 'service-area-where',
        question: 'Where do you serve?',
        answer:
          'Best Coatings Solutions focuses on South Florida, from Jupiter southward. Free estimates are available only in the Fort Lauderdale area. Projects outside the normal service area may be considered by arrangement.',
      },
      {
        id: 'service-area-address',
        question: 'What is your shop address?',
        answer:
          'A public physical shop address is not published on this website unless owner-approved. Contact BCS by phone or email for location and access details relevant to your vessel.',
      },
    ],
  },
] as const;
