'use client';

import { useWallet } from '../hooks/use-wallet';
import { shortenAddress } from '@/lib/utils';

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
      className="px-6 py-3 bg-hero-gradient text-soft-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
    >
      {isConnected && stxAddress
        ? shortenAddress(stxAddress)
        : 'Connect Wallet'}
    </button>
  );
}
