"use client";

export function HowItWorks() {
  const steps = [
    {
      icon: "🔐",
      title: "Client-Side Encryption",
      description:
        "Your guess is encrypted using Fully Homomorphic Encryption (FHE) before leaving your browser. No one can see your actual guess.",
      color: "accent-gold",
    },
    {
      icon: "⛓️",
      title: "On-Chain FHE Computation",
      description:
        "The smart contract compares your encrypted guess with the encrypted secret using FHE operations. All computation happens on encrypted data.",
      color: "accent-emerald",
    },
    {
      icon: "🔓",
      title: "Secure Decryption",
      description:
        "Only you can decrypt the comparison result. The secret number remains encrypted throughout the entire process.",
      color: "accent-violet",
    },
  ];

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center text-white mb-4">
        How FHE Works
      </h2>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        CipherGuess uses Fully Homomorphic Encryption to enable computation on
        encrypted data. This means the blockchain never sees your actual guesses
        or the secret number - everything stays encrypted!
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="glass p-6 rounded-xl hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-${step.color}/20 flex items-center justify-center text-2xl`}
              >
                {step.icon}
              </div>
              <div
                className={`w-8 h-8 rounded-full bg-${step.color} text-dark-900 font-bold flex items-center justify-center`}
              >
                {index + 1}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm mb-4">Powered by</p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-lg">⚡</span>
            <span>Zama FHEVM</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-lg">🔷</span>
            <span>Ethereum Sepolia</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-lg">🌈</span>
            <span>RainbowKit</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-lg">⚛️</span>
            <span>Next.js</span>
          </div>
        </div>
      </div>
    </section>
  );
}

