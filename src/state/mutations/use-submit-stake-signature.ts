import { useMutation } from "@tanstack/react-query";
import { RQKEY as STAKE_STATUS_RQKEY } from "../queries/stake-status-options";
import { useWallet } from "@solana/wallet-adapter-react";

export type SubmitStakeResponse = {
  success: true;
  sessionId: string;
  stakeConfirmed: boolean;
};

export function useSubmitStakeMutation() {
  const { publicKey } = useWallet();

  return useMutation({
    mutationFn: async ({
      amount,
      duration,
      txSignature,
    }: {
      amount: number;
      duration: number;
      txSignature: string;
    }) => {
      const response = await fetch("/api/stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, duration, txSignature }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit stake");
      }

      return response.json() as Promise<SubmitStakeResponse>;
    },
    onSuccess: (data, _args, _, { client }) => {
      // Immediately update cache to "processing"
      if (publicKey) {
        client.setQueryData(STAKE_STATUS_RQKEY(publicKey.toBase58()), {
          sessionId: data.sessionId,
          status: "processing",
        });
      }
    },
  });
}
