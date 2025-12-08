"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { retryStakeVerification } from "../_lib/actions";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

type Props = {
  sessionId: string;
};

export function RetryVerificationButton({ sessionId }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRetry = () => {
    startTransition(async () => {
      await retryStakeVerification(sessionId);
      router.refresh();
    });
  };

  return (
    <Button onClick={handleRetry} disabled={isPending} variant="outline">
      <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Retrying..." : "Retry Verification"}
    </Button>
  );
}
