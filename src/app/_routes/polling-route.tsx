import { AnimatedGreedLoader } from "@/components/greed-loader";
import { cn } from "@/lib/utils";
import { useMiniRouter } from "@/state/mini-router";
import { stakeStatusOptions } from "@/state/queries/stake-status-options";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode } from "react";
import { RouteContainer } from "./route-container";

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

  return (
    <RouteContainer>
      <AnimatePresence mode="wait">
        {state === "error" && (
          <motion.div
            key="error"
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
                <XCircle className="size-24 text-destructive" />
              </motion.div>
              <motion.div className="text-center" variants={fadeSlideUp}>
                <h2 className="text-[28px]/[95%] font-black text-neutral tracking-[-0.4px] font-futura">
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
          </motion.div>
        )}

        {state === "success" && (
          <motion.div
            key="success"
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
                <CheckCircle2 className="size-24 text-green-600" />
              </motion.div>
              <motion.div className="text-center" variants={fadeSlideUp}>
                <h2 className="text-[28px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
                  Verification Complete!
                </h2>
                <p className="mt-4 text-sm text-[#7E1D1D]">
                  Your stake has been verified. You can now start the quiz.
                </p>
              </motion.div>
              <motion.div variants={fadeSlideUp}>
                <Button onClick={() => navigate("quiz")}>Start Quiz</Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {state === "loading" && (
          <motion.div
            key="loading"
            className="flex-1 flex flex-col items-center justify-center gap-2 pb-40"
            variants={stateVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center gap-2"
            >
              <motion.div variants={fadeSlideUp}>
                <AnimatedGreedLoader />
              </motion.div>
              <motion.div className="text-center" variants={fadeSlideUp}>
                <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
                  Verifying Stake...
                </h2>
                <p className="mt-4 text-sm text-[#7E1D1D]">
                  This usually takes a few seconds
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RouteContainer>
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
        "w-full text-surface-2 bg-brand h-[70px] px-24 rounded-full text-[18px]/[130%] font-medium",
      )}
    >
      {children}
    </motion.button>
  );
}
