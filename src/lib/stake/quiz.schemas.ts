import * as z from "zod";

export const quizAnswersSchema = z.array(
  z.object({
    questionId: z.string(),
    answerId: z.string(),
  }),
);

export interface SubmitQuizAnswersParams {
  userId: string;
  answers: z.infer<typeof quizAnswersSchema>;
}

export interface SubmitQuizAnswersResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}
