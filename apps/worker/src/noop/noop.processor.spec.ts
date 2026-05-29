import { Job } from 'bullmq';
import { NoopProcessor } from './noop.processor';

describe('NoopProcessor (unit)', () => {
  it('echoes the job payload and stamps a timestamp', async () => {
    const processor = new NoopProcessor();
    const job = { id: '1', data: { echo: 'ping' } } as Job<{ echo: string }>;

    const result = await processor.process(job);

    expect(result).toMatchObject({ ok: true, echo: 'ping' });
    expect(() => new Date(result.processedAt).toISOString()).not.toThrow();
  });
});
