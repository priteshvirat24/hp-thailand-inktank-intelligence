/**
 * Domain Profiling & Strategy Policy Engine
 */

import { DomainProfile, CrawlabilityStatus, AcquisitionStrategy } from '../acquisition/types';

export class DomainPolicyEngine {
  private profiles = new Map<string, DomainProfile>();

  /**
   * Evaluates or retrieves the cached domain profile.
   */
  public getProfile(domain: string): DomainProfile | null {
    return this.profiles.get(domain) || null;
  }

  /**
   * Profiles a domain based on domain name patterns and observed signals.
   */
  public profileDomain(domain: string): DomainProfile {
    const cached = this.profiles.get(domain);
    if (cached && Date.now() - new Date(cached.last_checked_at).getTime() < 86400000) {
      return cached;
    }

    const domainLower = domain.toLowerCase();

    let category: DomainProfile['detected_category'] = 'GENERIC';
    let crawlability: CrawlabilityStatus = 'EASY';
    let recommendedStrategy: AcquisitionStrategy = 'DIRECT_HTTP';
    let isJsHeavy = false;
    let requiresBrowser = false;
    let supportsDirectHttp = true;

    // Marketplace / E-commerce patterns
    if (
      domainLower.includes('shopee') ||
      domainLower.includes('lazada') ||
      domainLower.includes('tiktok') ||
      domainLower.includes('jd.co.th')
    ) {
      category = 'MARKETPLACE';
      crawlability = 'PROVIDER_REQUIRED';
      recommendedStrategy = 'BRIGHTDATA_UNLOCKER';
      isJsHeavy = true;
      requiresBrowser = false;
      supportsDirectHttp = false;
    } else if (
      domainLower.includes('facebook') ||
      domainLower.includes('instagram') ||
      domainLower.includes('youtube') ||
      domainLower.includes('twitter') ||
      domainLower.includes('linkedin')
    ) {
      category = 'SOCIAL';
      crawlability = 'RENDER_REQUIRED';
      recommendedStrategy = 'APIFY_HTTP';
      isJsHeavy = true;
      requiresBrowser = true;
      supportsDirectHttp = false;
    } else if (
      domainLower.includes('jib.co.th') ||
      domainLower.includes('advice.co.th') ||
      domainLower.includes('bnn.in.th') ||
      domainLower.includes('powerbuy.co.th')
    ) {
      category = 'RETAILER';
      crawlability = 'RENDER_REQUIRED';
      recommendedStrategy = 'BRIGHTDATA_UNLOCKER';
      isJsHeavy = true;
      requiresBrowser = false;
      supportsDirectHttp = true;
    } else if (
      domainLower.includes('hp.com') ||
      domainLower.includes('epson.co.th') ||
      domainLower.includes('canon.co.th') ||
      domainLower.includes('brother.co.th')
    ) {
      category = 'OFFICIAL_BRAND';
      crawlability = 'EASY';
      recommendedStrategy = 'DIRECT_HTTP';
      isJsHeavy = false;
      requiresBrowser = false;
      supportsDirectHttp = true;
    }

    const profile: DomainProfile = {
      domain,
      crawlability_status: crawlability,
      recommended_strategy: recommendedStrategy,
      is_javascript_heavy: isJsHeavy,
      requires_browser: requiresBrowser,
      supports_direct_http: supportsDirectHttp,
      robots_state: 'UNKNOWN',
      last_checked_at: new Date().toISOString(),
      sample_latency_ms: 0,
      detected_category: category,
    };

    this.profiles.set(domain, profile);
    return profile;
  }

  /**
   * Updates domain profile from live acquisition feedback.
   */
  public updateProfileFromFeedback(domain: string, updates: Partial<DomainProfile>): void {
    const existing = this.profileDomain(domain);
    const updated = {
      ...existing,
      ...updates,
      last_checked_at: new Date().toISOString(),
    };
    this.profiles.set(domain, updated);
  }
}

export const domainPolicyEngine = new DomainPolicyEngine();
