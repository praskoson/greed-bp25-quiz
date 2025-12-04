import type { LeaderboardEntry } from "@/lib/stake/quiz.schemas";
import { QuizService } from "@/lib/stake/quiz.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AutoRefreshWrapper } from "./_components/auto-refresh";
import { LeaderboardRowDesktop } from "./_components/table-row";

export default async function LeaderboardAutoPage() {
  let entries: LeaderboardEntry[];
  let error: Error | null = null;

  try {
    entries = await QuizService.getQuizLeaderboard();
  } catch (e) {
    error = e instanceof Error ? e : new Error("Failed to load leaderboard");
    entries = [];
  }

  if (error) {
    return (
      <AutoRefreshWrapper>
        <LeaderboardErrorState error={error} />
      </AutoRefreshWrapper>
    );
  }

  return (
    <AutoRefreshWrapper>
      <LeaderboardContent entries={entries} />
    </AutoRefreshWrapper>
  );
}

function LeaderboardErrorState({ error }: { error: Error }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <svg
        className="size-24 text-destructive"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div className="text-center px-4">
        <p className="mt-4 text-sm text-[#7E1D1D]">
          There was an error while loading the leaderboard.
        </p>
        {error.message && (
          <p className="mt-2 text-xs text-[#A37878] wrap-break-word">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/leaderboard/auto"
          className="flex items-center justify-center h-14 px-12 rounded-full text-[16px]/[130%] font-medium text-surface-2 bg-brand"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}

function StarRating({
  score,
  maxScore = 5,
}: {
  score: number;
  maxScore?: number;
}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxScore }).map((_, index) => {
        const isFilled = index < score;
        return (
          <svg
            key={index}
            className={cn(
              "size-5 tv:size-10",
              isFilled
                ? "text-brand-dark fill-brand-dark"
                : "text-surface-3 fill-surface-3",
            )}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}

function LeaderboardContent({ entries }: { entries: LeaderboardEntry[] }) {
  // Sort by weighted score (score * stake), then by completedAt (earlier is better)
  const sortedEntries = [...entries].sort((a, b) => {
    const bScore = b.score * b.stakeAmountLamports;
    const aScore = a.score * a.stakeAmountLamports;
    if (bScore !== aScore) {
      return bScore - aScore;
    }
    return (
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
  });

  const lamportsToSol = (lamports: number) => {
    return (lamports / 1_000_000_000).toFixed(2);
  };

  const secondsToDays = (seconds: number) => {
    return Math.floor(seconds / 86400);
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[#FEF1C2] text-[#A55900] border-[#FCDF75]";
      case 2:
        return "bg-[#EEEDF2] text-[#3C4659] border-[#D6D7E0]";
      case 3:
        return "bg-[#FFDCC6] text-[#B73A02] border-[#FCB281]";
      default:
        return "bg-transparent border-transparent text-[#7E1D1D]";
    }
  };

  // Leaderboard entries - desktop only
  return sortedEntries.length === 0 ? (
    <div className="mt-8 flex-1 flex flex-col items-center justify-center gap-6">
      <p className="text-[#7E1D1D]">
        No quiz results yet. Be the first to complete the quiz!
      </p>
      <Link
        href="/"
        className="flex items-center justify-center h-14 px-12 rounded-full text-[16px]/[130%] font-medium text-surface-2 bg-brand"
      >
        Take the Quiz
      </Link>
    </div>
  ) : (
    <div className="mt-8 flex-1 min-h-0 w-full pb-20 bg-white rounded-[14px] mx-2 px-12 py-[52px] grid content-start grid-cols-32 gap-y-4 overflow-y-auto scrollbar-hidden">
      <div className="grid items-center grid-cols-subgrid col-span-full font-semibold text-sm text-[#B59090] uppercase tv:text-xl">
        <div className="text-center col-span-2">#</div>
        <div aria-hidden="true">{/* spacer */}</div>
        <div className="text-left col-span-13">WALLET ADDRESS</div>
        <div className="col-span-5">STAKE (SOL)</div>
        <div className="col-span-5">DURATION (DAYS)</div>
        <div className="col-span-6">CORRECT ANSWERS</div>
      </div>
      {sortedEntries.map((entry, index) => {
        const rank = index + 1;
        const solAmount = lamportsToSol(entry.stakeAmountLamports);
        const days = secondsToDays(entry.stakeDurationSeconds);

        return (
          <LeaderboardRowDesktop key={entry.userId}>
            <div className="grid grid-cols-subgrid col-span-full">
              <div className="col-span-2">
                <div
                  className={cn(
                    "flex items-center justify-center size-11 rounded-full border-2 font-bold text-sm shrink-0 tv:size-20 tv:text-2xl",
                    getRankBadgeColor(rank),
                  )}
                >
                  {rank}
                </div>
              </div>
              <div aria-hidden="true" className="col-span-1">
                {/* spacer */}
              </div>
              <div
                data-address={entry.walletAddress}
                className="font-semibold text-base/[130%] text-foreground content-center col-span-13 tv:text-2xl/[130%]"
              >
                {entry.walletAddress}
              </div>
              <div
                data-stake={solAmount}
                className="font-semibold text-base/[130%] text-foreground content-center col-span-5 tv:text-2xl/[130%]"
              >
                {solAmount}
              </div>
              <div
                data-days={days}
                className="font-semibold text-base/[130%] text-foreground content-center col-span-5 tv:text-2xl/[130%]"
              >
                {days}
              </div>
              <div
                data-rating={entry.score}
                className="font-semibold text-base/[130%] text-foreground content-center col-span-6 tv:text-2xl/[130%]"
              >
                <StarRating score={entry.score} />
              </div>
            </div>
          </LeaderboardRowDesktop>
        );
      })}
    </div>
  );
}
