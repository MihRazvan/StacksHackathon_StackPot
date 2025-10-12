'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { previewDeposit } from '@/lib/stacks/contracts';
import { CONSTANTS } from '@/lib/stacks/config';

interface DepositPreviewData {
  currentTickets: number;
  newTickets: number;
  ticketsAdded: number;
  currentTotalTickets: number;
  newTotalTickets: number;
  currentProbabilityBasisPoints: number;
  newProbabilityBasisPoints: number;
}

export function useDepositPreview(userAddress: string | null, amountSTX: string) {
  const [debouncedAmount, setDebouncedAmount] = useState(amountSTX);

  // Debounce the amount input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amountSTX);
    }, 500);

    return () => clearTimeout(timer);
  }, [amountSTX]);

  // Parse and validate amount
  const amountNum = parseFloat(debouncedAmount);
  const isValidAmount = !isNaN(amountNum) && amountNum > 0;
  const amountMicroStx = isValidAmount ? Math.floor(amountNum * CONSTANTS.MICROSTX_PER_STX) : 0;
  const meetsMinimum = amountMicroStx >= CONSTANTS.MIN_DEPOSIT_MICROSTX;

  // Only fetch if we have a valid address, valid amount, and meets minimum
  const shouldFetch = Boolean(userAddress && isValidAmount && meetsMinimum);

  const { data, isLoading, error } = useQuery({
    queryKey: ['deposit-preview', userAddress, amountMicroStx],
    queryFn: async () => {
      if (!userAddress) throw new Error('No wallet address');

      console.log('📊 [useDepositPreview] Fetching preview:', { userAddress, amountMicroStx });
      const result = await previewDeposit(userAddress, amountMicroStx);
      console.log('📊 [useDepositPreview] Raw result:', result);

      // Extract values from nested Clarity structure {type, value}
      const rawData = result.value;
      console.log('📊 [useDepositPreview] Raw data:', rawData);

      // Access nested .value properties from Clarity tuple
      const extractedData: DepositPreviewData = {
        currentTickets: Number(rawData['current-tickets']?.value ?? 0),
        newTickets: Number(rawData['new-tickets']?.value ?? 0),
        ticketsAdded: Number(rawData['tickets-added']?.value ?? 0),
        currentTotalTickets: Number(rawData['current-total-tickets']?.value ?? 0),
        newTotalTickets: Number(rawData['new-total-tickets']?.value ?? 0),
        currentProbabilityBasisPoints: Number(rawData['current-probability-basis-points']?.value ?? 0),
        newProbabilityBasisPoints: Number(rawData['new-probability-basis-points']?.value ?? 0),
      };

      console.log('📊 [useDepositPreview] Extracted data:', extractedData);

      return extractedData;
    },
    enabled: shouldFetch,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1,
  });

  return {
    data,
    isLoading: shouldFetch && isLoading,
    error,
    isValidAmount,
    meetsMinimum,
    shouldShow: shouldFetch,
  };
}
