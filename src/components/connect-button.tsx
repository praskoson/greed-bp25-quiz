"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { useMiniRouter } from "@/state/mini-router";
import clsx from "clsx";
import { WalletIcon } from "./svg/wallet-icon";
import { ConnectedWalletButton } from "./connected-wallet-button";

export function ConnectButton() {
  const { navigate } = useMiniRouter();
  const { setVisible } = useWalletModal();
  const { connecting, disconnect, connected } = useWallet();
  const { signIn } = useWalletAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = useCallback(async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      const res = await signIn();
      console.log(res);
      switch (res.status) {
        case "failed":
          throw Error("Failed to process stake");
        case "processing":
          navigate("polling");
          break;
        case "success":
          navigate("quiz");
          break;
        default:
          navigate("stake");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      await disconnect();
    } finally {
      setIsSigningIn(false);
    }
  }, [signIn, disconnect, navigate]);

  if (!connected) {
    return (
      <div className="h-[122px] flex flex-col gap-2.5">
        <motion.button
          onClick={async () => {
            setVisible(true);
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          initial={false}
          aria-disabled={connecting || isSigningIn}
          className={clsx(
            "h-14 flex items-center justify-center gap-[7px] w-full p-4 font-semibold rounded-full",
            "font-medium text-sm/6 text-foreground-muted bg-brand-dark",
            "aria-disabled:pointer-events-none",
          )}
        >
          <span>Connect Wallet</span>
          <WalletIcon className="size-6" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-[122px] flex flex-col gap-2.5">
      <ConnectedWalletButton className="h-14" />
      <motion.button
        onClick={async () => await handleSignIn()}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        initial={false}
        aria-disabled={connecting || isSigningIn}
        className={clsx(
          "flex items-center justify-center gap-2 w-full p-4 font-semibold rounded-full",
          "bg-brand-dark",
          "font-medium text-sm/6 text-foreground-muted",
          "aria-disabled:pointer-events-none",
        )}
      >
        {isSigningIn ? "Signing in…" : "Sign Message"}
      </motion.button>
      {error && !isExpectedError(error) && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-900 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

function isExpectedError(error: string): boolean {
  const expected =
    error === "User rejected the request." || error === "Failed to sign in";

  return expected;
}
