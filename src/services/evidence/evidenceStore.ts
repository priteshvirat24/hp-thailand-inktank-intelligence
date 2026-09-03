/**
 * Authoritative Evidence Storage & Idempotent Registry
 * Ensures 100% deterministic, deduplicated persistence of evidence observations.
 * Supports disk persistence via data/evidence_lake/scrapling_verified_lake.json and globalThis singleton.
 */

import fs from 'fs';
import path from 'path';
import { RawEvidenceRecord } from '@/types/evidence';
import { TargetBrand } from '@/types/brands';
import { ChannelType, PlatformType } from '@/types/sources';

export interface InsertResult {
  readonly inserted: boolean;
  readonly updated: boolean;
  readonly evidence_id: string;
}

export class EvidenceStore {
  private records: Map<string, RawEvidenceRecord> = new Map();
  private initializedFromDisk: boolean = false;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.loadFromDisk();
    }
  }

  public loadFromDisk(force: boolean = false): void {
    if (process.env.NODE_ENV === 'test' && !force) return;
    if (this.initializedFromDisk && this.records.size > 0 && !force) return;
    try {
      if (force) {
        this.records.clear();
      }
      const lakePath = path.join(process.cwd(), 'data/evidence_lake/scrapling_verified_lake.json');
      if (fs.existsSync(lakePath)) {
        const raw = fs.readFileSync(lakePath, 'utf-8');
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          if (force) this.records.clear();
          for (const item of items) {
            if (item && typeof item === 'object' && item.evidence_id) {
              this.records.set(item.evidence_id, item as RawEvidenceRecord);
            }
          }
        }
      }
      this.initializedFromDisk = true;
    } catch {
      // File read error non-fatal
    }
  }

  public saveToDisk(): void {
    if (process.env.NODE_ENV === 'test') return;
    try {
      const dir = path.join(process.cwd(), 'data/evidence_lake');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const lakePath = path.join(dir, 'scrapling_verified_lake.json');
      fs.writeFileSync(lakePath, JSON.stringify(Array.from(this.records.values()), null, 2), 'utf-8');
    } catch {
      // Non-fatal
    }
  }

  /**
   * Idempotently inserts or updates an evidence record.
   * If evidence_id already exists, it is updated in-place without duplicating.
   */
  public insert(record: RawEvidenceRecord): InsertResult {
    if (process.env.NODE_ENV !== 'test') {
      this.loadFromDisk();
    }
    const exists = this.records.has(record.evidence_id);
    this.records.set(record.evidence_id, record);

    return {
      inserted: !exists,
      updated: exists,
      evidence_id: record.evidence_id,
    };
  }

  public insertBatch(records: readonly RawEvidenceRecord[]): {
    insertedCount: number;
    updatedCount: number;
    results: InsertResult[];
  } {
    if (process.env.NODE_ENV !== 'test') {
      this.loadFromDisk();
    }
    let insertedCount = 0;
    let updatedCount = 0;
    const results: InsertResult[] = [];

    for (const record of records) {
      const res = this.insert(record);
      if (res.inserted) insertedCount++;
      if (res.updated) updatedCount++;
      results.push(res);
    }

    if (insertedCount > 0 || updatedCount > 0) {
      this.saveToDisk();
    }

    return { insertedCount, updatedCount, results };
  }

  public getById(evidenceId: string): RawEvidenceRecord | undefined {
    if (process.env.NODE_ENV !== 'test') {
      this.loadFromDisk();
    }
    return this.records.get(evidenceId);
  }

  public getAll(): RawEvidenceRecord[] {
    if (process.env.NODE_ENV !== 'test') {
      this.loadFromDisk();
    }
    return Array.from(this.records.values());
  }

  public getByBrand(brand: TargetBrand): RawEvidenceRecord[] {
    return this.getAll().filter((r) => r.brand === brand);
  }

  public getByChannel(channel: ChannelType): RawEvidenceRecord[] {
    return this.getAll().filter((r) => r.channel === channel);
  }

  public getByPlatform(platform: PlatformType): RawEvidenceRecord[] {
    return this.getAll().filter((r) => r.platform === platform);
  }

  public getBySku(skuModelName: string): RawEvidenceRecord[] {
    return this.getAll().filter((r) => r.product_sku?.toLowerCase() === skuModelName.toLowerCase());
  }

  public getCount(): number {
    if (process.env.NODE_ENV !== 'test') {
      this.loadFromDisk();
    }
    return this.records.size;
  }

  public clear(): void {
    this.records.clear();
    this.initializedFromDisk = false;
  }
}

// Attach to globalThis to preserve across Next.js dev server hot-module reloads
const globalForEvidence = globalThis as unknown as {
  globalEvidenceStore?: EvidenceStore;
};

export const globalEvidenceStore =
  globalForEvidence.globalEvidenceStore ?? new EvidenceStore();

if (process.env.NODE_ENV !== 'production') {
  globalForEvidence.globalEvidenceStore = globalEvidenceStore;
}
