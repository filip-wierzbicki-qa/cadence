import { scoreBand, scoreBandRanges } from './score-band';
import { SCORE_THRESHOLDS } from './score-thresholds';

describe('scoreBand', () => {
  it('returns the neutral band for a null score', () => {
    expect(scoreBand(null).label).toBe('No score');
  });

  it.each([
    [100, 'Great'],
    [91, 'Great'],
    [90, 'Good'],
    [76, 'Good'],
    [75, 'Could do more'],
    [61, 'Could do more'],
    [60, 'Needs work'],
    [0, 'Needs work'],
  ])('maps %d to %s', (score, label) => {
    expect(scoreBand(score).label).toBe(label);
  });
});

describe('scoreBandRanges', () => {
  it('covers 0–100 exactly once, from best to worst', () => {
    const ranges = scoreBandRanges();

    expect(ranges[0].to).toBe(100);
    expect(ranges[ranges.length - 1].from).toBe(0);

    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i].to + 1).toBe(ranges[i - 1].from);
    }
  });

  it('follows the shared thresholds and agrees with scoreBand', () => {
    const [great, good] = scoreBandRanges();

    expect(great.from).toBe(SCORE_THRESHOLDS.great + 1);
    expect(good.to).toBe(SCORE_THRESHOLDS.great);

    for (const range of scoreBandRanges()) {
      expect(scoreBand(range.from).label).toBe(range.label);
      expect(scoreBand(range.to).label).toBe(range.label);
    }
  });
});
