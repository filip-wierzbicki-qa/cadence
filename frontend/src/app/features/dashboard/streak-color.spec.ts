import { streakColor } from './streak-color';

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
