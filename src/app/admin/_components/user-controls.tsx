"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { resetUserQuizAnswers } from "../_lib/actions";
import { useRouter } from "next/navigation";

type Props = {
  sessionId: string;
  hasAnswers: boolean;
};

export function UserControls({ sessionId, hasAnswers }: Props) {
  const [isResetting, startResetTransition] = useTransition();
  const router = useRouter();

  const handleReset = () => {
    if (!confirm("Are you sure you want to reset this user's quiz answers? They will need to answer all questions again.")) {
      return;
    }
    startResetTransition(async () => {
      await resetUserQuizAnswers(sessionId);
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
      >
        {isResetting ? "Resetting..." : "Reset Answers"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleRemove}
      >
        Remove User
      </Button>
    </div>
  );
}
