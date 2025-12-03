import { getBase58Codec } from "@solana/codecs";
import * as z from "zod";
import {
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { env } from "@/env";

const base58Codec = getBase58Codec();
const base58Alphabet =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

export const base58ZodValidator = z.stringFormat("base58", (val) => {
  if (!base58Alphabet.test(val)) return false;
  return base58Codec.getSizeFromValue(val) === 64;
});

export type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

let client: Client | undefined;
export function createClient(): Client {
  if (!client) {
    client = {
      rpc: createSolanaRpc(env.NEXT_PUBLIC_RPC_URL + ":8899"),
      rpcSubscriptions: createSolanaRpcSubscriptions(
        env.NEXT_PUBLIC_RPC_URL.replace("https", "wss") + ":8900",
      ),
    };
  }
  return client;
}

export const CUSTODIAN = "EXnRxsXiRbTe1s1S4Gh73AdZP8Vdp6rg2VV5daTPcx1u";
export const VALIDATOR_VOTE_ACCOUNT =
  "GREEDkpTvpKzcGvBu9qd36yk6BfjTWPShB67gLWuixMv";
