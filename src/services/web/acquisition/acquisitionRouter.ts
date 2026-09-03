/**
 * Deterministic Acquisition Strategy Router
 */

import { AcquisitionStrategy } from './types';
import { extractDomain } from '../discovery/urlNormalizer';
import { domainPolicyEngine } from '../policies/domainPolicy';

export interface RoutingDecision {
  strategy: AcquisitionStrategy;
  provider: 'DIRECT' | 'BRIGHTDATA' | 'APIFY' | 'CUSTOM';
  reason: string;
  canEscalateToBrowser: boolean;
}

export function routeAcquisitionStrategy(targetUrl: string, forceStrategy?: AcquisitionStrategy): RoutingDecision {
  if (forceStrategy && forceStrategy !== 'CUSTOM_ADAPTER') {
    return {
      strategy: forceStrategy,
      provider: forceStrategy.startsWith('BRIGHTDATA') ? 'BRIGHTDATA' : forceStrategy.startsWith('APIFY') ? 'APIFY' : 'DIRECT',
      reason: `Forced strategy '${forceStrategy}' configured by user.`,
      canEscalateToBrowser: forceStrategy === 'DIRECT_HTTP' || forceStrategy === 'STRUCTURED_HTML',
    };
  }

  const domain = extractDomain(targetUrl);
  const profile = domainPolicyEngine.profileDomain(domain);

  // 1. Marketplace domains requiring proxy/unlocker
  if (profile.detected_category === 'MARKETPLACE') {
    return {
      strategy: 'BRIGHTDATA_UNLOCKER',
      provider: 'BRIGHTDATA',
      reason: `Domain '${domain}' is a major e-commerce marketplace requiring bot-detection mitigation.`,
      canEscalateToBrowser: true,
    };
  }

  // 2. Social media platforms
  if (profile.detected_category === 'SOCIAL') {
    return {
      strategy: 'APIFY_HTTP',
      provider: 'APIFY',
      reason: `Domain '${domain}' is a social media platform requiring specialized pagination actors.`,
      canEscalateToBrowser: true,
    };
  }

  // 3. Retailer domains
  if (profile.detected_category === 'RETAILER') {
    return {
      strategy: 'DIRECT_HTTP',
      provider: 'DIRECT',
      reason: `Domain '${domain}' is a standard Thai IT retailer. Attempting direct HTTP first.`,
      canEscalateToBrowser: true,
    };
  }

  // 4. Default: Direct HTTP
  return {
    strategy: 'DIRECT_HTTP',
    provider: 'DIRECT',
    reason: `Standard web domain '${domain}'. Starting with lightweight direct HTTP.`,
    canEscalateToBrowser: true,
  };
}
