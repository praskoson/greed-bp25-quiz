import { Spinner } from "@/components/spinner";
import type {
  QuizQuestion,
  SubmitQuizAnswersResult,
} from "@/lib/stake/quiz.schemas";
import { cn } from "@/lib/utils";
import { useMiniRouter } from "@/state/mini-router";
import { submitAnswersMutationOption } from "@/state/mutations/use-submit-quiz-answers";
import { quizQuestionsOptions } from "@/state/queries/quiz-questions";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { RouteContainer } from "./route-container";

const PENDING_DELAY_MS = 180;

const stateTransition = {
  duration: 0.4,
  ease: "easeOut" as const,
};

const stateVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: stateTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" as const },
  },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: stateTransition,
  },
};

type QuizState = "pending" | "error" | "finished" | "quiz";

function useDelayedPending(isPending: boolean, delayMs: number): boolean {
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => setShowPending(true), delayMs);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPending(false);
    }
  }, [isPending, delayMs]);

  return showPending;
}

export function QuizRoute() {
  const { publicKey } = useWallet();
  const { data, isPending, error } = useQuery({
    ...quizQuestionsOptions(publicKey?.toBase58()),
    staleTime: Infinity,
  });

  const showPending = useDelayedPending(isPending, PENDING_DELAY_MS);

  // Determine current state
  let state: QuizState = "quiz";
  if (isPending) state = "pending";
  else if (error) state = "error";
  else if (data?.state === "finished") state = "finished";

  return (
    <RouteContainer>
      <AnimatePresence mode="wait">
        {state === "pending" && showPending && (
          <QuizPendingState key="pending" />
        )}

        {state === "error" && error && (
          <QuizErrorState key="error" error={error} />
        )}

        {state === "finished" && data?.state === "finished" && (
          <QuizAlreadyCompletedState
            key="finished"
            score={data.score}
            totalQuestions={data.totalQuestions}
            completedAt={data.completedAt}
          />
        )}

        {state === "quiz" && data?.state === "ready" && (
          <QuizContent key="quiz" questions={data.questions} />
        )}
      </AnimatePresence>
    </RouteContainer>
  );
}

function QuizPendingState() {
  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center gap-6"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-6"
      >
        <motion.div variants={fadeSlideUp}>
          <Spinner className="size-24 text-brand" />
        </motion.div>
        <motion.div className="text-center" variants={fadeSlideUp}>
          <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
            Loading Quiz...
          </h2>
          <p className="mt-4 text-sm text-[#7E1D1D]">
            Please wait while we load your questions
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
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
    <motion.div
      className="flex-1 flex flex-col"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="flex-1 flex flex-col items-center justify-center gap-6"
      >
        <motion.div variants={fadeSlideUp}>
          <XCircle className="size-24 text-destructive" />
        </motion.div>
        <motion.div className="text-center px-4" variants={fadeSlideUp}>
          <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
            Unable to Load Quiz
          </h2>
          <p className="mt-4 text-sm text-[#7E1D1D]">
            We encountered an error while loading your quiz.
          </p>
          {error.message && (
            <p className="mt-2 text-xs text-[#A37878] wrap-break-word">
              {error.message}
            </p>
          )}
        </motion.div>
        <motion.div className="flex flex-col gap-3" variants={fadeSlideUp}>
          <Button onClick={handleRetry}>Try Again</Button>
          <button
            onClick={handleGoBack}
            className="text-sm text-[#A37878] hover:text-neutral"
          >
            ← Go Back
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
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
    <motion.div
      className="flex-1 flex flex-col"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex-1 flex flex-col p-3 pt-0">
        {/* Header with category and progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
              {currentQuestion.categoryName}
            </span>
            <span className="text-sm text-[#7E1D1D] font-medium">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-3 rounded-full h-2">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-neutral leading-relaxed">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Answer options */}
        <div className="mt-6 space-y-3">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all",
                  isSelected
                    ? "border-brand bg-brand/5"
                    : "border-surface-3 hover:border-brand/50 bg-surface-1",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      isSelected ? "border-brand" : "border-[#A37878]",
                    )}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-brand" />
                    )}
                  </div>
                  <span className="text-sm text-neutral">
                    {answer.answerText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Answer progress indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#A37878]">
            {selectedAnswers.size} of {totalQuestions} questions answered
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 p-3 pt-0">
        <Button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          variant="outline"
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {canSubmit
              ? "Submit Quiz"
              : `Answer ${totalQuestions - selectedAnswers.size} more`}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
    </motion.div>
  );
}

function QuizSubmittingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6">
      <Spinner className="size-24 text-brand" />
      <div className="text-center">
        <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
          Submitting...
        </h2>
        <p className="mt-4 text-sm text-[#7E1D1D]">
          Please wait while we process your answers
        </p>
      </div>
    </div>
  );
}

function QuizSubmissionErrorState({ onRetry }: { onRetry: () => void }) {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <XCircle className="size-24 text-destructive" />
        <div className="text-center px-4">
          <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
            Submission Failed
          </h2>
          <p className="mt-4 text-sm text-[#7E1D1D]">
            We couldn&apos;t submit your quiz answers. Please try again.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 mx-auto mb-6">
        <Button onClick={onRetry}>Try Again</Button>
        <button
          onClick={handleGoBack}
          className="text-sm text-[#A37878] hover:text-neutral"
        >
          ← Go Back
        </button>
      </div>
    </>
  );
}

function QuizResultsState({ result }: { result: SubmitQuizAnswersResult }) {
  const percentage = (result.score / result.totalQuestions) * 100;
  const passed = percentage >= 60;

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {passed ? (
          <CheckCircle2 className="size-24 text-green-600" />
        ) : (
          <AlertTriangle className="size-24 text-orange-500" />
        )}
        <div className="text-center">
          <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
            {passed ? "Quiz Complete!" : "Quiz Submitted"}
          </h2>
          <p className="mt-4 text-sm text-[#7E1D1D]">
            {passed
              ? "Great job! You've successfully completed the quiz."
              : "You've completed the quiz. Review your results below."}
          </p>
        </div>

        {/* Score display */}
        <div className="w-full max-w-xs bg-surface-1 rounded-2xl p-6 space-y-4">
          <div className="text-center space-y-1">
            <div className="text-5xl font-black text-neutral">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-sm text-[#7E1D1D]">Correct Answers</div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-3 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-500",
                passed ? "bg-green-500" : "bg-orange-500",
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto mb-6">
        <LinkButton href="/leaderboard">View the Leaderboard</LinkButton>
      </div>
    </>
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
  const { signOut } = useWalletAuth();
  const { navigate } = useMiniRouter();
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
    <motion.div
      className="flex-1 flex flex-col"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
      >
        <motion.div variants={fadeSlideUp}>
          {passed ? (
            <CheckCircle2 className="size-24 text-green-600" />
          ) : (
            <AlertTriangle className="size-24 text-orange-500" />
          )}
        </motion.div>
        <motion.div className="text-center" variants={fadeSlideUp}>
          <h2 className="text-[32px]/[95%] font-black text-neutral tracking-[-0.4px] font-futura">
            Quiz Completed
          </h2>
          <p className="mt-4 text-sm text-[#7E1D1D]">
            You completed this quiz on {formattedDate} at {formattedTime}
          </p>
        </motion.div>

        {/* Score display */}
        <motion.div
          className="w-full max-w-xs bg-surface-1 rounded-2xl p-6 space-y-4"
          variants={fadeSlideUp}
        >
          <div className="text-center space-y-1">
            <div className="text-5xl font-black text-neutral">
              {score}/{totalQuestions}
            </div>
            <div className="text-sm text-[#7E1D1D]">Correct Answers</div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-3 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full",
                passed ? "bg-green-500" : "bg-orange-500",
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </motion.div>

        <motion.div className="flex flex-col gap-3" variants={fadeSlideUp}>
          <LinkButton href="/leaderboard">View the Leaderboard</LinkButton>
          <button
            onClick={async () => {
              await signOut();
              navigate("sign-in");
            }}
            className="text-sm text-[#A37878] hover:text-neutral"
          >
            Disconnect Wallet
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Button({
  onClick,
  disabled,
  variant = "default",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  children: ReactNode;
}) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      initial={false}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 h-14 px-6 rounded-full text-[16px]/[130%] font-medium transition-opacity",
        variant === "default" && "text-surface-2 bg-brand",
        variant === "outline" &&
          "text-brand bg-transparent border-2 border-brand",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {children}
    </motion.button>
  );
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
      <Link
        href={href}
        className="flex items-center justify-center h-14 px-6 rounded-full text-[16px]/[130%] font-medium text-surface-2 bg-brand"
      >
        {children}
      </Link>
    </motion.div>
  );
}
