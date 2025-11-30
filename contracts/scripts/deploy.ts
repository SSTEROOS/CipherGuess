import { ethers } from "hardhat";

async function main() {
  console.log("Deploying GuessNumber contract to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const GuessNumber = await ethers.getContractFactory("GuessNumber");
  const guessNumber = await GuessNumber.deploy();

  await guessNumber.waitForDeployment();

  const contractAddress = await guessNumber.getAddress();
  console.log("GuessNumber deployed to:", contractAddress);
  console.log("");
  console.log("To verify the contract on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);

  return contractAddress;
}

main()
  .then((address) => {
    console.log("");
    console.log("Deployment successful!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

