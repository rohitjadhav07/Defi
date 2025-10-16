'use client';

import { useAccount } from 'wagmi';
import RiskScore from './RiskScore';
import PortfolioOverview from './PortfolioOverview';
import TokenBalances from './TokenBalances';
import ArbitrageOpportunities from './ArbitrageOpportunities';
import LessonsPanel from './LessonsPanel';
import RebalanceSuggestions from './RebalanceSuggestions';
import TransactionHistory from './TransactionHistory';
import AgentChat from './AgentChat';

export default function Dashboard() {
  const { address } = useAccount();

  return (
    <div className="space-y-6">
      {/* Risk Score Banner */}
      <RiskScore address={address} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Portfolio & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <PortfolioOverview address={address} />
          <TokenBalances address={address} />
          <TransactionHistory address={address} />
        </div>

        {/* Right Column - Opportunities & Education */}
        <div className="space-y-6">
          <ArbitrageOpportunities />
          <RebalanceSuggestions address={address} />
          <LessonsPanel />
          <AgentChat address={address} />
        </div>
      </div>
    </div>
  );
}
