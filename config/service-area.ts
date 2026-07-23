/**
 * Service-area configuration — only approved locations may be published.
 * Do not invent city lists, marina lists, or travel radius claims.
 */

import type { OwnerApprovalStatus } from '@/config/publication';

export type ServiceAreaEntryStatus =
  'draft' | 'approved' | 'published' | 'archived';

export interface ServiceAreaLocation {
  readonly id: string;
  readonly name: string;
  readonly kind: 'primary' | 'city' | 'county' | 'region' | 'note';
  readonly status: ServiceAreaEntryStatus;
  readonly ownerApprovalStatus: OwnerApprovalStatus;
  readonly summaryEn?: string;
  readonly summaryEs?: string;
}

export interface ServiceAreaConfig {
  readonly primaryArea: ServiceAreaLocation;
  readonly additionalLocations: readonly ServiceAreaLocation[];
  readonly travelNotes: readonly ServiceAreaLocation[];
  readonly inspectionNotes: readonly ServiceAreaLocation[];
  readonly limitations: readonly ServiceAreaLocation[];
  /**
   * Map treatment — lightweight static placeholder only.
   * Do not add a map SDK until owner-approved.
   */
  readonly map: {
    readonly treatment: 'placeholder' | 'static';
    readonly labelEn: string;
    readonly labelEs: string;
  };
}

export const serviceAreaConfig: ServiceAreaConfig = {
  primaryArea: {
    id: 'south-florida',
    name: 'South Florida',
    kind: 'region',
    status: 'published',
    ownerApprovalStatus: 'approved',
    summaryEn: 'Primary service region: South Florida, from Jupiter southward.',
    summaryEs:
      'Región de servicio principal: Sur de la Florida, desde Jupiter hacia el sur.',
  },
  additionalLocations: [
    {
      id: 'fort-lauderdale',
      name: 'Fort Lauderdale',
      kind: 'city',
      status: 'published',
      ownerApprovalStatus: 'approved',
      summaryEn:
        'Free estimates are available only in the Fort Lauderdale area.',
      summaryEs:
        'Los estimados gratuitos están disponibles solo en el área de Fort Lauderdale.',
    },
  ],
  travelNotes: [
    {
      id: 'travel-arrangement',
      name: 'Travel by arrangement',
      kind: 'note',
      status: 'published',
      ownerApprovalStatus: 'approved',
      summaryEn:
        'Projects outside the normal service area may be considered by arrangement.',
      summaryEs:
        'Los proyectos fuera del área de servicio normal pueden considerarse por acuerdo.',
    },
  ],
  inspectionNotes: [
    {
      id: 'inspection-access',
      name: 'Inspection access',
      kind: 'note',
      status: 'published',
      ownerApprovalStatus: 'approved',
      summaryEn:
        'Vessel access, marina rules, and weather can affect inspection timing and whether on-site review is appropriate.',
      summaryEs:
        'El acceso a la embarcación, las reglas del muelle y el clima pueden afectar el momento de la inspección y si es apropiada una revisión en el sitio.',
    },
  ],
  limitations: [
    {
      id: 'not-every-marina',
      name: 'Service limitations',
      kind: 'note',
      status: 'published',
      ownerApprovalStatus: 'approved',
      summaryEn:
        'Listing South Florida or Fort Lauderdale does not mean BCS serves every marina or every city in the region.',
      summaryEs:
        'Mencionar el Sur de la Florida o Fort Lauderdale no significa que BCS atienda cada marina o cada ciudad de la región.',
    },
  ],
  map: {
    treatment: 'placeholder',
    labelEn:
      'Map placeholder — approved location map treatment pending. Not a live map and not a shop address.',
    labelEs:
      'Marcador de mapa — tratamiento de mapa aprobado pendiente. No es un mapa en vivo ni una dirección de taller.',
  },
};

function isApprovedPublished(entry: ServiceAreaLocation): boolean {
  return (
    entry.status === 'published' && entry.ownerApprovalStatus === 'approved'
  );
}

export function getApprovedServiceAreaLocations(): readonly ServiceAreaLocation[] {
  return [
    serviceAreaConfig.primaryArea,
    ...serviceAreaConfig.additionalLocations,
  ].filter(isApprovedPublished);
}

export function getApprovedServiceAreaNotes(): readonly ServiceAreaLocation[] {
  return [
    ...serviceAreaConfig.travelNotes,
    ...serviceAreaConfig.inspectionNotes,
    ...serviceAreaConfig.limitations,
  ].filter(isApprovedPublished);
}
