import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getVerifiedUsersWithQuestions } from "../../_lib/queries";

function formatWalletAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
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
  return (lamports / 1_000_000_000).toFixed(2);
}

export const dynamic = "force-dynamic";

export default async function VerifiedUsersPage() {
  const users = await getVerifiedUsersWithQuestions();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-foreground">
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verified Users (Questions Assigned)</CardTitle>
          <CardDescription>
            {users.length} users who have staked and been assigned quiz
            questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users found</p>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <Link
                  key={user.sessionId}
                  href={`/admin/users/${user.sessionId}`}
                  className="flex items-center justify-between py-3 hover:bg-surface-3 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm">
                      {formatWalletAddress(user.walletAddress)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)} · {user.questionCount}{" "}
                      questions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatSol(user.stakeAmountLamports)} SOL
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
