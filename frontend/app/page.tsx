"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimpleGame } from "@/components/SimpleGame";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-violet/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-emerald/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-accent-gold/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {!isConnected ? (
          <div className="py-8 md:py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                <span className="text-sm text-gray-400">Powered by Zama FHEVM</span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Cipher
                </span>
                <span className="bg-gradient-to-r from-accent-gold via-accent-emerald to-accent-violet bg-clip-text text-transparent">
                  Guess
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed px-4">
                The first <span className="text-white font-medium">fully homomorphic encryption</span> powered 
                number comparison game on Ethereum
              </p>
              
              <p className="text-gray-500 mb-10 max-w-xl mx-auto px-4">
                Your number stays encrypted. The blockchain computes on ciphertext. 
                Only you can decrypt the result.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col items-center gap-4 mb-16">
                <ConnectButton.Custom>
                  {({ openConnectModal, connectModalOpen }) => (
                    <button
                      onClick={openConnectModal}
                      disabled={connectModalOpen}
                      className="group relative px-8 py-4 text-lg font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-gold via-accent-emerald to-accent-violet opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center gap-3 text-dark-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Connect Wallet to Play
                      </span>
                    </button>
                  )}
                </ConnectButton.Custom>
                <p className="text-sm text-gray-600">Sepolia Testnet • Gas fees apply</p>
              </div>
            </div>

            {/* Feature Cards - Outside text-center for better grid control */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <FeatureCard
                icon="🔐"
                title="Client-Side Encryption"
                description="Numbers encrypted in your browser using FHE before touching the blockchain"
                gradient="from-accent-gold/20 to-transparent"
              />
              <FeatureCard
                icon="⚡"
                title="On-Chain Computation"
                description="Smart contract compares encrypted values without ever decrypting them"
                gradient="from-accent-emerald/20 to-transparent"
              />
              <FeatureCard
                icon="🔓"
                title="Authorized Decryption"
                description="Sign with your wallet to decrypt - only you control access to results"
                gradient="from-accent-violet/20 to-transparent"
              />
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs">🦊</div>
                <span>MetaMask</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs">⟠</div>
                <span>Ethereum Sepolia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs">🔒</div>
                <span>Zama FHEVM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs">📜</div>
                <span>Solidity</span>
              </div>
            </div>
          </div>
        ) : (
          <SimpleGame />
        )}
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  gradient: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-white/10 hover:-translate-y-1 text-center md:text-left">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
