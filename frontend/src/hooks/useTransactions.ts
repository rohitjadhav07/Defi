import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@/types';

export function useTransactions(address?: string) {
  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['transactions', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/transactions/${address}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  return { transactions, isLoading, error };
}
