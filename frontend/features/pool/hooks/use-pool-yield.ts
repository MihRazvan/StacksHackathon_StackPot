'use client';

import { useQuery } from '@tanstack/react-query';
import { getPoolYield, getAccumulatedYield, getContractStSTXValue } from '@/lib/stacks/contracts';

export function usePoolYield() {
  return useQuery({
    queryKey: ['pool-yield'],
    queryFn: async () => {
      const result = await getPoolYield();
      if (result && result.value !== undefined) {
        return result.value;
      }
      return result;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useAccumulatedYield() {
  return useQuery({
    queryKey: ['accumulated-yield'],
    queryFn: async () => {
      const result = await getAccumulatedYield();
      if (result && result.value !== undefined) {
        return result.value;
      }
      return result;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useContractStSTXValue() {
  return useQuery({
    queryKey: ['contract-ststx-value'],
    queryFn: async () => {
      const result = await getContractStSTXValue();
      if (result && result.value !== undefined) {
        return result.value;
      }
      return result;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
