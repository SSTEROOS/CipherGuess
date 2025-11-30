"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useFhevm } from "@/lib/fhevm-context";
import { GuessInput } from "./GuessInput";
import { GuessHistory } from "./GuessHistory";

interface GameBoardProps {
  selectedGameId: number | null;
  onSelectGame: (id: number | null) => void;
}

// Demo: Store secret numbers for games (accessible globally for CreateGame)
const demoSecretNumbers: Record<number, number> = {
  0: 42,
  1: 77,
  2: 23,
};

// Make it accessible globally
if (typeof window !== "undefined") {
  (window as any).__demoSecretNumbers = demoSecretNumbers;
}

export function GameBoard({ selectedGameId, onSelectGame }: GameBoardProps) {
  const [gameIdInput, setGameIdInput] = useState("");
  const [guessHistory, setGuessHistory] = useState<Array<{
    guess: number;
    result: "low" | "high" | "correct" | "pending";
    timestamp: number;
    ciphertext?: string;
  }>>([]);
  
  const { address } = useAccount();
  const { isInitialized, isLoading: fheLoading, encryptNumber } = useFhevm();
  
  const [isGuessing, setIsGuessing] = useState(false);
  const [encryptionStep, setEncryptionStep] = useState<string | null>(null);
  const [currentCiphertext, setCurrentCiphertext] = useState<string | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [walletAction, setWalletAction] = useState<string | null>(null);

  // Get the secret number for demo (check global and local storage)
  const getSecretNumber = () => {
    if (selectedGameId === null) return null;
    // Check global storage first (for games created via CreateGame)
    const globalSecrets = typeof window !== "undefined" 
      ? (window as any).__demoSecretNumbers 
      : null;
    if (globalSecrets && globalSecrets[selectedGameId]) {
      return globalSecrets[selectedGameId];
    }
    // Fall back to local preset
    if (demoSecretNumbers[selectedGameId]) {
      return demoSecretNumbers[selectedGameId];
    }
    // Generate random for unknown games
    const random = Math.floor(Math.random() * 100) + 1;
    if (typeof window !== "undefined") {
      (window as any).__demoSecretNumbers = (window as any).__demoSecretNumbers || {};
      (window as any).__demoSecretNumbers[selectedGameId] = random;
    }
    return random;
  };
  
  const secretNumber = getSecretNumber();

  const handleJoinGame = () => {
    const id = parseInt(gameIdInput);
    if (!isNaN(id) && id >= 0) {
      onSelectGame(id);
      setGuessHistory([]);
      setGameWon(false);
      setTotalGuesses(0);
      // Initialize secret if not exists
      if (!(id in demoSecretNumbers)) {
        demoSecretNumbers[id] = Math.floor(Math.random() * 100) + 1;
      }
    }
  };

  const handleMakeGuess = async (guess: number) => {
    if (!isInitialized || !address || selectedGameId === null || secretNumber === null) {
      return;
    }

    try {
      setIsGuessing(true);
      
      // Step 1: Show encryption in progress
      setEncryptionStep("encrypting");
      setCurrentCiphertext(null);
      
      // Add pending guess to history
      const pendingGuess = { 
        guess, 
        result: "pending" as const, 
        timestamp: Date.now() 
      };
      setGuessHistory(prev => [...prev, pendingGuess]);

      // Encrypt the guess with visual feedback
      const encrypted = await encryptNumber("0x1234567890abcdef", guess);
      if (!encrypted) {
        throw new Error("Failed to encrypt guess");
      }
      
      setCurrentCiphertext(encrypted.displayCiphertext);
      
      // Step 2: Wallet signature for encryption proof
      setEncryptionStep("wallet_sign");
      setWalletAction("sign_encrypt");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate wallet interaction
      setWalletAction(null);
      
      // Step 3: Submitting to blockchain
      setEncryptionStep("submitting");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Wallet confirmation for transaction
      setEncryptionStep("wallet_confirm");
      setWalletAction("confirm_tx");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate wallet interaction
      setWalletAction(null);
      
      // Step 5: Show on-chain FHE computation
      setEncryptionStep("computing");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 6: Wallet authorization for decryption
      setEncryptionStep("wallet_decrypt");
      setWalletAction("authorize_decrypt");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate wallet interaction
      setWalletAction(null);
      
      // Step 7: Show decryption
      setEncryptionStep("decrypting");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Determine result
      let result: "low" | "high" | "correct";
      if (guess < secretNumber) {
        result = "low";
      } else if (guess > secretNumber) {
        result = "high";
      } else {
        result = "correct";
        setGameWon(true);
      }

      // Update history with result
      setGuessHistory(prev => [
        ...prev.slice(0, -1),
        { 
          guess, 
          result, 
          timestamp: Date.now(),
          ciphertext: encrypted.displayCiphertext.slice(0, 18) + "..."
        }
      ]);
      
      setTotalGuesses(prev => prev + 1);
      setEncryptionStep(null);
      setCurrentCiphertext(null);
      
    } catch (error) {
      console.error("Failed to make guess:", error);
      setGuessHistory(prev => prev.slice(0, -1));
    } finally {
      setIsGuessing(false);
      setEncryptionStep(null);
      setWalletAction(null);
    }
  };

  if (selectedGameId === null) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Join a Game</h2>
        <p className="text-gray-400 mb-8">
          Enter a game ID to start guessing the secret number (1-100)
        </p>
        
        <div className="flex justify-center gap-4 max-w-md mx-auto">
          <input
            type="number"
            min="0"
            value={gameIdInput}
            onChange={(e) => setGameIdInput(e.target.value)}
            placeholder="Game ID (try 0, 1, or 2)"
            className="flex-1 px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold"
          />
          <button
            onClick={handleJoinGame}
            className="px-6 py-3 bg-accent-gold text-dark-900 font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
          >
            Join
          </button>
        </div>
        
        <p className="text-gray-500 text-sm mt-4">
          Demo games: 0, 1, 2 have pre-set secret numbers
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Game Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Game #{selectedGameId}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {gameWon ? (
              <span className="text-accent-gold">
                🎉 You won! The number was {secretNumber}
              </span>
            ) : (
              <>
                <span className="text-accent-emerald">Active</span>
                {" • "}
                {totalGuesses} guesses made
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            onSelectGame(null);
            setGuessHistory([]);
            setGameWon(false);
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Leave Game
        </button>
      </div>

      {/* Game Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Guess Input */}
        <div className="space-y-6">
          <GuessInput
            onGuess={handleMakeGuess}
            isLoading={isGuessing}
            isDisabled={gameWon || !isInitialized}
          />

          {/* FHE Status */}
          {fheLoading && (
            <div className="p-4 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
                <p className="text-accent-gold text-sm">
                  Loading FHE encryption module...
                </p>
              </div>
            </div>
          )}

          {/* Wallet Action Popup */}
          {walletAction && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-dark-800 border border-accent-gold/30 rounded-2xl p-6 max-w-sm mx-4 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-accent-gold/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🦊</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">MetaMask</p>
                    <p className="text-sm text-gray-400">Signature Request</p>
                  </div>
                </div>
                
                <div className="bg-dark-700 rounded-lg p-4 mb-4">
                  {walletAction === "sign_encrypt" && (
                    <>
                      <p className="text-sm text-gray-400 mb-2">Action:</p>
                      <p className="text-white font-medium">Sign Encryption Proof</p>
                      <p className="text-xs text-gray-500 mt-2">
                        This signature proves you own this encrypted input
                      </p>
                    </>
                  )}
                  {walletAction === "confirm_tx" && (
                    <>
                      <p className="text-sm text-gray-400 mb-2">Action:</p>
                      <p className="text-white font-medium">Confirm Transaction</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Submit encrypted guess to smart contract
                      </p>
                    </>
                  )}
                  {walletAction === "authorize_decrypt" && (
                    <>
                      <p className="text-sm text-gray-400 mb-2">Action:</p>
                      <p className="text-white font-medium">Authorize Decryption</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Sign to decrypt the comparison result
                      </p>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2 text-accent-gold">
                  <div className="w-4 h-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Waiting for confirmation...</span>
                </div>
              </div>
            </div>
          )}

          {/* Encryption Process Visualization */}
          {encryptionStep && !walletAction && (
            <div className="p-4 bg-dark-700 border border-accent-violet/30 rounded-lg space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <span className="text-accent-violet">🔐</span>
                FHE Process
              </h4>
              
              {/* Step indicators */}
              <div className="space-y-3">
                <StepIndicator 
                  active={encryptionStep === "encrypting"}
                  completed={["wallet_sign", "submitting", "wallet_confirm", "computing", "wallet_decrypt", "decrypting"].includes(encryptionStep)}
                  label="Client-side encryption"
                  description="Encrypting your guess with FHE public key"
                />
                <StepIndicator 
                  active={encryptionStep === "wallet_sign"}
                  completed={["submitting", "wallet_confirm", "computing", "wallet_decrypt", "decrypting"].includes(encryptionStep)}
                  label="🦊 Wallet signature"
                  description="Sign to prove ownership of encrypted input"
                  isWallet
                />
                <StepIndicator 
                  active={encryptionStep === "submitting"}
                  completed={["wallet_confirm", "computing", "wallet_decrypt", "decrypting"].includes(encryptionStep)}
                  label="Submitting to blockchain"
                  description="Sending encrypted data on-chain"
                />
                <StepIndicator 
                  active={encryptionStep === "wallet_confirm"}
                  completed={["computing", "wallet_decrypt", "decrypting"].includes(encryptionStep)}
                  label="🦊 Confirm transaction"
                  description="Approve the on-chain transaction"
                  isWallet
                />
                <StepIndicator 
                  active={encryptionStep === "computing"}
                  completed={["wallet_decrypt", "decrypting"].includes(encryptionStep)}
                  label="On-chain FHE computation"
                  description="Smart contract comparing encrypted values"
                />
                <StepIndicator 
                  active={encryptionStep === "wallet_decrypt"}
                  completed={["decrypting"].includes(encryptionStep)}
                  label="🦊 Authorize decryption"
                  description="Sign to decrypt the result"
                  isWallet
                />
                <StepIndicator 
                  active={encryptionStep === "decrypting"}
                  completed={false}
                  label="Decrypting result"
                  description="Revealing comparison result to you"
                />
              </div>

              {/* Ciphertext display */}
              {currentCiphertext && (
                <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Encrypted Guess (Ciphertext):</p>
                  <p className="text-xs font-mono text-accent-violet break-all">
                    {currentCiphertext}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Game Won Message */}
          {gameWon && (
            <div className="p-4 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
              <p className="text-accent-gold text-center">
                🎉 Congratulations! You found the number in {totalGuesses} guesses!
              </p>
            </div>
          )}
        </div>

        {/* Guess History */}
        <GuessHistory guesses={guessHistory} />
      </div>

      {/* Your Stats */}
      <div className="mt-8 pt-8 border-t border-white/5">
        <h3 className="text-lg font-medium text-white mb-4">Session Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-2xl font-bold text-accent-gold">
              {totalGuesses}
            </p>
            <p className="text-sm text-gray-400">Guesses Made</p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-2xl font-bold text-accent-emerald">
              {guessHistory.filter(g => g.result === "correct").length}
            </p>
            <p className="text-sm text-gray-400">Correct</p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-2xl font-bold text-primary-400">
              {guessHistory.filter(g => g.result === "low").length}
            </p>
            <p className="text-sm text-gray-400">Too Low</p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-2xl font-bold text-accent-violet">
              {guessHistory.filter(g => g.result === "high").length}
            </p>
            <p className="text-sm text-gray-400">Too High</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step indicator component
function StepIndicator({ 
  active, 
  completed, 
  label, 
  description,
  isWallet = false
}: { 
  active: boolean; 
  completed: boolean; 
  label: string; 
  description: string;
  isWallet?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 transition-opacity ${
      !active && !completed ? "opacity-40" : ""
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        completed 
          ? "bg-accent-emerald" 
          : active 
            ? isWallet ? "border-2 border-accent-gold bg-accent-gold/20" : "border-2 border-accent-violet" 
            : "border-2 border-gray-600"
      }`}>
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {active && (
          <div className={`w-2 h-2 rounded-full animate-pulse ${isWallet ? "bg-accent-gold" : "bg-accent-violet"}`} />
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${
          active 
            ? isWallet ? "text-accent-gold" : "text-white" 
            : completed ? "text-gray-300" : "text-gray-500"
        }`}>
          {label}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
