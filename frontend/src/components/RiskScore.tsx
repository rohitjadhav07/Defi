'use client';

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function RiskScore({ address }: { address?: string }) {
  const { data: riskData, isLoading } = useQuery({
    queryKey: ['risk', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/risk/${address}`);
      if (!response.ok) throw new Error('Failed to fetch risk');
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 30000,
  });

  if (isLoading || !riskData) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-32" />;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'safe': return 'text-green-500';
      case 'low': return 'text-blue-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'safe') return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (severity === 'critical' || severity === 'high') return <AlertTriangle className="w-6 h-6 text-red-500" />;
    return <Shield className="w-6 h-6 text-yellow-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {getSeverityIcon(riskData.severity)}
          Risk Score
        </h2>
        <div className={`text-4xl font-bold ${getSeverityColor(riskData.severity)}`}>
          {riskData.overallScore}/100
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-sm">Warnings</p>
          <p className="text-2xl font-bold text-yellow-500">{riskData.totalWarnings}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-sm">Critical</p>
          <p className="text-2xl font-bold text-red-500">{riskData.criticalAssets}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-sm">Status</p>
          <p className={`text-lg font-bold uppercase ${getSeverityColor(riskData.severity)}`}>
            {riskData.severity}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-900 rounded-lg">
        <p className="text-sm text-gray-300">
          {riskData.severity === 'safe' && '✅ Your portfolio looks safe! Keep monitoring.'}
          {riskData.severity === 'low' && '👍 Low risk detected. Stay vigilant.'}
          {riskData.severity === 'medium' && '⚠️ Medium risk. Consider reviewing your positions.'}
          {riskData.severity === 'high' && '🚨 High risk! Take action to protect your assets.'}
          {riskData.severity === 'critical' && '🔴 CRITICAL RISK! Immediate action required!'}
        </p>
      </div>
    </div>
  );
}
