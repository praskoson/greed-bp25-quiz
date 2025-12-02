"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { useMiniRouter } from "@/state/mini-router";

export function ConnectButton() {
  const { navigate } = useMiniRouter();
  const { setVisible } = useWalletModal();
  const { connecting, disconnect, connected } = useWallet();
  const { signIn, isAuthenticated } = useWalletAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isClicked = connecting || isSigningIn || isAuthenticated;

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

  const buttonText = useCallback(() => {
    if (!connected) {
      return "Connect your wallet to start";
    }
    if (connecting) {
      return "Connecting...";
    }

    if (!isAuthenticated) {
      return "Sign In";
    } else {
      return "Signing in...";
    }
  }, [connected, connecting, isAuthenticated]);

  return (
    <>
      <motion.button
        onClick={async () => {
          if (!connected) {
            setVisible(true);
          } else {
            await handleSignIn();
          }
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        initial={false}
        animate={{
          scale: isClicked ? 0.96 : 1,
          backgroundColor: isClicked ? "var(--color-surface-2)" : "#470000",
          color: isClicked ? "#470000" : "#fff",
        }}
        aria-disabled={connecting || isSigningIn}
        className="font-lg p-4 font-semibold rounded-full aria-disabled:pointer-events-none"
      >
        {buttonText()}
      </motion.button>
      {error && !isExpectedError(error) && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-900 font-medium">{error}</p>
        </div>
      )}
    </>
  );
}

function isExpectedError(error: string): boolean {
  const expected =
    error === "User rejected the request." || error === "Failed to sign in";

  return expected;
}
