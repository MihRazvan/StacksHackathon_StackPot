'use client';

import { useWallet } from '../hooks/use-wallet';
import { shortenAddress } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';

export function ConnectButton() {
  const { isConnected, stxAddress, connect, disconnect } = useWallet();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 bg-hero-gradient text-soft-lavender font-semibold rounded-lg hover:opacity-90 hover:purple-glow transition-all flex items-center gap-2"
    >
      {isConnected && stxAddress ? (
        <>
          <LogOut className="w-4 h-4" />
          <span>{shortenAddress(stxAddress)}</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
