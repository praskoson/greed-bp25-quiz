import { AnimatedGreedLoader } from "@/components/greed-loader";
import { ConnectedWalletButton } from "@/components/connected-wallet-button";
import { GreedAcademyLogo } from "@/components/ga-logo";
import { PendingWrapper } from "@/components/pending-wrapper";
import Solana from "@/components/svg/sol-icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useMiniRouter } from "@/state/mini-router";
import { useSubmitSecondaryStakeMutation } from "@/state/mutations/use-submit-secondary-stake";
import { secondaryStakeStatusOptions } from "@/state/queries/secondary-stake-status-options";
import {
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ChevronDown, CircleHelp, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  amount: z.number().min(0.01, "Minimum stake amount is 0.01 SOL"),
  duration: z
    .number()
    .min(60, "Minimum stake duration is 60 days")
    .max(365, "Duration cannot exceed 365 days"),
});

export function StakeMoreRoute() {
  const { mutate, isPending, error, data } = useSubmitSecondaryStakeMutation();
  const { navigate, goBack } = useMiniRouter();

  const [amountInput, setAmountInput] = useState("");
  const [duration, setDuration] = useState(60);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

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
    setShowErrors(true);

    const {
      formData,
      errors: validationErrors,
      isValid,
    } = validateAndGetData();
    setErrors(validationErrors);

    if (!isValid) return;

    mutate({ solAmount: formData.amount, duration: formData.duration });
  };

  return (
    <div className="relative h-full bg-surface-2 flex items-center flex-col p-4 overflow-y-hidden">
      <ConnectedWalletButton
        className="h-14 w-full"
        onDisconnect={() => navigate("sign-in")}
      />
      <GreedAcademyLogo className="mt-5 text-foreground" />
      <WhyStakeMore />
      <form
        id="stake-form"
        onSubmit={handleSubmit}
        className="w-full mt-6 flex flex-col gap-5 py-2"
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
              "pl-8 text-sm/[130%] mt-2",
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
              "pl-8 text-sm/[130%] mt-2",
            )}
          >
            Minimum duration is 60 days
          </span>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Button
            type="submit"
            form="stake-form"
            disabled={isPending}
            className="relative flex items-center gap-1 justify-center"
          >
            <PendingWrapper isPending={isPending}>Stake SOL</PendingWrapper>
          </Button>
          <button
            type="button"
            onClick={() => goBack()}
            className="text-foreground underline underline-offset-2 text-sm"
          >
            Go back →
          </button>
        </div>
      </form>

      <div className="relative h-6 w-full max-w-[350px]">
        {error && !isExpectedError(error) && (
          <div className="absolute z-1 top-0 inset-x-0 h-auto w-full rounded-lg bg-white border border-red-500 p-4 mt-4">
            <p className="text-sm text-red-700 font-medium">{error.message}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {data && <VerificationSheet stakeId={data.stakeId} onClose={goBack} />}
      </AnimatePresence>
    </div>
  );
}

function WhyStakeMore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-4 font-base"
    >
      <CollapsibleTrigger className="flex items-center gap-2 mx-auto text-[#7E1D1D] hover:text-neutral transition-colors">
        <CircleHelp className="size-5" />
        <span className="text-base font-medium">
          Why should I stake more SOL?
        </span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent forceMount>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-2 text-sm text-[#7E1D1D] overflow-hidden list-disc pl-5"
            >
              <li>
                Staking more SOL can improve your position on the leaderboard
                (Score = Correct Answers × Total Stake)
              </li>
              <li>
                Staking with the Greed Academy validator helps support our
                non-profit education initiatives.
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
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
    <div className="flex h-12 items-stretch gap-1">
      <input
        type={type}
        value={value}
        onChange={onChange}
        tabIndex={-1}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        className={cn(
          "text-foreground bg-surface-1 placeholder:text-[#A37878] min-w-0 grow rounded-full px-6 text-base/[130%] font-medium",
          "border-8 border-surface-1 focus:outline-none",
          "ring-2 ring-transparent focus-visible:ring-brand transition-shadow duration-150",
          "aria-invalid:ring-destructive/50",
        )}
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
      />
      {icon && (
        <div className="bg-surface-1 grid w-[54px] shrink-0 place-content-center rounded-full">
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
  form?: string;
  disabled?: boolean;
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
        "w-full max-w-[300px] bg-brand-dark text-foreground-muted h-12 rounded-full text-sm/[130%] font-medium",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function isExpectedError(error: Error): boolean {
  const expected =
    error instanceof WalletSendTransactionError ||
    error instanceof WalletSignTransactionError ||
    error instanceof WalletSignMessageError;

  return expected;
}

type VerificationState = "loading" | "success" | "error";

function getVerificationState(
  data: { status: string | null } | undefined,
  error: Error | null,
  failureCount: number,
): VerificationState {
  if (error && failureCount >= 3) return "error";
  if (data?.status === "failed") return "error";
  if (data?.status === "success") return "success";
  return "loading";
}

function VerificationSheet({
  stakeId,
  onClose,
}: {
  stakeId: string;
  onClose: () => void;
}) {
  const { data, error, failureCount } = useQuery({
    ...secondaryStakeStatusOptions(stakeId),
    refetchInterval: 5000,
  });

  const state = getVerificationState(data, error, failureCount);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-10 bg-surface-2 flex flex-col items-center p-4"
    >
      <div aria-hidden className="h-14" />
      <GreedAcademyLogo className="mt-5 text-foreground" />

      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center gap-6"
          >
            <AnimatedGreedLoader className="w-full min-w-[300px] max-w-[400px]" />
            <div className="text-center">
              <h2 className="text-[28px]/[95%] font-black text-foreground tracking-[-1px]">
                VERIFYING STAKE
              </h2>
              <p className="mt-4 text-base text-[#7E1D1D]">
                This usually takes a few seconds
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 text-foreground underline underline-offset-2 text-sm"
            >
              Go back →
            </button>
          </motion.div>
        )}

        {state === "success" && data && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center gap-6"
          >
            <CheckCircle className="size-24 text-[#00522F]" />
            <div className="text-center">
              <h2 className="text-[28px]/[95%] font-black text-foreground tracking-[-1px]">
                STAKE VERIFIED!
              </h2>
              <p className="mt-4 text-base text-[#7E1D1D]">
                Your additional stake has been confirmed
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                Total stake: {data.totalStakeSol.toFixed(2)} SOL
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="mt-4 w-full max-w-[350px] bg-brand-dark text-foreground-muted h-11 rounded-full text-sm/[130%] font-medium"
            >
              Go back
            </motion.button>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center gap-6"
          >
            <XCircle className="size-24 text-destructive" />
            <div className="text-center">
              <h2 className="text-[28px]/[95%] font-black text-foreground tracking-[-1px]">
                VERIFICATION FAILED
              </h2>
              <p className="mt-4 text-base text-[#7E1D1D]">
                We couldn&apos;t verify your stake
              </p>
              {error && (
                <p className="mt-2 text-sm text-[#A37878]">{error.message}</p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="mt-4 w-full max-w-[350px] bg-brand-dark text-foreground-muted h-11 rounded-full text-sm/[130%] font-medium"
            >
              Go back
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
