import { LeaderboardEntry } from "@/lib/stake/quiz.schemas";
import { queryOptions } from "@tanstack/react-query";

export const RQKEY_ROOT = "quiz_leaderboard";
export const RQKEY = () => [RQKEY_ROOT];

const selectFn = (data: LeaderboardEntry[]) => {
  return data.toSorted((a, b) => {
    const bScore = b.score * b.stakeAmountLamports;
    const aScore = a.score * a.stakeAmountLamports;
    return bScore - aScore;
  });
};

export const quizLeaderboardOptions = () =>
  queryOptions({
    queryKey: RQKEY(),
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/quiz/scores", {
        signal,
      });
      if (!response.ok) {
        throw Error(JSON.stringify(await response.json()));
      }

      const data = (await response.json()) as Array<LeaderboardEntry>;

      return data;
    },
    select: selectFn,
  });
