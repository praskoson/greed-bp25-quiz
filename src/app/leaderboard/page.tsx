import type { LeaderboardEntry } from "@/lib/stake/quiz.schemas";
import { QuizService } from "@/lib/stake/quiz.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BackLink } from "./_components/back-link";
import { GreedAcademyLogo } from "@/components/ga-logo";

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
    <div className="min-h-screen p-6">
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
          <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
            Unable to Load Leaderboard
          </h2>
          <p className="mt-4 text-sm text-[#7E1D1D]">
            We encountered an error while loading the leaderboard.
          </p>
          {error.message && (
            <p className="mt-2 text-xs text-[#A37878] break-words">
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
          <Link
            href="/"
            className="text-sm text-[#A37878] hover:text-neutral text-center"
          >
            ← Go Home
          </Link>
        </div>
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

  return (
    <div className="min-h-screen bg-surface-2 p-4 flex flex-col items-center">
      {/* Header */}
      <GreedAcademyLogo className="text-brand-dark mt-8" />
      <h1 className="mt-2 text-[36px]/none font-black text-foreground tracking-[-1.1px]">
        LEADERBOARD
      </h1>
      <p className="mt-4 text-xl text-foreground">
        Score = Stake × Correct Answers
      </p>

      {/* Leaderboard entries */}
      {sortedEntries.length === 0 ? (
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
        <div className="mt-8 space-y-2 flex-1 w-full">
          {sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const solAmount = lamportsToSol(entry.stakeAmountLamports);
            const days = secondsToDays(entry.stakeDurationSeconds);

            return (
              <div
                key={entry.userId}
                className="w-full p-4 rounded-2xl  bg-surface-1"
              >
                <div className="flex items-center gap-3 sm:gap-4">
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
              </div>
            );
          })}
        </div>
      )}

      {/* Back link */}
      <div className="w-full">
        <BackLink />
      </div>
    </div>
  );
}
