import { AnimatedGreedLoader } from "@/components/greed-loader";
import { cn } from "@/lib/utils";
import { useMiniRouter } from "@/state/mini-router";
import { stakeStatusOptions } from "@/state/queries/stake-status-options";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode } from "react";
import { quizQuestionsOptions } from "@/state/queries/quiz-questions";
import { GreedAcademyLogo } from "@/components/ga-logo";
import { GreedAcademyDottedBackground } from "@/components/ga-dotted-bg";

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

type PollingState = "loading" | "success" | "error";

function getState(
  data: { status: string | null } | undefined,
  error: Error | null,
  failureCount: number,
): PollingState {
  if (error && failureCount >= 3) return "error";
  if (data?.status === "failed") return "error";
  if (data?.status === "success") return "success";
  return "loading";
}

export function PollingRoute() {
  const { publicKey } = useWallet();
  const { navigate } = useMiniRouter();
  const { data, error, failureCount } = useQuery({
    ...stakeStatusOptions(publicKey?.toBase58()),
    refetchInterval: 5000,
  });

  const state = getState(data, error, failureCount);

  if (state === "error") {
    return (
      <div
        key="error"
        className="h-full flex flex-col items-center justify-center gap-6"
      >
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-6"
        >
          <div className="h-14" />

          <motion.div variants={fadeSlideUp}>
            <XCircle className="size-24 text-destructive" />
          </motion.div>
          <motion.div className="text-center" variants={fadeSlideUp}>
            <h2 className="mt-2 text-[28px]/[95%] font-black text-foreground tracking-[-1.1px] w-full text-center">
              Verification Failed
            </h2>
            <p className="mt-4 text-sm text-[#7E1D1D]">
              We encountered an error while verifying your stake.
            </p>
            <p className="mt-2 text-xs text-[#A37878]">
              {error?.message || "An unknown error occurred"}
            </p>
          </motion.div>
          <motion.div variants={fadeSlideUp}>
            <Button onClick={() => navigate("stake")}>Try Again</Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative bg-surface-2 h-full overflow-hidden">
      <motion.div
        aria-hidden={state === "success" ? true : undefined}
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className={cn(
          "relative h-full flex items-center flex-col p-4",
          state === "success" && "pointer-events-none",
        )}
      >
        <div className="h-14" />
        <GreedAcademyLogo className="mt-5 text-foreground" />

        <motion.div className="text-center" variants={fadeSlideUp}>
          <h1 className="mt-2 text-[36px]/[95%] font-black text-foreground tracking-[-1.1px] w-full text-center">
            VERIFYING STAKE
          </h1>

          <p className="mt-4 text-[19px] text-[#7E1D1D] tracking-[-0.6px] font-medium">
            This usually takes a few seconds
          </p>
        </motion.div>
        <AnimatedGreedLoader className="mt-[30px] w-full min-w-[350px] max-w-[540px]" />
      </motion.div>

      <AnimatePresence>
        {state === "success" && <SuccessState />}
      </AnimatePresence>
    </div>
  );
}

function SuccessState() {
  const { navigate } = useMiniRouter();
  const { publicKey } = useWallet();

  // prefetch
  useQuery({
    ...quizQuestionsOptions(publicKey?.toBase58()),
    notifyOnChangeProps: [],
  });

  return (
    <motion.div
      key="success"
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0 h-full bg-[#00522F] flex flex-col px-4"
    >
      <GreedAcademyLogo className="mx-auto mt-10 text-white" />
      <h1 className="mt-12 text-[32px]/[100%] font-black text-white tracking-[-1.1px] w-full text-center">
        VERIFICATION COMPLETE!
      </h1>
      <p className="mt-8 text-[19px] text-foreground-2 tracking-[-0.6px] text-center px-4">
        Your stake has been verified. You
        can&nbsp;now&nbsp;start&nbsp;the&nbsp;quiz.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        className={cn(
          "h-[54px] w-full mt-6",
          "flex items-center justify-center rounded-full",
          "text-white bg-neutral font-medium text-sm/[130%]",
        )}
        onClick={() => navigate("quiz")}
      >
        Start Quiz
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        className={cn(
          "h-[54px] w-full mt-2",
          "flex items-center justify-center rounded-full",
          "text-white bg-[#003820] font-medium text-sm/[130%]",
        )}
        onClick={() => navigate("stake-more")}
      >
        Stake more SOL
      </motion.button>

      <GreedAcademyDottedBackground />
    </motion.div>
  );
}

function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      initial={false}
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-surface-2 bg-brand h-[58px] px-24 rounded-full text-[18px]/[130%] font-medium",
      )}
    >
      {children}
    </motion.button>
  );
}
