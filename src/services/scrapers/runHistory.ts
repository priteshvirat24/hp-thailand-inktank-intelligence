/**
 * In-Memory Ingestion Run History Store
 * Tracks the execution history and summary metrics of recent crawler ingestion runs.
 */

import { IngestionReport } from './types';

export type IngestionRunStatus = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'NOT_CONFIGURED';

export interface IngestionRunSummary {
  readonly run_id: string;
  readonly started_at: string;
  readonly completed_at: string;
  readonly status: IngestionRunStatus;
  readonly targets_attempted: number;
  readonly targets_successful: number;
  readonly observations_extracted: number;
  readonly records_accepted: number;
  readonly records_rejected: number;
  readonly unresolved_sku: number;
  readonly ambiguous_sku: number;
  readonly duplicates: number;
  readonly errors_count: number;
  readonly source_reports: readonly IngestionReport[];
}

export class IngestionRunHistory {
  private history: IngestionRunSummary[] = [];
  private readonly maxEntries = 50;

  public recordRun(summary: IngestionRunSummary): void {
    this.history.unshift(summary);
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }
  }

  public getRecentRuns(limit = 10): readonly IngestionRunSummary[] {
    return this.history.slice(0, limit);
  }

  public getLatestRun(): IngestionRunSummary | undefined {
    return this.history[0];
  }

  public getRunById(runId: string): IngestionRunSummary | undefined {
    return this.history.find((r) => r.run_id === runId);
  }

  public clear(): void {
    this.history = [];
  }
}

export const globalRunHistory = new IngestionRunHistory();
