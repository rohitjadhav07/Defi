const hre = require("hardhat");

async function main() {
  console.log("Deploying DeFi Certificate NFT Contract...");

  const DeFiCertificate = await hre.ethers.getContractFactory("DeFiCertificate");
  const certificate = await DeFiCertificate.deploy();

  await certificate.waitForDeployment();

  const address = await certificate.getAddress();
  console.log("✅ DeFiCertificate deployed to:", address);

  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await certificate.deploymentTransaction().wait(5);

  // Verify on Basescan
  console.log("Verifying contract on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on Basescan");
  } catch (error) {
    console.log("Verification error:", error.message);
  }

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    address: address,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `./deployments/DeFiCertificate-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📝 Deployment info saved to deployments/");
  console.log("\n🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Update agent/.env with CONTRACT_ADDRESS=" + address);
  console.log("2. Update frontend/.env with NEXT_PUBLIC_CERTIFICATE_CONTRACT=" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
