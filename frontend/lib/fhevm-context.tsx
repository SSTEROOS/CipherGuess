"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";

// Ensure global.fetch is set BEFORE anything else
if (typeof window !== "undefined") {
  const g = window as any;
  if (!g.global) g.global = g;
  if (typeof g.global.fetch !== "function") {
    g.global.fetch = fetch.bind(window);
  }
}

interface FhevmContextType {
  instance: any;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  encryptNumber: (
    contractAddress: string,
    number: number
  ) => Promise<{ handle: Uint8Array; proof: Uint8Array } | null>;
  generateKeypair: () => { publicKey: string; privateKey: string } | null;
  createEIP712: (publicKey: string, contractAddresses: string[]) => any;
}

const FhevmContext = createContext<FhevmContextType>({
  instance: null,
  isInitialized: false,
  isLoading: true,
  error: null,
  encryptNumber: async () => null,
  generateKeypair: () => null,
  createEIP712: () => null,
});

export function useFhevm() {
  return useContext(FhevmContext);
}

export function FhevmProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initAttempted = useRef(false);

  const { address, isConnected } = useAccount();

  // Initialize FHEVM SDK
  useEffect(() => {
    const initFhevm = async () => {
      // Only run in browser
      if (typeof window === "undefined") {
        return;
      }

      // Only init once when connected
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      // Skip if already initialized or already attempted
      if (isInitialized || initAttempted.current) {
        return;
      }

      initAttempted.current = true;

      try {
        setIsLoading(true);
        setError(null);

        // Re-ensure polyfill
        const g = window as any;
        if (!g.global) g.global = g;
        if (typeof g.global.fetch !== "function") {
          g.global.fetch = fetch.bind(window);
        }

        console.log("Loading FHEVM SDK v0.3.0...");
        
        // Import the SDK
        const { initSDK, createInstance, SepoliaConfig } = await import("@zama-fhe/relayer-sdk/web");

        // Initialize WASM first
        console.log("Initializing FHE WASM...");
        try {
          await initSDK();
          console.log("✅ FHE WASM initialized");
        } catch (wasmError: any) {
          if (!wasmError.message?.includes("already")) {
            console.warn("WASM init warning:", wasmError);
          }
        }

        // Use SepoliaConfig directly as per official docs
        console.log("Creating FHE instance with SepoliaConfig...");
        const fhevmInstance = await createInstance(SepoliaConfig);
        console.log("✅ FHE instance created successfully");

        setInstance(fhevmInstance);
        setIsInitialized(true);
        setError(null);
      } catch (err: any) {
        console.error("Failed to initialize FHEVM:", err);
        setError(err.message || "Failed to initialize FHE");
        setInstance(null);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initFhevm();
  }, [isConnected, address, isInitialized]);

  // Encrypt a number for contract interaction
  const encryptNumber = useCallback(
    async (
      contractAddress: string,
      number: number
    ): Promise<{ handle: Uint8Array; proof: Uint8Array } | null> => {
      if (!instance || !address) {
        console.error("FHEVM not initialized or wallet not connected");
        return null;
      }

      try {
        console.log(`Encrypting number ${number} for contract ${contractAddress}...`);
        const input = instance.createEncryptedInput(contractAddress, address);
        input.add8(number);
        const encrypted = await input.encrypt();
        console.log("✅ Encryption complete");

        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
        };
      } catch (err) {
        console.error("Encryption failed:", err);
        throw err;
      }
    },
    [instance, address]
  );

  // Generate keypair for decryption
  const generateKeypair = useCallback(() => {
    if (!instance) {
      console.error("FHEVM not initialized");
      return null;
    }
    return instance.generateKeypair();
  }, [instance]);

  // Create EIP712 for decryption signature
  const createEIP712 = useCallback(
    (publicKey: string, contractAddresses: string[]) => {
      if (!instance) {
        console.error("FHEVM not initialized");
        return null;
      }
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 1;
      return instance.createEIP712(publicKey, contractAddresses, startTimestamp, durationDays);
    },
    [instance]
  );

  return (
    <FhevmContext.Provider
      value={{
        instance,
        isInitialized,
        isLoading,
        error,
        encryptNumber,
        generateKeypair,
        createEIP712,
      }}
    >
      {children}
    </FhevmContext.Provider>
  );
}
