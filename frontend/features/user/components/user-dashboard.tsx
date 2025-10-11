'use client';

import { useUserDashboard } from '../hooks/use-user-dashboard';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { formatSTX } from '@/lib/utils';
import { Wallet, Ticket, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface UserDashboardProps {
  onWithdraw?: () => void;
  onDeposit?: () => void;
}

export function UserDashboard({ onWithdraw, onDeposit }: UserDashboardProps) {
  const { stxAddress } = useWallet();
  const { data: userData, isLoading, error } = useUserDashboard(stxAddress);

  if (!stxAddress) {
    return null; // Don't show if not connected
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="glass-card p-6 rounded-xl">
          <p className="text-error-red text-center">Failed to load user data</p>
        </div>
      </section>
    );
  }

  // Format win probability as percentage
  // The win-probability field is a tuple with { user-tickets, total-tickets, probability-basis-points }
  const formatWinProbability = (winProbData: any) => {
    if (!winProbData || !winProbData.value) {
      return '0.00';
    }

    const basisPoints = Number(winProbData.value['probability-basis-points']?.value ?? 0);
    const percentage = basisPoints / 100; // Convert from basis points (1/10000) to percentage
    return percentage.toFixed(2);
  };

  return (
    <section className="mb-12">
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-soft-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-electric-violet" />
            Your Dashboard
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onDeposit}
              className="px-4 py-2 bg-electric-violet/20 hover:bg-electric-violet/30 border border-electric-violet/40 text-electric-violet rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-small font-semibold">Deposit</span>
            </button>
            <button
              onClick={onWithdraw}
              className="px-4 py-2 bg-sunset-orange/20 hover:bg-sunset-orange/30 border border-sunset-orange/40 text-sunset-orange rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span className="text-small font-semibold">Withdraw</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-slate-gray/30 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-gray/50 rounded w-24 mb-2"></div>
                <div className="h-8 bg-slate-gray/50 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Balance */}
            <div className="p-4 bg-electric-violet/10 border border-electric-violet/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-electric-violet" />
                <p className="text-small text-warm-gray">Your Balance</p>
              </div>
              <p className="text-h2 text-soft-white font-mono">
                {formatSTX(Number(userData?.['balance']?.value ?? 0))}
              </p>
              <p className="text-small text-warm-gray mt-1">STX</p>
            </div>

            {/* Tickets */}
            <div className="p-4 bg-sunset-orange/10 border border-sunset-orange/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-sunset-orange" />
                <p className="text-small text-warm-gray">Your Tickets</p>
              </div>
              <p className="text-h2 text-soft-white font-mono">
                {userData?.['tickets']?.value ?? '0'}
              </p>
              <p className="text-small text-warm-gray mt-1">Entries</p>
            </div>

            {/* Win Probability */}
            <div className="p-4 bg-bitcoin-gold/10 border border-bitcoin-gold/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-bitcoin-gold" />
                <p className="text-small text-warm-gray">Win Probability</p>
              </div>
              <p className="text-h2 text-soft-white font-mono">
                {formatWinProbability(userData?.['win-probability'])}%
              </p>
              <p className="text-small text-warm-gray mt-1">Chance</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {!isLoading && userData && userData?.['won-last-draw']?.value && (
          <div className="mt-4 p-4 bg-success-green/10 border border-success-green/20 rounded-lg">
            <p className="text-success-green text-center font-semibold">
              🎉 Congratulations! You won the last draw!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
