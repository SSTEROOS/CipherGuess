// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title NumberCompare
 * @notice FHE-powered number comparison game
 * @dev Flow:
 *   1. Frontend generates system random number, user inputs their number
 *   2. Both numbers are FHE encrypted before sending on-chain
 *   3. Contract performs FHE comparison
 *   4. Result is stored encrypted with user access permission
 *   5. Frontend uses userDecrypt to get the real result
 */
contract NumberCompare is ZamaEthereumConfig {
    // Result constants
    uint8 public constant RESULT_LOWER = 0;    // User number < System number
    uint8 public constant RESULT_EQUAL = 1;    // User number = System number
    uint8 public constant RESULT_HIGHER = 2;   // User number > System number

    // Comparison record
    struct CompareRecord {
        address player;
        euint8 encryptedResult;  // Encrypted comparison result
        uint256 timestamp;
    }

    // Storage
    uint256 public compareCounter;
    mapping(uint256 => CompareRecord) public records;

    // Events
    event NumbersCompared(
        uint256 indexed compareId,
        address indexed player,
        uint256 timestamp
    );

    /**
     * @notice Compare two encrypted numbers
     * @param encryptedSystemNum Encrypted system random number
     * @param encryptedUserNum Encrypted user input number
     * @param systemProof ZK proof for system number
     * @param userProof ZK proof for user number
     * @return compareId The ID of this comparison
     */
    function compareNumbers(
        externalEuint8 encryptedSystemNum,
        externalEuint8 encryptedUserNum,
        bytes calldata systemProof,
        bytes calldata userProof
    ) external returns (uint256) {
        // Unpack encrypted numbers
        euint8 systemNum = FHE.fromExternal(encryptedSystemNum, systemProof);
        euint8 userNum = FHE.fromExternal(encryptedUserNum, userProof);

        // FHE comparison
        // If userNum < systemNum: result = 0 (LOWER)
        // If userNum = systemNum: result = 1 (EQUAL)  
        // If userNum > systemNum: result = 2 (HIGHER)
        
        ebool isEqual = FHE.eq(userNum, systemNum);
        ebool isGreater = FHE.gt(userNum, systemNum);
        
        // Build result
        euint8 resultIfNotEqual = FHE.select(
            isGreater,
            FHE.asEuint8(RESULT_HIGHER),
            FHE.asEuint8(RESULT_LOWER)
        );
        
        euint8 result = FHE.select(
            isEqual,
            FHE.asEuint8(RESULT_EQUAL),
            resultIfNotEqual
        );

        // Save record
        uint256 compareId = compareCounter++;
        records[compareId] = CompareRecord({
            player: msg.sender,
            encryptedResult: result,
            timestamp: block.timestamp
        });

        // Set permissions: allow contract and user to access encrypted result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        // Note: Not using makePubliclyDecryptable(), requires user signature to decrypt

        emit NumbersCompared(compareId, msg.sender, block.timestamp);

        return compareId;
    }

    /**
     * @notice Get encrypted comparison result
     * @param compareId Comparison ID
     * @return Encrypted result handle
     */
    function getResult(uint256 compareId) external view returns (euint8) {
        require(compareId < compareCounter, "Invalid compare ID");
        return records[compareId].encryptedResult;
    }

    /**
     * @notice Get comparison record info
     * @param compareId Comparison ID
     * @return player Player address
     * @return timestamp Timestamp
     */
    function getRecordInfo(uint256 compareId) external view returns (
        address player,
        uint256 timestamp
    ) {
        require(compareId < compareCounter, "Invalid compare ID");
        CompareRecord storage record = records[compareId];
        return (record.player, record.timestamp);
    }
}
