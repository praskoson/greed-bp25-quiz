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

export interface QuizAnswer {
  id: string;
  answerText: string;
}

export interface QuizAnswerWithResult extends QuizAnswer {
  isCorrect: boolean;
}

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  categoryName: string;
  assignmentId: string;
  displayOrder: number;
  answers: QuizAnswer[];
}

export interface QuizQuestionResult {
  questionId: string;
  questionText: string;
  categoryName: string;
  displayOrder: number;
  userAnswerId: string | null;
  answers: QuizAnswerWithResult[];
}

export interface SubmitQuizAnswersResult {
  score: number;
  totalQuestions: number;
  completedAt: Date;
  questions: QuizQuestionResult[];
}

export type QuizStateWithQuestions =
  | { state: "ready"; questions: QuizQuestion[] }
  | {
      state: "finished";
      score: number;
      totalQuestions: number;
      completedAt: Date;
      questions: QuizQuestionResult[];
    };

export interface LeaderboardEntry {
  userId: string;
  walletAddress: string;
  score: number;
  completedAt: Date;
  stakeAmountLamports: number;
  stakeDurationSeconds: number;
}
