"use client";

import { GreedAcademyLogo } from "@/components/ga-logo";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-[500px] mx-auto min-h-dvh bg-surface-2 flex flex-col items-center justify-center p-6">
      <GreedAcademyLogo className="text-brand-dark" />

      <div className="mt-12 flex flex-col items-center">
        <svg
          className="size-20 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>

        <h1 className="mt-6 text-[32px]/none font-black text-foreground tracking-[-1px]">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-[#7E1D1D] text-center">
          An unexpected error occurred.
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-[#A37878] text-center font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className="mt-10 flex items-center justify-center h-14 px-12 rounded-full text-[16px]/[130%] font-medium text-surface-2 bg-brand"
      >
        Try Again
      </button>
    </div>
  );
}
