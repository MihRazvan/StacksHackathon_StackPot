'use client';

import { useState } from 'react';
import { usePoolDashboard } from '@/features/pool/hooks/use-pool-dashboard';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { DepositModal } from '@/features/pool/components/deposit-modal';
import { WithdrawModal } from '@/features/pool/components/withdraw-modal';
import { UserDashboard } from '@/features/user/components/user-dashboard';
import { TriggerDrawCard } from '@/features/draw/components/trigger-draw-card';
import { formatSTX, formatBTC } from '@/lib/utils';
import { Bitcoin, Users, Clock, Trophy, Award } from 'lucide-react';

export default function Home() {
  const { data: poolData, isLoading, error } = usePoolDashboard();
  const { isConnected } = useWallet();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Debug logging for draw info
  if (poolData && !isLoading) {
    console.log('🎲 [HomePage] Current Draw ID:', poolData['current-draw-id']);
    console.log('🎲 [HomePage] Last Draw Info:', poolData['last-draw-info']);
    if (poolData['last-draw-info']?.value?.value) {
      const drawInfo = poolData['last-draw-info'].value.value;
      console.log('🎲 [HomePage] ✅ Winner:', drawInfo?.winner?.value);
      console.log('🎲 [HomePage] ✅ Prize Amount:', drawInfo?.['prize-amount']?.value);
      console.log('🎲 [HomePage] ✅ Draw Block:', drawInfo?.['draw-block']?.value);
      console.log('🎲 [HomePage] ✅ Participants:', drawInfo?.['participants-count']?.value);
      console.log('🎲 [HomePage] ✅ Winner Balance:', drawInfo?.['winner-balance']?.value);
      console.log('🎲 [HomePage] ✅ Claimed:', drawInfo?.claimed?.value);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen mesh-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-red text-h3 mb-4">Failed to load pool data</p>
          <p className="text-warm-gray">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-h1 text-soft-lavender mb-4">
            Win Bitcoin. Keep Your STX.
          </h2>
          <p className="text-body text-purple-gray max-w-2xl mx-auto mb-8">
            The no-loss lottery on Stacks. Deposit STX, win BTC prizes from stacking yield, withdraw anytime.
          </p>

          {/* Subtle Prize Pool Display */}
          <div className="inline-flex items-center gap-4 glass-card px-8 py-4 rounded-xl purple-glow">
            <div className="p-3 bg-bitcoin-gold/20 rounded-lg">
              <Bitcoin className="w-8 h-8 text-bitcoin-gold" />
            </div>
            <div className="text-left">
              <p className="text-purple-gray text-small uppercase tracking-wide font-semibold">Current Prize Pool</p>
              <p className="text-h2 text-bitcoin-gold font-bold font-mono">
                {isLoading ? '...' : formatBTC(10000000)} BTC
              </p>
            </div>
          </div>
        </section>

        {/* User Dashboard - Only shown when wallet is connected */}
        {isConnected && (
          <UserDashboard
            onDeposit={() => setIsDepositModalOpen(true)}
            onWithdraw={() => setIsWithdrawModalOpen(true)}
          />
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Pool */}
          <div className="bg-dark-purple border border-border-purple p-6 rounded-xl hover:border-electric-violet hover:purple-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-royal-purple/20 rounded-lg">
                <Bitcoin className="w-6 h-6 text-royal-purple" />
              </div>
              <h3 className="text-h3 text-soft-lavender">Total Pool</h3>
            </div>
            <p className="text-h2 text-soft-lavender font-mono">
              {isLoading ? '...' : formatSTX(Number(poolData?.['total-pool-balance']?.value ?? 0))}
            </p>
            <p className="text-small text-purple-gray mt-1">STX Deposited</p>
          </div>

          {/* Participants */}
          <div className="bg-dark-purple border border-border-purple p-6 rounded-xl hover:border-electric-violet hover:purple-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-electric-violet/20 rounded-lg">
                <Users className="w-6 h-6 text-electric-violet" />
              </div>
              <h3 className="text-h3 text-soft-lavender">Participants</h3>
            </div>
            <p className="text-h2 text-soft-lavender font-mono">
              {isLoading ? '...' : (poolData?.['total-participants']?.value ?? '0')}
            </p>
            <p className="text-small text-purple-gray mt-1">Active Players</p>
          </div>

          {/* Next Draw */}
          <div className="bg-dark-purple border border-border-purple p-6 rounded-xl hover:border-electric-violet hover:purple-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-bright-purple/20 rounded-lg">
                <Clock className="w-6 h-6 text-bright-purple" />
              </div>
              <h3 className="text-h3 text-soft-lavender">Next Draw</h3>
            </div>
            <p className="text-h2 text-soft-lavender font-mono">
              {isLoading ? '...' : poolData?.['blocks-until-next-draw']?.value ?? '0'}
            </p>
            <p className="text-small text-purple-gray mt-1">Bitcoin Blocks (~{isLoading ? '...' : Math.floor(Number(poolData?.['blocks-until-next-draw']?.value ?? 0) * 10)} min)</p>
          </div>
        </section>

        {/* Trigger Draw Card */}
        {!isLoading && poolData && (
          <TriggerDrawCard
            canDrawNow={Number(poolData?.['blocks-until-next-draw']?.value ?? 1) === 0}
            blocksUntilNextDraw={Number(poolData?.['blocks-until-next-draw']?.value ?? 0)}
            currentDrawId={Number(poolData?.['current-draw-id']?.value ?? 0)}
            totalParticipants={Number(poolData?.['total-participants']?.value ?? 0)}
            isLoading={isLoading}
          />
        )}

        {/* CTA Section */}
        <section className="text-center mb-12">
          <div className="glass-card p-8 rounded-xl max-w-2xl mx-auto">
            <h3 className="text-h2 text-soft-lavender mb-4">Ready to Play?</h3>
            <p className="text-body text-purple-gray mb-6">
              {isConnected
                ? 'Deposit STX and start playing. Your principal is always safe—withdraw anytime.'
                : 'Connect your wallet to deposit STX and start playing. Your principal is always safe—withdraw anytime.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="px-8 py-4 bg-hero-gradient text-soft-lavender font-semibold rounded-lg hover:opacity-90 hover:purple-glow transition-all disabled:opacity-50"
                disabled={!isConnected}
              >
                Deposit STX
              </button>
              <button className="px-8 py-4 bg-dark-purple border border-border-purple text-soft-lavender font-semibold rounded-lg hover:border-electric-violet transition-colors">
                Learn More
              </button>
            </div>
            {!isConnected && (
              <p className="text-small text-purple-gray mt-4">
                Connect your wallet to enable deposits
              </p>
            )}
          </div>
        </section>

        {/* Deposit Modal */}
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />

        {/* Withdraw Modal */}
        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
        />

        {/* Last Winner - Kleros Style */}
        {!isLoading && poolData && Number(poolData?.['current-draw-id']?.value ?? 0) > 0 && (
          <section className="mt-12">
            <div className="max-w-2xl mx-auto overflow-hidden rounded-xl border border-border-purple purple-glow">
              {/* Kleros-Style Header */}
              <div className="case-card-gradient p-4">
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="w-6 h-6 text-bitcoin-gold" />
                  <h3 className="text-h3 text-soft-lavender font-bold">Last Winner</h3>
                </div>
              </div>

              {/* Winner Content */}
              <div className="bg-dark-purple p-6">
                {poolData['last-draw-info']?.value?.value ? (
                  <>
                    {/* Winner Address with Award Badge */}
                    <div className="reward-badge p-4 rounded-lg mb-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-bitcoin-gold" />
                        <p className="text-mono text-soft-lavender text-body font-semibold">
                          {String(poolData['last-draw-info']?.value?.value?.winner?.value?.value ?? poolData['last-draw-info']?.value?.value?.winner?.value ?? 'No winner selected')}
                        </p>
                      </div>
                      <p className="text-center text-h2 text-bitcoin-gold font-bold">
                        {formatBTC(Number(poolData['last-draw-info']?.value?.value?.['prize-amount']?.value ?? 0))} BTC
                      </p>
                    </div>

                    {/* Draw Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-royal-purple/10 border border-border-purple rounded-lg">
                        <p className="text-purple-gray text-small mb-1">Draw Block</p>
                        <p className="text-soft-lavender font-mono font-semibold">
                          {String(poolData['last-draw-info']?.value?.value?.['draw-block']?.value ?? 'N/A')}
                        </p>
                      </div>
                      <div className="p-3 bg-royal-purple/10 border border-border-purple rounded-lg">
                        <p className="text-purple-gray text-small mb-1">Participants</p>
                        <p className="text-soft-lavender font-mono font-semibold">
                          {String(poolData['last-draw-info']?.value?.value?.['participants-count']?.value ?? '0')}
                        </p>
                      </div>
                      <div className="p-3 bg-royal-purple/10 border border-border-purple rounded-lg">
                        <p className="text-purple-gray text-small mb-1">Winner Balance</p>
                        <p className="text-soft-lavender font-mono font-semibold">
                          {formatSTX(Number(poolData['last-draw-info']?.value?.value?.['winner-balance']?.value ?? 0))} STX
                        </p>
                      </div>
                      <div className="p-3 bg-royal-purple/10 border border-border-purple rounded-lg">
                        <p className="text-purple-gray text-small mb-1">Prize Claimed</p>
                        <p className={`font-mono font-semibold ${poolData['last-draw-info']?.value?.value?.claimed?.value ? 'text-success-green' : 'text-purple-gray'}`}>
                          {poolData['last-draw-info']?.value?.value?.claimed?.value ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-purple-gray text-center py-4">
                    Draw has been triggered. Waiting for winner data to load...
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
