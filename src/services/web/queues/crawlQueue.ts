/**
 * Priority Crawl Target Queue
 */

export interface QueueItem {
  url: string;
  depth: number;
  priority: number;
  discoveredFrom?: string;
}

export class CrawlQueue {
  private items: QueueItem[] = [];

  public enqueue(item: QueueItem): void {
    this.items.push(item);
    // Sort descending by priority, ascending by depth
    this.items.sort((a, b) => b.priority - a.priority || a.depth - b.depth);
  }

  public dequeue(): QueueItem | null {
    return this.items.shift() || null;
  }

  public size(): number {
    return this.items.length;
  }

  public clear(): void {
    this.items = [];
  }
}
