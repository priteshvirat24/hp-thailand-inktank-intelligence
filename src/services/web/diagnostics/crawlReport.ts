/**
 * Structured Crawl Session Report Generator
 */

import { CrawlSession } from '../acquisition/types';

export function formatCrawlReportText(session: CrawlSession): string {
  const lines: string[] = [];
  lines.push('====================================================');
  lines.push(`CRAWL EXECUTION REPORT: ${session.crawl_id}`);
  lines.push('====================================================');
  lines.push(`Status: ${session.status}`);
  lines.push(`Started: ${session.started_at}`);
  lines.push(`Completed: ${session.completed_at || 'In Progress'}`);
  lines.push(`Requested Targets: ${session.requested_targets.length}`);
  lines.push(`URLs Discovered: ${session.discovered_urls.length}`);
  lines.push(`URLs Acquired: ${session.acquired_urls.length}`);
  lines.push(`Successful Pages: ${session.successful_pages}`);
  lines.push(`Partial Pages: ${session.partial_pages}`);
  lines.push(`Blocked Pages: ${session.blocked_pages}`);
  lines.push(`Failed Pages: ${session.failed_pages}`);
  lines.push('----------------------------------------------------');
  lines.push('EVIDENCE INTEGRATION:');
  lines.push(`Evidence Records Created: ${session.evidence_created}`);
  lines.push(`Duplicate Observations: ${session.evidence_duplicates}`);
  lines.push(`Rejected (Contamination Filter): ${session.evidence_rejected}`);
  lines.push(`Unresolved SKUs: ${session.unresolved_skus}`);
  lines.push('----------------------------------------------------');
  lines.push('PROVIDER USAGE:');
  for (const [provider, count] of Object.entries(session.provider_usage)) {
    lines.push(`- ${provider}: ${count}`);
  }
  lines.push('----------------------------------------------------');
  lines.push('STRATEGY USAGE:');
  for (const [strategy, count] of Object.entries(session.strategy_usage)) {
    lines.push(`- ${strategy}: ${count}`);
  }
  lines.push('====================================================');

  return lines.join('\n');
}
