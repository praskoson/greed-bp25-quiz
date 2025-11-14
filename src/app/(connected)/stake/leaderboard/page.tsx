"use client";

import { quizLeaderboardOptions } from "@/state/queries/quiz-leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LeaderboardEntry } from "@/lib/stake/quiz.schemas";
import Link from "next/link";

export default function LeaderboardPage() {
  const { data, isPending, error } = useQuery(quizLeaderboardOptions());

  if (isPending) {
    return <LeaderboardPendingState />;
  }

  if (error) {
    return <LeaderboardErrorState error={error} />;
  }

  return <LeaderboardContent entries={data} />;
}

function LeaderboardPendingState() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-3">
              <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-full max-w-md bg-muted animate-pulse rounded-md" />
            </div>

            {/* Leaderboard entries skeleton */}
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 border-border"
                >
                  {/* Rank */}
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                  </div>

                  {/* Score */}
                  <div className="h-6 w-12 bg-muted animate-pulse rounded-md" />
                </div>
              ))}
            </div>

            {/* Loading message */}
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Loading leaderboard...
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LeaderboardErrorState({ error }: { error: Error }) {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6 text-center">
            {/* Error icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <svg
                  className="h-12 w-12 text-destructive"
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
              </div>
            </div>

            {/* Error message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Unable to Load Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We encountered an error while loading the leaderboard. This
                might be a temporary issue.
              </p>
            </div>

            {/* Error details (for debugging) */}
            {error.message && (
              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-xs text-muted-foreground font-mono break-words">
                  {error.message}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={handleRetry} className="min-w-32">
                Try Again
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="min-w-32"
              >
                Go Back
              </Button>
            </div>
          </div>
        </Card>
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
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isFilled
                ? "text-yellow-500 fill-yellow-500"
                : "text-muted fill-muted"
            }`}
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
  // Sort by score (descending), then by completedAt (ascending - earlier is better)
  const sortedEntries = [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
  });

  const formatWalletAddress = (address: string) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
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
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case 2:
        return "bg-gray-400/10 text-gray-600 border-gray-400/20";
      case 3:
        return "bg-orange-600/10 text-orange-700 border-orange-600/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Leaderboard
              </h1>
            </div>

            {/* Leaderboard entries */}
            {sortedEntries.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No quiz results yet. Be the first to complete the quiz!
                </p>
                <div className="pt-4">
                  <Button asChild>
                    <Link href="/stake/quiz">Take the Quiz</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEntries.map((entry, index) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  const solAmount = lamportsToSol(entry.stakeAmountLamports);
                  const days = secondsToDays(entry.stakeDurationSeconds);

                  return (
                    <div
                      key={entry.userId}
                      className={`
                        p-4 rounded-lg border-2 transition-colors
                        ${isTopThree ? "border-primary/30 bg-primary/5" : "border-border"}
                      `}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Rank badge */}
                        <div
                          className={`
                            flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm shrink-0
                            ${getRankBadgeColor(rank)}
                          `}
                        >
                          {rank}
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">
                            {formatWalletAddress(entry.walletAddress)}
                          </div>

                          {/* Stars */}
                          <div className="mt-1">
                            <StarRating score={entry.score} />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right shrink-0 space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {solAmount} SOL
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {days} {days === 1 ? "day" : "days"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
