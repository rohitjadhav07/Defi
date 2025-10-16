'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold">DeFi Portfolio Agent</h1>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
