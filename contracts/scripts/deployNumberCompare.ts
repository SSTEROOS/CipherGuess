import { ethers } from "hardhat";

async function main() {
  console.log("Deploying NumberCompare contract to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const NumberCompare = await ethers.getContractFactory("NumberCompare");
  const contract = await NumberCompare.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("NumberCompare deployed to:", address);

  console.log("\nTo verify the contract on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${address}`);

  console.log("\n✅ Deployment successful!");
  console.log("Contract address:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

