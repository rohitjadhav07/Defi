import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DeFiAgent } from './agents/DeFiAgent'; // ADK-TS Agent
import { PortfolioAgent } from './agents/PortfolioAgent';
import { PortfolioService } from './services/PortfolioService';
import { RebalanceService } from './services/RebalanceService';
import { RiskService } from './services/RiskService';
import { EducationService } from './services/EducationService';
import { ArbitrageService } from './services/ArbitrageService';
import { SmartActionsService } from './services/SmartActionsService';
import { P2PService } from './services/P2PService';
import { ForexService } from './services/ForexService';
import { ProfileService } from './services/ProfileService';
import { TransferService } from './services/TransferService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize ADK-TS Agent
const defiAgent = new DeFiAgent();

// Initialize services
const portfolioService = new PortfolioService();
const rebalanceService = new RebalanceService();
const portfolioAgent = new PortfolioAgent();
const riskService = new RiskService();
const educationService = new EducationService();
const arbitrageService = new ArbitrageService();
const smartActionsService = new SmartActionsService();
const p2pService = new P2PService();
const forexService = new ForexService();
const profileService = new ProfileService();
const transferService = new TransferService();

// Get portfolio data
app.get('/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const portfolio = await portfolioService.getPortfolio(address);
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get rebalance suggestions
app.get('/suggestions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const suggestions = await rebalanceService.getSuggestions(address);
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Execute rebalance suggestion
app.post('/execute', async (req, res) => {
  try {
    const { suggestionId, address } = req.body;
    const result = await rebalanceService.executeSuggestion(suggestionId, address);
    res.json(result);
  } catch (error) {
    console.error('Error executing suggestion:', error);
    res.status(500).json({ error: 'Failed to execute suggestion' });
  }
});

// Get transaction history
app.get('/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const transactions = await portfolioService.getTransactions(address);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Chat with ADK-TS agent
app.post('/chat', async (req, res) => {
  try {
    const { message, address } = req.body;
    
    // Get portfolio context for AI
    let context: any = {};
    if (address) {
      try {
        const portfolio = await portfolioService.getPortfolio(address);
        const riskAnalysis = await riskService.analyzePortfolioRisk(portfolio.balances);
        context = {
          portfolio,
          riskScore: riskAnalysis.overallScore,
          userAddress: address,
        };
      } catch (err) {
        console.log('Could not fetch portfolio context:', err);
      }
    }
    
    // Use ADK-TS agent for response
    const response = await defiAgent.execute({ message, context });
    res.json({ response });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

// Get risk analysis for portfolio
app.get('/risk/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const portfolio = await portfolioService.getPortfolio(address);
    const riskAnalysis = await riskService.analyzePortfolioRisk(portfolio.balances);
    res.json(riskAnalysis);
  } catch (error) {
    console.error('Error fetching risk analysis:', error);
    res.status(500).json({ error: 'Failed to analyze risk' });
  }
});

// Get educational lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = educationService.getLessons();
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get specific lesson
app.get('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = educationService.getLesson(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Get achievements
app.get('/achievements', async (req, res) => {
  try {
    const achievements = educationService.getAchievements();
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Scan for arbitrage opportunities
app.get('/arbitrage', async (req, res) => {
  try {
    const opportunities = await arbitrageService.scanForOpportunities();
    res.json(opportunities);
  } catch (error) {
    console.error('Error scanning arbitrage:', error);
    res.status(500).json({ error: 'Failed to scan for opportunities' });
  }
});

// Execute arbitrage
app.post('/arbitrage/execute', async (req, res) => {
  try {
    const { opportunityId } = req.body;
    const result = await arbitrageService.executeArbitrage(opportunityId);
    res.json(result);
  } catch (error) {
    console.error('Error executing arbitrage:', error);
    res.status(500).json({ error: 'Failed to execute arbitrage' });
  }
});

// Get protection rules
app.get('/protection/rules', async (req, res) => {
  try {
    const rules = smartActionsService.getRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch protection rules' });
  }
});

// Get protection actions
app.get('/protection/actions', async (req, res) => {
  try {
    const actions = smartActionsService.getActions();
    res.json(actions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch protection actions' });
  }
});

// Execute protection action
app.post('/protection/execute', async (req, res) => {
  try {
    const { actionId } = req.body;
    const result = await smartActionsService.executeProtectionAction(actionId);
    res.json(result);
  } catch (error) {
    console.error('Error executing protection:', error);
    res.status(500).json({ error: 'Failed to execute protection action' });
  }
});

// P2P Trading endpoints
app.get('/p2p/offers', async (req, res) => {
  try {
    const { type, token, paymentMethod } = req.query;
    const offers = await p2pService.getOffers({
      type: type as any,
      token: token as string,
      paymentMethod: paymentMethod as string,
    });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching P2P offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/p2p/offers', async (req, res) => {
  try {
    const offer = await p2pService.createOffer(req.body);
    res.json(offer);
  } catch (error) {
    console.error('Error creating P2P offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

app.post('/p2p/trade', async (req, res) => {
  try {
    const { offerId, buyer, amount, paymentMethod } = req.body;
    const trade = await p2pService.initiateTrade(offerId, buyer, amount, paymentMethod);
    res.json(trade);
  } catch (error) {
    console.error('Error initiating P2P trade:', error);
    res.status(500).json({ error: 'Failed to initiate trade' });
  }
});

app.get('/p2p/trades/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const trades = await p2pService.getUserTrades(address);
    res.json(trades);
  } catch (error) {
    console.error('Error fetching user trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Forex Trading endpoints
app.get('/forex/pairs', async (req, res) => {
  try {
    const pairs = await forexService.getPairs();
    res.json(pairs);
  } catch (error) {
    console.error('Error fetching forex pairs:', error);
    res.status(500).json({ error: 'Failed to fetch pairs' });
  }
});

app.get('/forex/signals', async (req, res) => {
  try {
    const signals = await forexService.getSignals();
    res.json(signals);
  } catch (error) {
    console.error('Error fetching forex signals:', error);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

app.post('/forex/trade', async (req, res) => {
  try {
    const { pair, type, amount, leverage, stopLoss, takeProfit } = req.body;
    const trade = await forexService.openTrade(pair, type, amount, leverage, stopLoss, takeProfit);
    res.json(trade);
  } catch (error) {
    console.error('Error opening forex trade:', error);
    res.status(500).json({ error: 'Failed to open trade' });
  }
});

app.post('/forex/trade/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await forexService.closeTrade(id);
    res.json(trade);
  } catch (error) {
    console.error('Error closing forex trade:', error);
    res.status(500).json({ error: 'Failed to close trade' });
  }
});

app.get('/forex/trades', async (req, res) => {
  try {
    const { status } = req.query;
    const trades = await forexService.getTrades(status as any);
    res.json(trades);
  } catch (error) {
    console.error('Error fetching forex trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

app.get('/forex/analysis/:pair', async (req, res) => {
  try {
    const { pair } = req.params;
    const analysis = await forexService.getForexAnalysis(pair);
    res.json({ analysis });
  } catch (error) {
    console.error('Error fetching forex analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// User Profile endpoints
app.get('/profile/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const profile = await profileService.getProfile(address);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/profile', async (req, res) => {
  try {
    const { address, username, email, avatarURI } = req.body;
    const profile = await profileService.createProfile(address, username, email, avatarURI);
    res.json(profile);
  } catch (error: any) {
    console.error('Error creating profile:', error);
    res.status(400).json({ error: error.message || 'Failed to create profile' });
  }
});

app.put('/profile/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const updates = req.body;
    const profile = await profileService.updateProfile(address, updates);
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/profile/:address/kyc', async (req, res) => {
  try {
    const { address } = req.params;
    const { documents, country } = req.body;
    await profileService.submitKYC(address, documents, country);
    res.json({ success: true, message: 'KYC submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting KYC:', error);
    res.status(400).json({ error: error.message || 'Failed to submit KYC' });
  }
});

app.post('/profile/:address/verify', async (req, res) => {
  try {
    const { address } = req.params;
    const { level } = req.body;
    await profileService.verifyKYC(address, level);
    res.json({ success: true, message: 'KYC verified successfully' });
  } catch (error) {
    console.error('Error verifying KYC:', error);
    res.status(500).json({ error: 'Failed to verify KYC' });
  }
});

// Token Transfer endpoints
app.post('/transfer/create', async (req, res) => {
  try {
    const { from, to, tokenSymbol, tokenAddress, amount, chainId, memo } = req.body;
    const transfer = await transferService.createTransfer(from, to, tokenSymbol, tokenAddress, amount, chainId, memo);
    res.json(transfer);
  } catch (error: any) {
    console.error('Error creating transfer:', error);
    res.status(400).json({ error: error.message || 'Failed to create transfer' });
  }
});

app.post('/transfer/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await transferService.executeTransfer(id);
    res.json(transfer);
  } catch (error) {
    console.error('Error executing transfer:', error);
    res.status(500).json({ error: 'Failed to execute transfer' });
  }
});

app.post('/transfer/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { txHash } = req.body;
    const transfer = await transferService.confirmTransfer(id, txHash);
    res.json(transfer);
  } catch (error) {
    console.error('Error confirming transfer:', error);
    res.status(500).json({ error: 'Failed to confirm transfer' });
  }
});

app.get('/transfer/history/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const history = await transferService.getTransferHistory(address);
    res.json(history);
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.get('/transfer/addressbook', async (req, res) => {
  try {
    const addressBook = await transferService.getAddressBook();
    res.json(addressBook);
  } catch (error) {
    console.error('Error fetching address book:', error);
    res.status(500).json({ error: 'Failed to fetch address book' });
  }
});

app.post('/transfer/addressbook', async (req, res) => {
  try {
    const { name, address, chainId } = req.body;
    const entry = await transferService.addToAddressBook(name, address, chainId);
    res.json(entry);
  } catch (error: any) {
    console.error('Error adding to address book:', error);
    res.status(400).json({ error: error.message || 'Failed to add address' });
  }
});

app.post('/transfer/validate', async (req, res) => {
  try {
    const { address } = req.body;
    const validation = await transferService.validateAddress(address);
    res.json(validation);
  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({ error: 'Failed to validate address' });
  }
});

// ADK-TS Agent status endpoint
app.get('/agent/status', async (req, res) => {
  try {
    const status = defiAgent.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({ error: 'Failed to get agent status' });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Nexus Finance API running on port ${PORT}`);
  console.log(`✅ ADK-TS Agent Framework initialized`);
  console.log(`✅ Risk Analysis enabled`);
  console.log(`✅ Educational system ready`);
  console.log(`✅ Arbitrage scanner active`);
  console.log(`✅ Smart protection enabled`);
  console.log(`✅ P2P Trading marketplace live`);
  console.log(`✅ Forex Trading platform active (30+ pairs)`);
  console.log(`✅ On-chain User Profiles ready`);
  console.log(`✅ KYC Verification system active`);
  console.log(`✅ Token Transfer system ready`);
  console.log(`✅ Address Book management active`);
});
