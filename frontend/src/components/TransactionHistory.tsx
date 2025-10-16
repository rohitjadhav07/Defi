'use client';

import { History, ExternalLink } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { supportedChains } from '@/lib/chains';
import { formatDistanceToNow } from 'date-fns';

export default function TransactionHistory({ address }: { address?: string }) {
  const { transactions, isLoading } = useTransactions(address);

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-96" />;
  }

  const getExplorerUrl = (chainId: number, hash: string) => {
    const chain = supportedChains.find(c => c.id === chainId);
    return `${chain?.blockExplorers?.default.url}/tx/${hash}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-green-500" />
        Transaction History
      </h2>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx.hash} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold capitalize">{tx.type}</span>
                <a
                  href={getExplorerUrl(tx.chainId, tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {tx.tokenIn && tx.tokenOut && (
                <p className="text-sm text-gray-400 mb-2">
                  {tx.tokenIn.symbol} → {tx.tokenOut.symbol}
                </p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className={getStatusColor(tx.status)}>{tx.status}</span>
                <span className="text-gray-500">
                  {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
