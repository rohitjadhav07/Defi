'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import { useRebalanceSuggestions } from '@/hooks/useRebalanceSuggestions';

export default function RebalanceSuggestions({ address }: { address?: string }) {
  const { suggestions, isLoading, executeSuggestion } = useRebalanceSuggestions(address);

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-96" />;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        AI Suggestions
      </h2>
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No suggestions at the moment</p>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-300">{suggestion.reason}</p>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {(suggestion.confidence * 100).toFixed(0)}%
                </span>
              </div>
              {suggestion.actions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm bg-gray-800 p-3 rounded">
                  <span className="font-semibold">{action.tokenIn.symbol}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">{action.tokenOut.symbol}</span>
                  <span className="text-gray-400 ml-auto">{parseFloat(action.amountIn).toFixed(4)}</span>
                </div>
              ))}
              <button
                onClick={() => executeSuggestion(suggestion.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                Execute
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
