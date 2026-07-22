/** Phase 4 conversion / forms / legal UI copy (English). */
export const conversionEn = {
  common: {
    optional: 'optional',
    required: 'required',
    next: 'Continue',
    back: 'Back',
    submit: 'Submit request',
    submitting: 'Preparing request…',
    errorSummary: 'Please fix the following:',
    demoBanner:
      'Demonstration mode: requests are prepared locally until production delivery is configured.',
    demoSuccess:
      'Your request has been prepared successfully. Direct delivery will be enabled before production launch.',
    demoFailure:
      'We could not prepare your request. Your information is still here — please try again.',
    retry: 'Try again',
  },
  validation: {
    required: 'This field is required.',
    email: 'Enter a valid email address.',
    phone: 'Enter a valid phone number.',
    messageMin: 'Please enter at least 10 characters.',
    descriptionMin: 'Please describe the damage in at least 20 characters.',
    consent: 'Please confirm this acknowledgment to continue.',
    year: 'Enter a valid vessel year.',
    length: 'Enter vessel length in feet.',
    servicesMin: 'Select at least one marine service.',
    maxFiles: 'Too many photos. Remove some before continuing.',
    maxSize: 'A selected photo exceeds the maximum file size.',
    fileType: 'One or more files use an unsupported format.',
  },
  contact: {
    metaTitle: 'Contact | Best Coatings Solutions',
    metaDescription:
      'Contact Best Coatings Solutions for marine coatings questions in South Florida. Call, email, or send a message — no website pricing.',
    eyebrow: 'Contact',
    title: 'Contact Best Coatings Solutions',
    lead: 'Reach our team for marine refinishing questions. Aviation remains Coming Soon and is not available for estimates or booking.',
    directTitle: 'Direct contact',
    hoursTitle: 'Business hours',
    closed: 'Closed',
    weekdays: 'Monday – Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    areaTitle: 'Service area',
    areaBody:
      'We serve South Florida from Jupiter southward. Free estimates are available only in the Fort Lauderdale area.',
    formTitle: 'Send a message',
    formLead:
      'Tell us how we can help. This form is for general and marine inquiries — not aviation estimates.',
    mapTitle: 'Location',
    mapPlaceholder:
      'Placeholder Image — map embed not configured. No street address is published on this site.',
    nextTitle: 'What happens next',
    nextSteps: [
      'We review your message.',
      'A team member follows up by your preferred method when available.',
      'If an estimate or visit is appropriate, we discuss next steps — nothing is confirmed by this form alone.',
    ],
    fields: {
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      inquiryType: 'Inquiry type',
      message: 'Message',
      preferredContactMethod: 'Preferred contact method',
      consent:
        'I understand this message does not create an appointment or binding estimate.',
    },
    inquiryTypes: {
      general: 'General question',
      'marine-service': 'Marine service question',
      'estimate-follow-up': 'Estimate follow-up',
      partnership: 'Partnership or vendor',
      other: 'Other',
    },
    preferred: {
      phone: 'Phone',
      email: 'Email',
      either: 'Either phone or email',
    },
  },
  estimate: {
    metaTitle: 'Request Estimate | Best Coatings Solutions',
    metaDescription:
      'Request a marine estimate review from Best Coatings Solutions. Free estimates apply only in Fort Lauderdale. No prices online.',
    eyebrow: 'Marine estimate request',
    title: 'Request a marine estimate review',
    lead: 'Share vessel and damage details so we can follow up. This is not an instant quote, binding price, or confirmed appointment.',
    policyNote:
      'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
    noAviation:
      'Aviation estimate requests are not available. Aviation remains Coming Soon.',
    progress: 'Step {current} of {total}: {label}',
    steps: {
      customer: 'Customer',
      vessel: 'Vessel',
      services: 'Services',
      damage: 'Damage',
      photos: 'Photos',
      review: 'Review',
    },
    fields: {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      preferredContactMethod: 'Preferred contact method',
      manufacturer: 'Manufacturer',
      model: 'Model',
      year: 'Year',
      lengthFeet: 'Length (feet)',
      vesselName: 'Vessel name',
      hin: 'HIN',
      currentLocation: 'Current vessel location',
      marinaName: 'Marina name',
      services: 'Marine services needed',
      damageDescription: 'Damage description',
      affectedArea: 'Approximate affected area',
      damageOccurred: 'When the damage occurred',
      operability: 'Vessel operability',
      insuranceRelated: 'Is this insurance-related?',
      urgency: 'Timing preference',
      photos: 'Photos',
      acknowledgeNotQuote:
        'I understand this request is not a final quotation.',
      acknowledgeInspection:
        'I understand BCS may need an inspection or more information.',
      acknowledgeNoAppointment:
        'I understand submitting this form does not confirm an appointment.',
    },
    services: {
      'gelcoat-repair': 'Gelcoat Repair',
      'fiberglass-repair': 'Fiberglass Repair',
      'paint-refinishing': 'Paint & Refinishing',
      'hull-restoration': 'Hull Restoration',
      'yacht-cosmetic-repair': 'Yacht Cosmetic Repair',
      'structural-composite-repair': 'Structural Composite Repair',
      'color-matching': 'Color Matching',
      'insurance-repair': 'Insurance Repair',
      'other-marine-repair': 'Other Marine Repair',
    },
    affected: {
      small: 'Small area',
      medium: 'Medium area',
      large: 'Large area',
      unsure: 'Not sure',
    },
    operability: {
      'fully-operational': 'Fully operational',
      limited: 'Limited operation',
      'not-operational': 'Not operational',
      unknown: 'Unknown',
    },
    insurance: {
      yes: 'Yes',
      no: 'No',
      unsure: 'Unsure',
    },
    urgency: {
      flexible: 'Flexible timing',
      soon: 'Prefer sooner if possible',
      'time-sensitive': 'Time-sensitive — discuss availability',
    },
    urgencyHint:
      'Timing preferences help planning. We do not promise emergency response times on this website.',
    photosHint:
      'Select up to {max} photos (JPEG, PNG, WebP, HEIC). Max {size} MB each. Photos are not uploaded or stored in this demonstration.',
    photosSelected: '{count} photo(s) selected',
    photosRemove: 'Remove {name}',
    reviewTitle: 'Review your request',
    reviewPhotos: 'Photos attached',
    preferred: {
      phone: 'Phone',
      email: 'Email',
      either: 'Either phone or email',
    },
  },
  schedule: {
    metaTitle: 'Schedule Visit | Best Coatings Solutions',
    metaDescription:
      'Learn how Best Coatings Solutions schedules marine inspections after estimate or contact review. No online calendar booking.',
    eyebrow: 'Visits',
    title: 'How visits are scheduled',
    lead: 'Submitting a request does not confirm a visit. BCS reviews details and contacts you before any inspection is arranged.',
    processTitle: 'Intended process',
    process: [
      'Customer submits an estimate or contact request.',
      'BCS reviews the project details.',
      'BCS contacts the customer.',
      'An inspection or visit may be scheduled when appropriate.',
    ],
    noConfirm:
      'There is no online calendar, time-slot picker, or confirmed appointment booking on this website.',
    checklistTitle: 'Preparation checklist',
    checklist: [
      'Clear photos of the affected areas',
      'Vessel location and access notes',
      'Manufacturer, model, year, and approximate length',
      'Whether the work may be insurance-related',
    ],
    accessTitle: 'Vessel access guidance',
    accessBody:
      'Share marina or storage details, dock access, and any constraints that affect mobile work when you contact us.',
    photoTitle: 'Photos and damage information',
    photoBody:
      'Clear daytime photos from multiple angles help our review. Include close-ups and a wider context shot when possible.',
  },
  thankYou: {
    metaTitle: 'Thank You | Best Coatings Solutions',
    metaDescription:
      'Thank you for contacting Best Coatings Solutions. Review next steps for marine estimate and contact requests.',
    contactTitle: 'Message prepared',
    estimateTitle: 'Estimate request prepared',
    fallbackTitle: 'Thank you',
    contactBody:
      'Your contact request has been prepared in demonstration mode. Direct delivery will be enabled before production launch.',
    estimateBody:
      'Your marine estimate request has been prepared in demonstration mode. Direct delivery will be enabled before production launch.',
    fallbackBody:
      'If you just submitted a form, your request was prepared for future delivery. For help now, call Best Coatings Solutions or return to Contact.',
    nextTitle: 'What happens next',
    nextSteps: [
      'When production delivery is enabled, BCS will review incoming requests.',
      'Follow-up uses your preferred contact method when available.',
      'An inspection is discussed only when appropriate — nothing is confirmed by the form alone.',
    ],
    noFixedTime: 'We do not promise a fixed response time on this website.',
  },
  privacy: {
    metaTitle: 'Privacy Policy | Best Coatings Solutions',
    metaDescription:
      'Privacy information for the Best Coatings Solutions website, contact forms, and marine estimate requests.',
    title: 'Privacy Policy',
    lead: 'How we describe information you may share through this website. Owner and legal review are required before production launch.',
    reviewBadge: 'Requires owner / legal review before production',
    sections: [
      {
        title: 'Information you may provide',
        body: 'Contact details, vessel information, damage descriptions, preferences, and optional photos selected in forms.',
      },
      {
        title: 'Contact and estimate requests',
        body: 'Used to respond to inquiries and evaluate marine project requests. Forms do not create contracts or appointments.',
      },
      {
        title: 'Photos and vessel information',
        body: 'Photo selection in the estimate form is client-side only in the current demonstration. No cloud storage is active yet.',
      },
      {
        title: 'Intended use',
        body: 'To communicate with you about marine services and related follow-up. We do not sell personal information.',
      },
      {
        title: 'Data retention',
        body: 'Retention periods will be defined with owner and legal counsel before production. Placeholder — not yet finalized.',
      },
      {
        title: 'Third-party services',
        body: 'Future email, hosting, analytics, or CRM providers may process data. Providers are not activated for form delivery in this phase.',
      },
      {
        title: 'Security limitations',
        body: 'No website can guarantee absolute security. Production will add server validation, rate limiting, and secure handling.',
      },
      {
        title: 'Your choices',
        body: 'You may contact us to update or discuss information you provided. Phone and email are listed on the Contact page.',
      },
      {
        title: 'Children’s privacy',
        body: 'This website is not directed to children under 13. We do not knowingly collect children’s information.',
      },
      {
        title: 'Policy updates',
        body: 'We may update this page. The published version on this site is the current statement.',
      },
      {
        title: 'Contact',
        body: 'Questions about privacy can be sent through the Contact page or by phone using the number published on this site.',
      },
    ],
  },
  terms: {
    metaTitle: 'Terms and Conditions | Best Coatings Solutions',
    metaDescription:
      'Website terms for Best Coatings Solutions, including estimate-request limitations and acceptable use.',
    title: 'Terms and Conditions',
    lead: 'Terms for using this website. Owner and legal review are required before production launch.',
    reviewBadge: 'Requires owner / legal review before production',
    sections: [
      {
        title: 'Informational website',
        body: 'Content is for general information about Best Coatings Solutions marine services and related topics.',
      },
      {
        title: 'Estimate-request limitations',
        body: 'Submitting a form requests review and follow-up only. It is not a quotation, invoice, or price commitment.',
      },
      {
        title: 'No binding quote from forms',
        body: 'Any pricing discussion happens after review and is confirmed separately — never displayed as public site pricing.',
      },
      {
        title: 'No confirmed appointment from forms',
        body: 'Form submission does not schedule or confirm a visit, inspection, or work date.',
      },
      {
        title: 'Intellectual property',
        body: 'Site content, branding, and materials belong to Best Coatings Solutions or licensors unless otherwise noted.',
      },
      {
        title: 'Acceptable use',
        body: 'Do not misuse forms, attempt unauthorized access, or submit unlawful, abusive, or harmful content.',
      },
      {
        title: 'Third-party links',
        body: 'External links, if present, are not controlled by BCS. We are not responsible for third-party content.',
      },
      {
        title: 'Warranty disclaimer',
        body: 'Website content is provided as-is without warranties of completeness for every situation. Placeholder pending legal review.',
      },
      {
        title: 'Limitation of liability',
        body: 'Limitation language will be finalized with legal counsel. Placeholder — not a final legal term.',
      },
      {
        title: 'Governing law',
        body: 'Governing law and venue will be confirmed with the owner and counsel. Not fabricated in this draft.',
      },
      {
        title: 'Changes',
        body: 'We may update these terms. Continued use of the site means you should review the latest published version.',
      },
      {
        title: 'Contact',
        body: 'Questions about these terms can be sent through the Contact page or by calling the published business phone.',
      },
    ],
  },
  notFound: {
    metaTitle: 'Page Not Found | Best Coatings Solutions',
    title: 'Page not found',
    body: 'That page does not exist or is no longer available.',
  },
  error: {
    title: 'Something went wrong',
    body: 'We hit an unexpected problem. You can try again or return home.',
    retry: 'Try again',
  },
  a11y: {
    stepStatus: 'Form progress',
    submitting: 'Submitting form',
    fileInput: 'Select damage photos',
  },
} as const;

export type ConversionCopy = typeof conversionEn;
