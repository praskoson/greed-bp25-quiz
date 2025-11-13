import { mutationOptions } from "@tanstack/react-query";
import * as z from "zod";
import {
  quizAnswersSchema,
  type SubmitQuizAnswersResult,
} from "@/lib/stake/quiz.schemas";

export const submitAnswersMutationOption = mutationOptions({
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

    return response.json() as Promise<SubmitQuizAnswersResult>;
  },
});
