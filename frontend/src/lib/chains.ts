import { Chain } from 'wagmi/chains';

export const sepolia: Chain = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.org'] },
    public: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};

export const baseSepolia: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

export const arbitrumSepolia: Chain = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
    public: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  testnet: true,
};

export const supportedChains = [sepolia, baseSepolia, arbitrumSepolia];

export const UNISWAP_V3_ADDRESSES: Record<number, { router: string; factory: string; quoter: string }> = {
  11155111: {
    router: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
    quoter: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
  },
  84532: {
    router: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
    factory: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
    quoter: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27',
  },
  421614: {
    router: '0x101F443B4d1b059569D643917553c771E1b9663E',
    factory: '0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e',
    quoter: '0x2779a0CC1c3e0E44D2542EC3e79e3864Ae93Ef0B',
  },
};
