import { ethers } from 'ethers';

export interface ProtectionAction {
  id: string;
  type: 'move_funds' | 'revoke_approval' | 'stop_loss' | 'alert';
  reason: string;
  asset: {
    symbol: string;
    address: string;
    amount: string;
  };
  from: {
    chainId: number;
    location: string;
  };
  to?: {
    chainId: number;
    location: string;
  };
  status: 'pending' | 'executed' | 'failed';
  executedAt?: number;
  txHash?: string;
}

export interface AutoProtectionRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'risk_score' | 'price_drop' | 'suspicious_activity' | 'low_liquidity';
    threshold: number;
  };
  action: {
    type: 'move_funds' | 'revoke_approval' | 'alert';
    destination?: string;
  };
}

export class SmartActionsService {
  private actions: Map<string, ProtectionAction>;
  private rules: AutoProtectionRule[];

  constructor() {
    this.actions = new Map();
    this.rules = this.getDefaultRules();
  }

  private getDefaultRules(): AutoProtectionRule[] {
    return [
      {
        id: 'critical-risk',
        name: 'Critical Risk Protection',
        enabled: true,
        trigger: {
          type: 'risk_score',
          threshold: 20, // Risk score below 20
        },
        action: {
          type: 'move_funds',
          destination: 'safe_wallet',
        },
      },
      {
        id: 'price-crash',
        name: 'Price Crash Protection',
        enabled: true,
        trigger: {
          type: 'price_drop',
          threshold: 15, // 15% drop
        },
        action: {
          type: 'move_funds',
          destination: 'stablecoin',
        },
      },
      {
        id: 'suspicious-contract',
        name: 'Suspicious Contract Alert',
        enabled: true,
        trigger: {
          type: 'suspicious_activity',
          threshold: 80, // 80% confidence
        },
        action: {
          type: 'alert',
        },
      },
      {
        id: 'low-liquidity',
        name: 'Low Liquidity Warning',
        enabled: true,
        trigger: {
          type: 'low_liquidity',
          threshold: 30, // Liquidity score below 30
        },
        action: {
          type: 'alert',
        },
      },
    ];
  }

  async evaluateProtection(
    riskScore: number,
    tokenAddress: string,
    tokenSymbol: string,
    amount: string,
    chainId: number
  ): Promise<ProtectionAction | null> {
    // Check if any rules are triggered
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      let triggered = false;

      switch (rule.trigger.type) {
        case 'risk_score':
          triggered = riskScore < rule.trigger.threshold;
          break;
        case 'price_drop':
          // In production: check actual price drops
          triggered = false;
          break;
        case 'suspicious_activity':
          // In production: check for suspicious patterns
          triggered = riskScore < 30;
          break;
        case 'low_liquidity':
          // In production: check actual liquidity
          triggered = false;
          break;
      }

      if (triggered) {
        const action = await this.createProtectionAction(
          rule,
          tokenAddress,
          tokenSymbol,
          amount,
          chainId
        );
        return action;
      }
    }

    return null;
  }

  private async createProtectionAction(
    rule: AutoProtectionRule,
    tokenAddress: string,
    tokenSymbol: string,
    amount: string,
    chainId: number
  ): Promise<ProtectionAction> {
    const action: ProtectionAction = {
      id: `action-${Date.now()}`,
      type: rule.action.type as any,
      reason: `${rule.name} triggered`,
      asset: {
        symbol: tokenSymbol,
        address: tokenAddress,
        amount,
      },
      from: {
        chainId,
        location: 'current_wallet',
      },
      status: 'pending',
    };

    if (rule.action.type === 'move_funds') {
      action.to = {
        chainId,
        location: rule.action.destination || 'safe_wallet',
      };
    }

    this.actions.set(action.id, action);
    return action;
  }

  async executeProtectionAction(actionId: string): Promise<{
    success: boolean;
    message: string;
    txHash?: string;
  }> {
    const action = this.actions.get(actionId);

    if (!action) {
      return {
        success: false,
        message: 'Action not found',
      };
    }

    if (action.status !== 'pending') {
      return {
        success: false,
        message: 'Action already executed or failed',
      };
    }

    try {
      // In production: Execute actual blockchain transactions
      switch (action.type) {
        case 'move_funds':
          // Move funds to safe location
          break;
        case 'revoke_approval':
          // Revoke token approval
          break;
        case 'stop_loss':
          // Execute stop loss trade
          break;
        case 'alert':
          // Send alert (already done)
          break;
      }

      // For demo: simulate success
      action.status = 'executed';
      action.executedAt = Date.now();
      action.txHash = '0x' + Math.random().toString(16).substring(2, 66);

      return {
        success: true,
        message: `Protection action executed: ${action.reason}`,
        txHash: action.txHash,
      };
    } catch (error) {
      console.error('Error executing protection action:', error);
      action.status = 'failed';
      return {
        success: false,
        message: 'Failed to execute protection action',
      };
    }
  }

  getActions(): ProtectionAction[] {
    return Array.from(this.actions.values());
  }

  getRules(): AutoProtectionRule[] {
    return this.rules;
  }

  updateRule(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  async suggestProtectionActions(riskScore: number): Promise<string[]> {
    const suggestions: string[] = [];

    if (riskScore < 20) {
      suggestions.push('🚨 CRITICAL: Immediately move funds to a safe wallet');
      suggestions.push('🔒 Revoke all token approvals for this contract');
      suggestions.push('📢 Report this contract to the community');
    } else if (riskScore < 40) {
      suggestions.push('⚠️ HIGH RISK: Consider moving funds to safer assets');
      suggestions.push('🔍 Monitor this position closely');
      suggestions.push('📉 Set up stop-loss protection');
    } else if (riskScore < 60) {
      suggestions.push('⚡ MEDIUM RISK: Reduce position size');
      suggestions.push('🎯 Diversify into other assets');
      suggestions.push('📊 Enable automatic alerts');
    } else if (riskScore < 80) {
      suggestions.push('✅ LOW RISK: Position looks relatively safe');
      suggestions.push('👀 Continue monitoring');
      suggestions.push('📈 Consider taking some profits');
    } else {
      suggestions.push('🎉 SAFE: This is a low-risk position');
      suggestions.push('💎 Hold with confidence');
      suggestions.push('📚 Learn about yield opportunities');
    }

    return suggestions;
  }
}
