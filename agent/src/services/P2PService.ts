import { ethers } from 'ethers';

export interface P2POffer {
  id: string;
  type: 'buy' | 'sell';
  creator: string;
  token: {
    symbol: string;
    address: string;
    chainId: number;
  };
  amount: string;
  price: number; // Price per token in USD
  paymentMethods: string[];
  minAmount?: string;
  maxAmount?: string;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  expiresAt: number;
  reputation: number; // 0-100
  completedTrades: number;
}

export interface P2PTrade {
  id: string;
  offerId: string;
  buyer: string;
  seller: string;
  amount: string;
  totalPrice: number;
  paymentMethod: string;
  status: 'pending' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled';
  escrowAddress?: string;
  createdAt: number;
  updatedAt: number;
  messages: P2PMessage[];
}

export interface P2PMessage {
  from: string;
  message: string;
  timestamp: number;
}

export class P2PService {
  private offers: Map<string, P2POffer>;
  private trades: Map<string, P2PTrade>;

  constructor() {
    this.offers = new Map();
    this.trades = new Map();
    this.initializeMockOffers();
  }

  private initializeMockOffers() {
    // Create some mock offers for demo
    const mockOffers: P2POffer[] = [
      {
        id: 'offer-1',
        type: 'sell',
        creator: '0x1234...5678',
        token: {
          symbol: 'ETH',
          address: ethers.ZeroAddress,
          chainId: 11155111,
        },
        amount: '1.0',
        price: 4000,
        paymentMethods: ['Bank Transfer', 'PayPal', 'Wise'],
        minAmount: '0.1',
        maxAmount: '1.0',
        status: 'active',
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() + 86400000,
        reputation: 95,
        completedTrades: 47,
      },
      {
        id: 'offer-2',
        type: 'buy',
        creator: '0xabcd...efgh',
        token: {
          symbol: 'ETH',
          address: ethers.ZeroAddress,
          chainId: 11155111,
        },
        amount: '2.0',
        price: 3980,
        paymentMethods: ['Bank Transfer', 'Revolut'],
        minAmount: '0.5',
        maxAmount: '2.0',
        status: 'active',
        createdAt: Date.now() - 7200000,
        expiresAt: Date.now() + 86400000,
        reputation: 88,
        completedTrades: 23,
      },
      {
        id: 'offer-3',
        type: 'sell',
        creator: '0x9876...4321',
        token: {
          symbol: 'USDC',
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          chainId: 11155111,
        },
        amount: '5000',
        price: 1.0,
        paymentMethods: ['Bank Transfer', 'Zelle', 'Venmo'],
        minAmount: '100',
        maxAmount: '5000',
        status: 'active',
        createdAt: Date.now() - 1800000,
        expiresAt: Date.now() + 86400000,
        reputation: 92,
        completedTrades: 156,
      },
    ];

    mockOffers.forEach(offer => this.offers.set(offer.id, offer));
  }

  async getOffers(filters?: {
    type?: 'buy' | 'sell';
    token?: string;
    paymentMethod?: string;
  }): Promise<P2POffer[]> {
    let offers = Array.from(this.offers.values());

    // Filter active offers
    offers = offers.filter(o => o.status === 'active' && Date.now() < o.expiresAt);

    // Apply filters
    if (filters?.type) {
      offers = offers.filter(o => o.type === filters.type);
    }
    if (filters?.token) {
      offers = offers.filter(o => o.token.symbol === filters.token);
    }
    if (filters?.paymentMethod) {
      offers = offers.filter(o => o.paymentMethods.includes(filters.paymentMethod!));
    }

    // Sort by reputation
    offers.sort((a, b) => b.reputation - a.reputation);

    return offers;
  }

  async createOffer(offer: Omit<P2POffer, 'id' | 'status' | 'createdAt' | 'expiresAt'>): Promise<P2POffer> {
    const newOffer: P2POffer = {
      ...offer,
      id: `offer-${Date.now()}`,
      status: 'active',
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000, // 24 hours
    };

    this.offers.set(newOffer.id, newOffer);
    return newOffer;
  }

  async initiateTrade(
    offerId: string,
    buyer: string,
    amount: string,
    paymentMethod: string
  ): Promise<P2PTrade> {
    const offer = this.offers.get(offerId);
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'active') throw new Error('Offer not active');

    const trade: P2PTrade = {
      id: `trade-${Date.now()}`,
      offerId,
      buyer,
      seller: offer.creator,
      amount,
      totalPrice: parseFloat(amount) * offer.price,
      paymentMethod,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    this.trades.set(trade.id, trade);
    offer.status = 'in_progress';

    return trade;
  }

  async updateTradeStatus(
    tradeId: string,
    status: P2PTrade['status'],
    message?: string
  ): Promise<P2PTrade> {
    const trade = this.trades.get(tradeId);
    if (!trade) throw new Error('Trade not found');

    trade.status = status;
    trade.updatedAt = Date.now();

    if (message) {
      trade.messages.push({
        from: 'system',
        message,
        timestamp: Date.now(),
      });
    }

    // If completed, update offer status
    if (status === 'completed') {
      const offer = this.offers.get(trade.offerId);
      if (offer) {
        offer.status = 'completed';
        offer.completedTrades++;
      }
    }

    return trade;
  }

  async sendMessage(tradeId: string, from: string, message: string): Promise<void> {
    const trade = this.trades.get(tradeId);
    if (!trade) throw new Error('Trade not found');

    trade.messages.push({
      from,
      message,
      timestamp: Date.now(),
    });
  }

  async getTrade(tradeId: string): Promise<P2PTrade | undefined> {
    return this.trades.get(tradeId);
  }

  async getUserTrades(address: string): Promise<P2PTrade[]> {
    return Array.from(this.trades.values()).filter(
      t => t.buyer === address || t.seller === address
    );
  }

  async createEscrow(tradeId: string): Promise<string> {
    // In production: Deploy escrow smart contract
    // For demo: return mock address
    const escrowAddress = '0x' + Math.random().toString(16).substring(2, 42);
    
    const trade = this.trades.get(tradeId);
    if (trade) {
      trade.escrowAddress = escrowAddress;
    }

    return escrowAddress;
  }

  async releaseEscrow(tradeId: string): Promise<string> {
    // In production: Release funds from escrow contract
    // For demo: return mock tx hash
    return '0x' + Math.random().toString(16).substring(2, 66);
  }
}
