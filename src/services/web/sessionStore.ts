/**
 * Crawl Session Orchestration & In-Memory Store
 */

import { createHash } from 'crypto';
import { CrawlSession, CrawlBudget, AcquisitionStrategy } from './acquisition/types';
import { DEFAULT_CRAWL_BUDGET, crawlPolicyEngine } from './policies/crawlPolicy';
import { discoveryService } from './discovery/discoveryService';
import { acquisitionService } from './acquisition/acquisitionService';
import { genericWebAdapter } from './adapters/genericWebAdapter';
import { CrawlQueue } from './queues/crawlQueue';
import { DedupeQueue } from './queues/dedupeQueue';
import { TargetBrand } from '@/types/brands';

export interface StartCrawlOptions {
  seedUrls?: string[];
  query?: string;
  brand?: TargetBrand;
  skuId?: string;
  domains?: string[];
  maxDepth?: number;
  maxPages?: number;
  strategy?: AcquisitionStrategy | 'AUTO';
  customHtmlMap?: Record<string, string>; // For testing/mocking
}

export class CrawlSessionStore {
  private sessions = new Map<string, CrawlSession>();
  private order: string[] = [];
  private MAX_HISTORY = 50;

  public getSession(id: string): CrawlSession | null {
    return this.sessions.get(id) || null;
  }

  public getRecentSessions(limit = 10): CrawlSession[] {
    return this.order.slice(0, limit).map((id) => this.sessions.get(id)!).filter(Boolean);
  }

  public clear(): void {
    this.sessions.clear();
    this.order = [];
  }

  /**
   * Executes a bounded web crawl job.
   */
  public async runCrawl(options: StartCrawlOptions): Promise<CrawlSession> {
    const timestamp = new Date().toISOString();
    const datePrefix = timestamp.split('T')[0];
    const randHex = createHash('sha256').update(timestamp + Math.random().toString()).digest('hex').slice(0, 8).toUpperCase();
    const crawlId = `CRAWL-${datePrefix}-${randHex}`;

    const budget: CrawlBudget = {
      max_pages: options.maxPages || DEFAULT_CRAWL_BUDGET.max_pages,
      max_depth: options.maxDepth || DEFAULT_CRAWL_BUDGET.max_depth,
      max_runtime_ms: DEFAULT_CRAWL_BUDGET.max_runtime_ms,
      max_bytes: DEFAULT_CRAWL_BUDGET.max_bytes,
      max_provider_requests: DEFAULT_CRAWL_BUDGET.max_provider_requests,
    };

    const session: CrawlSession = {
      crawl_id: crawlId,
      started_at: timestamp,
      completed_at: null,
      status: 'RUNNING',
      requested_targets: options.seedUrls || (options.query ? [options.query] : ['Canonical 28 SKUs']),
      discovered_urls: [],
      acquired_urls: [],
      successful_pages: 0,
      partial_pages: 0,
      failed_pages: 0,
      blocked_pages: 0,
      evidence_created: 0,
      evidence_duplicates: 0,
      evidence_rejected: 0,
      unresolved_skus: 0,
      provider_usage: {},
      strategy_usage: {},
      error_summary: {},
      created_evidence_ids: [],
      budget,
    };

    this.sessions.set(crawlId, session);
    this.order.unshift(crawlId);
    if (this.order.length > this.MAX_HISTORY) {
      const oldest = this.order.pop();
      if (oldest) this.sessions.delete(oldest);
    }

    const queue = new CrawlQueue();
    const dedupe = new DedupeQueue();

    // 1. Discover Initial Targets
    const candidates = await discoveryService.discoverTargets({
      seedUrls: options.seedUrls,
      query: options.query,
      brand: options.brand,
      skuId: options.skuId,
      maxCandidates: budget.max_pages,
    });

    for (const cand of candidates) {
      if (!dedupe.hasUrl(cand.url)) {
        dedupe.markUrl(cand.url);
        session.discovered_urls.push(cand.url);
        queue.enqueue({ url: cand.url, depth: 1, priority: cand.discovery_source === 'USER_PROVIDED' ? 10 : 5 });
      }
    }

    const startTimeMs = Date.now();
    let totalTransferredBytes = 0;

    // 2. Acquisition Loop
    while (queue.size() > 0) {
      const budgetCheck = crawlPolicyEngine.isBudgetExceeded(session, totalTransferredBytes, startTimeMs);
      if (budgetCheck.exceeded) {
        break;
      }

      const item = queue.dequeue();
      if (!item) break;

      session.acquired_urls.push(item.url);

      const forcedStrategy = options.strategy && options.strategy !== 'AUTO' ? options.strategy : undefined;
      const customHtml = options.customHtmlMap?.[item.url];

      const acq = await acquisitionService.acquireUrl(item.url, {
        forceStrategy: forcedStrategy,
        crawlId,
        customHtml,
      });

      totalTransferredBytes += acq.html ? acq.html.length : 0;

      // Track usage
      session.provider_usage[acq.provider] = (session.provider_usage[acq.provider] || 0) + 1;
      session.strategy_usage[acq.strategy] = (session.strategy_usage[acq.strategy] || 0) + 1;

      if (acq.status === 'SUCCESS') {
        session.successful_pages++;
      } else if (acq.status === 'PARTIAL_SUCCESS' || acq.status === 'JS_REQUIRED') {
        session.partial_pages++;
      } else if (acq.status === 'BLOCKED' || acq.status === 'ROBOTS_DISALLOWED' || acq.status === 'SSRF_BLOCKED') {
        session.blocked_pages++;
      } else {
        session.failed_pages++;
      }

      if (acq.error_code) {
        session.error_summary[acq.error_code] = (session.error_summary[acq.error_code] || 0) + 1;
      }

      // Enqueue newly discovered links if within depth
      if (item.depth < budget.max_depth && acq.discovered_urls.length > 0) {
        for (const discovered of acq.discovered_urls) {
          if (!dedupe.hasUrl(discovered) && session.discovered_urls.length < budget.max_pages * 3) {
            dedupe.markUrl(discovered);
            session.discovered_urls.push(discovered);
            queue.enqueue({ url: discovered, depth: item.depth + 1, priority: 1, discoveredFrom: item.url });
          }
        }
      }

      // Ingest into Evidence Lake
      if (acq.html) {
        const obsResult = genericWebAdapter.ingestAcquisition(acq);
        session.evidence_created += obsResult.accepted;
        session.evidence_duplicates += obsResult.duplicate;
        session.evidence_rejected += obsResult.rejected;
        session.unresolved_skus += obsResult.unresolved_sku;
        session.created_evidence_ids.push(...obsResult.observations.map((o) => o.evidence_id));
      }
    }

    session.completed_at = new Date().toISOString();
    session.status =
      session.successful_pages > 0 || session.evidence_created > 0
        ? 'SUCCESS'
        : session.blocked_pages > 0
        ? 'PARTIAL_SUCCESS'
        : 'FAILED';

    return session;
  }
}

export const globalCrawlSessionStore = new CrawlSessionStore();
