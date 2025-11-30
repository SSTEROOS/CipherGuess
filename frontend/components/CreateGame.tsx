"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useFhevm } from "@/lib/fhevm-context";

interface CreateGameProps {
  onGameCreated: (gameId: number) => void;
}

// Demo: Store created games
let nextGameId = 3; // Start from 3 since 0, 1, 2 are preset
const demoGames: Record<number, number> = {};

export function CreateGame({ onGameCreated }: CreateGameProps) {
  const [secretNumber, setSecretNumber] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<number | null>(null);
  const [encryptionStep, setEncryptionStep] = useState<string | null>(null);
  const [ciphertext, setCiphertext] = useState<string | null>(null);
  const [walletAction, setWalletAction] = useState<string | null>(null);

  const { address } = useAccount();
  const { isInitialized, encryptNumber } = useFhevm();

  const handleCreateGame = async () => {
    if (!isInitialized || !address) return;

    const num = parseInt(secretNumber);
    if (num < 1 || num > 100) return;

    try {
      setIsCreating(true);

      // Step 1: Encrypting
      setEncryptionStep("encrypting");
      const encrypted = await encryptNumber("0x1234567890abcdef", num);
      if (!encrypted) {
        throw new Error("Failed to encrypt secret number");
      }
      setCiphertext(encrypted.displayCiphertext);

      // Step 2: Wallet signature for encryption proof
      setEncryptionStep("wallet_sign");
      setWalletAction("sign_encrypt");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setWalletAction(null);

      // Step 3: Submitting to blockchain
      setEncryptionStep("submitting");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Wallet confirmation for transaction
      setEncryptionStep("wallet_confirm");
      setWalletAction("confirm_tx");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setWalletAction(null);

      // Step 5: Confirming
      setEncryptionStep("confirming");
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create the game
      const gameId = nextGameId++;
      demoGames[gameId] = num;
      
      // Export to global for GameBoard to use
      (window as any).__demoSecretNumbers = (window as any).__demoSecretNumbers || {};
      (window as any).__demoSecretNumbers[gameId] = num;

      setCreatedGameId(gameId);
      setEncryptionStep(null);
    } catch (error) {
      console.error("Failed to create game:", error);
      setEncryptionStep(null);
    } finally {
      setIsCreating(false);
      setWalletAction(null);
    }
  };

  const isValidSecret = secretNumber !== "" && parseInt(secretNumber) >= 1 && parseInt(secretNumber) <= 100;
  const isLoading = isCreating;

  if (createdGameId !== null) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-4">Game Created!</h2>
        <p className="text-gray-400 mb-8">
          Your secret number has been encrypted and stored on-chain.
          Share the game ID with friends to let them play!
        </p>
        
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-4 bg-dark-700 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">Game ID</p>
            <p className="text-4xl font-mono font-bold text-accent-gold">
              #{createdGameId}
            </p>
          </div>

          {ciphertext && (
            <div className="p-4 bg-dark-700 rounded-xl text-left">
              <p className="text-sm text-gray-400 mb-2">Encrypted Secret (on-chain)</p>
              <p className="text-xs font-mono text-accent-violet break-all">
                {ciphertext}
              </p>
            </div>
          )}
          
          <button
            onClick={() => onGameCreated(createdGameId)}
            className="w-full py-3 bg-accent-emerald text-dark-900 font-medium rounded-lg hover:bg-accent-emerald/90 transition-colors"
          >
            Play This Game
          </button>
          
          <button
            onClick={() => {
              setCreatedGameId(null);
              setSecretNumber("");
              setCiphertext(null);
            }}
            className="w-full py-3 bg-dark-600 text-white font-medium rounded-lg hover:bg-dark-500 transition-colors"
          >
            Create Another Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create a New Game</h2>
        <p className="text-gray-400">
          Choose a secret number between 1 and 100. It will be encrypted
          and stored on the blockchain - only the contract can use it for
          comparisons!
        </p>
      </div>

      <div className="space-y-6">
        {/* Secret Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Secret Number
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={secretNumber}
            onChange={(e) => setSecretNumber(e.target.value)}
            disabled={isLoading}
            placeholder="Enter 1-100"
            className="w-full px-6 py-4 text-3xl font-mono bg-dark-700 border border-white/10 rounded-xl text-white text-center placeholder-gray-500 focus:outline-none focus:border-accent-emerald disabled:opacity-50"
          />
        </div>

        {/* Security Note */}
        <div className="p-4 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <div>
              <p className="text-accent-emerald font-medium mb-1">
                End-to-End Encrypted
              </p>
              <p className="text-sm text-gray-400">
                Your secret number will be encrypted using FHE before leaving
                your browser. Even the blockchain cannot see the actual value -
                it can only perform encrypted comparisons.
              </p>
            </div>
          </div>
        </div>

        {/* FHE Status */}
        {!isInitialized && (
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
                      This signature proves you encrypted this secret number
                    </p>
                  </>
                )}
                {walletAction === "confirm_tx" && (
                  <>
                    <p className="text-sm text-gray-400 mb-2">Action:</p>
                    <p className="text-white font-medium">Confirm Transaction</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Create game with encrypted secret on blockchain
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

        {/* Encryption Process */}
        {encryptionStep && !walletAction && (
          <div className="p-4 bg-dark-700 border border-accent-violet/30 rounded-xl space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <span className="text-accent-violet">🔐</span>
              Creating Encrypted Game
            </h4>
            
            <div className="space-y-3">
              <StepIndicator 
                active={encryptionStep === "encrypting"}
                completed={["wallet_sign", "submitting", "wallet_confirm", "confirming"].includes(encryptionStep)}
                label="Encrypting secret number"
                description="Using FHE to encrypt your number"
              />
              <StepIndicator 
                active={encryptionStep === "wallet_sign"}
                completed={["submitting", "wallet_confirm", "confirming"].includes(encryptionStep)}
                label="🦊 Wallet signature"
                description="Sign to prove encryption ownership"
                isWallet
              />
              <StepIndicator 
                active={encryptionStep === "submitting"}
                completed={["wallet_confirm", "confirming"].includes(encryptionStep)}
                label="Submitting to blockchain"
                description="Storing encrypted data on-chain"
              />
              <StepIndicator 
                active={encryptionStep === "wallet_confirm"}
                completed={["confirming"].includes(encryptionStep)}
                label="🦊 Confirm transaction"
                description="Approve the on-chain transaction"
                isWallet
              />
              <StepIndicator 
                active={encryptionStep === "confirming"}
                completed={false}
                label="Confirming transaction"
                description="Waiting for block confirmation"
              />
            </div>

            {ciphertext && (
              <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Encrypted Secret:</p>
                <p className="text-xs font-mono text-accent-violet break-all">
                  {ciphertext}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreateGame}
          disabled={!isValidSecret || !isInitialized || isLoading}
          className="w-full py-4 bg-gradient-to-r from-accent-emerald to-accent-gold text-dark-900 font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create Encrypted Game</span>
              <span>🎮</span>
            </>
          )}
        </button>
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
