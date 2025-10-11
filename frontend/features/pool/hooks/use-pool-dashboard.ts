'use client';

import { useQuery } from '@tanstack/react-query';
import { getPoolDashboard } from '@/lib/stacks/contracts';

export function usePoolDashboard() {
  return useQuery({
    queryKey: ['pool-dashboard'],
    queryFn: async () => {
      const result = await getPoolDashboard();
      if (result && result.value) {
        return result.value;
      }
      return result;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
