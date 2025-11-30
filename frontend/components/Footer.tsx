"use client";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold via-accent-emerald to-accent-violet flex items-center justify-center">
              <span className="text-sm">🔐</span>
            </div>
            <span className="text-gray-400">
              CipherGuess - FHE Number Guessing Game
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a
              href="https://docs.zama.ai/fhevm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              FHEVM Docs
            </a>
            <a
              href="https://github.com/zama-ai/fhevm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <span>Built for Zama Developer Program</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

