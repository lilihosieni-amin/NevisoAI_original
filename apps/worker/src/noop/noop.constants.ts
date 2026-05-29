/** Name of the proof-of-life queue used in Phase 0 to verify BullMQ + Redis. */
export const NOOP_QUEUE = 'noop';

export interface NoopJobData {
  echo: string;
}

export interface NoopJobResult {
  ok: true;
  echo: string;
  processedAt: string;
}
