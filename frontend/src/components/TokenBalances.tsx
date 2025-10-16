'use client';

import { Coins } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { supportedChains } from '@/lib/chains';

export default function TokenBalances({ address }: { address?: string }) {
  const { portfolio, isLoading } = usePortfolio(address);

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-64" />;
  }

  const getChainName = (chainId: number) => {
    return supportedChains.find(c => c.id === chainId)?.name || 'Unknown';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Coins className="w-5 h-5 text-purple-500" />
        Token Balances
      </h2>
      <div className="space-y-3">
        {portfolio?.balances.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tokens found</p>
        ) : (
          portfolio?.balances.map((balance, idx) => (
            <div key={idx} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {balance.token.symbol.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{balance.token.symbol}</p>
                  <p className="text-sm text-gray-400">{getChainName(balance.chainId)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{parseFloat(balance.balance).toFixed(4)}</p>
                <p className="text-sm text-gray-400">${balance.balanceUSD.toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
