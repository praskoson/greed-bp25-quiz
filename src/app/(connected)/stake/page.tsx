"use client";

import { useWalletAuth } from "@/state/use-wallet-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StakeForm } from "./_components/stake-form";

export default function StakePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, walletAddress, signOut } =
    useWalletAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = (newSessionId: string) => {
    setSessionId(newSessionId);
    setIsConfirmed(true);
    router.push("/stake/polling");
  };

  const handleError = (error: string) => {
    setSubmitError(error);
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

  // Show success state
  if (isConfirmed && sessionId) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 pt-8 dark:bg-black sm:items-center sm:pt-0">
        <main className="w-full max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-900">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-white">
              Stake Confirmed!
            </h2>
            <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Your stake has been verified. You can now start the quiz.
            </p>

            {/* Start Quiz Button */}
            <button
              onClick={() => router.push(`/quiz/${sessionId}`)}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
            >
              Start Quiz
            </button>

            {/* Sign Out Link */}
            <button
              type="button"
              onClick={signOut}
              className="mt-4 w-full text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Sign Out
            </button>
          </div>
        </main>
      </div>
    );
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
        <StakeForm onSuccess={handleSuccess} onError={handleError} />

        {/* Submit Error */}
        {submitError && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-800 dark:text-red-400">
              {submitError}
            </p>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={signOut}
          className="mt-4 w-full text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Sign Out
        </button>
      </main>
    </div>
  );
}
