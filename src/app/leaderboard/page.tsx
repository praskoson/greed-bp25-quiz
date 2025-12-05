import type { LeaderboardEntry } from "@/lib/stake/quiz.schemas";
import { QuizService } from "@/lib/stake/quiz.service";
import { sortByWeightedScore } from "@/lib/stake/score";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LeaderboardRowNoSsr } from "./_components/table-row-no-ssr";

// function generateLeaderboardEntries(num: number): LeaderboardEntry[] {
//   return Array.from({ length: num }, (_, i) => ({
//     userId: `user-${i + 1}`,
//     walletAddress: `GREEDkpTvpKzcGvBu9qd36yk6BfjTWPShB67gLWuixMv`,
//     score: Math.floor(Math.random() * 5) + 1,
//     completedAt: new Date(),
//     stakeAmountLamports:
//       Math.floor(Math.random() * 10_000_000_000) + 1_000_000_000,
//     stakeDurationSeconds: 60 * 86400,
//   }));
// }

export default async function LeaderboardPage() {
  let entries: LeaderboardEntry[];
  let error: Error | null = null;

  try {
    entries = await QuizService.getQuizLeaderboard();
  } catch (e) {
    error = e instanceof Error ? e : new Error("Failed to load leaderboard");
    entries = [];
  }

  if (error) {
    return <LeaderboardErrorState error={error} />;
  }

  return <LeaderboardContent entries={entries} />;
}

function LeaderboardErrorState({ error }: { error: Error }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <svg
        className="text-destructive size-24"
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
      <div className="px-4 text-center">
        <p className="mt-4 text-sm text-[#7E1D1D]">
          There was an error while loading the leaderboard.
        </p>
        {error.message && (
          <p className="mt-2 text-xs wrap-break-word text-[#A37878]">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/leaderboard"
          className="text-surface-2 bg-brand flex h-14 items-center justify-center rounded-full px-12 text-[16px]/[130%] font-medium"
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
              "tv:size-10 size-4 sm:size-5",
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
  const sortedEntries = sortByWeightedScore(entries);

  const formatWalletAddress = (address: string, chars = 4) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

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

  // Leaderboard entries
  return sortedEntries.length === 0 ? (
    <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-6">
      <p className="text-[#7E1D1D]">
        No quiz results yet. Be the first to complete the quiz!
      </p>
      <Link
        href="/"
        className="text-surface-2 bg-brand flex h-14 items-center justify-center rounded-full px-12 text-[16px]/[130%] font-medium"
      >
        Take the Quiz
      </Link>
    </div>
  ) : (
    <div className="scrollbar-hidden mt-8 min-h-0 w-full flex-1 pb-20 max-xl:space-y-2 xl:mx-2 xl:grid xl:grid-cols-32 xl:content-start xl:gap-y-4 xl:overflow-y-auto xl:rounded-[14px] xl:bg-white xl:px-12 xl:py-[52px]">
      <div className="tv:text-xl col-span-full hidden grid-cols-subgrid items-center text-sm font-semibold text-[#B59090] uppercase xl:grid">
        <div className="col-span-2 text-center">#</div>
        <div aria-hidden="true">{/* spacer */}</div>
        <div className="col-span-13 text-left">WALLET ADDRESS</div>
        <div className="col-span-5">STAKE (SOL)</div>
        <div className="col-span-5">DURATION (DAYS)</div>
        <div className="col-span-6">CORRECT ANSWERS</div>
      </div>
      {sortedEntries.map((entry, index) => {
        const rank = index + 1;
        const solAmount = lamportsToSol(entry.stakeAmountLamports);
        const days = secondsToDays(entry.stakeDurationSeconds);

        return (
          <LeaderboardRowNoSsr key={entry.userId}>
            <div className="hidden xl:col-span-full xl:grid xl:grid-cols-subgrid">
              <div className="col-span-2">
                <div
                  className={cn(
                    "tv:size-20 tv:text-2xl flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
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
                className="text-foreground tv:text-2xl/[130%] col-span-13 content-center text-base/[130%] font-semibold"
              >
                {entry.walletAddress}
              </div>
              <div
                data-stake={solAmount}
                className="text-foreground tv:text-2xl/[130%] col-span-5 content-center text-base/[130%] font-semibold"
              >
                {solAmount}
              </div>
              <div
                data-days={days}
                className="text-foreground tv:text-2xl/[130%] col-span-5 content-center text-base/[130%] font-semibold"
              >
                {days}
              </div>
              <div
                data-rating={entry.score}
                className="text-foreground tv:text-2xl/[130%] col-span-6 content-center text-base/[130%] font-semibold"
              >
                <StarRating score={entry.score} />
              </div>
            </div>

            <div className="flex w-full items-center gap-3 sm:gap-4 xl:hidden">
              {/* Rank badge */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                  getRankBadgeColor(rank),
                )}
              >
                {rank}
              </div>

              {/* User info */}
              <div className="min-w-0 flex-1">
                <div className="text-foreground truncate text-base font-medium">
                  {formatWalletAddress(entry.walletAddress, 4)}
                </div>

                {/* Stars */}
                <div data-rating={entry.score} className="mt-1">
                  <StarRating score={entry.score} />
                </div>
              </div>

              {/* Stats */}
              <div className="shrink-0 space-y-1 text-right text-base/[130%] font-semibold">
                <div className="text-foreground font-semibold">
                  {solAmount} SOL
                </div>
                <div className="text-[#A37878]">
                  {days} {days === 1 ? "day" : "days"}
                </div>
              </div>
            </div>
          </LeaderboardRowNoSsr>
        );
      })}
    </div>
  );
}
