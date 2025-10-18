import axios from 'axios';

export class PriceService {
  private priceCache: Map<string, { price: number; timestamp: number }>;
  private cacheDuration = 60000; // 1 minute cache
  private forexCache: Map<string, { rate: number; timestamp: number }>;

  constructor() {
    this.priceCache = new Map();
    this.forexCache = new Map();
  }

  async getETHPrice(): Promise<number> {
    const cached = this.priceCache.get('ETH');
    const now = Date.now();

    // Return cached price if still valid
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    try {
      // Use CoinGecko free API (no key required)
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );

      const price = response.data.ethereum.usd;
      this.priceCache.set('ETH', { price, timestamp: now });
      
      console.log(`✅ Fetched ETH price: $${price}`);
      return price;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      
      // Fallback to cached price if available
      if (cached) {
        console.log('Using cached ETH price');
        return cached.price;
      }

      // Ultimate fallback
      console.log('Using fallback ETH price: $3000');
      return 3000;
    }
  }

  async getTokenPrice(tokenSymbol: string): Promise<number> {
    const cached = this.priceCache.get(tokenSymbol);
    const now = Date.now();

    // Return cached price if still valid
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    try {
      // Map token symbols to CoinGecko IDs
      const coinGeckoIds: Record<string, string> = {
        ETH: 'ethereum',
        WETH: 'ethereum',
        USDC: 'usd-coin',
        USDT: 'tether',
        DAI: 'dai',
        WBTC: 'wrapped-bitcoin',
      };

      const coinId = coinGeckoIds[tokenSymbol];
      if (!coinId) {
        console.log(`Unknown token: ${tokenSymbol}, defaulting to $0`);
        return 0;
      }

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );

      const price = response.data[coinId].usd;
      this.priceCache.set(tokenSymbol, { price, timestamp: now });
      
      console.log(`✅ Fetched ${tokenSymbol} price: $${price}`);
      return price;
    } catch (error) {
      console.error(`Error fetching ${tokenSymbol} price:`, error);
      
      // Fallback to cached price if available
      if (cached) {
        console.log(`Using cached ${tokenSymbol} price`);
        return cached.price;
      }

      // Stablecoin fallback
      if (['USDC', 'USDT', 'DAI'].includes(tokenSymbol)) {
        return 1.0;
      }

      // Default fallback
      return 0;
    }
  }

  /**
   * Get real forex rates from ExchangeRate-API (FREE)
   */
  async getForexRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}/${to}`;
    const cached = this.forexCache.get(cacheKey);
    const now = Date.now();

    // Return cached rate if still valid
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.rate;
    }

    try {
      // Use ExchangeRate-API (FREE, no key required)
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${from}`
      );

      const rate = response.data.rates[to];
      if (rate) {
        this.forexCache.set(cacheKey, { rate, timestamp: now });
        console.log(`✅ Fetched ${from}/${to} rate: ${rate}`);
        return rate;
      }

      // Fallback
      return 1.0;
    } catch (error) {
      console.error(`Error fetching ${from}/${to} rate:`, error);
      
      // Return cached if available
      if (cached) {
        return cached.rate;
      }

      // Ultimate fallback
      return 1.0;
    }
  }

  /**
   * Get multiple forex rates at once
   */
  async getForexRates(pairs: Array<{ from: string; to: string }>): Promise<Map<string, number>> {
    const rates = new Map<string, number>();
    
    // Group by base currency to minimize API calls
    const byBase = new Map<string, string[]>();
    pairs.forEach(({ from, to }) => {
      if (!byBase.has(from)) {
        byBase.set(from, []);
      }
      byBase.get(from)!.push(to);
    });

    // Fetch rates for each base currency
    for (const [from, targets] of byBase.entries()) {
      try {
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${from}`
        );

        targets.forEach(to => {
          const rate = response.data.rates[to];
          if (rate) {
            const key = `${from}/${to}`;
            rates.set(key, rate);
            this.forexCache.set(key, { rate, timestamp: Date.now() });
          }
        });
      } catch (error) {
        console.error(`Error fetching rates for ${from}:`, error);
      }
    }

    return rates;
  }
}
