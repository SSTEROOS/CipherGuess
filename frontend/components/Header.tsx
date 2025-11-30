"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useFhevm } from "@/lib/fhevm-context";

export function Header() {
  const { isConnected } = useAccount();
  const { isInitialized, isLoading } = useFhevm();

  return (
    <header className="border-b border-white/5">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-gold via-accent-emerald to-accent-violet flex items-center justify-center">
              <span className="text-xl">🔐</span>
            </div>
            <span className="text-xl font-bold">CipherGuess</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* FHE Status */}
            {isConnected && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isInitialized
                      ? "bg-accent-emerald"
                      : isLoading
                      ? "bg-accent-gold animate-pulse"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-gray-400">
                  {isInitialized
                    ? "FHE Ready"
                    : isLoading
                    ? "Initializing..."
                    : "FHE Error"}
                </span>
              </div>
            )}

            {/* Connect Button */}
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

