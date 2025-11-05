"use client";

import { useWalletAuth } from "@/state/use-wallet-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";

export function AuthButton() {
  const { connected } = useWallet();
  const { isAuthenticated, isLoading, signIn, signOut, walletAddress } =
    useWalletAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      await signIn();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (err: any) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-300 rounded">
        Loading...
      </button>
    );
  }

  if (!connected) {
    return <WalletMultiButton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSigningIn ? "Signing In..." : "Sign In"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-600">
        Connected: {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
      </p>
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </button>
    </div>
  );
}
