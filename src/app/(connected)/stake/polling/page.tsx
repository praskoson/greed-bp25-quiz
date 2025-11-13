"use client";

import { stakeStatusOptions } from "@/state/queries/stake-status-options";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PollingPage() {
  const { publicKey } = useWallet();
  const { data, error, failureCount } = useQuery({
    ...stakeStatusOptions(publicKey?.toBase58()),
    refetchInterval: 5000,
  });

  if (error && failureCount >= 3) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 pt-8 dark:bg-black sm:items-center sm:pt-0">
        <main className="w-full max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-900">
            <div className="mb-6 flex justify-center">
              <XCircle className="h-24 w-24 text-red-600 dark:text-red-500" />
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="mb-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              We encountered an error while verifying your stake.
            </p>
            <p className="mb-8 text-center text-xs text-zinc-500 dark:text-zinc-500">
              {error.message || "An unknown error occurred"}
            </p>

            <Button
              asChild
              className="w-full block"
              variant="outline"
              size="lg"
            >
              <Link href="/stake">Try Again</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (data?.status === "success") {
    return (
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 pt-8 dark:bg-black sm:items-center sm:pt-0">
        <main className="w-full max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-900">
            <div className="mb-6 flex justify-center">
              <CheckCircle2 className="h-24 w-24 text-green-600 dark:text-green-500" />
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-white">
              Verification Complete!
            </h2>
            <p className="mb-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Your stake has been verified. You can now start the quiz.
            </p>

            <Button asChild size="lg">
              <Link href="/stake/quiz" className="block w-full">
                Start Quiz
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 pt-8 dark:bg-black sm:items-center sm:pt-0">
      <main className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-900">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-500"></div>
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            Verifying Stake...
          </h2>
          <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            This usually takes a few seconds
          </p>
        </div>
      </main>
    </div>
  );
}
