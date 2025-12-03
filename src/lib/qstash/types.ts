import { z } from "zod";

export interface VerifyStakeJobPayload {
  signature: string;
  walletAddress: string;
  amount: number;
  duration: number;
  sessionId: string;
}

export interface VerifySecondaryStakeJobPayload {
  signature: string;
  walletAddress: string;
  amount: number;
  duration: number;
  stakeId: string;
}

export const DlqMessageBodySchema = z.object({
  walletAddress: z.string(),
  sessionId: z.string(),
  signature: z.string(),
  amount: z.number(),
  duration: z.number(),
});

export type DlqMessageBody = z.infer<typeof DlqMessageBodySchema>;
