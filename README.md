# ⚡ Nexus Finance

> **AI-Powered DeFi Portfolio Management with Real Blockchain Transactions**

A comprehensive DeFi platform built with ADK-TS framework, combining AI-powered risk analysis, multi-chain portfolio tracking, P2P trading, and forex positions - all with real on-chain transactions.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🎯 What Is This?

Nexus Finance is a **production-ready DeFi platform** that helps users:
- 📊 Track portfolios across multiple chains (Sepolia, Base, Arbitrum)
- 🤖 Get AI-powered risk analysis and recommendations
- 💸 Transfer tokens on-chain (ETH, USDC, USDT, DAI, WBTC)
- 🤝 Trade P2P with smart contract escrow
- 💱 Trade forex with leverage (30+ pairs)
- 📚 Learn DeFi through AI education
- 🔍 Find arbitrage opportunities

**Built for ADK-TS Hackathon 2025** - Track 3: Web3 Use Cases

*Where AI meets DeFi at the nexus of innovation* ✨

---

## ✨ Key Features

### 1. Multi-Chain Portfolio Tracking
- Real-time balance fetching from blockchain
- Support for 5 tokens: ETH, USDC, USDT, DAI, WBTC
- 3 testnets: Sepolia, Base Sepolia, Arbitrum Sepolia
- Live price data from CoinGecko
- USD value calculation

### 2. AI-Powered Risk Analysis (ADK-TS)
- Risk scoring (0-100) based on multiple factors
- Volatility, concentration, and smart contract risk analysis
- Personalized recommendations
- Context-aware AI responses using Google Gemini

### 3. On-Chain Token Transfers
- **Real blockchain transactions** (not mock data!)
- ETH and ERC20 support
- Transaction confirmation on Etherscan
- Address book management
- Transaction history

### 4. P2P Marketplace
- Smart contract escrow (ready to deploy)
- Peer-to-peer trading
- Reputation system
- Multiple payment methods

### 5. Forex Trading
- 30+ currency pairs (Major, Minor, Exotic, Crypto)
- Leveraged positions (1-100x)
- AI trading signals
- On-chain position management

### 6. Educational AI Assistant
- Google Gemini 2.5 Flash (FREE!)
- 5 comprehensive DeFi lessons
- Natural language chat
- Portfolio-specific advice

### 7. User Profiles
- On-chain KYC storage
- Verification levels
- Reputation tracking
- Document management

### 8. Arbitrage Detection
- Cross-chain price monitoring
- Profit calculation
- Execution instructions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or Web3 wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com))

### 1. Clone & Install
```bash
git clone https://github.com/rohitjadhav07/Defi.git
cd Defi
npm install
```

### 2. Setup Environment Variables

**Backend** (`agent/.env`):
```env
GEMINI_API_KEY=your_gemini_key_here
PORT=3001
```
Get FREE Gemini API key: https://aistudio.google.com/app/apikey

**Frontend** (`frontend/.env`):
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_AGENT_API_URL=http://localhost:3001
```
Get WalletConnect ID: https://cloud.walletconnect.com

### 3. Run the App

**Terminal 1 - Backend**:
```bash
cd agent
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Open http://localhost:3000

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 + TypeScript
- Tailwind CSS
- wagmi + viem (Web3)
- TanStack Query

**Backend:**
- **ADK-TS Framework** (Agent Development Kit)
- Express.js + TypeScript
- ethers.js (Blockchain)
- Google Gemini AI (FREE!)
- CoinGecko API

**Blockchain:**
- Solidity 0.8.20
- Hardhat
- OpenZeppelin
- 3 Smart Contracts (UserProfile, P2PEscrow, ForexPosition)

### ADK-TS Integration

Our `NexusFinanceAI` agent extends the ADK-TS Agent base class:

```typescript
import { Agent } from '@iqai/adk';

export class DeFiAgent extends Agent {
  constructor() {
    super({
      name: 'NexusFinanceAI',
      description: 'AI-powered DeFi portfolio management',
      version: '1.0.0',
    });
  }

  async execute(input: { message: string; context?: any }): Promise<string> {
    // Context-aware AI responses with portfolio data
    // Risk analysis, rebalancing, education
  }
}
```

**Key Capabilities:**
- Portfolio analysis with context
- Risk assessment automation
- Rebalancing suggestions
- Educational content generation
- Multi-chain DeFi expertise

---

## 🔗 On-Chain Features

All critical operations happen **on-chain**:

### Token Transfers
- Uses wagmi's `useSendTransaction` for ETH
- Uses `useWriteContract` for ERC20 tokens
- Real transactions on Sepolia testnet
- Etherscan verification

### Portfolio Tracking
- Direct blockchain queries via ethers.js
- Real-time balance fetching
- Multi-chain support
- Live price data

### Smart Contracts (Ready to Deploy)
1. **UserProfile.sol** - On-chain KYC and reputation
2. **P2PEscrow.sol** - Secure P2P trading
3. **ForexPosition.sol** - Leveraged forex positions

**Deploy contracts:**
```bash
cd blockchain
npm install
echo "PRIVATE_KEY=your_key" > .env
npm run deploy:sepolia
```

---

## 📊 Project Structure

```
nexus-finance/
├── agent/                  # Backend (ADK-TS + Express)
│   ├── src/
│   │   ├── agents/        # ADK-TS agents
│   │   │   └── DeFiAgent.ts
│   │   ├── services/      # Business logic
│   │   └── index.ts       # API routes
│   └── package.json
├── frontend/              # Frontend (Next.js)
│   ├── src/
│   │   ├── app/          # Pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
│   └── package.json
├── blockchain/            # Smart contracts
│   ├── contracts/        # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   └── hardhat.config.js
└── README.md
```

---

## 🎮 Usage

### 1. Connect Wallet
- Click "Connect Wallet" in the header
- Approve MetaMask connection
- Switch to Sepolia testnet

### 2. View Portfolio
- Dashboard shows real on-chain balances
- Multi-chain support (Sepolia, Base, Arbitrum)
- Live USD values from CoinGecko

### 3. Transfer Tokens
- Go to "Token Transfer" tab
- Select token (ETH, USDC, USDT, DAI, WBTC)
- Enter recipient and amount
- Confirm in MetaMask
- View transaction on Etherscan

### 4. Chat with AI
- Ask DeFi questions
- Get portfolio-specific advice
- Learn through 5 educational lessons
- Context-aware responses

### 5. Check Risk Score
- AI analyzes your portfolio
- Risk score (0-100)
- Specific recommendations
- Rebalancing suggestions

---

## 🧪 Testing

### Test Backend
```bash
cd agent
npm run dev

# Test agent status
curl http://localhost:3001/agent/status

# Test chat (PowerShell)
Invoke-RestMethod -Uri "http://localhost:3001/chat" -Method POST -ContentType "application/json" -Body '{"message":"What is DeFi?"}'
```

### Test Frontend
```bash
cd frontend
npm run dev

# Open http://localhost:3000
# Connect wallet
# Try token transfer
```

### Test Smart Contracts
```bash
cd blockchain
npx hardhat test
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway/Render)
```bash
cd agent
npm run build
# Deploy to Railway or Render
```

### Smart Contracts (Sepolia)
```bash
cd blockchain
npm run deploy:sepolia
# Update contract addresses in frontend
```

---

## 🏆 Hackathon Submission

### Track 3: Web3 Use Cases ($1,000)
- ✅ AI agent integrated with blockchain
- ✅ Real on-chain portfolio management
- ✅ Multi-chain DeFi support
- ✅ Wallet assistant via natural language

### Bonus Tracks
- ✅ Most Practical Real-World Use Case ($200)
- ✅ Best Technical Implementation ($200)
- ✅ Best Improvement to ADK-TS ($200)

**Total Potential: $1,600**

---

## 🎯 What Makes This Special

### 1. Real Blockchain Integration
Not mock data - actual on-chain transactions verifiable on Etherscan.

### 2. FREE AI
Google Gemini means no API costs. Truly accessible DeFi.

### 3. ADK-TS Framework
Proper agent implementation with context-aware responses.

### 4. Production Ready
Not a prototype - fully functional platform users can use today.

### 5. Multi-Chain
Seamless experience across 3 different testnets.

### 6. Comprehensive
8 major features in one platform. No need for multiple apps.

---

## 📝 API Endpoints

### Portfolio
- `GET /portfolio/:address` - Get portfolio data
- `GET /risk/:address` - Get risk analysis

### Chat
- `POST /chat` - Chat with ADK-TS agent
- `GET /agent/status` - Agent status

### Transfers
- `POST /transfer/create` - Create transfer
- `POST /transfer/:id/confirm` - Confirm transaction
- `GET /transfer/history/:address` - Transfer history

### P2P
- `GET /p2p/offers` - Get trading offers
- `POST /p2p/trade` - Initiate trade

### Forex
- `GET /forex/pairs` - Get currency pairs
- `POST /forex/trade` - Open position

### Profile
- `GET /profile/:address` - Get user profile
- `POST /profile` - Create profile
- `POST /profile/:address/kyc` - Submit KYC

---

## 🔐 Security

- ✅ ReentrancyGuard on all contracts
- ✅ Input validation
- ✅ Safe math operations
- ✅ OpenZeppelin libraries
- ✅ Wallet signature required for transactions
- ✅ No private keys stored

---

## 🌐 Testnet Information

### Sepolia
- Chain ID: 11155111
- RPC: https://rpc.sepolia.org
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

### Base Sepolia
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org

### Arbitrum Sepolia
- Chain ID: 421614
- RPC: https://sepolia-rollup.arbitrum.io/rpc
- Explorer: https://sepolia.arbiscan.io

---

## 💰 Token Addresses (Sepolia)

```
ETH:  Native
USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
USDT: 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
DAI:  0x68194a729C2450ad26072b3D33ADaCbcef39D574
WBTC: 0x29f2D40B0605204364af54EC677bD022dA425d03
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ADK-TS** - Agent Development Kit framework
- **Google Gemini AI** - FREE AI API
- **CoinGecko** - Price data
- **OpenZeppelin** - Smart contract libraries
- **Ethereum** - Testnet infrastructure

---

## 📞 Contact

- **GitHub**: [Your GitHub]
- **Demo Video**: [Your Video Link]
- **Live Demo**: [Your Deployment Link]

---

## 🎉 Built For

**ADK-TS Hackathon 2025**
- Track 3: Web3 Use Cases
- Bonus Tracks: Practical Use Case, Technical Implementation, ADK-TS Improvement

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Built with ❤️ using ADK-TS Framework

</div>
