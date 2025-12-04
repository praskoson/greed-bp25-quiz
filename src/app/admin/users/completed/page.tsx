import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCompletedQuizUsers } from "../../_lib/queries";
import { ExportCsvButton } from "../../_components/export-csv-button";

function formatWalletAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(3);
}

export const dynamic = "force-dynamic";

export default async function CompletedUsersPage() {
  const users = await getCompletedQuizUsers();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-foreground">
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </Button>
        <ExportCsvButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Completed</CardTitle>
          <CardDescription>
            {users.length} users who have finished the quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No completed quizzes yet
            </p>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <Link
                  key={user.sessionId}
                  href={`/admin/users/${user.sessionId}`}
                  className="hover:bg-surface-4 -mx-2 flex items-center justify-between rounded-md px-2 py-3 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono">
                      {formatWalletAddress(user.walletAddress)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">
                      {formatSol(user.stakeAmountLamports)} SOL
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">
                      Score: {user.score}/{user.questionCount}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {user.completedAt && formatDate(user.completedAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
