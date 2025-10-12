'use client';

import { useUserDashboard } from '../hooks/use-user-dashboard';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { useWithdrawalEstimate } from '@/features/pool/hooks/use-withdrawal-estimate';
import { formatSTX } from '@/lib/utils';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Trophy, AlertCircle } from 'lucide-react';

interface UserDashboardProps {
  onWithdraw?: () => void;
  onDeposit?: () => void;
}

export function UserDashboard({ onWithdraw, onDeposit }: UserDashboardProps) {
  const { stxAddress } = useWallet();
  const { data: userData, isLoading, error } = useUserDashboard(stxAddress);
  const { data: withdrawalEstimate } = useWithdrawalEstimate(stxAddress);

  if (!stxAddress) {
    return null; // Don't show if not connected
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="flat-card p-6">
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
      <div className="flat-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-text-primary flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyber-teal" />
            Your Dashboard
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onDeposit}
              className="px-4 py-2 bg-cyber-teal/20 hover:bg-cyber-teal hover:text-bg-main border border-teal-border text-cyber-teal rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-small font-semibold">Deposit</span>
            </button>
            <button
              onClick={onWithdraw}
              className="px-4 py-2 flat-card-elevated hover:border-cyber-teal text-text-primary rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span className="text-small font-semibold">Withdraw</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 flat-card-elevated">
                <div className="h-4 bg-bg-elevated animate-shimmer rounded w-24 mb-2"></div>
                <div className="h-8 bg-bg-elevated animate-shimmer rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Balance */}
            <div className="p-6 flat-card-elevated">
              <p className="text-small text-text-muted mb-2">Your Balance</p>
              <p className="text-h2 text-text-primary font-mono">
                {formatSTX(Number(userData?.['balance']?.value ?? 0))}
              </p>
              <p className="text-small text-text-muted mt-1">STX</p>
            </div>

            {/* Tickets */}
            <div className="p-6 flat-card-elevated">
              <p className="text-small text-text-muted mb-2">Your Tickets</p>
              <p className="text-h2 text-text-primary font-mono">
                {userData?.['tickets']?.value ?? '0'}
              </p>
              <p className="text-small text-text-muted mt-1">Entries</p>
            </div>

            {/* Win Probability */}
            <div className="p-6 flat-card-elevated">
              <p className="text-small text-text-muted mb-2">Win Probability</p>
              <p className="text-h2 text-text-primary font-mono">
                {formatWinProbability(userData?.['win-probability'])}%
              </p>
              <p className="text-small text-text-muted mt-1">Chance</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {!isLoading && userData && userData?.['won-last-draw']?.value && (
          <div className="mt-4 p-4 teal-accent-card">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-cyber-teal" />
              <p className="text-cyber-teal text-center font-semibold">
                Congratulations! You won the last draw!
              </p>
            </div>
          </div>
        )}

        {/* Withdrawal Estimate Info */}
        {!isLoading && withdrawalEstimate && Number(userData?.['balance']?.value ?? 0) > 0 && (
          <div className="mt-4 p-4 flat-card-elevated">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-text-primary font-semibold mb-2">Instant Withdrawal Available</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-small">
                  <div>
                    <span className="text-text-muted">You'll receive: </span>
                    <span className="text-text-primary font-mono font-semibold">
                      {formatSTX(Number(withdrawalEstimate?.['amount-after-fee']?.value ?? 0))} STX
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Instant withdrawal fee (1%): </span>
                    <span className="text-text-primary font-mono font-semibold">
                      {formatSTX(Number(withdrawalEstimate?.['fee-amount']?.value ?? 0))} STX
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
