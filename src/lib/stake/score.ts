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
  let quizScore: number;
  switch (entry.score) {
    case 1:
      quizScore = 1.2;
      break;
    case 2:
      quizScore = 1.4;
      break;
    case 3:
      quizScore = 1.6;
      break;
    case 4:
      quizScore = 1.8;
      break;
    case 5:
      quizScore = 2.0;
      break;
    default:
      quizScore = 1.0;
      break;
  }

  return (entry.stakeAmountLamports / 1_000_000_000) * quizScore;
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
