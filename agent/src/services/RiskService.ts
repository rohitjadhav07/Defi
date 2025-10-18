import { ethers } from 'ethers';
import axios from 'axios';

export interface RiskScore {
  overall: number; // 0-100 (100 = safest)
  factors: {
    contractAge: number;
    liquidity: number;
    holderDistribution: number;
    contractVerified: number;
    ownershipRenounced: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface TokenRisk {
  address: string;
  symbol: string;
  chainId: number;
  riskScore: RiskScore;
  severity: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

export class RiskService {
  private etherscanApiKeys: Record<number, string> = {
    11155111: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken', // Sepolia
    84532: process.env.BASESCAN_API_KEY || 'YourApiKeyToken', // Base Sepolia
    421614: process.env.ARBISCAN_API_KEY || 'YourApiKeyToken', // Arbitrum Sepolia
  };

  async analyzeTokenRisk(
    tokenAddress: string,
    chainId: number,
    provider: ethers.JsonRpcProvider
  ): Promise<TokenRisk> {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const factors = {
      contractAge: 0,
      liquidity: 0,
      holderDistribution: 0,
      contractVerified: 0,
      ownershipRenounced: 0,
    };

    try {
      // 1. Check if it's native ETH (always safe)
      if (tokenAddress === ethers.ZeroAddress) {
        return {
          address: tokenAddress,
          symbol: 'ETH',
          chainId,
          riskScore: {
            overall: 100,
            factors: {
              contractAge: 100,
              liquidity: 100,
              holderDistribution: 100,
              contractVerified: 100,
              ownershipRenounced: 100,
            },
            warnings: [],
            recommendations: ['Native ETH is the safest asset on Ethereum'],
          },
          severity: 'safe',
        };
      }

      // 2. Check contract age
      const contractAge = await this.checkContractAge(tokenAddress, provider);
      factors.contractAge = contractAge;
      if (contractAge < 30) {
        warnings.push(`⚠️ Contract is only ${contractAge} days old - very new!`);
        recommendations.push('Be cautious with new contracts - wait for more history');
      }

      // 3. Check if contract is verified
      const isVerified = await this.checkContractVerified(tokenAddress, chainId);
      factors.contractVerified = isVerified ? 100 : 0;
      if (!isVerified) {
        warnings.push('⚠️ Contract source code is not verified');
        recommendations.push('Avoid unverified contracts - they could be malicious');
      }

      // 4. Check holder distribution
      const holderScore = await this.checkHolderDistribution(tokenAddress, chainId);
      factors.holderDistribution = holderScore;
      if (holderScore < 50) {
        warnings.push('⚠️ Token ownership is highly concentrated');
        recommendations.push('Concentrated ownership = higher rug pull risk');
      }

      // 5. Check liquidity
      const liquidityScore = await this.checkLiquidity(tokenAddress, chainId, provider);
      factors.liquidity = liquidityScore;
      if (liquidityScore < 30) {
        warnings.push('⚠️ Low liquidity - hard to sell without slippage');
        recommendations.push('Add liquidity alerts or avoid low-liquidity tokens');
      }

      // 6. Check ownership (renounced = safer)
      const ownershipScore = await this.checkOwnership(tokenAddress, provider);
      factors.ownershipRenounced = ownershipScore;
      if (ownershipScore < 50) {
        warnings.push('⚠️ Contract owner has control - could change rules');
        recommendations.push('Prefer tokens with renounced ownership');
      }

      // Calculate overall risk score
      const overall = Math.round(
        (factors.contractAge * 0.2 +
          factors.liquidity * 0.25 +
          factors.holderDistribution * 0.2 +
          factors.contractVerified * 0.2 +
          factors.ownershipRenounced * 0.15)
      );

      const severity = this.getSeverity(overall);

      return {
        address: tokenAddress,
        symbol: 'TOKEN',
        chainId,
        riskScore: {
          overall,
          factors,
          warnings,
          recommendations,
        },
        severity,
      };
    } catch (error) {
      console.error('Error analyzing token risk:', error);
      return {
        address: tokenAddress,
        symbol: 'UNKNOWN',
        chainId,
        riskScore: {
          overall: 50,
          factors,
          warnings: ['Unable to fully analyze token risk'],
          recommendations: ['Exercise caution with unknown tokens'],
        },
        severity: 'medium',
      };
    }
  }

  private async checkContractAge(
    address: string,
    provider: ethers.JsonRpcProvider
  ): Promise<number> {
    try {
      const code = await provider.getCode(address);
      if (code === '0x') return 0; // Not a contract

      // Get network info
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Get API key and base URL
      const apiKey = this.etherscanApiKeys[chainId] || 'YourApiKeyToken';
      let baseUrl = 'https://api.etherscan.io/api';
      
      if (chainId === 84532) baseUrl = 'https://api-sepolia.basescan.org/api';
      else if (chainId === 8453) baseUrl = 'https://api.basescan.org/api';
      else if (chainId === 421614) baseUrl = 'https://api-sepolia.arbiscan.io/api';
      
      // Get contract creation info
      const response = await fetch(
        `${baseUrl}?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${apiKey}`
      );
      
      const data: any = await response.json();
      if (data.status === '1' && data.result && data.result[0]) {
        const creationBlock = parseInt(data.result[0].blockNumber);
        const currentBlock = await provider.getBlockNumber();
        const blockDiff = currentBlock - creationBlock;
        
        // Estimate days (assuming ~12 sec per block for Ethereum, ~2 sec for Base)
        const secondsPerBlock = chainId === 8453 || chainId === 84532 ? 2 : 12;
        const days = Math.floor((blockDiff * secondsPerBlock) / 86400);
        return Math.max(days, 1); // At least 1 day
      }
      
      // Fallback: estimate from current block
      return 30;
    } catch (error) {
      console.error('Error checking contract age:', error);
      return 30;
    }
  }

  private async checkContractVerified(
    address: string,
    chainId: number
  ): Promise<boolean> {
    try {
      const apiKey = this.etherscanApiKeys[chainId] || 'YourApiKeyToken';
      let baseUrl = 'https://api.etherscan.io/api';
      
      if (chainId === 84532) baseUrl = 'https://api-sepolia.basescan.org/api';
      else if (chainId === 8453) baseUrl = 'https://api.basescan.org/api';
      else if (chainId === 421614) baseUrl = 'https://api-sepolia.arbiscan.io/api';
      
      const response = await fetch(
        `${baseUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
      );
      
      const data: any = await response.json();
      if (data.status === '1' && data.result && data.result[0]) {
        // Contract is verified if source code exists
        return data.result[0].SourceCode !== '';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking contract verification:', error);
      return false;
    }
  }

  private async checkHolderDistribution(
    address: string,
    chainId: number
  ): Promise<number> {
    try {
      // Use CoinGecko API to get token info (includes holder data for some tokens)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address.toLowerCase()}`
      );
      
      if (response.ok) {
        const data: any = await response.json();
        // If we have market data, token is likely well-distributed
        if (data.market_data && data.market_data.market_cap) {
          return 75; // Good distribution if listed on CoinGecko
        }
      }
      
      // Fallback: assume moderate distribution
      return 50;
    } catch (error) {
      console.error('Error checking holder distribution:', error);
      return 50;
    }
  }

  private async checkLiquidity(
    address: string,
    chainId: number,
    provider: ethers.JsonRpcProvider
  ): Promise<number> {
    try {
      // Check if token has liquidity on CoinGecko
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address.toLowerCase()}`
      );
      
      if (response.ok) {
        const data: any = await response.json();
        if (data.market_data && data.market_data.total_volume) {
          const volume24h = data.market_data.total_volume.usd || 0;
          
          // Score based on 24h volume
          if (volume24h > 1000000) return 100; // >$1M = excellent
          if (volume24h > 100000) return 80;   // >$100K = good
          if (volume24h > 10000) return 60;    // >$10K = moderate
          if (volume24h > 1000) return 40;     // >$1K = low
          return 20; // <$1K = very low
        }
      }
      
      // Fallback: assume moderate liquidity
      return 50;
    } catch (error) {
      console.error('Error checking liquidity:', error);
      return 50;
    }
  }

  private async checkOwnership(
    address: string,
    provider: ethers.JsonRpcProvider
  ): Promise<number> {
    try {
      // Try to call owner() function
      const contract = new ethers.Contract(
        address,
        ['function owner() view returns (address)'],
        provider
      );
      
      try {
        const owner = await contract.owner();
        
        // Check if ownership is renounced (zero address)
        if (owner === ethers.ZeroAddress) {
          return 100; // Ownership renounced = safest
        }
        
        // Has owner = some risk
        return 30;
      } catch {
        // No owner() function = might be safe or might not have standard interface
        return 60;
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
      return 50;
    }
  }

  private getSeverity(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'safe';
    if (score >= 60) return 'low';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'high';
    return 'critical';
  }

  async analyzePortfolioRisk(balances: any[]): Promise<{
    overallScore: number;
    severity: string;
    totalWarnings: number;
    criticalAssets: number;
  }> {
    let totalScore = 0;
    let totalWarnings = 0;
    let criticalAssets = 0;

    for (const balance of balances) {
      // Native ETH is always safe
      if (balance.token.address === ethers.ZeroAddress) {
        totalScore += 100;
      } else {
        // For other tokens, use random score for demo
        const score = Math.floor(Math.random() * 100);
        totalScore += score;
        if (score < 40) {
          totalWarnings++;
          if (score < 20) criticalAssets++;
        }
      }
    }

    const overallScore = balances.length > 0 ? Math.round(totalScore / balances.length) : 100;
    const severity = this.getSeverity(overallScore);

    return {
      overallScore,
      severity,
      totalWarnings,
      criticalAssets,
    };
  }
}
