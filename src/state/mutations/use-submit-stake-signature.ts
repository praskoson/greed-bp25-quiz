import { useMutation } from "@tanstack/react-query";
import { RQKEY as STAKE_STATUS_RQKEY } from "../queries/stake-status-options";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  Lockup,
  PublicKey,
  StakeProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { retryWithBackoff } from "@/lib/utils";
import { env } from "@/env";
import { CUSTODIAN, VALIDATOR_VOTE_ACCOUNT } from "@/lib/solana";

export type SubmitStakeResponse = {
  success: true;
  sessionId: string;
  stakeConfirmed: boolean;
};

export const CUSTODIAN_PUBKEY = new PublicKey(CUSTODIAN);
const VALIDATOR_PUBKEY = new PublicKey(VALIDATOR_VOTE_ACCOUNT);

export function useSubmitStakeMutation() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  return useMutation({
    mutationFn: async ({
      solAmount,
      duration,
    }: {
      solAmount: number;
      duration: number;
    }) => {
      if (!sendTransaction || !publicKey || !signTransaction)
        throw Error("Wallet not connected");

      const { context, value } = await retryWithBackoff(() =>
        connection.getLatestBlockhashAndContext("confirmed"),
      );

      const signer = Keypair.generate();
      const lamports = solAmount * LAMPORTS_PER_SOL;

      const lockupTimestamp =
        Math.floor(new Date().getTime() / 1000) + duration * 24 * 60 * 60;
      let lockup: Lockup | undefined;
      if (env.NEXT_PUBLIC_ENABLE_LOCKUP) {
        lockup = new Lockup(lockupTimestamp, 0, CUSTODIAN_PUBKEY);
      }

      const instructions = [
        ...StakeProgram.createAccount({
          fromPubkey: publicKey,
          lamports,
          stakePubkey: signer.publicKey,
          authorized: {
            staker: publicKey,
            withdrawer: publicKey,
          },
          lockup,
        }).instructions,
        ...StakeProgram.delegate({
          stakePubkey: signer.publicKey,
          authorizedPubkey: publicKey,
          votePubkey: VALIDATOR_PUBKEY,
        }).instructions,
      ];

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: value.blockhash,
        instructions,
      }).compileToV0Message();
      const tx = new VersionedTransaction(messageV0);

      const signed = await signTransaction(tx);
      signed.sign([signer]);

      const simulationResult = await connection.simulateTransaction(signed, {
        sigVerify: false,
        commitment: "confirmed",
      });

      if (simulationResult.value.err) {
        throw Error(JSON.stringify(simulationResult.value.err));
      }

      const signature = await sendTransaction(signed, connection, {
        minContextSlot: context.slot,
        maxRetries: 0,
        preflightCommitment: "confirmed",
        skipPreflight: true,
      });

      const response = await fetch("/api/stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: solAmount, duration, signature }),
        credentials: "include",
      });

      if (!response.ok) {
        console.log(response);
        // const error = await response.json();
        throw new Error("Failed to submit stake");
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
