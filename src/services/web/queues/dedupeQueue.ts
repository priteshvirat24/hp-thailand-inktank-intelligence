/**
 * Visited URL & Content-Hash Deduplication Engine
 */

export class DedupeQueue {
  private visitedUrls = new Set<string>();
  private contentHashes = new Set<string>();

  public hasUrl(url: string): boolean {
    return this.visitedUrls.has(url);
  }

  public markUrl(url: string): void {
    this.visitedUrls.add(url);
  }

  public hasContentHash(hash: string): boolean {
    if (!hash) return false;
    return this.contentHashes.has(hash);
  }

  public markContentHash(hash: string): void {
    if (hash) this.contentHashes.add(hash);
  }

  public clear(): void {
    this.visitedUrls.clear();
    this.contentHashes.clear();
  }
}
