'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isDemoMode, getSimulatedYield, simulateYieldForDemo } from '@/lib/stacks/contracts';

export function useDemoMode() {
  return useQuery({
    queryKey: ['demo-mode'],
    queryFn: async () => {
      const result = await isDemoMode();
      if (result && result.value !== undefined) {
        return result.value;
      }
      return result;
    },
    refetchInterval: 30000, // Poll every 30 seconds (less frequent since it rarely changes)
  });
}

export function useSimulatedYield() {
  return useQuery({
    queryKey: ['simulated-yield'],
    queryFn: async () => {
      const result = await getSimulatedYield();
      if (result && result.value !== undefined) {
        return result.value;
      }
      return result;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useSimulateYield() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (yieldAmount: number) => {
      return await simulateYieldForDemo(yieldAmount);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['simulated-yield'] });
      queryClient.invalidateQueries({ queryKey: ['accumulated-yield'] });
      queryClient.invalidateQueries({ queryKey: ['pool-yield'] });
      queryClient.invalidateQueries({ queryKey: ['pool-dashboard'] });
    },
  });
}
