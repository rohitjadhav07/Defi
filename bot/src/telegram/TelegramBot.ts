import { Telegraf, Context } from 'telegraf';
import axios from 'axios';

export class TelegramBot {
  private bot: Telegraf;
  private agentUrl: string;

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.agentUrl = process.env.AGENT_API_URL || 'http://localhost:3001';
    this.setupHandlers();
  }

  private setupHandlers() {
    this.bot.command('start', (ctx) => {
      ctx.reply(
        'Welcome to DeFi Portfolio Bot! 🚀\n\n' +
        'Commands:\n' +
        '/portfolio <address> - View your portfolio\n' +
        '/suggestions <address> - Get AI suggestions\n' +
        '/help - Show help'
      );
    });

    this.bot.command('help', (ctx) => {
      ctx.reply(
        '**DeFi Portfolio Bot Commands:**\n\n' +
        '/portfolio <address> - View portfolio overview\n' +
        '/suggestions <address> - Get AI rebalancing suggestions\n' +
        '/help - Show this help message\n\n' +
        '**Example:**\n' +
        '/portfolio 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
      );
    });

    this.bot.command('portfolio', async (ctx) => {
      const address = ctx.message.text.split(' ')[1];
      if (!address) {
        ctx.reply('Please provide a wallet address: /portfolio <address>');
        return;
      }

      try {
        const response = await axios.get(`${this.agentUrl}/portfolio/${address}`);
        const portfolio = response.data;

        const message = `
💼 **Portfolio Overview**

💰 Total Value: $${portfolio.totalValueUSD.toLocaleString()}
📈 24h Change: ${portfolio.pnl24h.toFixed(2)}%
🪙 Assets: ${portfolio.balances.length}

${portfolio.balances.map((b: any) => 
  `• ${b.token.symbol}: ${parseFloat(b.balance).toFixed(4)} ($${b.balanceUSD.toFixed(2)})`
).join('\n')}
        `;

        ctx.reply(message);
      } catch (error) {
        console.error('Telegram portfolio error:', error);
        ctx.reply('Error fetching portfolio data.');
      }
    });

    this.bot.command('suggestions', async (ctx) => {
      const address = ctx.message.text.split(' ')[1];
      if (!address) {
        ctx.reply('Please provide a wallet address: /suggestions <address>');
        return;
      }

      try {
        const response = await axios.get(`${this.agentUrl}/suggestions/${address}`);
        const suggestions = response.data;

        if (suggestions.length === 0) {
          ctx.reply('No rebalancing suggestions at the moment.');
          return;
        }

        const message = `
✨ **AI Rebalancing Suggestions**

${suggestions.map((s: any, i: number) => `
${i + 1}. ${s.reason}
   Confidence: ${(s.confidence * 100).toFixed(0)}%
   Actions: ${s.actions.length}
`).join('\n')}
        `;

        ctx.reply(message);
      } catch (error) {
        console.error('Telegram suggestions error:', error);
        ctx.reply('Error fetching suggestions.');
      }
    });
  }

  async start() {
    await this.bot.launch();
    console.log('Telegram bot is running');

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}
