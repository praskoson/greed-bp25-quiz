import type { LeaderboardEntry } from "@/lib/stake/quiz.schemas";
import { QuizService } from "@/lib/stake/quiz.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LeaderboardRow } from "./_components/table-row";

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

  // entries.push(...generateLeaderboardEntries(30));

  return <LeaderboardContent entries={entries} />;
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
          We encountered an error while loading the leaderboard.
        </p>
        {error.message && (
          <p className="mt-2 text-xs text-[#A37878] wrap-break-word">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/leaderboard"
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
              "w-4 h-4 sm:w-5 sm:h-5",
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
    <div className="mt-8 max-xl:space-y-2 flex-1 min-h-0 w-full pb-20 xl:bg-white xl:rounded-[14px] xl:mx-2 xl:px-12 xl:py-[52px] xl:grid xl:grid-cols-32 xl:gap-y-4 xl:overflow-y-auto scrollbar-hidden">
      <div className="hidden xl:grid items-center grid-cols-subgrid col-span-full font-semibold text-sm text-[#B59090] uppercase">
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
          <LeaderboardRow key={entry.userId}>
            <div className="xl:grid hidden xl:grid-cols-subgrid xl:col-span-full">
              <div className="col-span-2">
                <div
                  className={cn(
                    "flex items-center justify-center size-11 rounded-full border-2 font-bold text-sm shrink-0",
                    getRankBadgeColor(rank),
                  )}
                >
                  {rank}
                </div>
              </div>
              <div aria-hidden="true" className="col-span-1">
                {/* spacer */}
              </div>
              <div className="font-semibold text-base/[130%] text-foreground content-center col-span-13">
                {entry.walletAddress}
              </div>
              <div className="font-semibold text-base/[130%] text-foreground content-center col-span-5">
                {solAmount}
              </div>
              <div className="font-semibold text-base/[130%] text-foreground content-center col-span-5">
                {days}
              </div>
              <div className="font-semibold text-base/[130%] text-foreground content-center col-span-6">
                <StarRating score={entry.score} />
              </div>
            </div>

            <div className="xl:hidden flex items-center gap-3 sm:gap-4">
              {/* Rank badge */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm shrink-0",
                  getRankBadgeColor(rank),
                )}
              >
                {rank}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-base text-foreground truncate">
                  {formatWalletAddress(entry.walletAddress, 3)}
                </div>

                {/* Stars */}
                <div className="mt-1">
                  <StarRating score={entry.score} />
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0 space-y-1 text-base/[130%] font-semibold">
                <div className="text-foreground font-semibold">
                  {solAmount} SOL
                </div>
                <div className=" text-[#A37878]">
                  {days} {days === 1 ? "day" : "days"}
                </div>
              </div>
            </div>
          </LeaderboardRow>
        );
      })}
    </div>
  );
}
