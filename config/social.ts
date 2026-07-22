/**
 * Social channel configuration.
 *
 * Instagram and Facebook stay disabled until real URLs are supplied.
 * TikTok remains hidden (not rendered as an inactive public link).
 */
export type SocialNetwork = 'instagram' | 'facebook' | 'tiktok';

export type SocialVisibility = 'public' | 'hidden';

export interface SocialChannel {
  readonly id: SocialNetwork;
  readonly label: string;
  readonly url: string;
  /** When false, do not render in UI even if visibility is public. */
  readonly enabled: boolean;
  /** `hidden` channels never appear in public chrome (e.g. TikTok until approved). */
  readonly visibility: SocialVisibility;
}

export const socialChannels: readonly SocialChannel[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    url: '',
    enabled: false,
    visibility: 'public',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    url: '',
    enabled: false,
    visibility: 'public',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    url: '',
    enabled: false,
    visibility: 'hidden',
  },
] as const;

/** Channels allowed to appear in public UI when enabled + URL present. */
export function getPublicSocialChannels(): readonly SocialChannel[] {
  return socialChannels.filter(
    (channel) =>
      channel.visibility === 'public' &&
      channel.enabled &&
      channel.url.trim().length > 0,
  );
}
