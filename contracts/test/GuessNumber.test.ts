import { expect } from "chai";
import { ethers } from "hardhat";
import { GuessNumber } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("GuessNumber", function () {
  let guessNumber: GuessNumber;
  let guessNumberAddress: string;
  let deployer: HardhatEthersSigner;
  let host: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    host = signers[1];
    player1 = signers[2];
    player2 = signers[3];
  });

  beforeEach(async function () {
    const GuessNumberFactory = await ethers.getContractFactory("GuessNumber");
    guessNumber = await GuessNumberFactory.deploy();
    await guessNumber.waitForDeployment();
    guessNumberAddress = await guessNumber.getAddress();
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(guessNumberAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should have gameCounter initialized to 0", async function () {
      expect(await guessNumber.gameCounter()).to.equal(0);
    });

    it("should have correct result constants", async function () {
      expect(await guessNumber.RESULT_TOO_LOW()).to.equal(0);
      expect(await guessNumber.RESULT_CORRECT()).to.equal(1);
      expect(await guessNumber.RESULT_TOO_HIGH()).to.equal(2);
    });
  });

  describe("Contract Interface", function () {
    it("should expose createGame function", async function () {
      expect(guessNumber.createGame).to.be.a("function");
    });

    it("should expose makeGuess function", async function () {
      expect(guessNumber.makeGuess).to.be.a("function");
    });

    it("should expose claimWin function", async function () {
      expect(guessNumber.claimWin).to.be.a("function");
    });

    it("should expose endGame function", async function () {
      expect(guessNumber.endGame).to.be.a("function");
    });

    it("should expose getGameInfo function", async function () {
      expect(guessNumber.getGameInfo).to.be.a("function");
    });

    it("should expose getPlayerGuessCount function", async function () {
      expect(guessNumber.getPlayerGuessCount).to.be.a("function");
    });

    it("should expose getGuessResult function", async function () {
      expect(guessNumber.getGuessResult).to.be.a("function");
    });

    it("should expose isGameActive function", async function () {
      expect(guessNumber.isGameActive).to.be.a("function");
    });
  });

  describe("State Variables", function () {
    it("should have games mapping", async function () {
      // Access games(0) - should return default values
      const game = await guessNumber.games(0);
      expect(game.host).to.equal(ethers.ZeroAddress);
      expect(game.isActive).to.equal(false);
    });

    it("should have winners mapping", async function () {
      // Access winners(0) - should return zero address
      const winner = await guessNumber.winners(0);
      expect(winner).to.equal(ethers.ZeroAddress);
    });

    it("should have guessCounts mapping", async function () {
      // Access guessCounts(0) - should return 0
      const count = await guessNumber.guessCounts(0);
      expect(count).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("isGameActive should return false for non-existent game", async function () {
      const isActive = await guessNumber.isGameActive(999);
      expect(isActive).to.equal(false);
    });

    it("getPlayerGuessCount should return 0 for new player", async function () {
      const count = await guessNumber.getPlayerGuessCount(0, player1.address);
      expect(count).to.equal(0);
    });

    it("getGameInfo should return default values for non-existent game", async function () {
      const info = await guessNumber.getGameInfo(999);
      expect(info.host).to.equal(ethers.ZeroAddress);
      expect(info.isActive).to.equal(false);
      expect(info.createdAt).to.equal(0);
      expect(info.totalGuesses).to.equal(0);
      expect(info.winner).to.equal(ethers.ZeroAddress);
    });
  });
});
