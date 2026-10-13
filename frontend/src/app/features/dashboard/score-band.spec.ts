import { scoreBand, streakColor } from './score-band';

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

describe('streakColor', () => {
  it.each([
    [0, 'var(--color-text-secondary)'],
    [1, 'var(--color-score-good)'],
    [2, 'var(--color-score-good)'],
    [3, 'var(--color-score-great)'],
    [6, 'var(--color-score-great)'],
    [7, 'var(--color-score-could-do-more)'],
    [30, 'var(--color-score-could-do-more)'],
  ])('maps a streak of %d to %s', (streak, color) => {
    expect(streakColor(streak)).toBe(color);
  });

  it('never uses the needs-work tone', () => {
    for (let streak = 0; streak <= 100; streak++) {
      expect(streakColor(streak)).not.toContain('needs-work');
    }
  });
});
