"use client";

interface Guess {
  guess: number;
  result: "low" | "high" | "correct" | "pending";
  timestamp: number;
  ciphertext?: string;
}

interface GuessHistoryProps {
  guesses: Guess[];
}

export function GuessHistory({ guesses }: GuessHistoryProps) {
  const getResultIcon = (result: Guess["result"]) => {
    switch (result) {
      case "low":
        return "↑";
      case "high":
        return "↓";
      case "correct":
        return "✓";
      case "pending":
        return "⏳";
    }
  };

  const getResultText = (result: Guess["result"]) => {
    switch (result) {
      case "low":
        return "Too Low";
      case "high":
        return "Too High";
      case "correct":
        return "Correct!";
      case "pending":
        return "Processing...";
    }
  };

  const getResultColor = (result: Guess["result"]) => {
    switch (result) {
      case "low":
        return "text-primary-400 bg-primary-400/10 border-primary-400/20";
      case "high":
        return "text-accent-violet bg-accent-violet/10 border-accent-violet/20";
      case "correct":
        return "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20";
      case "pending":
        return "text-accent-gold bg-accent-gold/10 border-accent-gold/20";
    }
  };

  if (guesses.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-medium text-white mb-4">Guess History</h3>
        <div className="flex-1 flex items-center justify-center p-8 bg-dark-700/50 rounded-xl border border-white/5">
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-gray-400">No guesses yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Make your first encrypted guess!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-white mb-4">
        Guess History
        <span className="ml-2 text-sm text-gray-500">({guesses.length})</span>
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {[...guesses].reverse().map((g, i) => (
          <div
            key={`${g.timestamp}-${i}`}
            className={`p-4 rounded-xl border ${getResultColor(g.result)} transition-all duration-300 ${
              g.result === "pending" ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-mono font-bold">{g.guess}</span>
                <div>
                  <p className="font-medium">{getResultText(g.result)}</p>
                  <p className="text-xs opacity-60">
                    {new Date(g.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className="text-2xl">{getResultIcon(g.result)}</span>
            </div>
            
            {/* Show ciphertext for completed guesses */}
            {g.ciphertext && g.result !== "pending" && (
              <div className="mt-3 pt-3 border-t border-current/10">
                <p className="text-xs opacity-50 mb-1">Encrypted as:</p>
                <p className="text-xs font-mono opacity-70">{g.ciphertext}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Encryption flow indicator */}
      <div className="mt-4 p-3 bg-dark-700/50 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>🔐</span>
          <span>All guesses encrypted with FHE • Computed on-chain • Only you see results</span>
        </div>
      </div>
    </div>
  );
}
