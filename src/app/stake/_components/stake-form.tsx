"use client";

import * as z from "zod";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useSubmitStake } from "../use-submit-stake";
import { useSubmitStakeMutation } from "@/state/mutations/use-submit-stake-signature";

const formSchema = z.object({
  amount: z.number().min(0.1, "Minimum stake amount is 0.1 SOL"),
  duration: z
    .number()
    .min(60, "Minimum stake duration is 60 days")
    .max(365, "Duration cannot exceed 365 days"),
});

interface StakeFormProps {
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export function StakeForm({ onSuccess, onError }: StakeFormProps) {
  const { sendStakeTransaction, isConfirming } = useSubmitStake();
  const { mutateAsync } = useSubmitStakeMutation();

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
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Stake SOL to participate</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-stake" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!errors.amount}>
              <FieldLabel htmlFor="form-stake-amount">
                Stake Amount (SOL)
              </FieldLabel>
              <Input
                id="form-stake-amount"
                aria-invalid={!!errors.amount}
                placeholder="1.00"
                autoComplete="off"
                type="text"
                inputMode="decimal"
                disabled={isConfirming}
                value={amountInput}
                onChange={handleAmountChange}
              />
              {errors.amount && (
                <FieldError errors={[{ message: errors.amount }]} />
              )}
            </Field>

            <Field data-invalid={!!errors.duration}>
              <FieldLabel htmlFor="form-stake-duration">
                Lock Duration (Days)
              </FieldLabel>
              <InputGroup>
                <Input
                  id="form-stake-duration"
                  placeholder="Minimum 60 days"
                  aria-invalid={!!errors.duration}
                  type="number"
                  disabled={isConfirming}
                  value={duration === 0 ? "" : duration}
                  onChange={handleDurationChange}
                />
              </InputGroup>
              {errors.duration && (
                <FieldError errors={[{ message: errors.duration }]} />
              )}
            </Field>
          </FieldGroup>

          <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
            <h3 className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-300">
              How it works
            </h3>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-400">
              <li>• Your stake is locked for the selected duration</li>
              <li>• Answer 5 quiz questions (1 per category)</li>
              <li>• Score = Stake Amount × Correct Answers</li>
            </ul>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-stake" disabled={isConfirming}>
            {isConfirming ? "Processing Transaction..." : "Stake & Start Quiz"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
