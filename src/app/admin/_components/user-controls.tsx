"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { resetUserQuizAnswers, toggleShadowBan } from "../_lib/actions";
import { useRouter } from "next/navigation";
import { RotateCcw, Ban, Trash2 } from "lucide-react";

type Props = {
  sessionId: string;
  hasAnswers: boolean;
  isShadowBanned: boolean;
};

export function UserControls({ sessionId, hasAnswers, isShadowBanned }: Props) {
  const [isResetting, startResetTransition] = useTransition();
  const [isTogglingBan, startBanTransition] = useTransition();
  const router = useRouter();

  const handleReset = () => {
    if (
      !confirm(
        "Are you sure you want to reset this user's quiz answers? They will need to answer all questions again.",
      )
    ) {
      return;
    }
    startResetTransition(async () => {
      await resetUserQuizAnswers(sessionId);
      router.refresh();
    });
  };

  const handleToggleShadowBan = () => {
    const action = isShadowBanned ? "unban" : "shadow ban";
    if (
      !confirm(
        `Are you sure you want to ${action} this user? ${action === "shadow ban" ? "They will be able to solve the quiz, but will not be visible on the leaderboard." : ""}`,
      )
    ) {
      return;
    }
    startBanTransition(async () => {
      await toggleShadowBan(sessionId);
      router.refresh();
    });
  };

  const handleRemove = () => {
    // TODO: Implement remove action
    alert("Remove functionality not implemented yet");
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        disabled={isResetting || !hasAnswers}
        className="text-foreground"
      >
        <RotateCcw className="size-4" />
        {isResetting ? "Resetting..." : "Reset Answers"}
      </Button>
      <Button
        size="sm"
        onClick={handleToggleShadowBan}
        disabled={isTogglingBan}
        className={
          isShadowBanned
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-amber-500 hover:bg-amber-600 text-white"
        }
      >
        <Ban className="size-4" />
        {isTogglingBan
          ? "Updating..."
          : isShadowBanned
            ? "Unban"
            : "Shadow Ban"}
      </Button>
      <Button variant="destructive" size="sm" onClick={handleRemove}>
        <Trash2 className="size-4" />
        Remove
      </Button>
    </div>
  );
}
