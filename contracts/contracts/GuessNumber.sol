// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title GuessNumber
 * @notice A fully homomorphic encryption powered number guessing game
 * @dev Demonstrates FHE flow: frontend encryption -> on-chain FHE computation -> frontend decryption
 *
 * Game Flow:
 * 1. Host creates a game with an encrypted secret number (1-100)
 * 2. Players submit encrypted guesses
 * 3. Contract compares guess vs secret using FHE operations
 * 4. Result (too high/too low/correct) is stored encrypted
 * 5. Player decrypts result on frontend
 */
contract GuessNumber is ZamaEthereumConfig {
    // Result constants
    uint8 public constant RESULT_TOO_LOW = 0;
    uint8 public constant RESULT_CORRECT = 1;
    uint8 public constant RESULT_TOO_HIGH = 2;

    struct Game {
        address host;
        euint8 secretNumber;
        bool isActive;
        uint256 createdAt;
    }

    struct GuessRecord {
        address player;
        euint8 encryptedResult;
        uint256 timestamp;
    }

    // Game storage
    uint256 public gameCounter;
    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => GuessRecord[])) public playerGuesses;
    mapping(uint256 => address) public winners;
    mapping(uint256 => uint256) public guessCounts;

    // Events
    event GameCreated(uint256 indexed gameId, address indexed host, uint256 timestamp);
    event GuessMade(uint256 indexed gameId, address indexed player, uint256 guessIndex);
    event GameWon(uint256 indexed gameId, address indexed winner, uint256 attempts);
    event GameEnded(uint256 indexed gameId);

    /**
     * @notice Create a new guessing game with an encrypted secret number
     * @param encryptedSecret The encrypted secret number (should be 1-100)
     * @param inputProof ZK proof for the encrypted input
     */
    function createGame(
        externalEuint8 encryptedSecret,
        bytes calldata inputProof
    ) external returns (uint256) {
        euint8 secret = FHE.fromExternal(encryptedSecret, inputProof);
        
        uint256 gameId = gameCounter++;
        
        games[gameId] = Game({
            host: msg.sender,
            secretNumber: secret,
            isActive: true,
            createdAt: block.timestamp
        });

        // Allow contract to use the secret for comparisons
        FHE.allowThis(secret);
        
        emit GameCreated(gameId, msg.sender, block.timestamp);
        return gameId;
    }

    /**
     * @notice Submit an encrypted guess for a game
     * @param gameId The game to guess in
     * @param encryptedGuess The encrypted guess (should be 1-100)
     * @param inputProof ZK proof for the encrypted input
     * @return guessIndex The index of this guess in the player's guess history
     */
    function makeGuess(
        uint256 gameId,
        externalEuint8 encryptedGuess,
        bytes calldata inputProof
    ) external returns (uint256) {
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");
        require(winners[gameId] == address(0), "Game already won");

        euint8 guess = FHE.fromExternal(encryptedGuess, inputProof);

        // FHE comparison: compare guess with secret
        // If guess < secret: result = 0 (too low)
        // If guess = secret: result = 1 (correct)
        // If guess > secret: result = 2 (too high)
        
        ebool isEqual = FHE.eq(guess, game.secretNumber);
        ebool isGreater = FHE.gt(guess, game.secretNumber);
        
        // Build result: if equal -> 1, else if greater -> 2, else -> 0
        euint8 resultIfNotEqual = FHE.select(
            isGreater,
            FHE.asEuint8(RESULT_TOO_HIGH),
            FHE.asEuint8(RESULT_TOO_LOW)
        );
        
        euint8 result = FHE.select(
            isEqual,
            FHE.asEuint8(RESULT_CORRECT),
            resultIfNotEqual
        );

        // Store the encrypted result
        uint256 guessIndex = playerGuesses[gameId][msg.sender].length;
        playerGuesses[gameId][msg.sender].push(GuessRecord({
            player: msg.sender,
            encryptedResult: result,
            timestamp: block.timestamp
        }));

        guessCounts[gameId]++;

        // Allow player to decrypt their result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit GuessMade(gameId, msg.sender, guessIndex);

        return guessIndex;
    }

    /**
     * @notice Claim victory after correctly guessing the number
     * @param gameId The game ID
     * @param guessIndex The index of the winning guess
     */
    function claimWin(uint256 gameId, uint256 guessIndex) external {
        require(games[gameId].isActive, "Game is not active");
        require(winners[gameId] == address(0), "Game already won");
        
        GuessRecord[] storage guesses = playerGuesses[gameId][msg.sender];
        require(guessIndex < guesses.length, "Invalid guess index");

        // Note: In production, this would need additional verification
        // For demo purposes, we trust the claim and mark the game as won
        winners[gameId] = msg.sender;
        games[gameId].isActive = false;

        emit GameWon(gameId, msg.sender, guesses.length);
        emit GameEnded(gameId);
    }

    /**
     * @notice Get the encrypted result of a specific guess
     * @param gameId The game ID
     * @param player The player address
     * @param guessIndex The guess index
     * @return The encrypted result handle
     */
    function getGuessResult(
        uint256 gameId,
        address player,
        uint256 guessIndex
    ) external view returns (euint8) {
        require(guessIndex < playerGuesses[gameId][player].length, "Invalid guess index");
        return playerGuesses[gameId][player][guessIndex].encryptedResult;
    }

    /**
     * @notice Get the number of guesses a player has made in a game
     * @param gameId The game ID
     * @param player The player address
     * @return The number of guesses
     */
    function getPlayerGuessCount(
        uint256 gameId,
        address player
    ) external view returns (uint256) {
        return playerGuesses[gameId][player].length;
    }

    /**
     * @notice Check if a game is still active
     * @param gameId The game ID
     * @return Whether the game is active
     */
    function isGameActive(uint256 gameId) external view returns (bool) {
        return games[gameId].isActive && winners[gameId] == address(0);
    }

    /**
     * @notice End a game (host only)
     * @param gameId The game ID
     */
    function endGame(uint256 gameId) external {
        require(games[gameId].host == msg.sender, "Only host can end game");
        require(games[gameId].isActive, "Game already ended");
        
        games[gameId].isActive = false;
        emit GameEnded(gameId);
    }

    /**
     * @notice Get game information
     * @param gameId The game ID
     * @return host The game host address
     * @return isActive Whether the game is active
     * @return createdAt The game creation timestamp
     * @return totalGuesses The total number of guesses made
     * @return winner The winner address (zero if no winner yet)
     */
    function getGameInfo(uint256 gameId) external view returns (
        address host,
        bool isActive,
        uint256 createdAt,
        uint256 totalGuesses,
        address winner
    ) {
        Game storage game = games[gameId];
        return (
            game.host,
            game.isActive,
            game.createdAt,
            guessCounts[gameId],
            winners[gameId]
        );
    }
}

