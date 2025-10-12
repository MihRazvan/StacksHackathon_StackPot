'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserWithdrawalEstimate, getInstantWithdrawalFee } from '@/lib/stacks/contracts';

export function useWithdrawalEstimate(userAddress: string | undefined) {
  return useQuery({
    queryKey: ['withdrawal-estimate', userAddress],
    queryFn: async () => {
      if (!userAddress) return null;
      const result = await getUserWithdrawalEstimate(userAddress);
      if (result && result.value !== undefined) {
        return result.value;
      }
      return result;
    },
    enabled: !!userAddress,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useInstantWithdrawalFee(amountMicroStx: number) {
  return useQuery({
    queryKey: ['instant-withdrawal-fee', amountMicroStx],
    queryFn: async () => {
      return getInstantWithdrawalFee(amountMicroStx);
    },
    enabled: amountMicroStx > 0,
  });
}
