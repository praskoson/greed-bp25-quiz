import { GreedAcademyLogo } from "@/components/ga-logo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[500px] mx-auto min-h-dvh bg-surface-2 flex flex-col items-center justify-center p-6">
      <GreedAcademyLogo className="text-brand-dark" />

      <div className="mt-12 flex flex-col items-center">
        <svg
          className="size-20 text-brand"
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

        <h1 className="mt-6 text-[48px]/none font-black text-foreground tracking-[-1.5px]">
          404
        </h1>

        <p className="mt-3 text-lg text-[#7E1D1D] text-center">
          Page not found
        </p>

        <p className="mt-2 text-sm text-[#A37878] text-center">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="mt-10 flex items-center justify-center h-14 px-12 rounded-full text-[16px]/[130%] font-medium text-surface-2 bg-brand"
      >
        Back to Home
      </Link>
    </div>
  );
}
