"use client";

import { useState } from "react";

interface GuessInputProps {
  onGuess: (guess: number) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export function GuessInput({ onGuess, isLoading, isDisabled }: GuessInputProps) {
  const [guess, setGuess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(guess);
    if (num >= 1 && num <= 100) {
      onGuess(num);
      setGuess("");
    }
  };

  const isValidGuess = guess !== "" && parseInt(guess) >= 1 && parseInt(guess) <= 100;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Make Your Guess</h3>
      <p className="text-gray-400 text-sm">
        Enter a number between 1 and 100. Your guess will be encrypted before
        being sent to the blockchain.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={isLoading || isDisabled}
            placeholder="Enter 1-100"
            className="w-full px-6 py-4 text-2xl font-mono bg-dark-700 border border-white/10 rounded-xl text-white text-center placeholder-gray-500 focus:outline-none focus:border-accent-gold disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* Encryption indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🔐</span>
              <span>FHE</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValidGuess || isLoading || isDisabled}
          className="w-full py-4 bg-gradient-to-r from-accent-gold to-accent-emerald text-dark-900 font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              <span>Encrypting & Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Encrypted Guess</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Quick select buttons */}
      <div className="grid grid-cols-5 gap-2">
        {[10, 25, 50, 75, 90].map((num) => (
          <button
            key={num}
            onClick={() => setGuess(num.toString())}
            disabled={isLoading || isDisabled}
            className="py-2 px-4 bg-dark-600 hover:bg-dark-500 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

