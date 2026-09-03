/**
 * Master Scraper Adapter Registry
 * Maps source configurations to their specialized extraction adapters.
 */

import { ScraperAdapter } from './types';
import { metaAdsAdapter } from './adapters/metaAds';
import { googleAdsAdapter } from './adapters/googleAds';
import { shopeeAdapter } from './adapters/shopee';
import { lazadaAdapter } from './adapters/lazada';
import { tiktokShopAdapter } from './adapters/tiktokShop';
import { jibAdapter } from './adapters/jib';
import {
  facebookAdapter,
  instagramAdapter,
  youtubeSocialAdapter,
  tiktokSocialAdapter,
  linkedinAdapter,
} from './adapters/social';

export class ScraperRegistry {
  private adapters: Map<string, ScraperAdapter> = new Map();

  constructor() {
    this.register(metaAdsAdapter);
    this.register(googleAdsAdapter);
    this.register(shopeeAdapter);
    this.register(lazadaAdapter);
    this.register(tiktokShopAdapter);
    this.register(jibAdapter);
    this.register(facebookAdapter);
    this.register(instagramAdapter);
    this.register(youtubeSocialAdapter);
    this.register(tiktokSocialAdapter);
    this.register(linkedinAdapter);
  }

  public register(adapter: ScraperAdapter): void {
    this.adapters.set(adapter.sourceId, adapter);
  }

  public getAdapter(sourceId: string): ScraperAdapter | undefined {
    return this.adapters.get(sourceId);
  }

  public getAllAdapters(): ScraperAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const scraperRegistry = new ScraperRegistry();
