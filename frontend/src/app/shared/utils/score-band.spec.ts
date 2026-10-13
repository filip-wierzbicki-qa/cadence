import { scoreBand } from './score-band';

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
