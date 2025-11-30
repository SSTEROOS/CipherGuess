# CipherGuess - FHE Number Comparison Game

A fully homomorphic encryption (FHE) powered number comparison game built on Ethereum Sepolia using Zama's FHEVM.

## 🎯 Overview

CipherGuess demonstrates **real FHE (Fully Homomorphic Encryption)** in blockchain applications. Both user input and system-generated random numbers are encrypted client-side, compared on-chain using FHE operations, and only the authorized user can decrypt the result.

### Why FHE Matters

Traditional blockchain applications expose all data on-chain. With FHE:
- ✅ **Numbers stay encrypted** - Never revealed on-chain
- ✅ **Computation on ciphertext** - Smart contract compares encrypted values
- ✅ **User-controlled decryption** - Only you can decrypt your results (via wallet signature)
- ✅ **Zero trust required** - No central authority sees plaintext data

This enables a new paradigm of **privacy-preserving blockchain applications** that was previously impossible.

## 🔐 FHE Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CIPHERGUESS FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣ ENCRYPT (Client-Side)                                       │
│     ┌──────────────┐    ┌──────────────┐                        │
│     │ System: 42   │    │ User: 30     │                        │
│     └──────┬───────┘    └──────┬───────┘                        │
│            │ FHE.encrypt()     │ FHE.encrypt()                  │
│            ▼                   ▼                                │
│     ┌──────────────┐    ┌──────────────┐                        │
│     │ 0x7a8b...    │    │ 0x3f2c...    │                        │
│     └──────┬───────┘    └──────┬───────┘                        │
│            │                   │                                │
│  2️⃣ COMPUTE (On-Chain FHE)     │                                │
│            └─────────┬─────────┘                                │
│                      ▼                                          │
│     ┌────────────────────────────────┐                          │
│     │  Smart Contract:               │                          │
│     │  FHE.eq(cipher1, cipher2)      │                          │
│     │  FHE.gt(cipher1, cipher2)      │                          │
│     │  FHE.select(...)               │                          │
│     └────────────────┬───────────────┘                          │
│                      ▼                                          │
│     ┌──────────────────────────────┐                            │
│     │ Encrypted Result: 0x9d4e...  │                            │
│     └──────────────┬───────────────┘                            │
│                    │                                            │
│  3️⃣ DECRYPT (User Signature Required)                           │
│                    ▼                                            │
│     ┌──────────────────────────────┐                            │
│     │ 🦊 Wallet Sign EIP-712       │                            │
│     │    (Authorize Decryption)    │                            │
│     └──────────────┬───────────────┘                            │
│                    ▼                                            │
│     ┌──────────────────────────────┐                            │
│     │ Result: 0 (Lower) / 1 (Equal)│                            │
│     │         / 2 (Higher)         │                            │
│     └──────────────────────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Features

- **Real FHE Encryption** - Uses `@zama-fhe/relayer-sdk` for client-side encryption
- **On-Chain FHE Computation** - `FHE.eq()`, `FHE.gt()`, `FHE.select()` operations
- **User-Controlled Decryption** - `userDecrypt` with EIP-712 wallet signature
- **Modern UI** - Beautiful interface with animated backgrounds and step indicators
- **Wallet Integration** - RainbowKit + wagmi for seamless wallet connection

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Smart Contract | Solidity 0.8.24, FHEVM v0.9 |
| FHE Library | `@fhevm/solidity`, `@zama-fhe/relayer-sdk` |
| Frontend | Next.js 14, React 18, TypeScript |
| Wallet | RainbowKit 2.x, wagmi 2.x |
| Styling | Tailwind CSS |
| Network | Ethereum Sepolia Testnet |

## 📁 Project Structure

```
CipherGuess/
├── contracts/                      # Hardhat project
│   ├── contracts/
│   │   ├── NumberCompare.sol      # Main FHE comparison contract
│   │   └── GuessNumber.sol        # Legacy guessing game contract
│   ├── scripts/
│   │   └── deployNumberCompare.ts # Deployment script
│   ├── test/
│   │   ├── NumberCompare.test.ts  # Unit tests for NumberCompare
│   │   └── GuessNumber.test.ts    # Unit tests for GuessNumber
│   └── hardhat.config.ts
├── frontend/                       # Next.js application
│   ├── app/                        # App router pages
│   ├── components/
│   │   └── SimpleGame.tsx         # Main game component
│   └── lib/
│       ├── fhevm-context.tsx      # FHE SDK integration
│       └── contract.ts            # Contract ABI & address
└── README.md
```

## 📜 Smart Contract

### NumberCompare.sol

The main contract that performs FHE number comparison:

```solidity
// Core FHE operations used
FHE.fromExternal()  // Validate & import encrypted inputs
FHE.eq()            // Encrypted equality comparison
FHE.gt()            // Encrypted greater-than comparison
FHE.select()        // Encrypted conditional selection
FHE.allow()         // Grant decryption permission to user
```

**Key Functions:**
- `compareNumbers(encryptedSystem, encryptedUser, proofs)` - Compare two encrypted numbers
- `getResult(compareId)` - Get encrypted result handle for decryption

## 🚀 Deployed Contract

| Network | Contract | Address | Verified |
|---------|----------|---------|----------|
| Sepolia | NumberCompare | [`0x88432C3D631Ea1ce18eA8C16988279E40b973080`](https://sepolia.etherscan.io/address/0x88432C3D631Ea1ce18eA8C16988279E40b973080#code) | ✅ Yes |

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- MetaMask wallet
- Sepolia testnet ETH ([Faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/SSTEROOS/CipherGuess.git
cd CipherGuess

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Run Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy Contract (Optional)

```bash
cd contracts

# Create .env file
echo "SEPOLIA_RPC_URL=your_rpc_url" >> .env
echo "PRIVATE_KEY=your_private_key" >> .env
echo "ETHERSCAN_API_KEY=your_api_key" >> .env

# Deploy
npx hardhat run scripts/deployNumberCompare.ts --network sepolia

# Verify
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🧪 Testing

```bash
cd contracts
npm test
```

The test suite covers:
- Contract deployment and initialization
- Result constants (LOWER, EQUAL, HIGHER)
- Contract interface validation
- State variable accessibility
- View function behavior

## 💼 Business Potential

CipherGuess demonstrates a paradigm shift for blockchain applications:

| Use Case | Traditional | With FHE |
|----------|-------------|----------|
| **Gaming** | All bets/cards visible | Encrypted gameplay |
| **Auctions** | Bids visible to all | Sealed-bid auctions |
| **Voting** | Votes can be traced | Truly secret ballots |
| **Finance** | Amounts exposed | Private transactions |

### Future Roadmap

- 🎮 **Tournament Mode** - Multi-player competitions with prize pools
- 🏆 **NFT Achievements** - Mint badges for milestones
- 📊 **Analytics Dashboard** - Track stats while preserving privacy
- 🌐 **Multi-chain** - Deploy on other FHE-enabled networks

## 📄 License

MIT

## 🙏 Acknowledgments

- [Zama](https://zama.ai) - FHEVM and FHE libraries
- [RainbowKit](https://rainbowkit.com) - Wallet connection
- [wagmi](https://wagmi.sh) - React hooks for Ethereum

---

**Built for the [Zama Developer Program](https://guild.xyz/zama/developer-program)** 🔐
