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
        className="flex h-full flex-col items-center justify-center gap-6"
      >
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-6"
        >
          <div className="h-14" />

          <motion.div variants={fadeSlideUp}>
            <XCircle className="text-destructive size-24" />
          </motion.div>
          <motion.div className="text-center" variants={fadeSlideUp}>
            <h2 className="text-foreground mt-2 w-full text-center text-[28px]/[95%] font-black tracking-[-1.1px]">
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
    <div className="bg-surface-2 relative h-full overflow-hidden">
      <motion.div
        aria-hidden={state === "success" ? true : undefined}
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className={cn(
          "relative flex h-full flex-col items-center p-4",
          state === "success" && "pointer-events-none",
        )}
      >
        <div className="h-14" />
        <GreedAcademyLogo className="text-foreground mt-5" />

        <motion.div className="text-center" variants={fadeSlideUp}>
          <h1 className="text-foreground mt-2 w-full text-center text-[36px]/[95%] font-black tracking-[-1.1px]">
            VERIFYING STAKE
          </h1>

          <p className="mt-4 text-[19px] font-medium tracking-[-0.6px] text-[#7E1D1D]">
            This usually takes a few seconds
          </p>
        </motion.div>
        <AnimatedGreedLoader className="mt-[30px] w-full max-w-[540px] min-w-[350px]" />
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
      className="absolute inset-0 flex h-full flex-col bg-[#00522F] px-4"
    >
      <div className="flex h-16 w-full items-end justify-center pb-1">
        <GreedAcademyLogo className="text-white" />
      </div>
      <h1 className="mt-6 w-full text-center text-[32px]/[100%] font-black tracking-[-1.1px] text-white">
        VERIFICATION COMPLETE!
      </h1>
      <p className="text-foreground-2 mt-8 px-4 text-center text-[19px] tracking-[-0.6px]">
        Your stake has been verified. You
        can&nbsp;now&nbsp;start&nbsp;the&nbsp;quiz.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        className={cn(
          "mt-6 h-[54px] w-full",
          "flex items-center justify-center rounded-full",
          "bg-neutral text-sm/[130%] font-medium text-white",
        )}
        onClick={() => navigate("quiz")}
      >
        Start Quiz
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        className={cn(
          "mt-2 h-[54px] w-full",
          "flex items-center justify-center rounded-full",
          "bg-[#003820] text-sm/[130%] font-medium text-white",
        )}
        onClick={() => navigate("stake-more")}
      >
        Stake more SOL
      </motion.button>

      <div
        aria-hidden
        className="h-small:top-[500px] min-h-small:bottom-[3%] fixed inset-x-0 -z-1 overflow-hidden"
      >
        <GreedAcademyDottedBackground className="w-full" />
      </div>
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
        "text-surface-2 bg-brand h-[58px] w-full rounded-full px-24 text-[18px]/[130%] font-medium",
      )}
    >
      {children}
    </motion.button>
  );
}
