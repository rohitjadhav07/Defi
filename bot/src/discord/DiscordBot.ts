import { Client, GatewayIntentBits, Message } from 'discord.js';
import axios from 'axios';

export class DiscordBot {
  private client: Client;
  private agentUrl: string;

  constructor(token: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.agentUrl = process.env.AGENT_API_URL || 'http://localhost:3001';
    this.setupHandlers();
    this.client.login(token);
  }

  private setupHandlers() {
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', async (message: Message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith('!defi')) return;

      const command = message.content.slice(6).trim();
      await this.handleCommand(message, command);
    });
  }

  private async handleCommand(message: Message, command: string) {
    const parts = command.split(' ');
    const action = parts[0];

    try {
      switch (action) {
        case 'portfolio':
          await this.handlePortfolio(message, parts[1]);
          break;
        case 'suggestions':
          await this.handleSuggestions(message, parts[1]);
          break;
        case 'help':
          await this.handleHelp(message);
          break;
        default:
          await message.reply('Unknown command. Use `!defi help` for available commands.');
      }
    } catch (error) {
      console.error('Discord command error:', error);
      await message.reply('An error occurred processing your request.');
    }
  }

  private async handlePortfolio(message: Message, address?: string) {
    if (!address) {
      await message.reply('Please provide a wallet address: `!defi portfolio <address>`');
      return;
    }

    const response = await axios.get(`${this.agentUrl}/portfolio/${address}`);
    const portfolio = response.data;

    const embed = {
      title: '💼 Portfolio Overview',
      color: 0x0099ff,
      fields: [
        { name: 'Total Value', value: `$${portfolio.totalValueUSD.toLocaleString()}`, inline: true },
        { name: '24h Change', value: `${portfolio.pnl24h.toFixed(2)}%`, inline: true },
        { name: 'Assets', value: `${portfolio.balances.length}`, inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  }

  private async handleSuggestions(message: Message, address?: string) {
    if (!address) {
      await message.reply('Please provide a wallet address: `!defi suggestions <address>`');
      return;
    }

    const response = await axios.get(`${this.agentUrl}/suggestions/${address}`);
    const suggestions = response.data;

    if (suggestions.length === 0) {
      await message.reply('No rebalancing suggestions at the moment.');
      return;
    }

    const embed = {
      title: '✨ AI Rebalancing Suggestions',
      color: 0xffaa00,
      fields: suggestions.map((s: any, i: number) => ({
        name: `Suggestion ${i + 1}`,
        value: `${s.reason}\nConfidence: ${(s.confidence * 100).toFixed(0)}%`,
      })),
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  }

  private async handleHelp(message: Message) {
    const helpText = `
**DeFi Portfolio Bot Commands:**

\`!defi portfolio <address>\` - View portfolio overview
\`!defi suggestions <address>\` - Get AI rebalancing suggestions
\`!defi help\` - Show this help message

**Example:**
\`!defi portfolio 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\`
    `;
    await message.reply(helpText);
  }

  async start() {
    // Bot starts automatically in constructor
  }
}
