import { Spinner } from "@/components/spinner";
import type {
  QuizQuestion,
  QuizQuestionResult,
  SubmitQuizAnswersResult,
} from "@/lib/stake/quiz.schemas";
import { cn } from "@/lib/utils";
import { submitAnswersMutationOption } from "@/state/mutations/use-submit-quiz-answers";
import { quizQuestionsOptions } from "@/state/queries/quiz-questions";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  UseMutateFunction,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { ArrowLeft, XCircle, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { RouteContainer } from "./route-container";
import { GreedAcademyLogo } from "@/components/ga-logo";
import { GreedAcademyDottedBackground } from "@/components/ga-dotted-bg";
import { PendingWrapper } from "@/components/pending-wrapper";
import { useMiniRouter } from "@/state/mini-router";

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
  } = useMutation(submitAnswersMutationOption(publicKey?.toBase58() ?? ""));

  const showPending = useDelayedPending(isPending, PENDING_DELAY_MS);

  // Determine current state
  let state: QuizState = "pending";
  if (isPending) state = "pending";
  else if (error) state = "error";
  else if (mutationData) state = "completed";
  else if (mutationError) state = "submit-error";
  else if (data?.state === "finished") state = "already-completed";
  else state = "ready";

  return (
    <RouteContainer className="bg-brand flex flex-col overflow-hidden">
      <LogoHeader />
      <AnimatePresence mode="wait" initial={false}>
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
            questions={data.questions}
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
          <QuizSubmissionErrorState key="submit-error" error={mutationError!} />
        )}

        {state === "completed" && (
          <QuizResultsState key="completed" result={mutationData!} />
        )}
      </AnimatePresence>
      <GreedAcademyDottedBackground className="absolute bottom-10" />
    </RouteContainer>
  );
}

function QuizPendingState() {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center gap-6"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="mt-8 flex flex-col items-center gap-6"
      >
        <motion.div variants={fadeSlideUp}>
          <Spinner className="size-20 text-white" />
        </motion.div>
        <motion.div className="text-white" variants={fadeSlideUp}>
          <h2 className="text-center text-[32px]/[95%] font-black tracking-[-0.4px] text-white">
            Loading Quiz...
          </h2>
          <p className="text-foreground-muted mt-4 text-sm">
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
      className="flex flex-1 flex-col"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="flex flex-1 flex-col items-center justify-center gap-6"
      >
        <motion.div variants={fadeSlideUp}>
          <XCircle className="text-destructive size-24" />
        </motion.div>
        <motion.div className="px-4 text-center" variants={fadeSlideUp}>
          <h2 className="text-[32px]/[100%] font-black tracking-[-0.4px] text-white">
            Unable to Load Quiz
          </h2>
          <p className="text-surface-2 mt-4 text-sm">
            We encountered an error while loading your quiz.
          </p>
          {error.message && (
            <p className="text-surface-2 mt-2 text-sm wrap-break-word">
              {error.message}
            </p>
          )}
        </motion.div>
        <motion.div className="flex flex-col gap-3" variants={fadeSlideUp}>
          {/*<Button onClick={handleRetry}>Try Again</Button>*/}
          <button
            onClick={handleGoBack}
            className="text-surface-2 hover:text-surface-3 text-sm whitespace-pre underline underline-offset-4"
          >
            <ArrowLeft className="inline size-3.5 -translate-px" /> Go Back
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
      className="z-1 flex flex-1 flex-col overflow-y-auto rounded-t-2xl bg-[#F9F6F6] px-4 py-5"
    >
      <span className="bg-surface-3 text-foreground w-fit rounded-[4px] px-2 py-1 text-base/[130%] font-medium">
        {currentQuestion.categoryName}
      </span>

      <div className="pt-10 pb-6">
        <span className="sr-only">
          Progress: {currentQuestionIndex + 1} / {totalQuestions}
        </span>
        <div className="grid h-1 w-full grid-cols-5 gap-1 *:rounded-[30px]">
          <div className="bg-brand" />
          {new Array(4).fill(null).map((_, index) => {
            const isActive = currentQuestionIndex > index;
            return (
              <div
                key={index}
                className="bg-surface-3 relative overflow-hidden rounded-[30px]"
              >
                <motion.div
                  className="bg-brand absolute inset-0 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isActive ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h2 className="text-foreground text-xl/tight font-medium">
          {currentQuestion.questionText}
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                className={cn(
                  "w-full rounded-full border-2 px-6 py-4 text-left transition-colors duration-200",
                  isSelected
                    ? "border-brand-dark bg-brand-dark text-foreground-muted"
                    : "text-foreground border-[#DAC0C0] bg-white",
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
            className="flex-1"
          >
            Previous
          </Button>
        )}

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={isPending ? "pointer-events-none flex-1" : "flex-1"}
          >
            {canSubmit ? (
              <PendingWrapper isPending={isPending}>Submit Quiz</PendingWrapper>
            ) : (
              `Answer ${totalQuestions - selectedAnswers.size} more`
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1">
            Next
          </Button>
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
    <div className="mt-8 flex flex-1 flex-col">
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="flex flex-1 flex-col items-center justify-start gap-6"
      >
        <motion.div variants={fadeSlideUp}>
          <XCircle className="text-destructive size-24" />
        </motion.div>
        <motion.div className="px-4 text-center" variants={fadeSlideUp}>
          <h2 className="text-[28px]/[100%] font-black tracking-[-0.4px] text-white">
            Quiz Submit Failed
          </h2>
          {error?.message ? (
            <p className="text-surface-2 mt-2 text-sm wrap-break-word">
              {error.message}
            </p>
          ) : (
            <p>
              There was an error while submitting
              your&nbsp;quiz&nbsp;answers.{" "}
            </p>
          )}
        </motion.div>
        <motion.div className="flex flex-col gap-3" variants={fadeSlideUp}>
          {/*<Button onClick={handleRetry}>Try Again</Button>*/}
          <button
            onClick={handleGoBack}
            className="text-surface-2 hover:text-surface-3 text-sm whitespace-pre underline underline-offset-4"
          >
            <ArrowLeft className="inline size-3.5 -translate-px" />
            Go Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function QuizResultsState({ result }: { result: SubmitQuizAnswersResult }) {
  const { walletAddress } = useWalletAuth();
  const { navigate } = useMiniRouter();
  const [openAnswers, setOpenAnswers] = useState(false);

  return (
    <motion.div
      className="relative z-1 mt-7 flex flex-1 flex-col"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {openAnswers ? (
          <QuizAnswersSheet
            key="completed-questions"
            questions={result.questions}
            onClose={() => setOpenAnswers(false)}
            className="absolute inset-0"
          />
        ) : (
          <motion.div
            key="completed-preview"
            className="px-4"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ delay: 0.1, bounce: 0 }}
          >
            <div className="flex flex-col items-center gap-8 px-2">
              <h2 className="text-[32px]/[95%] font-black tracking-[-1px] text-white uppercase">
                Quiz Complete!
              </h2>
              <p className="text-surface-3 text-center text-xl/tight font-medium text-pretty">
                Great job! You&apos;ve successfully completed the quiz.
              </p>
            </div>
            <div className="bg-surface-2 mt-[30px] rounded-2xl px-2 py-5 text-center">
              <div className="text-foreground text-[64px]/[100%] font-black">
                {result.score}/{result.totalQuestions}
              </div>
              <div className="mt-2 text-sm text-[#A37878]">Correct Answers</div>
              <div className="text-brand mt-4 text-sm">
                Signed in as {walletAddress?.slice(0, 4)}…
                {walletAddress?.slice(-4)}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 px-3">
                <LinkButton href="/leaderboard" className="col-span-2">
                  View the Leaderboard
                </LinkButton>
                <Button
                  onClick={() => navigate("stake-more")}
                  variant="default"
                  className="w-full shrink-0 px-0"
                >
                  Stake More
                </Button>
                <Button
                  onClick={() => setOpenAnswers(true)}
                  variant="soft"
                  className="w-full shrink-0 px-0"
                >
                  View Answers
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuizAlreadyCompletedState({
  score,
  totalQuestions,
  completedAt,
  questions,
}: {
  score: number;
  totalQuestions: number;
  completedAt: Date;
  questions: QuizQuestionResult[];
}) {
  const { navigate } = useMiniRouter();
  const { walletAddress } = useWalletAuth();
  const [openAnswers, setOpenAnswers] = useState(false);

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
      className="relative z-1 mt-7 flex flex-1 flex-col"
      variants={stateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {openAnswers ? (
          <QuizAnswersSheet
            key="finished-questions"
            questions={questions}
            onClose={() => setOpenAnswers(false)}
            className="absolute inset-0"
          />
        ) : (
          <motion.div
            key="finished-preview"
            className="px-4"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ delay: 0.1, bounce: 0 }}
          >
            <div className="flex flex-col items-center gap-8 px-2">
              <h2 className="text-[32px]/[95%] font-black tracking-[-1px] text-white uppercase">
                Quiz Complete!
              </h2>
              <p className="text-surface-3 text-center text-xl/tight font-medium text-pretty">
                You completed this quiz on {formattedDate}&nbsp;at&nbsp;
                {formattedTime}
              </p>
            </div>
            <div className="bg-surface-2 mt-[30px] rounded-2xl px-2 py-5 text-center">
              <div className="text-foreground text-[64px]/[100%] font-black">
                {score}/{totalQuestions}
              </div>
              <div className="mt-2 text-sm text-[#A37878]">Correct Answers</div>
              <div className="text-brand mt-4 text-sm">
                Signed in as {walletAddress?.slice(0, 4)}…
                {walletAddress?.slice(-4)}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 px-3">
                <LinkButton href="/leaderboard" className="col-span-2">
                  View the Leaderboard
                </LinkButton>
                <Button
                  onClick={() => navigate("stake-more")}
                  variant="default"
                  className="w-full shrink-0 px-0"
                >
                  Stake More
                </Button>
                <Button
                  onClick={() => setOpenAnswers(true)}
                  variant="soft"
                  className="w-full shrink-0 px-0"
                >
                  View Answers
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuizAnswersSheet({
  questions,
  onClose,
  className,
}: {
  questions: QuizQuestionResult[];
  onClose: () => void;
  className?: string;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

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

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
      className={cn(
        "z-1 flex flex-1 flex-col overflow-y-auto rounded-t-2xl bg-[#F9F6F6] px-4 py-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="bg-surface-3 text-foreground w-fit rounded-[4px] px-2 py-1 text-base/[130%] font-medium">
          {currentQuestion.categoryName}
        </span>
        <button aria-label="Close answers" onClick={onClose}>
          <XIcon className="text-foreground size-5" />
        </button>
      </div>

      <div className="pt-4">
        <h2 className="text-foreground text-xl/tight font-medium">
          {currentQuestion.questionText}
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          {currentQuestion.answers.map((answer) => {
            return (
              <div
                key={answer.id}
                className={cn(
                  "w-full rounded-full border-2 px-6 py-4 text-left transition-colors duration-200",
                  answer.isCorrect
                    ? "border-[#00522F] bg-[#00522F]/10 text-[#00522F]"
                    : !answer.isCorrect &&
                        answer.id === currentQuestion.userAnswerId
                      ? "border-red-500 bg-white text-red-700"
                      : "text-foreground border-[#DAC0C0] bg-white",
                )}
              >
                <span className="text-base/[130%] font-medium whitespace-pre">
                  {answer.answerText}{" "}
                  {currentQuestion.userAnswerId === answer.id ? (
                    <>
                      <ArrowLeft className="inline size-3.5 -translate-px" />{" "}
                      Your answer
                    </>
                  ) : answer.isCorrect ? (
                    <>
                      <ArrowLeft className="inline size-3.5 -translate-px" />{" "}
                      Correct answer
                    </>
                  ) : (
                    ""
                  )}
                </span>
              </div>
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
            className="flex-1"
          >
            Previous
          </Button>
        )}

        {!isLastQuestion && (
          <Button className="flex-1" onClick={handleNext}>
            Next
          </Button>
        )}
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
        "flex h-[54px] items-center justify-center rounded-full px-6 text-[14px]/[130%] font-medium transition-opacity",
        variant === "default" && "text-foreground-muted bg-neutral",
        variant === "soft" && "text-foreground bg-surface-3",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

const MotionLink = motion.create(Link);

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
        "flex h-[54px] items-center justify-center rounded-full px-6 text-[14px]/[130%] font-medium transition-opacity",
        "bg-brand-dark text-white",
        className,
      )}
    >
      {children}
    </MotionLink>
  );
}

function LogoHeader() {
  return (
    <div className="flex h-16 w-full items-end justify-center pb-1">
      <GreedAcademyLogo className="text-white" />
    </div>
  );
}
