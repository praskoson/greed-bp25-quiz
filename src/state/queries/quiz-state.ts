import { queryOptions } from "@tanstack/react-query";

export const RQKEY_ROOT = "quiz-state";
export const RQKEY = () => [RQKEY_ROOT];

export type StatusResponseType = { status: "paused" | "active" };

export const quizStateOptions = () =>
  queryOptions({
    queryKey: RQKEY(),
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/quiz/state", {
        signal,
      });

      if (!response.ok) {
        throw Error(JSON.stringify(await response.json()));
      }

      return response.json() as Promise<StatusResponseType>;
    },
  });
