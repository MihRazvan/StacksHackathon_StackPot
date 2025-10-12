'use client';

import { useUserDashboard } from '../hooks/use-user-dashboard';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { formatSTX } from '@/lib/utils';
import { Wallet, Ticket, TrendingUp, ArrowUpCircle, ArrowDownCircle, Trophy } from 'lucide-react';

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
      <div className="bg-dark-purple border border-border-purple p-6 rounded-xl purple-glow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-soft-lavender flex items-center gap-2">
            <Wallet className="w-6 h-6 text-royal-purple" />
            Your Dashboard
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onDeposit}
              className="px-4 py-2 bg-royal-purple/20 hover:bg-royal-purple hover:text-soft-lavender border border-royal-purple/40 text-royal-purple rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-small font-semibold">Deposit</span>
            </button>
            <button
              onClick={onWithdraw}
              className="px-4 py-2 bg-electric-violet/20 hover:bg-electric-violet hover:text-soft-lavender border border-electric-violet/40 text-electric-violet rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span className="text-small font-semibold">Withdraw</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-dark-purple border border-border-purple rounded-lg">
                <div className="h-4 animated-gradient-purple rounded w-24 mb-2"></div>
                <div className="h-8 animated-gradient-purple rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Balance */}
            <div className="p-4 bg-royal-purple/10 border border-royal-purple/30 rounded-lg hover:border-royal-purple hover:purple-glow transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-royal-purple" />
                <p className="text-small text-purple-gray">Your Balance</p>
              </div>
              <p className="text-h2 text-soft-lavender font-mono">
                {formatSTX(Number(userData?.['balance']?.value ?? 0))}
              </p>
              <p className="text-small text-purple-gray mt-1">STX</p>
            </div>

            {/* Tickets */}
            <div className="p-4 bg-electric-violet/10 border border-electric-violet/30 rounded-lg hover:border-electric-violet hover:purple-glow transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-electric-violet" />
                <p className="text-small text-purple-gray">Your Tickets</p>
              </div>
              <p className="text-h2 text-soft-lavender font-mono">
                {userData?.['tickets']?.value ?? '0'}
              </p>
              <p className="text-small text-purple-gray mt-1">Entries</p>
            </div>

            {/* Win Probability */}
            <div className="p-4 bg-bright-purple/10 border border-bright-purple/30 rounded-lg hover:border-bright-purple hover:purple-glow transition-all">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-bright-purple" />
                <p className="text-small text-purple-gray">Win Probability</p>
              </div>
              <p className="text-h2 text-soft-lavender font-mono">
                {formatWinProbability(userData?.['win-probability'])}%
              </p>
              <p className="text-small text-purple-gray mt-1">Chance</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {!isLoading && userData && userData?.['won-last-draw']?.value && (
          <div className="mt-4 p-4 bg-success-green/10 border border-success-green/20 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-success-green" />
              <p className="text-success-green text-center font-semibold">
                Congratulations! You won the last draw!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
