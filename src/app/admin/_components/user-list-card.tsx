"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Ban } from "lucide-react";
import type { AdminUserListItem } from "../_lib/queries";

function formatWalletAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(3);
}

type UserListCardProps = {
  title: string;
  description: string;
  users: AdminUserListItem[];
  totalCount: number;
  viewAllHref: string;
  emptyMessage?: string;
  variant?: "default" | "danger";
};

export function UserListCard({
  title,
  description,
  users,
  totalCount,
  viewAllHref,
  emptyMessage = "No users found",
  variant = "default",
}: UserListCardProps) {
  const hasMore = totalCount > users.length;

  return (
    <Card className={variant === "danger" ? "border-red-200" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={variant === "danger" ? "text-red-700" : ""}>
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {/*<span className="text-2xl font-semibold text-muted-foreground">
            {totalCount}
          </span>*/}
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <UserListItem key={user.sessionId} user={user} />
            ))}
            {hasMore && (
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={viewAllHref}>View all {totalCount} users</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type UserListItemProps = {
  user: AdminUserListItem;
};

function UserListItem({ user }: UserListItemProps) {
  const handleCopyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(user.walletAddress);
  };

  return (
    <Link
      href={`/admin/users/${user.sessionId}`}
      className="flex items-center justify-between py-[5px] px-2 -mx-2 rounded-md hover:bg-surface-4"
    >
      <div className="flex items-center gap-1 text-sm/4">
        <button
          onClick={handleCopyAddress}
          className="_font-mono hover:underline"
          title="Click to copy address"
        >
          {formatWalletAddress(user.walletAddress)}
        </button>
        <span className="text-foreground">•</span>
        <span className="font-medium">
          {formatSol(user.stakeAmountLamports)} SOL
        </span>
      </div>
      <div className="flex items-center gap-2">
        {user.shadowBan && (
          <span title="Shadow banned">
            <Ban className="size-4 text-amber-500" />
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      </div>
    </Link>
  );
}
