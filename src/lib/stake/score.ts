export type ScoreableEntry = {
  score: number;
  stakeAmountLamports: number;
  completedAt: Date;
};

/**
 * Calculate weighted score: stake (in SOL) × correct answers
 */
export function calculateWeightedScore(entry: {
  score: number;
  stakeAmountLamports: number;
}): number {
  return (entry.stakeAmountLamports / 1_000_000_000) * entry.score;
}

/**
 * Sort entries by weighted score (descending), then by completedAt (ascending)
 */
export function sortByWeightedScore<T extends ScoreableEntry>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => {
    const aScore = calculateWeightedScore(a);
    const bScore = calculateWeightedScore(b);
    if (bScore !== aScore) {
      return bScore - aScore;
    }
    return (
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
  });
}
