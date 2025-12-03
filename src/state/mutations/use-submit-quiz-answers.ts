import { mutationOptions } from "@tanstack/react-query";
import * as z from "zod";
import {
  quizAnswersSchema,
  QuizStateWithQuestions,
  type SubmitQuizAnswersResult,
} from "@/lib/stake/quiz.schemas";
import { quizQuestionsOptions } from "../queries/quiz-questions";

type SubmitResponseData = {
  success: true;
  data: SubmitQuizAnswersResult;
};

export const submitAnswersMutationOption = (walletAddress: string) =>
  mutationOptions({
    mutationFn: async (quizAnswers: z.infer<typeof quizAnswersSchema>) => {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizAnswers),
        credentials: "include",
      });

      if (!response.ok) {
        console.log(response);
        // const error = await response.json();
        throw new Error("Failed to submit quiz answers");
      }

      const data = (await response.json()) as SubmitResponseData;

      return data.data;
    },
    onSuccess: (data, __, ___, { client }) => {
      if (walletAddress) {
        client.setQueryData<QuizStateWithQuestions>(
          quizQuestionsOptions(walletAddress).queryKey,
          {
            state: "finished",
            score: data.score,
            totalQuestions: data.totalQuestions,
            completedAt: data.completedAt,
          },
        );
      }
    },
  });
