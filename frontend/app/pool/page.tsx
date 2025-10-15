'use client';

import { useState } from 'react';
import { usePoolDashboard } from '@/features/pool/hooks/use-pool-dashboard';
import { usePoolYield } from '@/features/pool/hooks/use-pool-yield';
import { useUserDashboard } from '@/features/user/hooks/use-user-dashboard';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { DepositModal } from '@/features/pool/components/deposit-modal';
import { WithdrawModal } from '@/features/pool/components/withdraw-modal';
import { DemoControls } from '@/features/demo/components/demo-controls';
import { ConnectButton } from '@/features/wallet/components/connect-button';
import { formatSTX } from '@/lib/utils';
import { Trophy, Users, Clock, ShoppingCart, DollarSign, Zap, TrendingUp } from 'lucide-react';

export default function PoolPage() {
  const { data: poolData, isLoading, error } = usePoolDashboard();
  const { data: poolYield } = usePoolYield();
  const { stxAddress, isConnected } = useWallet();
  const { data: userData } = useUserDashboard(stxAddress);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const currentDrawId = Number(poolData?.['current-draw-id']?.value ?? 0);
  const totalParticipants = Number(poolData?.['total-participants']?.value ?? 0);
  const blocksUntilDraw = Number(poolData?.['blocks-until-next-draw']?.value ?? 0);
  const prizeAmount = Number(poolYield ?? 0);

  // User stats
  const userBalance = Number(userData?.['balance']?.value ?? 0);
  const userTickets = Number(userData?.['tickets']?.value ?? 0);
  const winProbabilityBPS = Number(userData?.['win-probability']?.value?.['probability-basis-points']?.value ?? 0);
  const winProbability = (winProbabilityBPS / 100).toFixed(2);

  // Calculate time display
  const estimatedMinutes = blocksUntilDraw * 10;
  const estimatedHours = Math.floor(estimatedMinutes / 60);
  const remainingMinutes = estimatedMinutes % 60;
  const timeDisplay = blocksUntilDraw === 0
    ? 'Draw Ready!'
    : estimatedHours > 0
    ? `${estimatedHours}h ${remainingMinutes}m`
    : `${remainingMinutes}m`;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-2xl font-bold mb-4">Failed to load pool data</p>
          <p className="text-slate-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {!isConnected ? (
          /* ========== LOGGED OUT VIEW ========== */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">Join the Pool</h1>
              <p className="text-xl text-slate-400">
                Deposit STX, earn tickets, win Bitcoin yield
              </p>
            </div>

            {/* Prize Display */}
            <div className="relative group mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-orange-500/5 to-amber-500/5 border border-orange-500/20 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full mb-4 shadow-lg shadow-orange-500/30">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm text-slate-400 mb-2">Current Prize Pool</div>
                <div className="text-5xl font-bold text-white mb-1">
                  {isLoading ? '...' : formatSTX(prizeAmount)}
                </div>
                <div className="text-lg text-orange-400">STX from Bitcoin Yield</div>
              </div>
            </div>

            {/* Pool Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{totalParticipants}</div>
                <div className="text-sm text-slate-400">Participants</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{timeDisplay}</div>
                <div className="text-sm text-slate-400">Next Draw</div>
              </div>
            </div>

            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          /* ========== LOGGED IN VIEW - TWO PANEL ========== */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* LEFT PANEL: Your Stats */}
            <div className="space-y-6 flex flex-col">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Your Stats</h1>
              </div>

              {/* Win Chance Hero */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <div className="text-sm text-slate-400 mb-2">Your Win Chance</div>
                  <div className="text-6xl font-bold text-emerald-400 mb-1">
                    {userTickets === 0 ? '0.00' : winProbability}%
                  </div>
                  <div className="text-slate-400">{userTickets.toLocaleString()} {userTickets === 1 ? 'ticket' : 'tickets'}</div>
                </div>
              </div>

              {/* Balance */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-sm text-slate-400 mb-1">Your Balance</div>
                <div className="text-3xl font-bold text-white">{formatSTX(userBalance)} STX</div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Tickets
                </button>

                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  disabled={userBalance === 0}
                  className="w-full py-5 bg-slate-800/50 hover:bg-slate-800 text-white font-semibold text-lg rounded-xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DollarSign className="w-5 h-5" />
                  Sell Tickets
                </button>
              </div>

            </div>

            {/* RIGHT PANEL: Pool Info */}
            <div className="space-y-6 flex flex-col">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Current Pool</h2>
              </div>

              {/* Prize Pool */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-br from-orange-500/5 to-amber-500/5 border border-orange-500/20 rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full mb-4 shadow-lg shadow-orange-500/30">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm text-slate-400 mb-2">Prize Pool</div>
                  <div className="text-5xl font-bold text-white mb-1">
                    {isLoading ? '...' : formatSTX(prizeAmount)}
                  </div>
                  <div className="text-orange-400">STX from Bitcoin Yield</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                  <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{totalParticipants}</div>
                  <div className="text-sm text-slate-400">Participants</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                  <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{timeDisplay}</div>
                  <div className="text-sm text-slate-400">Next Draw</div>
                </div>
              </div>

              {/* No Loss Info */}
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-white font-semibold">No loss guarantee:</span> Sell tickets anytime to get your STX back.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />

      {/* Demo Controls */}
      <DemoControls />
    </div>
  );
}
