/**
 * Deterministic Evidence ID generator
 * Generates immutable, traceable identifiers from stable source attributes.
 */

import { createHash } from 'crypto';

export interface EvidenceIdInput {
  platform: string;
  sourceUrl: string;
  publishedAt: string;
  platformEntityId?: string;
}

const PLATFORM_SLUGS: Record<string, string> = {
  'Meta Ad Library': 'META',
  'Meta': 'META',
  'Google Ads Transparency Center': 'GOOGLE',
  'Google Ads': 'GOOGLE',
  'Facebook': 'FB',
  'Instagram': 'IG',
  'YouTube': 'YOUTUBE',
  'Shopee': 'SHOPEE',
  'Lazada': 'LAZADA',
  'TikTok Shop': 'TIKTOKSHOP',
  'TikTok': 'TIKTOK',
  'JIB': 'JIB',
  'Advice': 'ADVICE',
  'Power Buy': 'POWERBUY',
};

/**
 * Generates a deterministic SHA256-based identifier: EVID-{PLATFORM_SLUG}-{12_CHAR_HEX}
 */
export function generateDeterministicEvidenceId(input: EvidenceIdInput): string {
  const platformSlug =
    PLATFORM_SLUGS[input.platform] ||
    input.platform.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

  const rawSeed = [
    input.platform.trim().toLowerCase(),
    input.sourceUrl.trim().toLowerCase(),
    input.publishedAt.trim(),
    (input.platformEntityId || '').trim().toLowerCase(),
  ].join('::');

  const hash = createHash('sha256').update(rawSeed, 'utf8').digest('hex').slice(0, 12);

  return `EVID-${platformSlug}-${hash.toUpperCase()}`;
}
