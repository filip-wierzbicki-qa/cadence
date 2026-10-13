/**
 * Streaks only celebrate progress, so they never use the "needs work" tone.
 * A streak of 0 is neutral rather than a failure.
 */
export function streakColor(streak: number): string {
  if (streak >= 7) {
    return 'var(--color-score-could-do-more)';
  }

  if (streak >= 3) {
    return 'var(--color-score-great)';
  }

  if (streak >= 1) {
    return 'var(--color-score-good)';
  }

  return 'var(--color-text-secondary)';
}
