"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { assignQuestionsToSession } from "../_lib/actions";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";

type Props = {
  sessionId: string;
};

export function AssignQuestionsButton({ sessionId }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAssign = () => {
    startTransition(async () => {
      await assignQuestionsToSession(sessionId);
      router.refresh();
    });
  };

  return (
    <Button onClick={handleAssign} disabled={isPending}>
      <Shuffle className="size-4" />
      {isPending ? "Assigning..." : "Assign Questions"}
    </Button>
  );
}
