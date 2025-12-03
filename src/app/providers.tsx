"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { env } from "@/env";
import { WalletAuthProvider } from "@/state/use-wallet-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";
import { WalletSignTransactionError } from "@solana/wallet-adapter-base";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const DynamicModalProvider = dynamic(() =>
  import("@solana/wallet-adapter-react-ui").then(
    (mod) => mod.WalletModalProvider,
  ),
);

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const endpoint = useMemo(() => env.NEXT_PUBLIC_RPC_URL, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={[]}
        autoConnect
        onError={(error) => {
          if (error instanceof WalletSignTransactionError) {
            console.log(error.name, error.message);
          }
        }}
      >
        <DynamicModalProvider>
          <WalletAuthProvider>
            <QueryClientProvider client={queryClient}>
              {children}
              {/*<ReactQueryDevtools initialIsOpen={false} />*/}
            </QueryClientProvider>
          </WalletAuthProvider>
        </DynamicModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
