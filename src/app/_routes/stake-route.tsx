import Solana from "@/components/svg/sol-icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, shorten } from "@/lib/utils";
import { useSubmitStakeMutation } from "@/state/mutations/use-submit-stake-signature";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { CircleHelp, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useState } from "react";
import { z } from "zod";
import { useSubmitStake } from "./use-submit-stake";
import { useMiniRouter } from "@/state/mini-router";
import { RouteContainer } from "./route-container";

const formSchema = z.object({
  amount: z.number().min(0.01, "Minimum stake amount is 0.1 SOL"),
  duration: z
    .number()
    .min(60, "Minimum stake duration is 60 days")
    .max(365, "Duration cannot exceed 365 days"),
});

interface StakeFormProps {
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export function StakeRoute({ onSuccess, onError }: StakeFormProps) {
  const { walletAddress, signOut } = useWalletAuth();
  const { sendStakeTransaction, isConfirming } = useSubmitStake();
  const { mutateAsync } = useSubmitStakeMutation();
  const { navigate } = useMiniRouter();

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

    try {
      const txResult = await sendStakeTransaction(
        formData.amount,
        formData.duration,
      );

      if (txResult.status === "error") {
        throw new Error(txResult.message || "Transaction failed");
      }

      await mutateAsync(
        {
          amount: formData.amount,
          duration: formData.duration,
          signature: txResult.signature,
        },
        {
          onSuccess: (data) => {
            onSuccess(data.sessionId);
          },
        },
      );
    } catch (error: any) {
      console.error("Stake submission error:", error);
      onError(error.message || "Failed to submit stake. Please try again.");
    }
  };

  return (
    <RouteContainer>
      <header className="flex justify-between items-center">
        <GreedLogoImage className="text-[#7E1D1D]" />
        <div className="text-right text-sm/4 text-[#7E1D1D] px-2 gap-2 font-base">
          <div>Connected as</div>
          <div className="font-bold">{shorten(walletAddress ?? "")}</div>
        </div>
      </header>
      <h1 className="mt-10 text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] w-full text-center font-futura">
        Stake, Learn & <span className="text-brand">Win</span>
      </h1>
      <HowItWorksCollapsible />
      <form
        id="stake-form"
        onSubmit={handleSubmit}
        className="mt-10 flex flex-col gap-6"
      >
        <div>
          <InputGroup
            type="text"
            value={amountInput}
            onChange={handleAmountChange}
            ariaInvalid={!!errors.amount}
            disabled={isConfirming}
            placeholder="Enter SOL amount"
            icon={<Solana height={30} width={30} />}
          />

          <span
            className={cn(
              errors?.amount ? "text-destructive" : "text-[#A37878]",
              "pl-8 text-sm mt-1",
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
            disabled={isConfirming}
            placeholder="Enter duration in days"
          />
          <span
            className={cn(
              errors?.duration ? "text-destructive" : "text-[#A37878]",
              "pl-8 text-sm mt-1",
            )}
          >
            Minimum duration is 60 days
          </span>
        </div>
      </form>

      <div className="mt-10 mx-auto">
        <Button type="submit" form="stake-form" disabled={isConfirming}>
          {isConfirming ? "Processing Transaction..." : "Stake SOL"}
        </Button>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate("sign-in");
          }}
          className="mt-4 w-full text-sm text-[#A37878] hover:text-neutral"
        >
          ← Sign Out
        </button>
      </div>
    </RouteContainer>
  );
}

function GreedLogoImage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 962 693"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-18 -translate-y-1", className)}
    >
      <g clipPath="url(#clip0_386_357)">
        <path
          d="M478.046 333.378C478.756 333.627 479.53 333.627 480.24 333.378L540.093 312.418C543.056 311.38 543.055 307.19 540.092 306.153L479.143 284.833L453.142 275.728C450.179 274.691 450.18 270.5 453.143 269.463L512.997 248.527C513.706 248.279 514.479 248.279 515.188 248.526L549.042 260.355L679.864 306.151C682.827 307.188 682.827 311.379 679.864 312.416L480.239 382.28C479.529 382.528 478.756 382.528 478.047 382.28L368.209 343.868C366.051 343.113 363.795 344.715 363.795 347.001L363.795 424.844C363.795 426.261 364.694 427.521 366.033 427.982L478.059 466.533C478.761 466.774 479.524 466.773 480.225 466.53L614.537 420.014C616.693 419.268 618.942 420.869 618.942 423.15V478.167C618.942 479.577 618.05 480.833 616.719 481.299L480.239 529.066C479.529 529.315 478.756 529.315 478.046 529.066L306.616 469.06C305.285 468.594 304.394 467.338 304.394 465.928V323.877C304.394 322.467 303.503 321.211 302.172 320.745L138.622 263.488C135.659 262.45 135.659 258.26 138.622 257.223L478.047 138.43C478.756 138.182 479.529 138.182 480.239 138.43L819.665 257.224C822.627 258.261 822.628 262.45 819.665 263.488L759.809 284.449C759.099 284.698 758.326 284.698 757.616 284.45L480.239 187.359C479.529 187.111 478.756 187.111 478.046 187.359L278.421 257.223C275.458 258.26 275.458 262.45 278.421 263.488L478.046 333.378Z"
          fill="currentColor"
        />
        <path
          d="M754.309 335.355C756.471 334.583 758.744 336.186 758.744 338.48V527.115C758.744 528.52 757.859 529.773 756.534 530.243L703.651 548.981C701.492 549.747 699.225 548.145 699.224 545.854L699.168 357.383C699.167 355.98 700.049 354.729 701.37 354.257L754.309 335.355Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_386_357">
          <rect
            width="698.938"
            height="415.854"
            fill="currentColor"
            transform="translate(129.69 138.153)"
          />
        </clipPath>
      </defs>
    </svg>
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
    <div className="flex h-[70px] items-stretch gap-1">
      <input
        type={type}
        value={value}
        onChange={onChange}
        tabIndex={-1}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        className={cn(
          "text-foreground bg-surface-1 placeholder:text-[#A37878] min-w-0 grow rounded-full px-6 text-[18px]/[130%] font-medium",
          "border-8 border-surface-1 focus:outline-none",
          "ring-2 ring-transparent focus-visible:ring-brand transition-shadow duration-150",
          "aria-invalid:ring-destructive/50",
        )}
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
      />
      {icon && (
        <div className="bg-surface-1 grid w-[78px] shrink-0 place-content-center rounded-full">
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
}: {
  type: "submit" | "button";
  form: string;
  disabled: boolean;
  children: ReactNode;
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
        "w-full text-surface-2 bg-brand h-[70px] px-24 rounded-full text-[18px]/[130%] font-medium",
      )}
    >
      {children}
    </motion.button>
  );
}

function HowItWorksCollapsible() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-6 px-4 font-base"
    >
      <CollapsibleTrigger className="flex items-center gap-2 mx-auto text-[#7E1D1D] hover:text-neutral transition-colors">
        <CircleHelp className="size-5" />
        <span className="text-base font-medium">How does it work?</span>
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
                Stake your SOL (minimum of 0.01) for at least 60 days to
                participate.
              </li>
              <li>Answer 5 questions in different categories.</li>
              <li>
                View your results on the leaderboard! Score = Stake × Correct
                Answers.
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}
