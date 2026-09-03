/**
 * Crawl Budget & Execution Limits Policy
 */

import { CrawlBudget, CrawlSession } from '../acquisition/types';

export const DEFAULT_CRAWL_BUDGET: CrawlBudget = {
  max_pages: 50,
  max_depth: 2,
  max_runtime_ms: 60000, // 60 seconds
  max_bytes: 10 * 1024 * 1024, // 10 MB
  max_provider_requests: 20,
};

export class CrawlPolicyEngine {
  /**
   * Evaluates whether a crawl session has exceeded its configured budget.
   */
  public isBudgetExceeded(
    session: CrawlSession,
    currentBytes = 0,
    startTimeMs = Date.now()
  ): { exceeded: boolean; reason?: string } {
    const budget = session.budget || DEFAULT_CRAWL_BUDGET;

    if (session.acquired_urls.length >= budget.max_pages) {
      return {
        exceeded: true,
        reason: `Max page limit (${budget.max_pages}) reached.`,
      };
    }

    if (Date.now() - startTimeMs >= budget.max_runtime_ms) {
      return {
        exceeded: true,
        reason: `Max crawl runtime (${budget.max_runtime_ms / 1000}s) reached.`,
      };
    }

    if (currentBytes >= budget.max_bytes) {
      return {
        exceeded: true,
        reason: `Max payload transfer limit (${budget.max_bytes / (1024 * 1024)}MB) reached.`,
      };
    }

    const totalProviderReqs = Object.values(session.provider_usage).reduce((a, b) => a + b, 0);
    if (totalProviderReqs >= budget.max_provider_requests) {
      return {
        exceeded: true,
        reason: `Max provider request budget (${budget.max_provider_requests}) reached.`,
      };
    }

    return { exceeded: false };
  }
}

export const crawlPolicyEngine = new CrawlPolicyEngine();
