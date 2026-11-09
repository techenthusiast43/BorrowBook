const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("==================================================");
  console.log("BorrowBook Smart Contract Deployment");
  console.log("Network Name:    ", network.name);
  console.log("Chain ID:        ", network.chainId.toString());
  console.log("Deployer Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "BOT");
  console.log("==================================================");

  const BorrowBookFactory = await ethers.getContractFactory("BorrowBook");
  console.log("Deploying BorrowBook contract...");
  const borrowBook = await BorrowBookFactory.deploy();
  await borrowBook.waitForDeployment();

  const contractAddress = await borrowBook.getAddress();
  const deployTx = borrowBook.deploymentTransaction();

  console.log("BorrowBook successfully deployed!");
  console.log("Contract Address:", contractAddress);
  if (deployTx) {
    console.log("Transaction Hash:", deployTx.hash);
    const explorerBase = Number(network.chainId) === 677 ? "https://scan.botchain.ai" : "https://scan.bohr.life";
    console.log("Block Explorer:  ", `${explorerBase}/tx/${deployTx.hash}`);
  }

  // Export deployment info to frontend
  const deployedInfo = {
    address: contractAddress,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    txHash: deployTx ? deployTx.hash : null,
  };

  const outputDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployedAddress.json"),
    JSON.stringify(deployedInfo, null, 2)
  );

  console.log("Deployment details exported to src/contracts/deployedAddress.json");
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
