"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: 60,
    },
  });

  // Poll for stake confirmation
  // const pollStakeStatus = async (sessionId: string, token: string) => {
  //   const maxAttempts = 30; // 30 seconds max
  //   let attempts = 0;

  //   const poll = async () => {
  //     try {
  //       const response = await fetch(
  //         `/api/stake/status/route?sessionId=${sessionId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       if (response.ok) {
  //         const data = await response.json();

  //         if (data.stakeConfirmed) {
  //           onSuccess(sessionId);
  //           return;
  //         }
  //       }

  //       attempts++;
  //       if (attempts < maxAttempts) {
  //         setTimeout(poll, 1000); // Poll every second
  //       } else {
  //         onError(
  //           "Verification is taking longer than expected. Please check back later.",
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Polling error:", error);
  //       onError("Failed to verify stake. Please try again.");
  //     }
  //   };

  //   poll();
  // };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // Step 1: Send stake transaction on Solana
      const txResult = await sendStakeTransaction(data.amount, data.duration);

      if (txResult.status === "error") {
        throw new Error(txResult.message || "Transaction failed");
      }

      await mutateAsync(
        {
          amount: data.amount,
          duration: data.duration,
          txSignature: txResult.signature,
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
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Stake SOL to participate</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-stake" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-stake-amount">
                    Stake Amount (SOL)
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-stake-amount"
                    aria-invalid={fieldState.invalid}
                    placeholder="1.00"
                    autoComplete="off"
                    type="number"
                    step="0.001"
                    disabled={isConfirming}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="duration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-stake-duration">
                    Lock Duration (Days)
                  </FieldLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      id="form-stake-duration"
                      placeholder="Minimum 60 days"
                      aria-invalid={fieldState.invalid}
                      type="number"
                      disabled={isConfirming}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Info Box */}
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
