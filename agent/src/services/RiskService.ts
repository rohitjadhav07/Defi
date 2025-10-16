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
      // Get contract creation transaction (simplified)
      const code = await provider.getCode(address);
      if (code === '0x') return 0; // Not a contract

      // For demo: return random age between 1-365 days
      // In production: query block explorer API for creation date
      return Math.floor(Math.random() * 365) + 1;
    } catch {
      return 0;
    }
  }

  private async checkContractVerified(
    address: string,
    chainId: number
  ): Promise<boolean> {
    try {
      // For demo: 70% chance verified
      // In production: query Etherscan/Basescan API
      return Math.random() > 0.3;
    } catch {
      return false;
    }
  }

  private async checkHolderDistribution(
    address: string,
    chainId: number
  ): Promise<number> {
    try {
      // For demo: return score 0-100
      // In production: analyze top holder percentages
      // Score = 100 if well distributed, 0 if concentrated
      return Math.floor(Math.random() * 100);
    } catch {
      return 50;
    }
  }

  private async checkLiquidity(
    address: string,
    chainId: number,
    provider: ethers.JsonRpcProvider
  ): Promise<number> {
    try {
      // For demo: return score 0-100
      // In production: check DEX liquidity pools
      return Math.floor(Math.random() * 100);
    } catch {
      return 50;
    }
  }

  private async checkOwnership(
    address: string,
    provider: ethers.JsonRpcProvider
  ): Promise<number> {
    try {
      // For demo: 50% chance ownership renounced
      // In production: check owner() function and if it's zero address
      return Math.random() > 0.5 ? 100 : 30;
    } catch {
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
