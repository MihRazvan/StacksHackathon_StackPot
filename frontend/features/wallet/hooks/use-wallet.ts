'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { request } from '@stacks/connect';

interface WalletState {
  isConnected: boolean;
  stxAddress: string | null;
  btcAddress: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      stxAddress: null,
      btcAddress: null,

      connect: async () => {
        try {
          const response = await request('getAddresses');

          if (response && response.addresses) {
            // Find STX and BTC addresses
            const stxAddr = response.addresses.find((addr: any) =>
              addr.address.startsWith('ST') || addr.address.startsWith('SP')
            );
            const btcAddr = response.addresses.find((addr: any) =>
              addr.address.startsWith('bc1') || addr.address.startsWith('tb1')
            );

            set({
              isConnected: true,
              stxAddress: stxAddr?.address || null,
              btcAddress: btcAddr?.address || null,
            });
          }
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          throw error;
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          stxAddress: null,
          btcAddress: null,
        });
      },
    }),
    {
      name: 'stackpot-wallet',
      partialize: (state) => ({
        isConnected: state.isConnected,
        stxAddress: state.stxAddress,
        btcAddress: state.btcAddress,
      }),
    }
  )
);
