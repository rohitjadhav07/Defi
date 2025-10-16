import { useQuery } from '@tanstack/react-query';
import { Portfolio } from '@/types';

export function usePortfolio(address?: string) {
  const { data: portfolio, isLoading, error } = useQuery<Portfolio>({
    queryKey: ['portfolio', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/portfolio/${address}`);
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return { portfolio, isLoading, error };
}
