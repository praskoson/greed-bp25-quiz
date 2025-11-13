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
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface QuizAnswer {
  id: string;
  answerText: string;
}

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  categoryName: string;
  assignmentId: string;
  displayOrder: number;
  answers: QuizAnswer[];
}
