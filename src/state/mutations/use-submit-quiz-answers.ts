import { mutationOptions } from "@tanstack/react-query";
import * as z from "zod";
import {
  quizAnswersSchema,
  QuizStateWithQuestions,
  type SubmitQuizAnswersResult,
} from "@/lib/stake/quiz.schemas";
import { quizQuestionsOptions } from "../queries/quiz-questions";

type SuccessSubmitResponseData = {
  success: true;
  data: SubmitQuizAnswersResult;
};

type ErrorSubmitResponseData = {
  success: false;
  message: string;
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
        let message = "Failed to submit quiz answers";
        try {
          const errorData = (await response.json()) as ErrorSubmitResponseData;
          if (errorData.message) {
            message = errorData.message;
          }
        } catch {
          // JSON parsing failed, use default message
        }
        throw new Error(message);
      }

      const data = (await response.json()) as SuccessSubmitResponseData;

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
            questions: data.questions,
          },
        );
      }
    },
  });
