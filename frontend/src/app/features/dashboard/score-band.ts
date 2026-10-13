export interface ScoreBand {
  label: string;
  description: string;
  color: string;
}

const NO_SCORE: ScoreBand = {
  label: 'No score',
  description: 'No score available.',
  color: 'var(--color-score-good)',
};

const BANDS: readonly (ScoreBand & { above: number })[] = [
  {
    above: 90,
    label: 'Great',
    description: "You're looking really good!",
    color: 'var(--color-score-great)',
  },
  {
    above: 75,
    label: 'Good',
    description: 'Keep it up, you can still make it!',
    color: 'var(--color-score-good)',
  },
  {
    above: 60,
    label: 'Could do more',
    description: 'Try to get back on track.',
    color: 'var(--color-score-could-do-more)',
  },
  {
    above: -Infinity,
    label: 'Needs work',
    description: 'Focus, you need to work a bit more on your progress.',
    color: 'var(--color-score-needs-work)',
  },
];

export function scoreBand(score: number | null): ScoreBand {
  if (score === null) {
    return NO_SCORE;
  }

  return BANDS.find((band) => score > band.above) ?? NO_SCORE;
}

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
