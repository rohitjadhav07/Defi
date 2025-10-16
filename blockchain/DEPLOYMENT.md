# Smart Contract Deployment Guide

## Contracts Overview

### 1. UserProfile.sol
Stores user KYC data and reputation on-chain.

### 2. P2PEscrow.sol
Manages peer-to-peer trades with escrow protection.

### 3. ForexPosition.sol
Tracks leveraged forex positions on-chain.

## Deployment Steps

### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 1. Setup Hardhat Config

Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: [process.env.PRIVATE_KEY],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

### 2. Create Deployment Script

Create `scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to", hre.network.name);

  // Deploy UserProfile
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  console.log("UserProfile deployed to:", await userProfile.getAddress());

  // Deploy P2PEscrow
  const P2PEscrow = await hre.ethers.getContractFactory("P2PEscrow");
  const p2pEscrow = await P2PEscrow.deploy();
  await p2pEscrow.waitForDeployment();
  console.log("P2PEscrow deployed to:", await p2pEscrow.getAddress());

  // Deploy ForexPosition (using USDC as collateral)
  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC
  const ForexPosition = await hre.ethers.getContractFactory("ForexPosition");
  const forexPosition = await ForexPosition.deploy(USDC_ADDRESS);
  await forexPosition.waitForDeployment();
  console.log("ForexPosition deployed to:", await forexPosition.getAddress());

  // Save addresses
  const addresses = {
    userProfile: await userProfile.getAddress(),
    p2pEscrow: await p2pEscrow.getAddress(),
    forexPosition: await forexPosition.getAddress(),
  };

  console.log("\n📝 Contract Addresses:");
  console.log(JSON.stringify(addresses, null, 2));
  console.log("\n✅ Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 3. Deploy to Sepolia Testnet

```bash
# Set environment variables
export PRIVATE_KEY="your_private_key_here"
export SEPOLIA_RPC_URL="https://rpc.sepolia.org"

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Update Frontend Config

After deployment, update the contract addresses in:
- `frontend/src/components/P2PMarketplace.tsx` - Update `ESCROW_CONTRACT`
- `frontend/src/components/UserProfile.tsx` - Update `PROFILE_CONTRACT`
- `frontend/src/components/ForexTrading.tsx` - Update `FOREX_CONTRACT`

### 5. Verify Contracts (Optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Testnet Faucets

Get test tokens:
- **Sepolia ETH**: https://sepoliafaucet.com/
- **Sepolia USDC**: https://faucet.circle.com/
- **Base Sepolia ETH**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Arbitrum Sepolia ETH**: https://faucet.quicknode.com/arbitrum/sepolia

## Contract Addresses (After Deployment)

Update these after deploying:

### Sepolia Testnet
- UserProfile: `0x...` (TODO)
- P2PEscrow: `0x...` (TODO)
- ForexPosition: `0x...` (TODO)

### Base Sepolia
- UserProfile: `0x...` (TODO)
- P2PEscrow: `0x...` (TODO)

### Arbitrum Sepolia
- UserProfile: `0x...` (TODO)
- P2PEscrow: `0x...` (TODO)

## Testing Contracts

```bash
# Run tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit private keys to git
- Use environment variables for sensitive data
- These are TESTNET contracts - do not use on mainnet without audit
- Test thoroughly before deploying to production
