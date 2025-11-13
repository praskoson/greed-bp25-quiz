"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  QuizQuestion,
  SubmitQuizAnswersResult,
} from "@/lib/stake/quiz.schemas";
import { submitAnswersMutationOption } from "@/state/mutations/use-submit-quiz-answers";
import { quizQuestionsOptions } from "@/state/queries/quiz-questions";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export default function QuizPage() {
  const { publicKey } = useWallet();
  const { data, isPending, error } = useQuery({
    ...quizQuestionsOptions(publicKey?.toBase58()),
    staleTime: Infinity,
  });

  if (isPending) {
    return <QuizPendingState />;
  }

  if (error) {
    return <QuizErrorState error={error} />;
  }

  if (data.state === "finished") {
    return (
      <QuizAlreadyCompletedState
        score={data.score}
        totalQuestions={data.totalQuestions}
        completedAt={data.completedAt}
      />
    );
  }

  return <QuizContent questions={data.questions} />;
}

function QuizPendingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Header with category and progress skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-7 w-32 bg-muted animate-pulse rounded-full" />
                <div className="h-5 w-28 bg-muted animate-pulse rounded-md" />
              </div>

              {/* Progress bar skeleton */}
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-muted-foreground/30 h-2 rounded-full w-1/5 animate-pulse" />
              </div>
            </div>

            {/* Question skeleton */}
            <div className="pt-2 space-y-3">
              <div className="h-7 w-full bg-muted animate-pulse rounded-md" />
              <div className="h-7 w-4/5 bg-muted animate-pulse rounded-md" />
            </div>

            {/* Answer options skeleton */}
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full p-4 rounded-lg border-2 border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons skeleton */}
            <div className="flex gap-3 pt-6">
              <div className="flex-1 h-10 bg-muted animate-pulse rounded-md" />
              <div className="flex-1 h-10 bg-muted animate-pulse rounded-md" />
            </div>

            {/* Answer progress skeleton */}
            <div className="text-center pt-2">
              <div className="h-4 w-48 bg-muted animate-pulse rounded-md mx-auto" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizErrorState({ error }: { error: Error }) {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6 text-center">
            {/* Error icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <svg
                  className="h-12 w-12 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Unable to Load Quiz
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We encountered an error while loading your quiz. This might be a
                temporary issue.
              </p>
            </div>

            {/* Error details (for debugging) */}
            {error.message && (
              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-xs text-muted-foreground font-mono wrap-break-word">
                  {error.message}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={handleRetry} className="min-w-32">
                Try Again
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="min-w-32"
              >
                Go Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizContent({ questions }: { questions: QuizQuestion[] }) {
  const { mutate, isPending, isError, data } = useMutation(
    submitAnswersMutationOption,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(
    new Map(),
  );

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const totalQuestions = questions.length;

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion.questionId, answerId);
      return newMap;
    });
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answers = Array.from(selectedAnswers.entries()).map(
      ([questionId, answerId]) => ({
        questionId,
        answerId,
      }),
    );
    mutate(answers);
  };

  const selectedAnswerId = selectedAnswers.get(currentQuestion.questionId);
  const canSubmit = selectedAnswers.size === totalQuestions;

  // Show submitting state
  if (isPending) {
    return <QuizSubmittingState />;
  }

  // Show error state
  if (isError) {
    return <QuizSubmissionErrorState onRetry={handleSubmit} />;
  }

  // Show results state
  if (data) {
    return <QuizResultsState result={data} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Header with category and progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {currentQuestion.categoryName}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="pt-2">
              <h2 className="text-xl sm:text-2xl font-bold leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Answer options */}
            <div className="space-y-3 pt-4">
              {currentQuestion.answers.map((answer) => {
                const isSelected = selectedAnswerId === answer.id;
                return (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswerSelect(answer.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                        mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${isSelected ? "border-primary" : "border-muted-foreground"}
                      `}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm sm:text-base">
                        {answer.answerText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1"
                >
                  {canSubmit
                    ? "Submit Quiz"
                    : `Answer ${totalQuestions - selectedAnswers.size} more`}
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  Next
                </Button>
              )}
            </div>

            {/* Answer progress indicator */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                {selectedAnswers.size} of {totalQuestions} questions answered
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizSubmittingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6 text-center">
            {/* Spinner */}
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  className="h-12 w-12 text-primary animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Submitting Your Answers
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Please wait while we process your quiz submission...
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizSubmissionErrorState({ onRetry }: { onRetry: () => void }) {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6 text-center">
            {/* Error icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <svg
                  className="h-12 w-12 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Submission Failed
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t submit your quiz answers. Please try again.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={onRetry} className="min-w-32">
                Try Again
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="min-w-32"
              >
                Go Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizResultsState({ result }: { result: SubmitQuizAnswersResult }) {
  const percentage = (result.score / result.totalQuestions) * 100;
  const passed = percentage >= 60;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6 text-center">
            {/* Success icon or badge */}
            <div className="flex justify-center">
              <div
                className={`rounded-full p-4 ${
                  passed ? "bg-green-500/10" : "bg-orange-500/10"
                }`}
              >
                {passed ? (
                  <svg
                    className="h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-12 w-12 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Results heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {passed ? "Quiz Complete!" : "Quiz Submitted"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {passed
                  ? "Great job! You've successfully completed the quiz."
                  : "You've completed the quiz. Review your results below."}
              </p>
            </div>

            {/* Score display */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-5xl font-bold">
                  {result.score}/{result.totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct Answers
                </div>
              </div>

              {/* Percentage */}
              <div className="pt-2">
                <div className="text-2xl font-semibold">
                  {percentage.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Score Percentage
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    passed ? "bg-green-500" : "bg-orange-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Action button */}
            <div className="pt-4">
              <Button asChild className="min-w-48">
                <Link href="/stake/leaderboard">View the Leaderboard</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizAlreadyCompletedState({
  score,
  totalQuestions,
  completedAt,
}: {
  score: number;
  totalQuestions: number;
  completedAt: Date;
}) {
  const percentage = (score / totalQuestions) * 100;
  const passed = percentage >= 60;

  // Format the completion date
  const formattedDate = new Date(completedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = new Date(completedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6 text-center">
            {/* Success icon or badge */}
            <div className="flex justify-center">
              <div
                className={`rounded-full p-4 ${
                  passed ? "bg-green-500/10" : "bg-orange-500/10"
                }`}
              >
                {passed ? (
                  <svg
                    className="h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-12 w-12 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Results heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Quiz Already Completed
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You completed this quiz on {formattedDate} at {formattedTime}
              </p>
            </div>

            {/* Score display */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-5xl font-bold">
                  {score}/{totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct Answers
                </div>
              </div>

              {/* Percentage */}
              <div className="pt-2">
                <div className="text-2xl font-semibold">
                  {percentage.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Score Percentage
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    passed ? "bg-green-500" : "bg-orange-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Action button */}
            <div className="pt-4">
              <Button asChild className="min-w-48">
                <Link href="/stake/leaderboard">View the Leaderboard</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
