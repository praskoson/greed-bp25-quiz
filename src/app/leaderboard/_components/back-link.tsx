"use client";

import { Spinner } from "@/components/spinner";
import { useMiniRouter } from "@/state/mini-router";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BackLink() {
  const { signOut } = useWalletAuth();
  const { navigate } = useMiniRouter();
  const { push } = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <button
      onClick={async () => {
        setIsSigningOut(true);
        await signOut();
        navigate("sign-in");

        push("/");
      }}
      className="w-full bg-neutral rounded-full py-4 px-8 text-sm/[130%] text-white whitespace-pre"
    >
      {isSigningOut ? <Spinner className="size-3.5 inline" /> : "←"} Back to
      Home
    </button>
  );
}
