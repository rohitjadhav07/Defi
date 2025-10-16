export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceUSD: number;
  chainId: number;
}

export interface Portfolio {
  totalValueUSD: number;
  balances: TokenBalance[];
  pnl24h: number;
  pnl7d: number;
}

export interface Transaction {
  hash: string;
  type: 'swap' | 'transfer' | 'approve';
  from: string;
  to: string;
  tokenIn?: Token;
  tokenOut?: Token;
  amountIn?: string;
  amountOut?: string;
  timestamp: number;
  chainId: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface RebalanceSuggestion {
  id: string;
  reason: string;
  actions: RebalanceAction[];
  estimatedGas: string;
  confidence: number;
  timestamp: number;
}

export interface RebalanceAction {
  type: 'swap';
  chainId: number;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  expectedAmountOut: string;
}

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  uniswapV3Router: string;
  uniswapV3Factory: string;
}
