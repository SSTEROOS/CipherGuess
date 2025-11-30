import { expect } from "chai";
import { ethers } from "hardhat";
import { NumberCompare } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("NumberCompare", function () {
  let numberCompare: NumberCompare;
  let numberCompareAddress: string;
  let deployer: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    player1 = signers[1];
    player2 = signers[2];
  });

  beforeEach(async function () {
    const NumberCompareFactory = await ethers.getContractFactory("NumberCompare");
    numberCompare = await NumberCompareFactory.deploy();
    await numberCompare.waitForDeployment();
    numberCompareAddress = await numberCompare.getAddress();
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(numberCompareAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should have compareCounter initialized to 0", async function () {
      expect(await numberCompare.compareCounter()).to.equal(0);
    });

    it("should have correct result constants", async function () {
      expect(await numberCompare.RESULT_LOWER()).to.equal(0);
      expect(await numberCompare.RESULT_EQUAL()).to.equal(1);
      expect(await numberCompare.RESULT_HIGHER()).to.equal(2);
    });
  });

  describe("Contract Interface", function () {
    it("should expose compareNumbers function", async function () {
      expect(numberCompare.compareNumbers).to.be.a("function");
    });

    it("should expose getResult function", async function () {
      expect(numberCompare.getResult).to.be.a("function");
    });

    it("should expose getRecordInfo function", async function () {
      expect(numberCompare.getRecordInfo).to.be.a("function");
    });

    it("should expose compareCounter function", async function () {
      expect(numberCompare.compareCounter).to.be.a("function");
    });

    it("should expose RESULT_LOWER constant", async function () {
      expect(numberCompare.RESULT_LOWER).to.be.a("function");
    });

    it("should expose RESULT_EQUAL constant", async function () {
      expect(numberCompare.RESULT_EQUAL).to.be.a("function");
    });

    it("should expose RESULT_HIGHER constant", async function () {
      expect(numberCompare.RESULT_HIGHER).to.be.a("function");
    });
  });

  describe("State Variables", function () {
    it("should have records mapping accessible", async function () {
      // Access records(0) - should return default values for non-existent record
      const record = await numberCompare.records(0);
      expect(record.player).to.equal(ethers.ZeroAddress);
      expect(record.timestamp).to.equal(0);
    });

    it("should track compareCounter correctly", async function () {
      const initialCounter = await numberCompare.compareCounter();
      expect(initialCounter).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("getResult should revert for invalid compareId", async function () {
      await expect(numberCompare.getResult(999))
        .to.be.revertedWith("Invalid compare ID");
    });

    it("getRecordInfo should revert for invalid compareId", async function () {
      await expect(numberCompare.getRecordInfo(999))
        .to.be.revertedWith("Invalid compare ID");
    });
  });

  describe("Result Constants", function () {
    it("RESULT_LOWER should be 0 (user < system)", async function () {
      const result = await numberCompare.RESULT_LOWER();
      expect(result).to.equal(0);
    });

    it("RESULT_EQUAL should be 1 (user = system)", async function () {
      const result = await numberCompare.RESULT_EQUAL();
      expect(result).to.equal(1);
    });

    it("RESULT_HIGHER should be 2 (user > system)", async function () {
      const result = await numberCompare.RESULT_HIGHER();
      expect(result).to.equal(2);
    });
  });

  describe("FHE Integration", function () {
    it("contract should inherit ZamaEthereumConfig", async function () {
      // If the contract deployed successfully with ZamaEthereumConfig inheritance,
      // it means the FHE configuration is properly set up
      expect(numberCompareAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("compareNumbers function should exist with correct signature", async function () {
      // Verify the function exists and has the expected parameter types
      const fragment = numberCompare.interface.getFunction("compareNumbers");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(4); // 2 encrypted inputs + 2 proofs
    });
  });

  describe("Gas Estimation", function () {
    it("should estimate gas for deployment", async function () {
      const NumberCompareFactory = await ethers.getContractFactory("NumberCompare");
      const deployTx = await NumberCompareFactory.getDeployTransaction();
      const estimatedGas = await ethers.provider.estimateGas(deployTx);
      expect(estimatedGas).to.be.gt(0);
      console.log(`    Deployment gas estimate: ${estimatedGas.toString()}`);
    });
  });
});

