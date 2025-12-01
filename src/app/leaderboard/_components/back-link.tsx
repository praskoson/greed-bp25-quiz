"use client";

import { useMiniRouter } from "@/state/mini-router";
import { useWalletAuth } from "@/state/use-wallet-auth";
import Link from "next/link";

export function BackLink() {
  const { signOut } = useWalletAuth();
  const { navigate } = useMiniRouter();
  return (
    <Link
      onClick={async () => {
        await signOut();
        navigate("sign-in");
      }}
      href="/"
      className="text-sm text-[#A37878] hover:text-neutral"
    >
      ← Back to Home
    </Link>
  );
}
