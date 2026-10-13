import { SCORE_THRESHOLDS } from './score-thresholds';

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
    above: SCORE_THRESHOLDS.great,
    label: 'Great',
    description: "You're looking really good!",
    color: 'var(--color-score-great)',
  },
  {
    above: SCORE_THRESHOLDS.good,
    label: 'Good',
    description: 'Keep it up, you can still make it!',
    color: 'var(--color-score-good)',
  },
  {
    above: SCORE_THRESHOLDS.couldDoMore,
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
