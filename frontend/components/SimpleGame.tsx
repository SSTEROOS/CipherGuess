"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient, useWalletClient } from "wagmi";
import { useFhevm } from "@/lib/fhevm-context";
import { NUMBER_COMPARE_ADDRESS, NUMBER_COMPARE_ABI, toHex, RESULT_LOWER, RESULT_EQUAL, RESULT_HIGHER } from "@/lib/contract";

type GameStep = "idle" | "encrypting" | "signing" | "confirming" | "decrypt_signing" | "decrypting" | "done";

interface CompareResult {
  systemNumber: number;
  userNumber: number;
  result: "lower" | "equal" | "higher";
  compareId: number;
}

export function SimpleGame() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isInitialized, isLoading: fheLoading, error: fheError, encryptNumber, instance } = useFhevm();
  
  const [userNumber, setUserNumber] = useState("");
  const [systemNumber, setSystemNumber] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<GameStep>("idle");
  const [txError, setTxError] = useState<string | null>(null);
  const [history, setHistory] = useState<CompareResult[]>([]);
  const [pendingUserNumber, setPendingUserNumber] = useState<number | null>(null);

  // Contract write
  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Read compare counter
  const { data: compareCounter, refetch: refetchCounter } = useReadContract({
    address: NUMBER_COMPARE_ADDRESS as `0x${string}`,
    abi: NUMBER_COMPARE_ABI,
    functionName: "compareCounter",
  });

  // Handle transaction success - decrypt result with user signature
  useEffect(() => {
    const decryptResult = async () => {
      if (!txSuccess || currentStep !== "confirming" || !instance || systemNumber === null || !publicClient || !walletClient || !address) return;
      
      try {
        // Step 4: Request signature for decryption
        setCurrentStep("decrypt_signing");
        
        // Wait for transaction to be indexed
        await new Promise(r => setTimeout(r, 3000));
        
        // Get the compare ID (counter - 1)
        const { data: latestCounter } = await refetchCounter();
        const compareId = latestCounter ? Number(latestCounter) - 1 : 0;
        
        // Read the encrypted result handle from contract
        const resultHandle = await publicClient.readContract({
          address: NUMBER_COMPARE_ADDRESS as `0x${string}`,
          abi: NUMBER_COMPARE_ABI,
          functionName: "getResult",
          args: [BigInt(compareId)],
        });
        
        if (!resultHandle) {
          throw new Error("Failed to get encrypted result");
        }

        // Convert handle to hex string
        const handleHex = typeof resultHandle === 'bigint' 
          ? `0x${resultHandle.toString(16).padStart(64, '0')}`
          : String(resultHandle);

        const keypair = instance.generateKeypair();

        const startTimestamp = Math.floor(Date.now() / 1000);
        const durationDays = 1;
        
        const eip712 = instance.createEIP712(
          keypair.publicKey,
          [NUMBER_COMPARE_ADDRESS],
          startTimestamp,
          durationDays
        );

        const signature = await walletClient.signTypedData({
          domain: eip712.domain,
          types: eip712.types,
          primaryType: eip712.primaryType,
          message: eip712.message,
        });

        setCurrentStep("decrypting");

        const decryptedResults = await instance.userDecrypt(
          [{ handle: handleHex, contractAddress: NUMBER_COMPARE_ADDRESS }],
          keypair.privateKey,
          keypair.publicKey,
          signature,
          [NUMBER_COMPARE_ADDRESS],
          address,
          startTimestamp,
          durationDays
        );
        
        const resultValue = Object.values(decryptedResults)[0];
        
        let resultStr: "lower" | "equal" | "higher";
        if (Number(resultValue) === RESULT_LOWER) {
          resultStr = "lower";
        } else if (Number(resultValue) === RESULT_EQUAL) {
          resultStr = "equal";
        } else {
          resultStr = "higher";
        }
        
        setHistory(prev => [...prev, {
          systemNumber: systemNumber,
          userNumber: pendingUserNumber || parseInt(userNumber),
          result: resultStr,
          compareId
        }]);
        
        setCurrentStep("done");
        setSystemNumber(null);
        setPendingUserNumber(null);
        setUserNumber("");
        
        // Reset after a delay
        setTimeout(() => setCurrentStep("idle"), 2000);
        
      } catch (err: any) {
        setTxError(err.message || "Decryption failed");
        setCurrentStep("idle");
      }
    };

    decryptResult();
  }, [txSuccess, currentStep, instance, systemNumber, publicClient, walletClient, address]);

  // Start comparison
  const handleCompare = async () => {
    if (!isInitialized || !address) return;
    
    const userNum = parseInt(userNumber);
    if (isNaN(userNum) || userNum < 1 || userNum > 100) {
      setTxError("Please enter a number between 1-100");
      return;
    }

    try {
      setTxError(null);
      setPendingUserNumber(userNum);
      
      const sysNum = Math.floor(Math.random() * 100) + 1;
      setSystemNumber(sysNum);

      setCurrentStep("encrypting");
      
      const [encryptedSystem, encryptedUser] = await Promise.all([
        encryptNumber(NUMBER_COMPARE_ADDRESS, sysNum),
        encryptNumber(NUMBER_COMPARE_ADDRESS, userNum)
      ]);
      
      if (!encryptedSystem || !encryptedUser) {
        throw new Error("Encryption failed");
      }

      setCurrentStep("signing");
      
      await writeContractAsync({
        address: NUMBER_COMPARE_ADDRESS as `0x${string}`,
        abi: NUMBER_COMPARE_ABI,
        functionName: "compareNumbers",
        args: [
          toHex(encryptedSystem.handle),
          toHex(encryptedUser.handle),
          toHex(encryptedSystem.proof),
          toHex(encryptedUser.proof)
        ],
      });

      setCurrentStep("confirming");
      
    } catch (err: any) {
      setTxError(err.message || "Operation failed");
      setCurrentStep("idle");
      setSystemNumber(null);
      setPendingUserNumber(null);
    }
  };

  // Loading state
  if (fheLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-xl text-white mb-2">Initializing FHE...</p>
        <p className="text-gray-400">Loading encryption module</p>
      </div>
    );
  }

  // FHE Error state
  if (fheError) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-6xl mb-6">⚠️</div>
        <p className="text-xl text-white mb-2">FHE Initialization Failed</p>
        <p className="text-red-400 mb-4">{fheError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-accent-gold text-dark-900 font-medium rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">FHE Number Compare</h2>
        <p className="text-gray-400 text-sm">
          Enter your number, system generates a random number<br/>
          Both are FHE encrypted and compared on-chain
        </p>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Enter your number (1-100)</label>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            max="100"
            value={userNumber}
            onChange={(e) => setUserNumber(e.target.value)}
            disabled={currentStep !== "idle"}
            placeholder="1-100"
            className="flex-1 px-4 py-4 text-2xl font-mono bg-dark-700 border border-white/10 rounded-xl text-white text-center placeholder-gray-500 focus:outline-none focus:border-accent-gold disabled:opacity-50"
            onKeyDown={(e) => e.key === "Enter" && currentStep === "idle" && handleCompare()}
          />
          <button
            onClick={handleCompare}
            disabled={currentStep !== "idle" || !userNumber || !isInitialized}
            className="px-6 py-4 bg-gradient-to-r from-accent-emerald to-accent-gold text-dark-900 font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep !== "idle" ? "..." : "Compare"}
          </button>
        </div>
        
        {txError && (
          <p className="text-red-400 text-sm text-center mt-2">{txError}</p>
        )}
      </div>

      {/* Process Steps */}
      {currentStep !== "idle" && currentStep !== "done" && (
        <div className="mb-6 p-4 bg-dark-700/50 rounded-xl border border-accent-violet/20">
          <div className="space-y-3">
            <StepItem 
              label="🔐 FHE Encrypt Both Numbers" 
              status={currentStep === "encrypting" ? "active" : "done"} 
            />
            <StepItem 
              label="🦊 Wallet Sign #1: Submit Transaction" 
              status={currentStep === "signing" ? "active" : currentStep === "encrypting" ? "pending" : "done"} 
            />
            <StepItem 
              label="⛓️ On-chain FHE Computation" 
              status={currentStep === "confirming" ? "active" : ["encrypting", "signing"].includes(currentStep) ? "pending" : "done"} 
            />
            <StepItem 
              label="🦊 Wallet Sign #2: Authorize Decryption" 
              status={currentStep === "decrypt_signing" ? "active" : ["encrypting", "signing", "confirming"].includes(currentStep) ? "pending" : "done"} 
            />
            <StepItem 
              label="🔓 FHE User Decrypt (userDecrypt)" 
              status={currentStep === "decrypting" ? "active" : "pending"} 
            />
          </div>
          
          {systemNumber !== null && (
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-gray-500">
                System Random: <span className="font-mono text-accent-gold">{systemNumber}</span> (FHE Encrypted)
              </p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">History (Real FHE Decrypted Results)</p>
          {[...history].reverse().map((h, i) => (
            <div
              key={history.length - 1 - i}
              className={`p-4 rounded-xl border ${
                h.result === "equal"
                  ? "bg-accent-emerald/10 border-accent-emerald/30"
                  : h.result === "lower"
                    ? "bg-primary-400/10 border-primary-400/30"
                    : "bg-accent-violet/10 border-accent-violet/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Your Number</p>
                    <p className="text-xl font-mono font-bold text-white">{h.userNumber}</p>
                  </div>
                  <div className="text-2xl">
                    {h.result === "equal" ? "=" : h.result === "lower" ? "<" : ">"}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">System Number</p>
                    <p className="text-xl font-mono font-bold text-white">{h.systemNumber}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  h.result === "equal"
                    ? "bg-accent-emerald/20 text-accent-emerald"
                    : h.result === "lower"
                      ? "bg-primary-400/20 text-primary-400"
                      : "bg-accent-violet/20 text-accent-violet"
                }`}>
                  {h.result === "equal" ? "✓ Equal" : h.result === "lower" ? "↓ Lower" : "↑ Higher"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contract info */}
      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-gray-600">
          Contract: {NUMBER_COMPARE_ADDRESS.slice(0, 10)}...{NUMBER_COMPARE_ADDRESS.slice(-8)}
        </p>
        <p className="text-xs text-accent-emerald mt-1">
          ✓ Encryption / On-chain Compute / Signed Decrypt - All Real FHE
        </p>
      </div>
    </div>
  );
}

// Step indicator component
function StepItem({ label, status }: { label: string; status: "pending" | "active" | "done" }) {
  return (
    <div className={`flex items-center gap-3 ${
      status === "active" ? "text-accent-gold" : status === "done" ? "text-accent-emerald" : "text-gray-500"
    }`}>
      {status === "active" ? (
        <div className="w-4 h-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      ) : status === "done" ? (
        <span className="text-accent-emerald">✓</span>
      ) : (
        <span>○</span>
      )}
      <span className="text-sm">{label}</span>
    </div>
  );
}
