import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ethers } from 'ethers';

const CHAINS = [
  { id: 11155111, name: 'Sepolia', rpc: 'https://rpc.sepolia.org' },
  { id: 84532, name: 'Base Sepolia', rpc: 'https://sepolia.base.org' },
  { id: 421614, name: 'Arbitrum Sepolia', rpc: 'https://sepolia-rollup.arbitrum.io/rpc' },
];

const server = new Server(
  {
    name: 'defi-blockchain-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Get wallet balance across all chains
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'get_multichain_balance',
        description: 'Get wallet balance across Sepolia, Base Sepolia, and Arbitrum Sepolia',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Ethereum wallet address',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'get_token_price',
        description: 'Get current token price from CoinGecko',
        inputSchema: {
          type: 'object',
          properties: {
            tokenId: {
              type: 'string',
              description: 'CoinGecko token ID (e.g., ethereum, uniswap)',
            },
          },
          required: ['tokenId'],
        },
      },
      {
        name: 'get_gas_prices',
        description: 'Get current gas prices for all supported chains',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_multichain_balance') {
    const { address } = args as { address: string };
    const balances = [];

    for (const chain of CHAINS) {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const balance = await provider.getBalance(address);
      balances.push({
        chain: chain.name,
        chainId: chain.id,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(balances, null, 2),
        },
      ],
    };
  }

  if (name === 'get_token_price') {
    const { tokenId } = args as { tokenId: string };
    // Mock implementation - replace with real CoinGecko API
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ tokenId, price: 2000, currency: 'usd' }),
        },
      ],
    };
  }

  if (name === 'get_gas_prices') {
    const gasPrices = [];
    for (const chain of CHAINS) {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const feeData = await provider.getFeeData();
      gasPrices.push({
        chain: chain.name,
        chainId: chain.id,
        gasPrice: ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'),
        maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas || 0n, 'gwei'),
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(gasPrices, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DeFi Blockchain MCP Server running on stdio');
}

main().catch(console.error);
