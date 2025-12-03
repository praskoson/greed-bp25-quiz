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
import {
  UseMutateFunction,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { RouteContainer } from "./route-container";
import { GreedAcademyLogo } from "@/components/ga-logo";
import { GreedAcademyDottedBackground } from "@/components/ga-dotted-bg";
import { PendingWrapper } from "@/components/pending-wrapper";

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

type QuizState =
  | "pending"
  | "error"
  | "already-completed"
  | "ready"
  | "completed"
  | "submit-error";

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

  const {
    error: mutationError,
    data: mutationData,
    mutate,
    isPending: isMutationPending,
  } = useMutation(submitAnswersMutationOption);

  const showPending = useDelayedPending(isPending, PENDING_DELAY_MS);

  // Determine current state
  let state: QuizState = "pending";
  if (isPending) state = "pending";
  else if (error) state = "error";
  else if (data?.state === "finished") state = "already-completed";
  else if (mutationError) state = "submit-error";
  else if (mutationData) state = "completed";
  else state = "ready";

  return (
    <RouteContainer className="bg-brand overflow-hidden flex flex-col">
      <GreedAcademyLogo className="w-full mx-auto mt-10 text-white justify-center" />
      <AnimatePresence mode="wait">
        {state === "pending" && showPending && (
          <QuizPendingState key="pending" />
        )}

        {state === "error" && error && (
          <QuizErrorState key="error" error={error} />
        )}

        {state === "already-completed" && data?.state === "finished" && (
          <QuizAlreadyCompletedState
            key="finished"
            score={data.score}
            totalQuestions={data.totalQuestions}
            completedAt={data.completedAt}
          />
        )}

        {state === "ready" && data?.state === "ready" && (
          <QuizContent
            key="quiz"
            questions={data.questions}
            mutate={mutate}
            isPending={isMutationPending}
          />
        )}

        {state === "submit-error" && (
          <QuizSubmissionErrorState error={mutationError!} />
        )}

        {state === "completed" && <QuizResultsState result={mutationData!} />}
      </AnimatePresence>
      <GreedAcademyDottedBackground className="absolute bottom-10 z-0" />
    </RouteContainer>
  );
}

function QuizPendingState() {
  return (
    <motion.div
      className="mt-8 flex-1 flex flex-col items-center gap-6 "
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
          <Spinner className="size-20 text-white" />
        </motion.div>
        <motion.div className="text-white" variants={fadeSlideUp}>
          <h2 className="text-center text-[32px]/[95%] font-black text-white tracking-[-0.4px]">
            Loading Quiz...
          </h2>
          <p className="mt-4 text-sm text-foreground-muted">
            Please wait while we load your questions
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function QuizErrorState({ error }: { error: Error }) {
  const handleGoBack = () => {
    window.location.reload();
  };

  return (
    <motion.div
      className="mt-8 flex-1 flex flex-col"
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
          <h2 className="text-[32px]/[100%] font-black text-white tracking-[-0.4px]">
            Unable to Load Quiz
          </h2>
          <p className="mt-4 text-sm text-surface-2">
            We encountered an error while loading your quiz.
          </p>
          {error.message && (
            <p className="mt-2 text-sm text-surface-2 wrap-break-word">
              {error.message}
            </p>
          )}
        </motion.div>
        <motion.div className="flex flex-col gap-3" variants={fadeSlideUp}>
          {/*<Button onClick={handleRetry}>Try Again</Button>*/}
          <button
            onClick={handleGoBack}
            className="text-sm text-surface-2 hover:text-surface-3 underline underline-offset-4"
          >
            ← Go Back
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function QuizContent({
  questions,
  mutate,
  isPending,
}: {
  questions: QuizQuestion[];
  isPending: boolean;
  mutate: UseMutateFunction<
    SubmitQuizAnswersResult,
    Error,
    {
      questionId: string;
      answerId: string;
    }[],
    unknown
  >;
}) {
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

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
      className="mt-8 z-1 flex-1 flex flex-col bg-[#F9F6F6] rounded-t-2xl px-4 py-5"
    >
      <span className="bg-surface-3 text-foreground rounded-[4px] font-medium text-base/[130%] w-fit px-2 py-1">
        {currentQuestion.categoryName}
      </span>

      <div className="pt-12 pb-6">
        <span className="sr-only">
          Progress: {currentQuestionIndex + 1} / {totalQuestions}
        </span>
        <div className="w-full grid grid-cols-5 gap-1 h-1 *:rounded-[30px]">
          <div className="bg-brand" />
          {/* prettier-ignore */}
          <div className={currentQuestionIndex > 0 ? "bg-brand" : "bg-surface-3"} />
          {/* prettier-ignore */}
          <div className={currentQuestionIndex > 1 ? "bg-brand" : "bg-surface-3"} />
          {/* prettier-ignore */}
          <div className={currentQuestionIndex > 2 ? "bg-brand" : "bg-surface-3"} />
          {/* prettier-ignore */}
          <div className={currentQuestionIndex > 3 ? "bg-brand" : "bg-surface-3"} />
        </div>
      </div>
      <div>
        <h2 className="font-medium text-foreground text-xl/tight">
          {currentQuestion.questionText}
        </h2>
        <div className="mt-8 flex flex-col gap-4">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                className={cn(
                  "w-full py-4 px-6 rounded-full border-2 text-left transition-colors duration-200",
                  isSelected
                    ? "border-brand-dark bg-brand-dark text-foreground-muted"
                    : "border-[#DAC0C0] bg-white text-foreground",
                )}
              >
                <span className="text-base/[130%] font-medium">
                  {answer.answerText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-auto flex gap-3 py-6">
        {!isFirstQuestion && (
          <Button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            variant="soft"
          >
            Previous
          </Button>
        )}

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={isPending ? "pointer-events-none" : ""}
          >
            {canSubmit ? (
              <PendingWrapper isPending={isPending}>Submit Quiz</PendingWrapper>
            ) : (
              `Answer ${totalQuestions - selectedAnswers.size} more`
            )}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
    </motion.div>
  );
}

function QuizSubmissionErrorState({ error }: { error: Error }) {
  const handleGoBack = () => {
    window.location.reload();
  };

  return (
    <div className="mt-8 flex-1 flex flex-col">
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="flex-1 flex flex-col items-center justify-start gap-6"
      >
        <motion.div variants={fadeSlideUp}>
          <XCircle className="size-24 text-destructive" />
        </motion.div>
        <motion.div className="text-center px-4" variants={fadeSlideUp}>
          <h2 className="text-[28px]/[100%] font-black text-white tracking-[-0.4px]">
            Quiz Submit Failed
          </h2>
          <p className="mt-4 text-sm text-surface-2">
            There was an error while submitting your&nbsp;quiz&nbsp;answers.
          </p>
          {error?.message && (
            <p className="mt-2 text-sm text-surface-2 wrap-break-word">
              {error.message}
            </p>
          )}
        </motion.div>
        <motion.div className="flex flex-col gap-3" variants={fadeSlideUp}>
          {/*<Button onClick={handleRetry}>Try Again</Button>*/}
          <button
            onClick={handleGoBack}
            className="text-sm text-surface-2 hover:text-surface-3 underline underline-offset-4"
          >
            ← Go Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function QuizResultsState({ result }: { result: SubmitQuizAnswersResult }) {
  const { walletAddress } = useWalletAuth();

  return (
    <motion.div
      className="mt-12 flex-1 flex flex-col px-4"
      variants={stateVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex flex-col gap-8 items-center px-2">
        <h2 className="text-[32px]/[95%] font-black text-white tracking-[-1px] uppercase">
          Quiz Complete!
        </h2>
        <p className="text-xl/tight font-medium text-surface-3 text-pretty text-center">
          Great job! You&apos;ve successfully completed the quiz.
        </p>
      </div>
      <div className="mt-[30px] bg-surface-2 rounded-2xl text-center px-2 py-5">
        <div className="text-[64px]/[100%] font-black text-foreground">
          {result.score}/{result.totalQuestions}
        </div>
        <div className="mt-2 text-base text-brand">Correct Answers</div>
        <div className="mt-5 text-base text-brand">
          Signed in as {walletAddress?.slice(0, 4)}…{walletAddress?.slice(-4)}
        </div>
        <LinkButton href="/leaderboard" className="mt-6">
          View the Leaderboard
        </LinkButton>
      </div>
    </motion.div>
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
  const { walletAddress } = useWalletAuth();

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
      className="mt-12 flex-1 flex flex-col px-4"
      variants={stateVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex flex-col gap-8 items-center px-2">
        <h2 className="text-[32px]/[95%] font-black text-white tracking-[-1px] uppercase">
          Quiz Complete!
        </h2>
        <p className="text-xl/tight font-medium text-surface-3 text-pretty text-center">
          You completed this quiz on {formattedDate}&nbsp;at&nbsp;
          {formattedTime}
        </p>
      </div>
      <div className="mt-[30px] bg-surface-2 rounded-2xl text-center px-2 py-5">
        <div className="text-[64px]/[100%] font-black text-foreground">
          {score}/{totalQuestions}
        </div>
        <div className="mt-2 text-base text-brand">Correct Answers</div>
        <div className="mt-5 text-base text-brand">
          Signed in as {walletAddress?.slice(0, 4)}…{walletAddress?.slice(-4)}
        </div>
        <LinkButton href="/leaderboard" className="mt-6">
          View the Leaderboard
        </LinkButton>
        <Button
          onClick={() => alert("Unimplemented")}
          variant="soft"
          className="mt-2 w-full"
        >
          Stake more SOL
        </Button>
      </div>
    </motion.div>
  );
}

function Button({
  onClick,
  disabled,
  variant = "default",
  children,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "soft";
  children: ReactNode;
  className?: string;
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
        "flex-1 h-[54px] px-6 rounded-full text-[16px]/[130%] font-medium transition-opacity",
        variant === "default" && "text-foreground-muted bg-neutral",
        variant === "soft" && "text-foreground bg-surface-3",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

const MotionLink = motion(Link);

function LinkButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <MotionLink
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      href={href}
      className={cn(
        "flex items-center justify-center h-[54px] px-6 rounded-full text-[16px]/[130%] font-medium transition-opacity",
        "text-white bg-brand-dark",
        className,
      )}
    >
      {children}
    </MotionLink>
  );
}
