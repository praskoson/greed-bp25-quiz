"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
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
  const [connectClickCount, setConnectClickCount] = useState(0);

  // Reset click counter when user connects
  useEffect(() => {
    if (connected) {
      setConnectClickCount(0);
    }
  }, [connected]);

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
      <div className="flex h-[122px] flex-col gap-2.5">
        <motion.button
          onClick={() => {
            setConnectClickCount((c) => c + 1);
            setVisible(true);
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          initial={false}
          aria-disabled={connecting || isSigningIn}
          className={clsx(
            "flex h-14 w-full items-center justify-center gap-[7px] rounded-full p-4 font-semibold",
            "text-foreground-muted bg-brand-dark text-sm/6 font-medium",
            "aria-disabled:pointer-events-none",
          )}
        >
          <span>Connect Wallet</span>
          <WalletIcon className="size-6" />
        </motion.button>
        {connectClickCount >= 6 && (
          <p className="text-foreground text-center text-xs text-balance">
            Trouble connecting? <br />
            Try force restarting your wallet&nbsp;app, or let us know so we can
            help.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-[122px] flex-col gap-2.5">
      <ConnectedWalletButton className="h-14" />
      <motion.button
        onClick={async () => await handleSignIn()}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        initial={false}
        aria-disabled={connecting || isSigningIn}
        className={clsx(
          "flex w-full items-center justify-center gap-2 rounded-full p-4 font-semibold",
          "bg-brand-dark",
          "text-foreground-muted text-sm/6 font-medium",
          "aria-disabled:pointer-events-none",
        )}
      >
        {isSigningIn ? "Signing in…" : "Sign Message"}
      </motion.button>
      {error && !isExpectedError(error) && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">{error}</p>
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
