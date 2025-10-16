'use client';

import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function ForexTrading() {
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const { data: pairs = [], isLoading: pairsLoading } = useQuery({
    queryKey: ['forex-pairs'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/forex/pairs`);
      if (!response.ok) throw new Error('Failed to fetch pairs');
      return response.json();
    },
    refetchInterval: 5000, // Update every 5 seconds
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['forex-signals'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/forex/signals`);
      if (!response.ok) throw new Error('Failed to fetch signals');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: trades = [] } = useQuery({
    queryKey: ['forex-trades'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/forex/trades?status=open`);
      if (!response.ok) throw new Error('Failed to fetch trades');
      return response.json();
    },
    refetchInterval: 5000,
  });

  if (pairsLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Forex Pairs */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          Forex Pairs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {pairs.map((pair: any) => (
            <div
              key={pair.symbol}
              onClick={() => setSelectedPair(pair.symbol)}
              className="bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-850 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{pair.symbol}</span>
                {pair.change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-lg font-bold">{pair.bid.toFixed(4)}</p>
              <p className={`text-xs ${pair.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Signals */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Trading Signals
        </h2>
        <div className="space-y-3">
          {signals.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No signals available</p>
          ) : (
            signals.map((signal: any) => (
              <div key={signal.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {signal.type === 'buy' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-semibold">{signal.pair}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      signal.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {signal.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    {signal.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{signal.reason}</p>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="bg-gray-800 rounded p-2">
                    <p className="text-gray-400">Entry</p>
                    <p className="font-semibold">{signal.entryPrice.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-800 rounded p-2">
                    <p className="text-gray-400">Stop Loss</p>
                    <p className="font-semibold text-red-400">{signal.stopLoss.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-800 rounded p-2">
                    <p className="text-gray-400">Take Profit</p>
                    <p className="font-semibold text-green-400">{signal.takeProfit.toFixed(4)}</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                  Execute Signal
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Open Trades */}
      {trades.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Open Positions</h2>
          <div className="space-y-3">
            {trades.map((trade: any) => (
              <div key={trade.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{trade.pair}</span>
                  <span className={`text-lg font-bold ${
                    trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      {trade.type.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Entry</p>
                    <p>{trade.entryPrice.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current</p>
                    <p>{trade.currentPrice.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Leverage</p>
                    <p>{trade.leverage}x</p>
                  </div>
                </div>
                <button className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                  Close Position
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
