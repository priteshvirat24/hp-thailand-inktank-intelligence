/**
 * Authoritative source, channel, and platform type contracts
 */

export type ChannelType = 'Paid Media' | 'Social' | 'E-commerce' | 'Consumer Review';

export type PlatformType =
  | 'Google Ads'
  | 'Meta'
  | 'YouTube'
  | 'Facebook'
  | 'Instagram'
  | 'TikTok'
  | 'LinkedIn'
  | 'Shopee'
  | 'Lazada'
  | 'TikTok Shop'
  | 'JIB'
  | 'Advice'
  | 'Power Buy';

export type SourcePriority = 'mandatory' | 'secondary' | 'optional' | 'dropped';

export type HistoricalCapability =
  | 'directly_available'
  | 'partially_available'
  | 'reconstructable'
  | 'current_only'
  | 'unavailable'
  | 'needs_validation';

export interface SourceDefinition {
  readonly source_id: string;
  readonly display_name: string;
  readonly channel: ChannelType;
  readonly platform: PlatformType;
  readonly priority: SourcePriority;
  readonly country: 'Thailand';
  readonly language: 'th-TH' | 'en';
  readonly expected_currency: 'THB' | null;
  readonly historical_capability: HistoricalCapability;
  readonly crawler_strategy: string;
  readonly enabled: boolean;
}
