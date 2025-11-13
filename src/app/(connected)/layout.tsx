"use client";

import { useWalletAuth } from "@/state/use-wallet-auth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function ConnectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, signOut } = useWalletAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      void signOut();
      router.push("/");
    }
  }, [isAuthenticated, router, signOut]);

  return children;
}
