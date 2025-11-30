# CipherGuess - FHE Number Guessing Game

A fully homomorphic encryption (FHE) powered number guessing game built on Ethereum Sepolia using Zama's FHEVM.

## Overview

CipherGuess demonstrates the power of Fully Homomorphic Encryption in blockchain applications. Players guess a secret number, but here's the twist: **all guesses and the secret number remain encrypted throughout the entire process**. The blockchain performs comparisons on encrypted data, and only the player can decrypt their results.

### Why FHE?

Traditional blockchain games expose all data on-chain. With FHE:
- The secret number is never revealed on-chain
- Player guesses remain private
- Comparisons happen on encrypted data
- Only authorized parties can decrypt results

This creates a truly fair and private gaming experience that was previously impossible on public blockchains.

## Features

- **Encrypted Game Creation**: Hosts set a secret number that's encrypted before hitting the blockchain
- **Private Guessing**: Player guesses are encrypted client-side using FHE
- **On-Chain FHE Computation**: Smart contract compares encrypted guess vs encrypted secret
- **Secure Result Decryption**: Only players can decrypt their comparison results
- **Beautiful UI**: Modern, responsive interface with RainbowKit wallet integration

## Technology Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.24, FHEVM |
| FHE Operations | Zama FHEVM Library |
| Frontend | Next.js 14, React 18, TypeScript |
| Wallet | RainbowKit, wagmi |
| Styling | Tailwind CSS |
| Network | Ethereum Sepolia Testnet |

## FHE Flow

```
1. CREATE GAME
   Host picks secret (e.g., 50)
   ↓
   Frontend encrypts: encrypt(50) → 0x7a8b...
   ↓
   Store encrypted secret on-chain

2. MAKE GUESS
   Player guesses (e.g., 30)
   ↓
   Frontend encrypts: encrypt(30) → 0x3f2c...
   ↓
   Contract compares: FHE.eq(encrypted_30, encrypted_50)
   ↓
   Returns encrypted result (0=low, 1=correct, 2=high)

3. VIEW RESULT
   Player requests decryption
   ↓
   Only player with permission can decrypt
   ↓
   Display: "Too Low!" / "Too High!" / "Correct!"
```

## Project Structure

```
zama_11/
├── contracts/                 # Hardhat project
│   ├── contracts/
│   │   └── GuessNumber.sol   # FHE game contract
│   ├── scripts/
│   │   └── deploy.ts         # Deployment script
│   ├── test/
│   │   └── GuessNumber.test.ts # Unit tests
│   └── hardhat.config.ts
├── frontend/                  # Next.js application
│   ├── app/                   # App router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities & hooks
│   └── package.json
└── README.md
```

## Smart Contract

The `GuessNumber` contract implements:

- `createGame()` - Create a game with an encrypted secret number
- `makeGuess()` - Submit an encrypted guess and get encrypted result
- `claimWin()` - Claim victory after guessing correctly
- `endGame()` - Host can end a game

Key FHE operations used:
- `FHE.fromExternal()` - Validate and import encrypted inputs
- `FHE.eq()` - Encrypted equality comparison
- `FHE.gt()` - Encrypted greater-than comparison
- `FHE.select()` - Encrypted conditional selection
- `FHE.allow()` - Grant decryption permissions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MetaMask or compatible wallet
- Sepolia testnet ETH

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd zama_11
```

2. Install contract dependencies:
```bash
cd contracts
pnpm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
pnpm install
```

### Configuration

1. Create `contracts/.env`:
```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Deploy the contract:
```bash
cd contracts
pnpm run deploy
```

3. Verify on Etherscan:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

4. Update the contract address in `frontend/lib/contract.ts`

### Running the Frontend

```bash
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Run the smart contract tests:

```bash
cd contracts
pnpm test
```

The test suite covers:
- Contract deployment
- Game creation with encrypted secrets
- Making encrypted guesses
- FHE comparison results (too low, too high, correct)
- Game management (ending, claiming wins)
- Multiple player scenarios

## Deployed Contract

| Network | Address | Verified |
|---------|---------|----------|
| Sepolia | [`0x98b3Aab6Af3e0f59b59802396eaADF263ACCDD53`](https://sepolia.etherscan.io/address/0x98b3Aab6Af3e0f59b59802396eaADF263ACCDD53#code) | Yes |

## Business Potential

CipherGuess demonstrates a new paradigm for blockchain gaming:

1. **Fair Gaming**: Impossible to cheat by reading on-chain data
2. **Privacy-Preserving**: Player behavior remains confidential
3. **Trustless**: No central authority knows the secrets
4. **Extensible**: Pattern applies to poker, auctions, voting, etc.

### Future Possibilities

- **Tournament Mode**: Multiple games with prize pools
- **NFT Rewards**: Mint achievement NFTs for winners
- **Leaderboards**: Track best players while preserving game privacy
- **Mobile App**: Native mobile experience
- **Multi-chain**: Deploy on other EVM chains supporting FHEVM

## License

MIT

## Acknowledgments

- [Zama](https://zama.ai) - FHEVM and FHE libraries
- [RainbowKit](https://rainbowkit.com) - Wallet connection
- [wagmi](https://wagmi.sh) - React hooks for Ethereum

