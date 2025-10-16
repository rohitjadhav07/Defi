export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  badge?: string;
  completed?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: number;
}

export class EducationService {
  private lessons: Lesson[] = [
    {
      id: 'risk-basics',
      title: 'Understanding DeFi Risks',
      description: 'Learn about the main risks in DeFi and how to protect yourself',
      content: `# Understanding DeFi Risks

## What You'll Learn:
1. Smart contract risks
2. Rug pull warning signs
3. Impermanent loss
4. Gas optimization

## Key Takeaways:
- Always verify contracts before interacting
- Never approve unlimited token amounts
- Diversify across multiple protocols
- Use hardware wallets for large amounts`,
      difficulty: 'beginner',
      estimatedTime: 5,
      badge: '🛡️ Risk Detective',
    },
    {
      id: 'impermanent-loss',
      title: 'Impermanent Loss Explained',
      description: 'Master the concept of impermanent loss in liquidity pools',
      content: `# Impermanent Loss

## What is it?
When you provide liquidity to a pool, price changes can result in having less value than if you just held the tokens.

## Example:
- You deposit 1 ETH + 4000 USDC (total $8000)
- ETH price doubles to $8000
- Your share is now 0.707 ETH + 5656 USDC = $11,312
- If you held: 1 ETH + 4000 USDC = $12,000
- Impermanent loss: $688 (5.7%)

## How to minimize:
- Choose stable pairs (USDC/USDT)
- Use concentrated liquidity
- Monitor price ranges`,
      difficulty: 'intermediate',
      estimatedTime: 10,
      badge: '💧 Liquidity Master',
    },
    {
      id: 'arbitrage-basics',
      title: 'Arbitrage Opportunities',
      description: 'Learn how to spot and execute profitable arbitrage trades',
      content: `# Arbitrage in DeFi

## What is Arbitrage?
Buying an asset on one exchange and selling it on another for profit.

## Types:
1. **Cross-DEX**: Same chain, different DEXes
2. **Cross-Chain**: Different chains, same token
3. **Triangular**: Three-way trades on same DEX

## Key Factors:
- Gas costs (can eat all profit!)
- Slippage (price impact)
- Speed (MEV bots are fast)
- Liquidity (can you execute?)

## Pro Tips:
- Calculate net profit AFTER gas
- Use flashbots for MEV protection
- Start small to test`,
      difficulty: 'advanced',
      estimatedTime: 15,
      badge: '🎯 Arbitrage Hunter',
    },
    {
      id: 'contract-analysis',
      title: 'Smart Contract Red Flags',
      description: 'Identify dangerous smart contracts before it\'s too late',
      content: `# Smart Contract Red Flags

## 🚩 Major Red Flags:
1. **Unverified source code** - Can't see what it does
2. **Unlimited approvals** - Can drain your wallet
3. **Centralized ownership** - Owner can change rules
4. **No liquidity lock** - Can rug pull anytime
5. **Honeypot functions** - Can buy but not sell

## ✅ Green Flags:
1. Verified and audited code
2. Renounced ownership
3. Locked liquidity
4. Time-locked admin functions
5. Multiple audits from reputable firms

## Tools to Use:
- Etherscan verification
- Token Sniffer
- Honeypot detector
- Audit reports`,
      difficulty: 'intermediate',
      estimatedTime: 12,
      badge: '🔍 Contract Auditor',
    },
    {
      id: 'gas-optimization',
      title: 'Gas Optimization Strategies',
      description: 'Save money on every transaction with these tips',
      content: `# Gas Optimization

## When to Trade:
- **Best times**: Weekends, late night UTC
- **Worst times**: Weekdays 2-6pm UTC
- **Check**: etherscan.io/gastracker

## Optimization Tips:
1. **Batch transactions** - Do multiple at once
2. **Use L2s** - 10-100x cheaper
3. **Set gas limits** - Don't overpay
4. **Approve once** - But not unlimited!
5. **Use aggregators** - Find best routes

## L2 Options:
- Arbitrum: ~$0.10 per tx
- Optimism: ~$0.15 per tx
- Base: ~$0.05 per tx
- zkSync: ~$0.20 per tx

## Pro Tip:
Use Flashbots to avoid MEV and save gas!`,
      difficulty: 'beginner',
      estimatedTime: 8,
      badge: '⛽ Gas Saver',
    },
  ];

  private achievements: Achievement[] = [
    {
      id: 'first-risk-check',
      name: 'First Risk Check',
      description: 'Analyzed your first token risk',
      icon: '🛡️',
      earned: false,
    },
    {
      id: 'lesson-complete',
      name: 'Knowledge Seeker',
      description: 'Completed your first lesson',
      icon: '📚',
      earned: false,
    },
    {
      id: 'arbitrage-found',
      name: 'Opportunity Spotter',
      description: 'Found your first arbitrage opportunity',
      icon: '🎯',
      earned: false,
    },
    {
      id: 'protection-activated',
      name: 'Guardian Angel',
      description: 'Activated automatic protection',
      icon: '👼',
      earned: false,
    },
    {
      id: 'all-lessons',
      name: 'DeFi Master',
      description: 'Completed all lessons',
      icon: '🏆',
      earned: false,
    },
  ];

  getLessons(): Lesson[] {
    return this.lessons;
  }

  getLesson(id: string): Lesson | undefined {
    return this.lessons.find(l => l.id === id);
  }

  getLessonsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Lesson[] {
    return this.lessons.filter(l => l.difficulty === difficulty);
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  earnAchievement(id: string): Achievement | undefined {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.earned) {
      achievement.earned = true;
      achievement.earnedAt = Date.now();
      return achievement;
    }
    return undefined;
  }

  getRelevantLesson(context: string): Lesson | undefined {
    // Return relevant lesson based on context
    if (context.includes('risk') || context.includes('dangerous')) {
      return this.getLesson('risk-basics');
    }
    if (context.includes('liquidity') || context.includes('pool')) {
      return this.getLesson('impermanent-loss');
    }
    if (context.includes('arbitrage') || context.includes('profit')) {
      return this.getLesson('arbitrage-basics');
    }
    if (context.includes('contract') || context.includes('scam')) {
      return this.getLesson('contract-analysis');
    }
    if (context.includes('gas') || context.includes('expensive')) {
      return this.getLesson('gas-optimization');
    }
    return this.lessons[0]; // Default to risk basics
  }

  generateEducationalResponse(topic: string): string {
    const lesson = this.getRelevantLesson(topic);
    if (!lesson) return '';

    return `📚 **Educational Moment**: ${lesson.title}

${lesson.description}

This is a ${lesson.difficulty} level topic that takes about ${lesson.estimatedTime} minutes to learn.

Would you like me to explain more about this? I can help you understand:
${lesson.content.split('\n').slice(0, 5).join('\n')}

Complete this lesson to earn the "${lesson.badge}" badge! 🎓`;
  }
}
