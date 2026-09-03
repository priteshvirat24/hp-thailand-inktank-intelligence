/**
 * Robots.txt Discovery & Sitemap Locator
 */

import { fetchDirectHttp } from '../acquisition/directHttpFetcher';
import { robotsPolicyEngine, ParsedRobots } from '../policies/robotsPolicy';

export async function discoverRobotsTxt(domain: string): Promise<ParsedRobots> {
  const cached = robotsPolicyEngine.getCached(domain);
  if (cached) return cached;

  const robotsUrl = `https://${domain}/robots.txt`;
  const result = await fetchDirectHttp(robotsUrl, { timeoutMs: 4000 });

  let parsed: ParsedRobots = { rules: [], sitemaps: [] };
  if (result.success && result.html) {
    parsed = robotsPolicyEngine.parseRobotsTxt(result.html);
  }

  robotsPolicyEngine.setCache(domain, parsed);
  return parsed;
}
