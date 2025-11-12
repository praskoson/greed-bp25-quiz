export interface VerifyStakeJobPayload {
  signature: string;
  walletAddress: string;
  amount: number;
  duration: number;
  sessionId: string;
}
