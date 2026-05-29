import { durationToMs } from './duration.util';

describe('durationToMs', () => {
  it.each([
    ['15m', 900_000],
    ['8h', 28_800_000],
    ['30d', 2_592_000_000],
    ['120s', 120_000],
    ['500ms', 500],
    ['120', 120_000], // bare number = seconds
  ])('%s -> %d ms', (input, expected) => {
    expect(durationToMs(input)).toBe(expected);
  });

  it('throws on garbage', () => {
    expect(() => durationToMs('soon')).toThrow();
  });
});
