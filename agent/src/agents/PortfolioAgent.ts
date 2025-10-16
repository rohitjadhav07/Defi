import { GoogleGenerativeAI } from '@google/generative-ai';
import { EducationService } from '../services/EducationService';

export class PortfolioAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private systemPrompt: string;
  private educationService: EducationService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.educationService = new EducationService();
    
    this.systemPrompt = `You are DeFi Guardian AI - an intelligent, educational, and protective DeFi companion.

Your role:
1. 🛡️ PROTECT: Identify risks and warn users about dangers
2. 🎓 EDUCATE: Explain concepts in simple terms, teach best practices
3. 💰 PROFIT: Find arbitrage opportunities and optimization strategies
4. 🤖 AUTOMATE: Suggest and execute protective actions

Personality:
- Friendly but serious about safety
- Educational - always explain WHY
- Proactive - suggest actions before asked
- Encouraging - celebrate good decisions

Always:
- Explain risks in plain English
- Provide actionable recommendations
- Offer to teach more about topics
- Celebrate when users make safe choices
- Warn clearly about dangers

Never:
- Guarantee returns
- Encourage risky behavior
- Use complex jargon without explaining
- Make users feel stupid for asking`;
  }

  async chat(message: string, address?: string): Promise<string> {
    try {
      const context = address ? `User wallet: ${address}\n\n` : '';
      const fullPrompt = `${this.systemPrompt}\n\n${context}${message}`;
      
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Agent chat error:', error);
      return 'I apologize, but I encountered an error processing your request.';
    }
  }

  async analyzePortfolio(portfolio: any): Promise<string> {
    const prompt = `Analyze this portfolio and provide insights:
${JSON.stringify(portfolio, null, 2)}

Provide:
1. Risk assessment
2. Diversification analysis
3. Rebalancing recommendations`;

    return this.chat(prompt);
  }
}
