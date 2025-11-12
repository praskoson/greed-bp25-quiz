"use client";

import { AuthButton } from "@/components/auth-button";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useWalletAuth();

  // Redirect authenticated users to stake page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/stake");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-white">
            Greed Academy
          </h1>
          <p className="mb-2 text-lg text-zinc-700 dark:text-zinc-300">
            BP25 Quiz Challenge
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Stake, Learn, Win
          </p>
        </div>

        <div className="w-full rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <AuthButton />
        </div>

        <div className="mt-4 max-w-sm text-center text-xs text-zinc-500 dark:text-zinc-500">
          <p>Connect your Solana wallet to get started</p>
        </div>
      </main>
    </div>
  );
}
