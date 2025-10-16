import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RebalanceSuggestion } from '@/types';

export function useRebalanceSuggestions(address?: string) {
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery<RebalanceSuggestion[]>({
    queryKey: ['suggestions', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/suggestions/${address}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000, // Refetch every minute
  });

  const executeMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, address }),
      });
      if (!response.ok) throw new Error('Failed to execute suggestion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions', address] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', address] });
      queryClient.invalidateQueries({ queryKey: ['transactions', address] });
    },
  });

  return {
    suggestions,
    isLoading,
    executeSuggestion: executeMutation.mutate,
  };
}
