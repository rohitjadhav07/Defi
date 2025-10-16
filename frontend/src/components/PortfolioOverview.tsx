'use client';

import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

export default function PortfolioOverview({ address }: { address?: string }) {
  const { portfolio, isLoading } = usePortfolio(address);

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-48" />;
  }

  const pnl24hPositive = (portfolio?.pnl24h || 0) >= 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-blue-500" />
        Portfolio Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Value</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">
            ${portfolio?.totalValueUSD.toLocaleString() || '0.00'}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">24h Change</span>
            {pnl24hPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${pnl24hPositive ? 'text-green-500' : 'text-red-500'}`}>
            {pnl24hPositive ? '+' : ''}
            {portfolio?.pnl24h.toFixed(2) || '0.00'}%
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Assets</span>
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{portfolio?.balances.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
