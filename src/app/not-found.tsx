import { GreedAcademyLogo } from "@/components/ga-logo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-surface-2 mx-auto flex min-h-dvh max-w-[500px] flex-col items-center justify-center p-6">
      <GreedAcademyLogo className="text-brand-dark" />

      <div className="mt-12 flex flex-col items-center">
        <svg
          className="text-brand size-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>

        <h1 className="text-foreground mt-6 text-[48px]/none font-black tracking-[-1.5px]">
          404
        </h1>

        <p className="mt-3 text-center text-lg text-[#7E1D1D]">
          Page not found
        </p>

        <p className="mt-2 text-center text-sm text-[#A37878]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="text-surface-2 bg-brand mt-10 flex h-14 items-center justify-center rounded-full px-12 text-[16px]/[130%] font-medium"
      >
        Back to Home
      </Link>
    </div>
  );
}
