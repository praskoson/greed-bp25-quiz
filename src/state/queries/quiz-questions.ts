import { QuizQuestion } from "@/lib/stake/quiz.service";
import { queryOptions } from "@tanstack/react-query";

export const RQKEY_ROOT = "quiz_questions";
export const RQKEY = (walletAddress: string) => [RQKEY_ROOT, walletAddress];

export type QuizQuestionResponseType = {
  success: true;
  data: QuizQuestion[];
};

export const quizQuestionsOptions = (walletAddress?: string) =>
  queryOptions({
    enabled: !!walletAddress,
    queryKey: RQKEY(walletAddress!),
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/quiz", {
        credentials: "include",
        signal,
      });
      if (!response.ok) {
        throw Error(JSON.stringify(await response.json()));
      }

      return response.json() as Promise<QuizQuestionResponseType>;
    },
  });
