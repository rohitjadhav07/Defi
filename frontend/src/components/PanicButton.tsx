'use client';

import { AlertTriangle, Shield, Zap, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function PanicButton() {
  const { address } = useAccount();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: threats = [] } = useQuery({
    queryKey: ['threats', address],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/panic/threats/${address}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 10000, // Check every 10 seconds
  });

  const executePanicMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/panic/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) throw new Error('Failed to execute panic mode');
      return response.json();
    },
    onSuccess: (data) => {
      setIsExecuting(false);
      setShowConfirm(false);
      alert(`✅ Emergency Exit Complete!\n\n${data.message}\n\nAll assets converted to USDC.`);
    },
    onError: (error) => {
      setIsExecuting(false);
      setShowConfirm(false);
      alert(`❌ Error: ${error.message}\n\nPlease try again or contact support.`);
    },
  });

  const handlePanicClick = () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmPanic = () => {
    setIsExecuting(true);
    executePanicMutation.mutate();
  };

  const threatLevel = threats.length > 0 ? 'high' : 'low';

  return (
    <div className="space-y-6">
      {/* Panic Button */}
      <div className={`rounded-lg p-6 border-2 ${
        threatLevel === 'high'
          ? 'bg-red-900/20 border-red-500 animate-pulse'
          : 'bg-gray-800 border-gray-700'
      }`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className={`w-8 h-8 ${threatLevel === 'high' ? 'text-red-500' : 'text-green-500'}`} />
            <h2 className="text-2xl font-bold">AI Emergency Protection</h2>
          </div>

          {threatLevel === 'high' && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
                <p className="text-red-400 font-bold text-lg">⚠️ THREATS DETECTED</p>
              </div>
              <div className="space-y-2">
                {threats.map((threat: any, i: number) => (
                  <p key={i} className="text-sm text-red-300">
                    • {threat.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-400 mb-6">
            {threatLevel === 'high'
              ? 'AI detected potential risks. Click below to instantly convert all assets to stablecoins.'
              : 'AI is monitoring your portfolio 24/7. No threats detected.'}
          </p>

          {/* Big Panic Button */}
          <button
            onClick={handlePanicClick}
            disabled={!address || isExecuting}
            className={`w-48 h-48 rounded-full mx-auto flex flex-col items-center justify-center transition-all font-bold text-xl ${
              threatLevel === 'high'
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-red-600/50 hover:bg-red-600'
            } ${!address ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <AlertTriangle className="w-16 h-16 mb-2" />
            PANIC
            <span className="text-sm font-normal mt-1">Emergency Exit</span>
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Instantly converts all assets to USDC
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">How AI Protection Works</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold mb-1">24/7 Monitoring</p>
              <p className="text-sm text-gray-400">AI continuously scans for threats: flash crashes, rug pulls, exploits</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold mb-1">Instant Detection</p>
              <p className="text-sm text-gray-400">When danger is detected, you're alerted immediately</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold mb-1">One-Click Exit</p>
              <p className="text-sm text-gray-400">Press panic button to convert all assets to USDC instantly</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">4</span>
            </div>
            <div>
              <p className="font-semibold mb-1">Safe & Secure</p>
              <p className="text-sm text-gray-400">Your funds are protected. You maintain full custody.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Threat History */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Recent Threat Scans</h3>
        <div className="space-y-3">
          {[
            { time: '2 min ago', status: 'safe', message: 'All clear - No threats detected' },
            { time: '12 min ago', status: 'safe', message: 'Portfolio health check passed' },
            { time: '22 min ago', status: 'safe', message: 'Smart contract audit complete' },
          ].map((scan, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900 rounded-lg p-3">
              <div className={`w-2 h-2 rounded-full ${
                scan.status === 'safe' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm">{scan.message}</p>
                <p className="text-xs text-gray-500">{scan.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-red-500">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold mb-2">Confirm Emergency Exit</h3>
              <p className="text-gray-400">
                This will convert ALL your assets to USDC immediately.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-400">
                ⚠️ This action cannot be undone. Make sure you want to exit all positions.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isExecuting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPanic}
                disabled={isExecuting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Execute Panic Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
