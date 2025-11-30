// NumberCompare contract address (Sepolia) - v2 with userDecrypt
export const NUMBER_COMPARE_ADDRESS = "0x88432C3D631Ea1ce18eA8C16988279E40b973080";

// Helper: Convert Uint8Array to hex string
export function toHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
}

// Contract ABI
export const NUMBER_COMPARE_ABI = [
  {
    inputs: [
      { internalType: "externalEuint8", name: "encryptedSystemNum", type: "bytes32" },
      { internalType: "externalEuint8", name: "encryptedUserNum", type: "bytes32" },
      { internalType: "bytes", name: "systemProof", type: "bytes" },
      { internalType: "bytes", name: "userProof", type: "bytes" }
    ],
    name: "compareNumbers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "compareId", type: "uint256" }],
    name: "getResult",
    outputs: [{ internalType: "euint8", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "compareId", type: "uint256" }],
    name: "getRecordInfo",
    outputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "compareCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "RESULT_LOWER",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "RESULT_EQUAL",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "RESULT_HIGHER",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "compareId", type: "uint256" },
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "NumbersCompared",
    type: "event"
  }
] as const;

// Result constants
export const RESULT_LOWER = 0;  // User number < System number
export const RESULT_EQUAL = 1;  // User number = System number
export const RESULT_HIGHER = 2; // User number > System number
