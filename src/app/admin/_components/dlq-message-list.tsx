import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DlqMessageBody } from "@/lib/qstash/types";

type DlqMessage = {
  dlqId: string;
  createdAt: number;
  body: DlqMessageBody;
};

type DlqMessageListProps = {
  messages: DlqMessage[];
};

function formatWalletAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function formatSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(3);
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function DlqMessageList({ messages }: DlqMessageListProps) {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700">
          <a
            href="https://console.upstash.com/qstash/dlq"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Dead Letter Queue
          </a>
        </CardTitle>
        <CardDescription>
          {messages.length} failed verification attempts that need attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No failed verifications
          </p>
        ) : (
          <div className="divide-y">
            {messages.map((message) => (
              <div
                key={message.dlqId}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono">
                    {formatWalletAddress(message.body.walletAddress)}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium">
                    {formatSol(message.body.amount)} SOL
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
