import type { SubmissionMessageKey } from '@/lib/submissions/types';

type ConversionCommon = {
  readonly demoFailure: string;
  readonly deliveryFailed: string;
  readonly rateLimited: string;
  readonly botCheckFailed: string;
  readonly validationFailed: string;
  readonly demoSuccess: string;
  readonly deliveredSuccess: string;
};

/** Map server submission message keys to localized UI copy. */
export function messageForSubmissionKey(
  common: ConversionCommon,
  key: SubmissionMessageKey,
): string {
  switch (key) {
    case 'demoFailure':
      return common.demoFailure;
    case 'deliveryFailed':
      return common.deliveryFailed;
    case 'rateLimited':
      return common.rateLimited;
    case 'botCheckFailed':
      return common.botCheckFailed;
    case 'validationFailed':
      return common.validationFailed;
    case 'deliveredSuccess':
      return common.deliveredSuccess;
    case 'demoSuccess':
    default:
      return common.demoSuccess;
  }
}
