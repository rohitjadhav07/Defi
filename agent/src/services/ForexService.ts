import axios from 'axios';

export interface ForexPair {
  symbol: string; // e.g., "EUR/USD"
  bid: number;
  ask: number;
  spread: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface ForexTrade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
  pnl: number;
  pnlPercentage: number;
  status: 'open' | 'closed';
  openedAt: number;
  closedAt?: number;
}

export interface ForexSignal {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number; // 0-100
  reason: string;
  createdAt: number;
  expiresAt: number;
}

export class ForexService {
  private pairs: Map<string, ForexPair>;
  private trades: Map<string, ForexTrade>;
  private signals: ForexSignal[];
  private priceCache: Map<string, { price: number; timestamp: number }>;

  constructor() {
    this.pairs = new Map();
    this.trades = new Map();
    this.signals = [];
    this.priceCache = new Map();
    this.initializePairs();
    this.generateMockSignals();
  }

  private initializePairs() {
    // Major, Minor, and Exotic forex pairs (Binance-level)
    const majorPairs = [
      // Major Pairs
      { symbol: 'EUR/USD', basePrice: 1.0850, category: 'major' },
      { symbol: 'GBP/USD', basePrice: 1.2650, category: 'major' },
      { symbol: 'USD/JPY', basePrice: 149.50, category: 'major' },
      { symbol: 'USD/CHF', basePrice: 0.8850, category: 'major' },
      { symbol: 'AUD/USD', basePrice: 0.6550, category: 'major' },
      { symbol: 'USD/CAD', basePrice: 1.3650, category: 'major' },
      { symbol: 'NZD/USD', basePrice: 0.6050, category: 'major' },
      
      // Minor Pairs (Cross Pairs)
      { symbol: 'EUR/GBP', basePrice: 0.8580, category: 'minor' },
      { symbol: 'EUR/JPY', basePrice: 162.30, category: 'minor' },
      { symbol: 'GBP/JPY', basePrice: 189.20, category: 'minor' },
      { symbol: 'EUR/AUD', basePrice: 1.6560, category: 'minor' },
      { symbol: 'EUR/CAD', basePrice: 1.4810, category: 'minor' },
      { symbol: 'GBP/AUD', basePrice: 1.9320, category: 'minor' },
      { symbol: 'AUD/JPY', basePrice: 97.90, category: 'minor' },
      { symbol: 'CAD/JPY', basePrice: 109.50, category: 'minor' },
      
      // Exotic Pairs
      { symbol: 'USD/TRY', basePrice: 28.50, category: 'exotic' },
      { symbol: 'USD/ZAR', basePrice: 18.75, category: 'exotic' },
      { symbol: 'USD/MXN', basePrice: 17.20, category: 'exotic' },
      { symbol: 'USD/SGD', basePrice: 1.3450, category: 'exotic' },
      { symbol: 'USD/HKD', basePrice: 7.8250, category: 'exotic' },
      { symbol: 'USD/SEK', basePrice: 10.65, category: 'exotic' },
      { symbol: 'USD/NOK', basePrice: 10.85, category: 'exotic' },
      
      // Crypto Forex Pairs
      { symbol: 'BTC/USD', basePrice: 67500, category: 'crypto' },
      { symbol: 'ETH/USD', basePrice: 4000, category: 'crypto' },
      { symbol: 'BNB/USD', basePrice: 620, category: 'crypto' },
      { symbol: 'SOL/USD', basePrice: 180, category: 'crypto' },
      { symbol: 'XRP/USD', basePrice: 0.65, category: 'crypto' },
    ];

    majorPairs.forEach(({ symbol, basePrice }) => {
      const spread = basePrice * 0.0001; // 1 pip spread
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      
      this.pairs.set(symbol, {
        symbol,
        bid: basePrice * (1 + change),
        ask: basePrice * (1 + change) + spread,
        spread,
        change24h: change * 100,
        high24h: basePrice * (1 + Math.abs(change) + 0.005),
        low24h: basePrice * (1 - Math.abs(change) - 0.005),
        volume24h: Math.random() * 1000000000,
      });
    });
  }

  private generateMockSignals() {
    const pairs = Array.from(this.pairs.keys());
    
    // Generate 3 signals
    for (let i = 0; i < 3; i++) {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const pairData = this.pairs.get(pair)!;
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      
      const entryPrice = type === 'buy' ? pairData.ask : pairData.bid;
      const stopLoss = type === 'buy' 
        ? entryPrice * 0.99 
        : entryPrice * 1.01;
      const takeProfit = type === 'buy'
        ? entryPrice * 1.02
        : entryPrice * 0.98;

      this.signals.push({
        id: `signal-${Date.now()}-${i}`,
        pair,
        type,
        entryPrice,
        stopLoss,
        takeProfit,
        confidence: 70 + Math.floor(Math.random() * 25),
        reason: this.generateSignalReason(pair, type),
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour
      });
    }
  }

  private generateSignalReason(pair: string, type: string): string {
    const reasons = [
      `Strong ${type === 'buy' ? 'bullish' : 'bearish'} momentum on ${pair}`,
      `Technical indicators suggest ${type} opportunity`,
      `Breaking key resistance level - ${type} signal`,
      `RSI oversold - potential ${type} reversal`,
      `Moving average crossover indicates ${type}`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  async getPairs(): Promise<ForexPair[]> {
    // Update prices with small random changes
    this.pairs.forEach((pair, symbol) => {
      const change = (Math.random() - 0.5) * 0.0005; // Small price movement
      pair.bid *= (1 + change);
      pair.ask *= (1 + change);
      pair.spread = pair.ask - pair.bid;
    });

    return Array.from(this.pairs.values());
  }

  async getPair(symbol: string): Promise<ForexPair | undefined> {
    return this.pairs.get(symbol);
  }

  async getPrice(symbol: string): Promise<number> {
    const pair = this.pairs.get(symbol);
    if (!pair) throw new Error('Pair not found');
    
    // Return mid price
    return (pair.bid + pair.ask) / 2;
  }

  async openTrade(
    pair: string,
    type: 'buy' | 'sell',
    amount: number,
    leverage: number = 1,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<ForexTrade> {
    const pairData = this.pairs.get(pair);
    if (!pairData) throw new Error('Pair not found');

    const entryPrice = type === 'buy' ? pairData.ask : pairData.bid;

    const trade: ForexTrade = {
      id: `trade-${Date.now()}`,
      pair,
      type,
      amount,
      entryPrice,
      currentPrice: entryPrice,
      stopLoss,
      takeProfit,
      leverage,
      pnl: 0,
      pnlPercentage: 0,
      status: 'open',
      openedAt: Date.now(),
    };

    this.trades.set(trade.id, trade);
    return trade;
  }

  async closeTrade(tradeId: string): Promise<ForexTrade> {
    const trade = this.trades.get(tradeId);
    if (!trade) throw new Error('Trade not found');
    if (trade.status !== 'open') throw new Error('Trade already closed');

    const pairData = this.pairs.get(trade.pair);
    if (!pairData) throw new Error('Pair not found');

    const exitPrice = trade.type === 'buy' ? pairData.bid : pairData.ask;
    const priceDiff = trade.type === 'buy' 
      ? exitPrice - trade.entryPrice
      : trade.entryPrice - exitPrice;
    
    trade.currentPrice = exitPrice;
    trade.pnl = priceDiff * trade.amount * trade.leverage;
    trade.pnlPercentage = (priceDiff / trade.entryPrice) * 100 * trade.leverage;
    trade.status = 'closed';
    trade.closedAt = Date.now();

    return trade;
  }

  async updateOpenTrades(): Promise<void> {
    for (const trade of this.trades.values()) {
      if (trade.status !== 'open') continue;

      const pairData = this.pairs.get(trade.pair);
      if (!pairData) continue;

      const currentPrice = trade.type === 'buy' ? pairData.bid : pairData.ask;
      const priceDiff = trade.type === 'buy'
        ? currentPrice - trade.entryPrice
        : trade.entryPrice - currentPrice;

      trade.currentPrice = currentPrice;
      trade.pnl = priceDiff * trade.amount * trade.leverage;
      trade.pnlPercentage = (priceDiff / trade.entryPrice) * 100 * trade.leverage;

      // Check stop loss
      if (trade.stopLoss) {
        const hitStopLoss = trade.type === 'buy'
          ? currentPrice <= trade.stopLoss
          : currentPrice >= trade.stopLoss;
        
        if (hitStopLoss) {
          await this.closeTrade(trade.id);
        }
      }

      // Check take profit
      if (trade.takeProfit) {
        const hitTakeProfit = trade.type === 'buy'
          ? currentPrice >= trade.takeProfit
          : currentPrice <= trade.takeProfit;
        
        if (hitTakeProfit) {
          await this.closeTrade(trade.id);
        }
      }
    }
  }

  async getTrades(status?: 'open' | 'closed'): Promise<ForexTrade[]> {
    await this.updateOpenTrades();
    
    let trades = Array.from(this.trades.values());
    if (status) {
      trades = trades.filter(t => t.status === status);
    }
    return trades.sort((a, b) => b.openedAt - a.openedAt);
  }

  async getSignals(): Promise<ForexSignal[]> {
    // Remove expired signals
    this.signals = this.signals.filter(s => Date.now() < s.expiresAt);
    
    // Generate new signals if needed
    if (this.signals.length < 3) {
      this.generateMockSignals();
    }

    return this.signals;
  }

  async executeSignal(signalId: string, amount: number, leverage: number = 1): Promise<ForexTrade> {
    const signal = this.signals.find(s => s.id === signalId);
    if (!signal) throw new Error('Signal not found');

    return this.openTrade(
      signal.pair,
      signal.type,
      amount,
      leverage,
      signal.stopLoss,
      signal.takeProfit
    );
  }

  async getForexAnalysis(pair: string): Promise<string> {
    const pairData = this.pairs.get(pair);
    if (!pairData) return 'Pair not found';

    const trend = pairData.change24h > 0 ? 'bullish' : 'bearish';
    const strength = Math.abs(pairData.change24h) > 0.5 ? 'strong' : 'weak';

    return `${pair} Analysis:
- Current Price: ${pairData.bid.toFixed(4)}
- 24h Change: ${pairData.change24h.toFixed(2)}%
- Trend: ${strength} ${trend}
- Support: ${pairData.low24h.toFixed(4)}
- Resistance: ${pairData.high24h.toFixed(4)}
- Recommendation: ${trend === 'bullish' ? 'Consider buying on dips' : 'Consider selling on rallies'}`;
  }
}
