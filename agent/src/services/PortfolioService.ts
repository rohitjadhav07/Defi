import { ethers } from 'ethers';
import { CHAINS } from '../utils/chains';
import { PriceService } from './PriceService';

export class PortfolioService {
  private providers: Map<number, ethers.JsonRpcProvider>;
  private priceService: PriceService;

  constructor() {
    this.providers = new Map();
    this.priceService = new PriceService();
    CHAINS.forEach(chain => {
      this.providers.set(chain.id, new ethers.JsonRpcProvider(chain.rpcUrl));
    });
  }

  async getPortfolio(address: string) {
    const balances = await this.getAllBalances(address);
    const totalValueUSD = balances.reduce((sum, b) => sum + b.balanceUSD, 0);

    return {
      totalValueUSD,
      balances,
      pnl24h: Math.random() * 10 - 5, // Mock data - replace with real calculation
      pnl7d: Math.random() * 20 - 10,
    };
  }

  async getAllBalances(address: string) {
    const balances = [];
    
    // Get real ETH price
    const ethPrice = await this.priceService.getETHPrice();

    for (const chain of CHAINS) {
      const provider = this.providers.get(chain.id)!;
      
      try {
        // Get native token balance
        const nativeBalance = await provider.getBalance(address);
        const nativeBalanceFormatted = ethers.formatEther(nativeBalance);
        
        if (parseFloat(nativeBalanceFormatted) > 0) {
          balances.push({
            token: {
              address: ethers.ZeroAddress,
              symbol: chain.nativeCurrency.symbol,
              name: chain.nativeCurrency.name,
              decimals: 18,
            },
            balance: nativeBalanceFormatted,
            balanceUSD: parseFloat(nativeBalanceFormatted) * ethPrice, // Real ETH price!
            chainId: chain.id,
          });
        }
      } catch (error) {
        console.error(`Error fetching balance for chain ${chain.name}:`, error);
      }

      // Get ERC20 token balances (USDC, USDT, DAI, WBTC)
      const tokens = this.getTokensForChain(chain.id);
      for (const token of tokens) {
        try {
          const tokenContract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
            provider
          );
          
          const balance = await tokenContract.balanceOf(address);
          const decimals = await tokenContract.decimals();
          const balanceFormatted = ethers.formatUnits(balance, decimals);
          
          if (parseFloat(balanceFormatted) > 0) {
            const tokenPrice = await this.priceService.getTokenPrice(token.symbol);
            balances.push({
              token: {
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                decimals: Number(decimals),
              },
              balance: balanceFormatted,
              balanceUSD: parseFloat(balanceFormatted) * tokenPrice,
              chainId: chain.id,
            });
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
        }
      }
    }

    return balances;
  }

  private getTokensForChain(chainId: number) {
    // Token addresses for each testnet
    const tokensByChain: Record<number, Array<{address: string, symbol: string, name: string}>> = {
      11155111: [ // Sepolia
        { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', symbol: 'USDC', name: 'USD Coin' },
        { address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', symbol: 'USDT', name: 'Tether USD' },
        { address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', symbol: 'DAI', name: 'Dai Stablecoin' },
        { address: '0x29f2D40B0605204364af54EC677bD022dA425d03', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
      ],
      84532: [ // Base Sepolia
        { address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', symbol: 'USDC', name: 'USD Coin' },
      ],
      421614: [ // Arbitrum Sepolia
        { address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', symbol: 'USDC', name: 'USD Coin' },
      ],
    };
    
    return tokensByChain[chainId] || [];
  }

  async getTransactions(address: string) {
    // Mock data - replace with real transaction fetching
    return [];
  }
}
