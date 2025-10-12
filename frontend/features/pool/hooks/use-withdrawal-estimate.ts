'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserWithdrawalEstimate, getInstantWithdrawalFee } from '@/lib/stacks/contracts';

export function useWithdrawalEstimate(userAddress: string | undefined) {
  return useQuery({
    queryKey: ['withdrawal-estimate', userAddress],
    queryFn: async () => {
      if (!userAddress) return null;
      const result = await getUserWithdrawalEstimate(userAddress);
      // Extract withdrawal estimate fields from the tuple
      if (result && result.value) {
        return {
          'fee-amount': result.value.fee?.value || 0,
          'amount-after-fee': result.value['stx-to-receive']?.value || 0,
          'instant': result.value.instant?.value || false,
          'ststx-to-burn': result.value['ststx-to-burn']?.value || 0,
        };
      }
      return null;
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
