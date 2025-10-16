'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import P2PMarketplace from '@/components/P2PMarketplace';
import ForexTrading from '@/components/ForexTrading';
import UserProfile from '@/components/UserProfile';
import TokenTransfer from '@/components/TokenTransfer';
import Header from '@/components/Header';

export default function Home() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'p2p' | 'forex' | 'transfer' | 'profile'>('portfolio');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                DeFi Guardian AI
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">
                Complete Financial Platform: DeFi + P2P + Forex Trading
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500 mt-6">
                <span className="px-3 py-1 bg-gray-800 rounded-full">🛡️ Risk Protection</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">🎓 AI Education</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">💰 Arbitrage</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">👥 P2P Trading</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">📈 Forex</span>
              </div>
            </div>
            <ConnectButton />
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700 overflow-x-auto">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'portfolio'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                🛡️ DeFi Portfolio
              </button>
              <button
                onClick={() => setActiveTab('p2p')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'p2p'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                👥 P2P Marketplace
              </button>
              <button
                onClick={() => setActiveTab('forex')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'forex'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                📈 Forex Trading
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'transfer'
                    ? 'text-pink-400 border-b-2 border-pink-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                💸 Send Tokens
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                👤 My Profile
              </button>
            </div>

            {/* Content */}
            {activeTab === 'portfolio' && <Dashboard />}
            {activeTab === 'p2p' && <P2PMarketplace />}
            {activeTab === 'forex' && <ForexTrading />}
            {activeTab === 'transfer' && <TokenTransfer />}
            {activeTab === 'profile' && <UserProfile />}
          </>
        )}
      </main>
    </div>
  );
}
