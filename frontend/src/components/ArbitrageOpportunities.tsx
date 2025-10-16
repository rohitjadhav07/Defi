'use client';

import { TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ArbitrageOpportunities() {
  const queryClient = useQueryClient();

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['arbitrage'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/arbitrage`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const executeMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/arbitrage/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId }),
      });
      if (!response.ok) throw new Error('Failed to execute');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arbitrage'] });
    },
  });

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-64" />;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        Arbitrage Opportunities
      </h2>
      
      {opportunities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Scanning for opportunities...</p>
          <p className="text-sm mt-2">Check back in a few seconds</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.slice(0, 3).map((opp: any) => (
            <div key={opp.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">{opp.tokenSymbol}</span>
                <span className="text-green-500 font-bold">
                  +${opp.netProfitUSD.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <span>{opp.buyChain.name}</span>
                <ArrowRight className="w-4 h-4" />
                <span>{opp.sellChain.name}</span>
                <span className="ml-auto text-blue-400">
                  {opp.profitPercentage.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Gas: ${opp.estimatedGas.toFixed(2)}</span>
                <span>Confidence: {opp.confidence}%</span>
                <span>Expires: {Math.floor((opp.expiresAt - Date.now()) / 1000)}s</span>
              </div>

              {opp.executable ? (
                <button
                  onClick={() => executeMutation.mutate(opp.id)}
                  disabled={executeMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {executeMutation.isPending ? 'Executing...' : 'Execute Now'}
                </button>
              ) : (
                <div className="w-full bg-gray-700 text-gray-400 py-2 rounded-lg text-center text-sm">
                  Not profitable enough
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
