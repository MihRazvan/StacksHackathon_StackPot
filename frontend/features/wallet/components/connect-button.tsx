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
      className="px-6 py-3 bg-cyber-teal text-bg-main font-semibold rounded-lg hover:bg-teal-hover transition-all flex items-center gap-2"
    >
      {isConnected && stxAddress ? (
        <>
          <span>{shortenAddress(stxAddress)}</span>
        </>
      ) : (
        <>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
