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

export interface ScoreBandRange extends ScoreBand {
  /** Lowest whole-number score in the band. */
  from: number;
  /** Highest whole-number score in the band. */
  to: number;
}

/** The bands from best to worst with their whole-number ranges, e.g. for a legend. */
export function scoreBandRanges(): ScoreBandRange[] {
  return BANDS.map((band, index) => {
    const better = BANDS[index - 1];

    return {
      label: band.label,
      description: band.description,
      color: band.color,
      // A band starts just above its own threshold; the worst band has none, so it starts at 0.
      from: Number.isFinite(band.above) ? band.above + 1 : 0,
      to: better ? better.above : 100,
    };
  });
}
