import { Agent } from '@iqai/adk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * DeFi Guardian AI Agent using ADK-TS Framework
 * 
 * This agent provides AI-powered DeFi portfolio management, risk analysis,
 * and educational guidance using the ADK-TS framework.
 */
export class DeFiAgent extends Agent {
  private genAI: GoogleGenerativeAI;
  private geminiModel: any;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor() {
    super({
      name: 'NexusFinanceAI',
      description: 'AI-powered DeFi portfolio management and risk analysis agent',
    });

    // Initialize Google Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    console.log('✅ Nexus Finance AI Agent initialized with ADK-TS');
  }

  /**
   * Main agent execution method
   * Processes user queries and provides AI-powered responses
   */
  async execute(input: {
    message: string;
    context?: {
      portfolio?: any;
      riskScore?: number;
      userAddress?: string;
    };
  }): Promise<string> {
    try {
      const { message, context } = input;

      // Build context-aware prompt
      let systemPrompt = `You are Nexus Finance AI, an expert DeFi advisor powered by ADK-TS framework.

Your capabilities:
- Portfolio analysis and risk assessment
- DeFi education and guidance
- Smart contract security advice
- Multi-chain DeFi strategies
- Rebalancing recommendations

`;

      // Add portfolio context if available
      if (context?.portfolio) {
        systemPrompt += `\nUser's Portfolio:
- Total Value: $${context.portfolio.totalValueUSD?.toFixed(2) || '0'}
- Assets: ${context.portfolio.balances?.length || 0} tokens
- Risk Score: ${context.riskScore || 'Not calculated'}
`;
      }

      systemPrompt += `\nProvide clear, actionable advice. Be friendly but professional.`;

      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      // Generate response using Gemini
      const chat = this.geminiModel.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I\'m ready to help with DeFi guidance.' }],
          },
          ...this.conversationHistory.slice(-10).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
        ],
      });

      const result = await chat.sendMessage(message);
      const response = result.response.text();

      // Add response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
      });

      return response;
    } catch (error) {
      console.error('DeFi Agent error:', error);
      throw error;
    }
  }

  /**
   * Analyze portfolio risk using AI
   */
  async analyzeRisk(portfolio: any): Promise<{
    score: number;
    factors: string[];
    recommendations: string[];
  }> {
    const prompt = `Analyze this DeFi portfolio and provide risk assessment:

Portfolio Value: $${portfolio.totalValueUSD}
Number of Assets: ${portfolio.balances?.length || 0}
Chains: ${portfolio.balances?.map((b: any) => b.chainId).join(', ')}

Provide:
1. Risk score (0-100)
2. Key risk factors
3. Specific recommendations

Format as JSON.`;

    const result = await this.geminiModel.generateContent(prompt);
    const response = result.response.text();

    try {
      // Parse AI response
      const analysis = JSON.parse(response);
      return {
        score: analysis.score || 50,
        factors: analysis.factors || [],
        recommendations: analysis.recommendations || [],
      };
    } catch {
      // Fallback if parsing fails
      return {
        score: 50,
        factors: ['Unable to parse AI response'],
        recommendations: ['Please try again'],
      };
    }
  }

  /**
   * Generate rebalancing suggestions
   */
  async suggestRebalancing(portfolio: any): Promise<{
    suggestions: Array<{
      action: string;
      token: string;
      amount: string;
      reason: string;
    }>;
  }> {
    const prompt = `Given this portfolio, suggest rebalancing actions:

${JSON.stringify(portfolio, null, 2)}

Provide specific buy/sell suggestions with reasoning.
Format as JSON array of actions.`;

    const result = await this.geminiModel.generateContent(prompt);
    const response = result.response.text();

    try {
      const suggestions = JSON.parse(response);
      return { suggestions };
    } catch {
      return { suggestions: [] };
    }
  }

  /**
   * Educational content generation
   */
  async educate(topic: string): Promise<string> {
    const prompt = `Explain this DeFi concept in simple terms: ${topic}

Include:
- Clear definition
- Real-world example
- Risks to be aware of
- Best practices

Keep it concise and beginner-friendly.`;

    const result = await this.geminiModel.generateContent(prompt);
    return result.response.text();
  }

  /**
   * Reset conversation history
   */
  resetConversation(): void {
    this.conversationHistory = [];
  }

  /**
   * Get agent status
   */
  getStatus(): {
    name: string;
    active: boolean;
    conversationLength: number;
  } {
    return {
      name: 'NexusFinanceAI',
      active: true,
      conversationLength: this.conversationHistory.length,
    };
  }
}
