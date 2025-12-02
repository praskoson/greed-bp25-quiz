"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { refreshAdminData } from "../_lib/actions";

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshAdminData();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
      className="text-foreground-1 hover:bg-brand-dark hover:text-foreground-1"
    >
      {isPending ? "Refreshing..." : "Refresh"}
    </Button>
  );
}
