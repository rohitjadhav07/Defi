'use client';

import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function ForexTrading() {
  const [selectedPair, setSelectedPair] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);

  const { data: pairs = [], isLoading: pairsLoading, isFetching } = useQuery({
    queryKey: ['forex-pairs'],
    queryFn: async () => {
      setIsUpdating(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/forex/pairs`);
      if (!response.ok) throw new Error('Failed to fetch pairs');
      const data = await response.json();
      setTimeout(() => setIsUpdating(false), 500);
      return data;
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Forex Pairs
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            {isUpdating ? 'Updating...' : 'Live'}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {pairs.map((pair: any) => (
            <div
              key={pair.symbol}
              onClick={() => {
                setSelectedPair(pair);
                setShowChartModal(true);
              }}
              className={`bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-850 hover:ring-2 hover:ring-blue-500/50 transition-all ${
                isUpdating ? 'ring-1 ring-green-500/30' : ''
              }`}
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
                <button 
                  onClick={() => {
                    setSelectedSignal(signal);
                    setShowSignalModal(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
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

      {/* Chart Modal */}
      {showChartModal && selectedPair && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedPair.symbol}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-3xl font-bold">{selectedPair.bid.toFixed(4)}</span>
                  <span className={`text-lg font-semibold ${
                    selectedPair.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChartModal(false);
                  setSelectedPair(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Chart */}
            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-4 h-96 relative">
                {/* Candlestick-style chart */}
                <div className="w-full h-full flex items-end justify-between gap-1 px-4">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const basePrice = selectedPair.bid;
                    const volatility = basePrice * 0.002;
                    const open = basePrice + (Math.random() - 0.5) * volatility;
                    const close = basePrice + (Math.random() - 0.5) * volatility;
                    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
                    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
                    const isGreen = close > open;
                    const bodyHeight = Math.abs(close - open) / volatility * 100;
                    const wickTop = (high - Math.max(open, close)) / volatility * 100;
                    const wickBottom = (Math.min(open, close) - low) / volatility * 100;
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        {/* Top wick */}
                        <div 
                          className={`w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ height: `${wickTop}px` }}
                        />
                        {/* Body */}
                        <div 
                          className={`w-full ${isGreen ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                          style={{ height: `${Math.max(bodyHeight, 2)}px` }}
                        />
                        {/* Bottom wick */}
                        <div 
                          className={`w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ height: `${wickBottom}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <div
                      key={percent}
                      className="absolute w-full border-t border-gray-800"
                      style={{ top: `${percent}%` }}
                    />
                  ))}
                </div>

                {/* Time labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500 mt-2">
                  <span>1h ago</span>
                  <span>30m ago</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Bid Price</p>
                  <p className="text-xl font-bold text-green-400">{selectedPair.bid.toFixed(4)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Ask Price</p>
                  <p className="text-xl font-bold text-red-400">{selectedPair.ask.toFixed(4)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">24h High</p>
                  <p className="text-xl font-bold text-green-400">{selectedPair.high24h.toFixed(4)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">24h Low</p>
                  <p className="text-xl font-bold text-red-400">{selectedPair.low24h.toFixed(4)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Spread</p>
                  <p className="text-xl font-bold">{selectedPair.spread.toFixed(4)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">24h Volume</p>
                  <p className="text-xl font-bold">${(selectedPair.volume24h / 1000000).toFixed(2)}M</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">24h Change</p>
                  <p className={`text-xl font-bold ${
                    selectedPair.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p className="text-xl font-bold text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Buy {selectedPair.symbol.split('/')[0]}
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Sell {selectedPair.symbol.split('/')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signal Execution Modal */}
      {showSignalModal && selectedSignal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Execute Trading Signal</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Pair:</span>
                <span className="font-semibold">{selectedSignal.pair}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className={`font-semibold ${
                  selectedSignal.type === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedSignal.type.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry Price:</span>
                <span className="font-semibold">{selectedSignal.entryPrice.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="font-semibold text-red-400">{selectedSignal.stopLoss.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Take Profit:</span>
                <span className="font-semibold text-green-400">{selectedSignal.takeProfit.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className="font-semibold">{selectedSignal.confidence}%</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-400">
                💡 {selectedSignal.reason}
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-400">
                ⚠️ Note: This is a demo signal. Real trading requires smart contract deployment and collateral.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSignalModal(false);
                  setSelectedSignal(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Signal executed for ${selectedSignal.pair}!\n\nNote: Smart contract deployment required for actual execution.`);
                  setShowSignalModal(false);
                  setSelectedSignal(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Execute Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
