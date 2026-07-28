/** Phase 4 conversion / forms / legal UI copy (English). */
export const conversionEn = {
  common: {
    optional: 'optional',
    required: 'required',
    next: 'Continue',
    back: 'Back',
    submit: 'Submit request',
    submitting: 'Sending request…',
    errorSummary: 'Please fix the following:',
    submitSuccess:
      'Your request was sent successfully. Best Coatings Solutions will follow up using your preferred contact method when available.',
    submitFailure:
      'We could not send your request right now. Your information is still here — please try again, or call us.',
    configError:
      'We could not send your request because delivery is temporarily unavailable. Please call Best Coatings Solutions or try again later.',
    rateLimited:
      'Too many requests were submitted recently. Please wait a few minutes and try again, or call us.',
    retry: 'Try again',
  },
  formConsent: {
    before:
      'By submitting this form, you agree that Best Coatings Solutions may contact you regarding your request. See our',
    privacy: 'Privacy Policy',
    and: ' and ',
    terms: 'Terms of Use',
    after: '.',
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
      'Contact Best Coatings Solutions about marine or aviation refinishing in South Florida. Call, email, or send a message — no website pricing.',
    eyebrow: 'Contact',
    title: 'Tell Us About Your Project',
    lead: 'Reach us about marine or aviation refinishing. Marine projects can use the estimate form; aviation inquiries are welcome through Contact.',
    directTitle: 'Direct contact',
    hoursTitle: 'Business hours',
    closed: 'Closed',
    weekdays: 'Monday – Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    areaTitle: 'Service area',
    areaBody:
      'We serve South Florida. Free estimates are available only in the Fort Lauderdale area.',
    formTitle: 'Send a message',
    formLead:
      'Tell us how we can help. For aviation projects, describe the cosmetic refinishing need here and we will follow up. Marine estimates also use the dedicated estimate form.',
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
    title: 'Request an Estimate',
    lead: 'Share boat and damage details so we can follow up. This is not an instant quote, binding price, or confirmed appointment.',
    policyNote:
      'Free estimates are available only in the Fort Lauderdale area. Other locations may require review or travel arrangements.',
    noAviation:
      'This estimate form is for marine projects. For aviation cosmetic refinishing inquiries, use Contact.',
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
      'Select up to {max} photos (JPEG, PNG, WebP, HEIC). Max {size} MB each. Photos stay on your device in this release — they are not uploaded or stored by the website.',
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
    contactTitle: 'Message received',
    estimateTitle: 'Estimate request received',
    fallbackTitle: 'Thank you',
    contactBody:
      'Thank you. Your contact request was submitted to Best Coatings Solutions. We will follow up using your preferred contact method when available.',
    estimateBody:
      'Thank you. Your marine estimate request was submitted to Best Coatings Solutions. We will review the details and follow up when available.',
    fallbackBody:
      'If you just submitted a form, your request was sent for review. For help now, call Best Coatings Solutions or return to Contact.',
    nextTitle: 'What happens next',
    nextSteps: [
      'Best Coatings Solutions reviews incoming requests.',
      'Follow-up uses your preferred contact method when available.',
      'An inspection or estimate discussion happens only when appropriate — nothing is confirmed by the form alone.',
    ],
    noFixedTime: 'We do not promise a fixed response time on this website.',
  },
  privacy: {
    metaTitle: 'Privacy Policy | Best Coatings Solutions',
    metaDescription:
      'Privacy Policy for the Best Coatings Solutions website, contact forms, and marine estimate requests.',
    title: 'Privacy Policy',
    lead: 'This Privacy Policy explains how Best Coatings Solutions handles information submitted through this website.',
    lastUpdatedLabel: 'Last updated',
    sections: [
      {
        title: 'Website operator',
        body: 'Best Coatings Solutions operates this website. The legal entity referenced for site notices is Best Coatings Solutions LLC. We operate in Florida, United States. No public street address is published on this website. [Owner to provide mailing address if a postal address is required.]',
      },
      {
        title: 'Information you may submit',
        body: 'Through contact and estimate forms you may provide your name, email address, phone number, preferred contact method, inquiry type, message contents, vessel or aircraft details when included, project or damage descriptions, service preferences, and related acknowledgments. The estimate form also allows local photo selection for your own review; photo files are not uploaded or stored by this website in the current release. Filenames or counts may be referenced in internal notifications when you select photos.',
      },
      {
        title: 'Technical information',
        body: 'Like most websites, hosting infrastructure may process basic technical logs such as IP address, browser type, request path, and timestamps to operate and secure the site. We do not operate a separate marketing cookie banner. This site uses Vercel Analytics for aggregated traffic insights; it is not used to build advertising profiles on this site, and we do not install third-party marketing pixels or ad trackers in the public marketing experience.',
      },
      {
        title: 'Purpose of collection',
        body: 'We use submitted information to respond to inquiries, prepare estimate evaluations, schedule or discuss service communications when appropriate, improve website reliability and security, and operate day-to-day customer communication related to your request.',
      },
      {
        title: 'Service providers',
        body: 'We use service providers to host the website and deliver transactional email, including Vercel (hosting / deployment) and Resend (email delivery for form notifications). These providers process information only as needed to provide their services to us. We do not sell your personal information.',
      },
      {
        title: 'Data retention',
        body: 'We retain inquiry and estimate-request information for as long as reasonably needed to respond, evaluate projects, maintain business records, and meet legal or security obligations. Retention periods may vary by request type. You may contact us to ask about information you submitted.',
      },
      {
        title: 'Data security',
        body: 'We use reasonable administrative and technical measures appropriate to the nature of the information, including HTTPS, server-side validation, and access-limited delivery tooling. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
      },
      {
        title: 'Privacy requests',
        body: 'To ask questions about privacy, request an update, or discuss information you submitted, contact Best Coatings Solutions using the phone number or email published on the Contact page (info@bestcoatingssolutions.com / 305-747-8352).',
      },
      {
        title: 'Children’s privacy',
        body: 'This website is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child submitted information, contact us so we can delete it.',
      },
      {
        title: 'Third-party links',
        body: 'This website may link to third-party sites. We are not responsible for the privacy practices or content of those sites. Review their policies before providing information.',
      },
      {
        title: 'Policy changes',
        body: 'We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page reflects the current version. Continued use of the website after changes means you should review the published policy.',
      },
      {
        title: 'Contact',
        body: 'Privacy questions: Best Coatings Solutions — email info@bestcoatingssolutions.com, phone 305-747-8352, or use the Contact page. Location context: Florida, United States. [Owner to provide mailing address if a postal address is required.]',
      },
    ],
  },
  terms: {
    metaTitle: 'Terms of Use | Best Coatings Solutions',
    metaDescription:
      'Terms of Use for the Best Coatings Solutions website, including estimate-request limitations and acceptable use.',
    title: 'Terms of Use',
    lead: 'These Terms of Use govern access to and use of the Best Coatings Solutions website.',
    lastUpdatedLabel: 'Last updated',
    sections: [
      {
        title: 'Acceptance of terms',
        body: 'By accessing or using this website, you agree to these Terms of Use. If you do not agree, do not use the site.',
      },
      {
        title: 'Permitted website use',
        body: 'You may use this website for lawful, personal, or business inquiries related to Best Coatings Solutions services. You may not misuse the site, interfere with its operation, or attempt unauthorized access.',
      },
      {
        title: 'Informational nature of content',
        body: 'Website content is provided for general information about Best Coatings Solutions and its Marine and Aviation refinishing services. Content may change and may not address every situation.',
      },
      {
        title: 'Estimate-request disclaimer',
        body: 'A website inquiry or estimate submission is only a request for evaluation. It is not a binding estimate, contract, repair authorization, guarantee, or commitment to perform work. Final pricing, if any, may depend on inspection, materials, condition, scope, access, scheduling, and other project factors. Best Coatings Solutions does not guarantee that every requested project will be accepted.',
      },
      {
        title: 'Inspection and written authorization',
        body: 'Any work requires separate review and written authorization as agreed between you and Best Coatings Solutions. Form submission alone does not schedule a visit, confirm an appointment, authorize repairs, or create a service contract.',
      },
      {
        title: 'Intellectual property',
        body: 'Site content, branding, logos, text, and materials are owned by Best Coatings Solutions or its licensors unless otherwise noted. You may not copy, modify, or redistribute site materials for commercial purposes without permission.',
      },
      {
        title: 'Prohibited conduct',
        body: 'You may not submit unlawful, abusive, deceptive, or harmful content; attempt to overload or disrupt the site; harvest data; or use automated means to submit forms except as expressly permitted.',
      },
      {
        title: 'Third-party links',
        body: 'Links to third-party websites, if present, are provided for convenience. Best Coatings Solutions does not control and is not responsible for third-party content or practices.',
      },
      {
        title: 'Manufacturer and brand disclaimer',
        body: 'References to manufacturers, vessels, aircraft, brands, former employers, or professional experience are descriptive only and do not imply sponsorship, affiliation, authorization, or endorsement.',
      },
      {
        title: 'Website availability',
        body: 'We aim to keep the website available but do not guarantee uninterrupted or error-free operation. Access may be suspended for maintenance, security, or operational reasons.',
      },
      {
        title: 'Disclaimer of warranties',
        body: 'THE WEBSITE AND ITS CONTENT ARE PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.',
      },
      {
        title: 'Limitation of liability',
        body: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, BEST COATINGS SOLUTIONS AND ITS OWNERS, EMPLOYEES, AND AGENTS ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE WEBSITE OR RELIANCE ON SITE CONTENT. OUR TOTAL LIABILITY FOR CLAIMS RELATING TO THE WEBSITE IS LIMITED TO THE GREATER OF FIFTY U.S. DOLLARS (US $50) OR THE AMOUNT YOU PAID US, IF ANY, FOR WEBSITE ACCESS IN THE TWELVE MONTHS BEFORE THE CLAIM.',
      },
      {
        title: 'Indemnification',
        body: 'You agree to indemnify and hold harmless Best Coatings Solutions from claims, losses, and expenses (including reasonable attorneys’ fees) arising from your misuse of the website, your submission of unlawful content, or your violation of these Terms.',
      },
      {
        title: 'Governing law',
        body: 'These Terms are governed by the laws of the State of Florida, United States, without regard to conflict-of-law principles. Courts located in Florida have exclusive jurisdiction over disputes arising from these Terms or the website, to the extent permitted by law.',
      },
      {
        title: 'Changes to terms',
        body: 'We may update these Terms of Use. The “Last updated” date reflects the current version. Continued use of the website after changes constitutes acceptance of the updated Terms.',
      },
      {
        title: 'Severability',
        body: 'If any provision of these Terms is found unenforceable, the remaining provisions remain in effect.',
      },
      {
        title: 'Contact',
        body: 'Questions about these Terms: Best Coatings Solutions — email info@bestcoatingssolutions.com, phone 305-747-8352, or use the Contact page. Florida, United States. [Owner to provide mailing address if a postal address is required.]',
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
