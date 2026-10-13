/**
 * The one place score bands are defined. A score falls in a band when it is
 * strictly above the band's threshold, so 90 is "good", 91 is "great".
 */
export const SCORE_THRESHOLDS = {
  great: 90,
  good: 75,
  couldDoMore: 60,
} as const;
