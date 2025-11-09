"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { env } from "@/env";

const DynamicModalProvider = dynamic(() =>
  import("@solana/wallet-adapter-react-ui").then(
    (mod) => mod.WalletModalProvider,
  ),
);

export function Providers({ children }: { children: React.ReactNode }) {
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => env.NEXT_PUBLIC_RPC_URL, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <DynamicModalProvider>{children}</DynamicModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
