export const CHAINS = [
  {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    uniswapV3Router: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    uniswapV3Factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    uniswapV3Router: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
    uniswapV3Factory: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    uniswapV3Router: '0x101F443B4d1b059569D643917553c771E1b9663E',
    uniswapV3Factory: '0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e',
  },
];
