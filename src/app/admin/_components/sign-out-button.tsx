"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { signOutAdmin } from "../_lib/auth-actions";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAdmin();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isPending}
      className="text-foreground-1 hover:bg-brand-dark hover:text-foreground-1"
    >
      <LogOut className="size-4" />
      {isPending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
