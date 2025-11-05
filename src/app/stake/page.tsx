"use client";

import { useWalletAuth } from "@/state/use-wallet-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MIN_STAKE_DURATION = 60; // days

export default function StakePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, walletAddress, signOut } = useWalletAuth();
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeDuration, setStakeDuration] = useState("");
  const [errors, setErrors] = useState<{
    amount?: string;
    duration?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const validateAmount = (value: string): string | undefined => {
    if (!value) {
      return "Stake amount is required";
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return "Invalid amount";
    }
    if (num <= 0) {
      return "Amount must be greater than 0";
    }
    if (num > 1000000) {
      return "Amount is too large";
    }
    return undefined;
  };

  const validateDuration = (value: string): string | undefined => {
    if (!value) {
      return "Stake duration is required";
    }
    const num = parseInt(value);
    if (isNaN(num)) {
      return "Invalid duration";
    }
    if (num < MIN_STAKE_DURATION) {
      return `Duration must be at least ${MIN_STAKE_DURATION} days`;
    }
    if (num > 365) {
      return "Duration cannot exceed 365 days";
    }
    return undefined;
  };

  const handleAmountChange = (value: string) => {
    setStakeAmount(value);
    const error = validateAmount(value);
    setErrors((prev) => ({ ...prev, amount: error }));
  };

  const handleDurationChange = (value: string) => {
    setStakeDuration(value);
    const error = validateDuration(value);
    setErrors((prev) => ({ ...prev, duration: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const amountError = validateAmount(stakeAmount);
    const durationError = validateDuration(stakeDuration);

    setErrors({
      amount: amountError,
      duration: durationError,
    });

    if (amountError || durationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement stake submission
      // This will call the /api/stake endpoint
      console.log("Submitting stake:", {
        amount: parseFloat(stakeAmount),
        duration: parseInt(stakeDuration),
        wallet: walletAddress,
      });

      // Placeholder for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Navigate to quiz page after stake is confirmed
      // router.push(`/quiz/${sessionId}`);
    } catch (error) {
      console.error("Stake submission error:", error);
      setErrors({
        amount: "Failed to submit stake. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 pt-8 dark:bg-black sm:items-center sm:pt-0">
      <main className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            Stake to Play
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Lock your SOL to participate in the quiz
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            Connected: {walletAddress?.slice(0, 4)}...
            {walletAddress?.slice(-4)}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900"
        >
          {/* Stake Amount */}
          <div>
            <label
              htmlFor="stakeAmount"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Stake Amount (SOL)
            </label>
            <input
              type="number"
              id="stakeAmount"
              value={stakeAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              step="0.001"
              placeholder="0.00"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Stake Duration */}
          <div>
            <label
              htmlFor="stakeDuration"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Lock Duration (Days)
            </label>
            <input
              type="number"
              id="stakeDuration"
              value={stakeDuration}
              onChange={(e) => handleDurationChange(e.target.value)}
              min={MIN_STAKE_DURATION}
              max={365}
              placeholder={`Minimum ${MIN_STAKE_DURATION} days`}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              disabled={isSubmitting}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
            )}
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Minimum: {MIN_STAKE_DURATION} days
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
            <h3 className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-300">
              How it works
            </h3>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-400">
              <li>• Your stake is locked for the selected duration</li>
              <li>• Answer 5 quiz questions (1 per category)</li>
              <li>• Score = Stake Amount × Correct Answers</li>
              <li>• Compete on the leaderboard!</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !!errors.amount || !!errors.duration}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
          >
            {isSubmitting ? "Processing..." : "Stake & Start Quiz"}
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={signOut}
            className="w-full text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Sign Out
          </button>
        </form>
      </main>
    </div>
  );
}
