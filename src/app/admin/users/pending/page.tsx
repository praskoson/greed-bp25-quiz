import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPendingVerificationUsers } from "../../_lib/queries";

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

export default async function PendingUsersPage() {
  const users = await getPendingVerificationUsers();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-foreground">
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verification</CardTitle>
          <CardDescription>
            {users.length} users awaiting stake verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No pending verifications
            </p>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <Link
                  key={user.sessionId}
                  href={`/admin/users/${user.sessionId}`}
                  className="flex items-center justify-between py-3 hover:bg-surface-3 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono">
                      {formatWalletAddress(user.walletAddress)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">
                      {formatSol(user.stakeAmountLamports)} SOL
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
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
