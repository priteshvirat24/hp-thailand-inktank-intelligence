/**
 * Robots.txt Parsing & Compliance Policy Engine
 */

export interface RobotsRule {
  userAgent: string;
  disallows: string[];
  allows: string[];
  crawlDelay?: number;
}

export interface ParsedRobots {
  rules: RobotsRule[];
  sitemaps: string[];
}

export class RobotsPolicyEngine {
  private cache = new Map<string, { parsed: ParsedRobots; fetchedAt: number }>();
  private CACHE_TTL_MS = 3600000; // 1 hour

  /**
   * Parses robots.txt file content into structured rules.
   */
  public parseRobotsTxt(content: string): ParsedRobots {
    const lines = content.split('\n');
    const rules: RobotsRule[] = [];
    const sitemaps: string[] = [];

    let currentAgents: string[] = [];
    let currentDisallows: string[] = [];
    let currentAllows: string[] = [];
    let currentCrawlDelay: number | undefined;

    const flushGroup = () => {
      if (currentAgents.length > 0) {
        for (const ua of currentAgents) {
          rules.push({
            userAgent: ua.toLowerCase(),
            disallows: [...currentDisallows],
            allows: [...currentAllows],
            crawlDelay: currentCrawlDelay,
          });
        }
      }
      currentAgents = [];
      currentDisallows = [];
      currentAllows = [];
      currentCrawlDelay = undefined;
    };

    for (let rawLine of lines) {
      // Strip comments
      const commentIdx = rawLine.indexOf('#');
      if (commentIdx !== -1) {
        rawLine = rawLine.slice(0, commentIdx);
      }
      const line = rawLine.trim();
      if (!line) continue;

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const field = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();

      if (field === 'user-agent') {
        if (currentDisallows.length > 0 || currentAllows.length > 0) {
          flushGroup();
        }
        currentAgents.push(value);
      } else if (field === 'disallow') {
        if (value) currentDisallows.push(value);
      } else if (field === 'allow') {
        if (value) currentAllows.push(value);
      } else if (field === 'crawl-delay') {
        const delay = parseFloat(value);
        if (!isNaN(delay)) currentCrawlDelay = delay;
      } else if (field === 'sitemap') {
        if (value) sitemaps.push(value);
      }
    }

    flushGroup();

    return { rules, sitemaps };
  }

  /**
   * Checks if a given path is allowed for a specific user-agent under the parsed robots.txt.
   */
  public isAllowed(parsed: ParsedRobots, path: string, userAgent = '*'): boolean {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const uaLower = userAgent.toLowerCase();

    // Find rules matching specific user agent, or fallback to '*'
    const relevantRules = parsed.rules.filter(
      (r) => r.userAgent === uaLower || r.userAgent === '*'
    );

    if (relevantRules.length === 0) {
      return true; // No rules, allowed by default
    }

    // Check specific agent first, then wildcard
    const sortedRules = [...relevantRules].sort((a, b) => (b.userAgent === uaLower ? 1 : 0) - (a.userAgent === uaLower ? 1 : 0));
    const activeRule = sortedRules[0];

    // Check Allow rules first (longest match wins in standard robots.txt)
    for (const allowPattern of activeRule.allows) {
      if (this.matchesPattern(allowPattern, cleanPath)) {
        return true;
      }
    }

    // Check Disallow rules
    for (const disallowPattern of activeRule.disallows) {
      if (this.matchesPattern(disallowPattern, cleanPath)) {
        return false;
      }
    }

    return true;
  }

  private matchesPattern(pattern: string, path: string): boolean {
    if (!pattern) return false;
    if (pattern === '/') return true;

    // Convert robots wildcard pattern to regex
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const regex = new RegExp(`^${escaped}`, 'i');
    return regex.test(path);
  }

  public getCached(domain: string): ParsedRobots | null {
    const cached = this.cache.get(domain);
    if (!cached) return null;
    if (Date.now() - cached.fetchedAt > this.CACHE_TTL_MS) {
      this.cache.delete(domain);
      return null;
    }
    return cached.parsed;
  }

  public setCache(domain: string, parsed: ParsedRobots): void {
    this.cache.set(domain, { parsed, fetchedAt: Date.now() });
  }
}

export const robotsPolicyEngine = new RobotsPolicyEngine();
