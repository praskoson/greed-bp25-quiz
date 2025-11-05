"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const DynamicModalProvider = dynamic(() =>
  import("@solana/wallet-adapter-react-ui").then(
    (mod) => mod.WalletModalProvider,
  ),
);

export function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <DynamicModalProvider>{children}</DynamicModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
