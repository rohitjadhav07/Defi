import dotenv from 'dotenv';
import { DiscordBot } from './discord/DiscordBot';
import { TelegramBot } from './telegram/TelegramBot';

dotenv.config();

async function main() {
  console.log('🤖 Starting DeFi Portfolio Bots...');

  // Start Discord bot
  if (process.env.DISCORD_BOT_TOKEN) {
    const discordBot = new DiscordBot(process.env.DISCORD_BOT_TOKEN);
    await discordBot.start();
    console.log('✅ Discord bot started');
  } else {
    console.log('⚠️  Discord bot token not found, skipping Discord bot');
  }

  // Start Telegram bot
  if (process.env.TELEGRAM_BOT_TOKEN) {
    const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    await telegramBot.start();
    console.log('✅ Telegram bot started');
  } else {
    console.log('⚠️  Telegram bot token not found, skipping Telegram bot');
  }

  console.log('🚀 All bots are running!');
}

main().catch(console.error);
