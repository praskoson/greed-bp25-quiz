import Solana from "@/components/svg/sol-icon";
import { cn } from "@/lib/utils";
import { useSubmitStakeMutation } from "@/state/mutations/use-submit-stake-signature";
import { motion } from "motion/react";
import { ReactNode, useState } from "react";
import { z } from "zod";
import { useMiniRouter } from "@/state/mini-router";
import {
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";
import { PendingWrapper } from "@/components/pending-wrapper";
import { ConnectedWalletButton } from "@/components/connected-wallet-button";
import { GreedAcademyLogo } from "@/components/ga-logo";
import dynamic from "next/dynamic";
import { GreedAcademyDottedBackground } from "@/components/ga-dotted-bg";
import { useQuery } from "@tanstack/react-query";
import { quizStateOptions } from "@/state/queries/quiz-state";

const DynamicHowItWorks = dynamic(() => import("@/components/how-it-works"), {
  ssr: false,
});

const formSchema = z.object({
  amount: z.number().min(0.01, "Minimum stake amount is 0.01 SOL"),
  duration: z
    .number()
    .min(60, "Minimum duration is 60 days")
    .max(365, "Duration cannot exceed 365 days"),
});

export function StakeRoute() {
  const { data: statusData, isPending: isStatusPending } =
    useQuery(quizStateOptions());
  const { mutate, isPending, error } = useSubmitStakeMutation();
  const { navigate } = useMiniRouter();

  const [amountInput, setAmountInput] = useState("");
  const [duration, setDuration] = useState(60);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [pausedWarningDismissed, setPausedWarningDismissed] = useState(false);

  const isQuizPaused = statusData?.status === "paused";
  const showPausedWarning = isQuizPaused && !pausedWarningDismissed;

  const validateAndGetData = () => {
    const amount =
      amountInput === "" ? NaN : parseFloat(amountInput.replace(/,/g, "."));
    const formData = { amount, duration };

    const result = formSchema.safeParse(formData);
    const newErrors: Record<string, string> = {};

    if (!result.success) {
      result.error.issues.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
    }

    return { formData, errors: newErrors, isValid: result.success };
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, ".");
    setAmountInput(value);

    if (showErrors) {
      const { errors: newErrors } = validateAndGetData();
      setErrors(newErrors);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setDuration(value);

    if (showErrors) {
      const { errors: newErrors } = validateAndGetData();
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    if (isStatusPending) return;
    setShowErrors(true);

    const {
      formData,
      errors: validationErrors,
      isValid,
    } = validateAndGetData();
    setErrors(validationErrors);

    if (!isValid) return;

    mutate(
      { solAmount: formData.amount, duration: formData.duration },
      {
        onSuccess: () => {
          navigate("polling");
        },
      },
    );
  };

  return (
    <div className="bg-surface-2 relative isolate flex h-full flex-col items-center overflow-x-hidden p-4">
      <ConnectedWalletButton
        className="h-14 w-full"
        onDisconnect={() => navigate("sign-in")}
      />
      <GreedAcademyLogo className="text-foreground mt-5" />

      <h1 className="text-foreground mt-2 w-full text-center text-[36px]/[95%] font-black tracking-[-1.1px]">
        CAN YOU TOP THE LEADERBOARD?
      </h1>
      <form
        id="stake-form"
        onSubmit={handleSubmit}
        className="z-1 mt-8 flex flex-col gap-5 px-4 py-2"
      >
        <div>
          <InputGroup
            type="text"
            value={amountInput}
            onChange={handleAmountChange}
            ariaInvalid={!!errors.amount}
            disabled={isPending}
            placeholder="Enter SOL amount"
            icon={<Solana height={26} width={26} />}
          />

          <span
            className={cn(
              errors?.amount ? "text-destructive" : "text-[#A37878]",
              "mt-2 pl-8 text-sm/[130%]",
            )}
          >
            Minimum amount is 0.01 SOL
          </span>
        </div>
        <div>
          <InputGroup
            type="number"
            value={duration === 0 ? "" : duration}
            onChange={handleDurationChange}
            ariaInvalid={!!errors.duration}
            disabled={isPending}
            placeholder="Enter duration in days"
          />
          <span
            className={cn(
              errors?.duration ? "text-destructive" : "text-[#A37878]",
              "mt-2 pl-8 text-sm/[130%]",
            )}
          >
            {errors?.duration ?? "Minimum duration is 60 days"}
          </span>
        </div>
        {showPausedWarning ? (
          <QuizPausedWarning
            onDismiss={() => setPausedWarningDismissed(true)}
          />
        ) : (
          <Button
            type="submit"
            form="stake-form"
            disabled={isPending}
            className="relative flex items-center justify-center gap-1"
          >
            <PendingWrapper isPending={isPending}>Stake SOL</PendingWrapper>
          </Button>
        )}
      </form>

      <div className="relative h-6 w-full max-w-[350px]">
        {error && !isExpectedError(error) && (
          <div className="absolute inset-x-0 top-0 z-1 mt-4 h-auto w-full rounded-lg border border-red-500 bg-white p-4">
            <p className="text-sm font-medium text-red-700">{error.message}</p>
          </div>
        )}
      </div>
      <div
        aria-hidden
        className="h-small:top-[500px] min-h-small:bottom-[3%] fixed inset-x-0 -z-1 overflow-hidden"
      >
        <GreedAcademyDottedBackground className="w-full" />
      </div>

      <div className="mt-auto w-full">
        <DynamicHowItWorks className="mt-4" />
      </div>
    </div>
  );
}

function InputGroup({
  type,
  value,
  onChange,
  ariaInvalid,
  disabled,
  placeholder,
  icon,
}: {
  type: "text" | "number";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaInvalid: boolean;
  disabled?: boolean;
  placeholder?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex h-[52px] items-stretch gap-1">
      <input
        type={type}
        value={value}
        onChange={onChange}
        tabIndex={-1}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        className={cn(
          "text-foreground bg-surface-1 min-w-0 grow rounded-full px-6 text-base/[130%] font-medium placeholder:text-[#A37878]",
          "border-surface-1 border-8 focus:outline-none",
          "focus-visible:ring-brand ring-2 ring-transparent transition-shadow duration-150",
          "aria-invalid:ring-destructive/50",
        )}
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
      />
      {icon && (
        <div className="bg-surface-1 grid w-[58px] shrink-0 place-content-center rounded-full">
          {icon}
        </div>
      )}
    </div>
  );
}

function Button({
  type,
  form,
  disabled,
  children,
  className,
}: {
  type: "submit" | "button";
  form: string;
  disabled: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      initial={false}
      type={type}
      form={form}
      disabled={disabled}
      className={cn(
        "bg-brand-dark text-foreground-muted h-14 w-full max-w-[350px] rounded-full text-sm/[130%] font-medium",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function QuizPausedWarning({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-surface-1 w-full max-w-[350px] rounded-2xl border border-[#F00F0F] p-4">
      <p className="text-sm font-medium text-[#F00F0F]">
        Quiz submissions are currently paused.
      </p>
      <p className="text-foreground mt-1 text-sm">
        You can still stake SOL and solve the quiz if you want to.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-foreground mt-3 h-10 w-full rounded-full bg-[#FCC3C3] text-sm font-medium"
      >
        I understand, continue
      </button>
    </div>
  );
}

function isExpectedError(error: Error): boolean {
  const expected =
    error instanceof WalletSendTransactionError ||
    error instanceof WalletSignTransactionError ||
    error instanceof WalletSignMessageError;

  return expected;
}
