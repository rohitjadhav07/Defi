const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 Deploying DeFi Guardian AI Smart Contracts");
  console.log("================================================");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ Error: Deployer has no ETH. Get testnet ETH from faucet first!");
    process.exit(1);
  }

  const deployedContracts = {};

  // 1. Deploy UserProfile
  console.log("📝 Deploying UserProfile...");
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  const userProfileAddress = await userProfile.getAddress();
  deployedContracts.userProfile = userProfileAddress;
  console.log("✅ UserProfile deployed to:", userProfileAddress);

  // 2. Deploy P2PEscrow
  console.log("\n🤝 Deploying P2PEscrow...");
  const P2PEscrow = await hre.ethers.getContractFactory("P2PEscrow");
  const p2pEscrow = await P2PEscrow.deploy();
  await p2pEscrow.waitForDeployment();
  const p2pEscrowAddress = await p2pEscrow.getAddress();
  deployedContracts.p2pEscrow = p2pEscrowAddress;
  console.log("✅ P2PEscrow deployed to:", p2pEscrowAddress);

  // 3. Deploy ForexPosition
  console.log("\n💱 Deploying ForexPosition...");
  
  // USDC addresses for different networks
  const usdcAddresses = {
    11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
    421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" // Arbitrum Sepolia
  };
  
  const usdcAddress = usdcAddresses[hre.network.config.chainId] || usdcAddresses[11155111];
  console.log("Using USDC address:", usdcAddress);
  
  const ForexPosition = await hre.ethers.getContractFactory("ForexPosition");
  const forexPosition = await ForexPosition.deploy(usdcAddress);
  await forexPosition.waitForDeployment();
  const forexPositionAddress = await forexPosition.getAddress();
  deployedContracts.forexPosition = forexPositionAddress;
  console.log("✅ ForexPosition deployed to:", forexPositionAddress);

  // Save deployment info
  console.log("\n💾 Saving deployment info...");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
    blockExplorers: {
      11155111: `https://sepolia.etherscan.io`,
      84532: `https://sepolia.basescan.org`,
      421614: `https://sepolia.arbiscan.io`
    }
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to:", filename);

  // Print summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("================================================");
  console.log("\n📋 Contract Addresses:");
  console.log("UserProfile:   ", userProfileAddress);
  console.log("P2PEscrow:     ", p2pEscrowAddress);
  console.log("ForexPosition: ", forexPositionAddress);
  
  const explorerBase = deploymentInfo.blockExplorers[hre.network.config.chainId];
  if (explorerBase) {
    console.log("\n🔍 View on Block Explorer:");
    console.log(`${explorerBase}/address/${userProfileAddress}`);
    console.log(`${explorerBase}/address/${p2pEscrowAddress}`);
    console.log(`${explorerBase}/address/${forexPositionAddress}`);
  }

  console.log("\n📝 Next Steps:");
  console.log("1. Update contract addresses in frontend components:");
  console.log("   - frontend/src/components/UserProfile.tsx");
  console.log("   - frontend/src/components/P2PMarketplace.tsx");
  console.log("   - frontend/src/components/ForexTrading.tsx");
  console.log("\n2. Test the contracts on the frontend");
  console.log("3. Record your demo video!");
  console.log("\n================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
