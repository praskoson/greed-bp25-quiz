import { AnimatedGreedLoader } from "@/components/greed-loader";
import { cn } from "@/lib/utils";
import { useMiniRouter } from "@/state/mini-router";
import { stakeStatusOptions } from "@/state/queries/stake-status-options";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { ReactNode } from "react";

export function PollingRoute() {
  const { publicKey } = useWallet();
  const { navigate } = useMiniRouter();
  const { data, error, failureCount } = useQuery({
    ...stakeStatusOptions(publicKey?.toBase58()),
    refetchInterval: 5000,
  });

  // Error state after 3 failed attempts
  if (error && failureCount >= 3) {
    return (
      <PollingContainer>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <XCircle className="size-24 text-destructive" />
          <div className="text-center">
            <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
              Verification Failed
            </h2>
            <p className="mt-4 text-sm text-[#7E1D1D]">
              We encountered an error while verifying your stake.
            </p>
            <p className="mt-2 text-xs text-[#A37878]">
              {error.message || "An unknown error occurred"}
            </p>
          </div>
        </div>
        <div className="mx-auto mb-6">
          <Button onClick={() => navigate("stake")}>Try Again</Button>
        </div>
      </PollingContainer>
    );
  }

  // Success state
  if (data?.status === "success") {
    return (
      <PollingContainer>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <CheckCircle2 className="size-24 text-green-600" />
          <div className="text-center">
            <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
              Verification Complete!
            </h2>
            <p className="mt-4 text-sm text-[#7E1D1D]">
              Your stake has been verified. You can now start the quiz.
            </p>
          </div>
        </div>
        <div className="mx-auto mb-6">
          <Button onClick={() => navigate("quiz")}>Start Quiz</Button>
        </div>
      </PollingContainer>
    );
  }

  // Loading/polling state (default)
  return (
    <PollingContainer>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 pb-40">
        <AnimatedGreedLoader />
        <div className="text-center">
          <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
            Verifying Stake...
          </h2>
          <p className="mt-4 text-sm text-[#7E1D1D]">
            This usually takes a few seconds
          </p>
        </div>
      </div>
    </PollingContainer>
  );
}

function PollingContainer({ children }: { children: ReactNode }) {
  return (
    <motion.div
      layoutId="page-two"
      style={{ borderRadius: 28 }}
      className="bg-surface-2 fixed inset-4 mx-auto my-auto"
    >
      <div className="h-full flex flex-col p-3">{children}</div>
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
        "w-full text-surface-2 bg-brand h-[70px] px-24 rounded-full text-[18px]/[130%] font-medium",
      )}
    >
      {children}
    </motion.button>
  );
}
