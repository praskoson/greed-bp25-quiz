import { retryWithBackoff } from "@/lib/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  StakeProgram,
  Transaction,
} from "@solana/web3.js";
import { useCallback, useState } from "react";

type SendStakeTransactionReturnType = Promise<
  | { status: "success"; signature: string }
  | { status: "error"; message: string }
>;

export function useSubmitStake() {
  const { connection } = useConnection();

  const { publicKey, sendTransaction } = useWallet();
  const [isConfirming, setIsConfirming] = useState(false);

  const sendStakeTransaction = useCallback(
    async (sol: number, days: number): SendStakeTransactionReturnType => {
      if (!sendTransaction || !publicKey) throw Error("Wallet not connected");

      try {
        if (!isConfirming) {
          setIsConfirming(true);
        }
        const { context, value } = await retryWithBackoff(() =>
          connection.getLatestBlockhashAndContext("confirmed"),
        );

        const tx = new Transaction();
        const signer = Keypair.generate();

        // const lockupTimestamp =
        //   Math.floor(new Date().getTime() / 1000) + days * 24 * 60 * 60;
        // // const lockup = new Lockup(lockupTimestamp, 0, publicKey);
        const stakeAmount = sol * LAMPORTS_PER_SOL;

        tx.add(
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1e6 }),
          StakeProgram.createAccount({
            fromPubkey: publicKey,
            lamports: stakeAmount,
            stakePubkey: signer.publicKey,
            authorized: {
              staker: publicKey,
              withdrawer: publicKey,
            },
            // lockup,
          }),
        );

        tx.feePayer = publicKey;
        tx.recentBlockhash = value.blockhash;
        tx.partialSign(signer);

        const signature = await sendTransaction(tx, connection, {
          minContextSlot: context.slot,
          maxRetries: 0,
          preflightCommitment: "confirmed",
          skipPreflight: true,
        });

        const result = await connection.confirmTransaction(
          {
            signature,
            blockhash: value.blockhash,
            lastValidBlockHeight: value.lastValidBlockHeight,
          },
          "confirmed",
        );

        if (result.value.err) throw Error(JSON.stringify(result.value.err));

        return { status: "success", signature };
      } catch (error: any) {
        return {
          status: "error",
          message:
            typeof error === "object" ? JSON.stringify(error) : error.message,
        };
      } finally {
        setIsConfirming(false);
      }
    },
    [connection, publicKey, sendTransaction, isConfirming],
  );

  return {
    sendStakeTransaction,
    isConfirming,
  };
}
