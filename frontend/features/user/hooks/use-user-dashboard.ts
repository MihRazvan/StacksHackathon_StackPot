'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserDashboard } from '@/lib/stacks/contracts';

export function useUserDashboard(userAddress: string | null) {
  return useQuery({
    queryKey: ['user-dashboard', userAddress],
    queryFn: async () => {
      if (!userAddress) {
        throw new Error('No user address provided');
      }
      const result = await getUserDashboard(userAddress);
      if (result && result.value) {
        return result.value;
      }
      return result;
    },
    enabled: !!userAddress, // Only run query if user address exists
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
