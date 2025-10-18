'use client';

import { Users, TrendingUp, TrendingDown, Star, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// P2P Escrow contract address (deploy to Sepolia)
const ESCROW_CONTRACT = '0x0000000000000000000000000000000000000000'; // TODO: Deploy and update

// Token addresses on Sepolia
const TOKEN_ADDRESSES: Record<string, string> = {
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  USDT: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8Da470',
  DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
};

// P2P Escrow ABI
const ESCROW_ABI = [
  {
    name: 'createTrade',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'price', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'acceptTrade',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tradeId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'completeTrade',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tradeId', type: 'uint256' }],
    outputs: [],
  },
] as const;

export default function P2PMarketplace() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['p2p-offers', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/p2p/offers${params}`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
    refetchInterval: 10000,
  });

  const handleTrade = async (offer: any) => {
    if (!address) return;
    
    try {
      // Accept trade on-chain via escrow contract
      writeContract({
        address: ESCROW_CONTRACT as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'acceptTrade',
        args: [BigInt(offer.onChainId || 0)],
      });
      
      setSelectedOffer(offer);
    } catch (error) {
      console.error('Trade failed:', error);
    }
  };

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-96" />;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          P2P Marketplace
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'all' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('buy')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'buy' ? 'bg-green-600' : 'bg-gray-700'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setFilter('sell')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'sell' ? 'bg-red-600' : 'bg-gray-700'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {!address && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-400">💡 Connect your wallet to start trading</p>
        </div>
      )}

      <div className="space-y-3">
        {offers.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No offers available</p>
        ) : (
          offers.map((offer: any) => (
            <div key={offer.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {offer.type === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold">
                      {offer.type.toUpperCase()} {offer.token.symbol}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {offer.creator.substring(0, 6)}...{offer.creator.substring(38)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${offer.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">per {offer.token.symbol}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-400 text-xs">Amount</p>
                  <p className="font-semibold">{offer.amount} {offer.token.symbol}</p>
                </div>
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-400 text-xs">Limits</p>
                  <p className="font-semibold text-xs">
                    {offer.minAmount} - {offer.maxAmount}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{offer.reputation}%</span>
                  <span className="text-xs text-gray-400">
                    ({offer.completedTrades} trades)
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {offer.paymentMethods.slice(0, 2).map((method: string) => (
                    <span
                      key={method}
                      className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleTrade(offer)}
                disabled={!address || isPending || isConfirming}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Processing...' : 'Trade with Escrow'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
