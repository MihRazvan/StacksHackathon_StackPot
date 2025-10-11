'use client';

import { useState } from 'react';
import { usePoolDashboard } from '@/features/pool/hooks/use-pool-dashboard';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { DepositModal } from '@/features/pool/components/deposit-modal';
import { WithdrawModal } from '@/features/pool/components/withdraw-modal';
import { UserDashboard } from '@/features/user/components/user-dashboard';
import { TriggerDrawCard } from '@/features/draw/components/trigger-draw-card';
import { formatSTX, formatBTC } from '@/lib/utils';
import { Bitcoin, Users, Clock } from 'lucide-react';

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
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-prize-glow blur-3xl"></div>
            <div className="relative bg-hero-gradient p-8 rounded-2xl">
              <Bitcoin className="w-16 h-16 mx-auto mb-4 text-bitcoin-gold" />
              <h1 className="text-hero text-soft-white font-bold">
                {isLoading ? '...' : formatBTC(10000000)}
              </h1>
              <p className="text-warm-gray text-body mt-2">BTC Prize Pool</p>
            </div>
          </div>

          <h2 className="text-h1 text-soft-white mb-4">
            Win Bitcoin. Keep Your STX.
          </h2>
          <p className="text-body text-warm-gray max-w-2xl mx-auto">
            The no-loss lottery on Stacks. Deposit STX, win BTC prizes from staking yield, withdraw anytime.
          </p>
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
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-electric-violet/20 rounded-lg">
                <Bitcoin className="w-6 h-6 text-electric-violet" />
              </div>
              <h3 className="text-h3 text-soft-white">Total Pool</h3>
            </div>
            <p className="text-h2 text-soft-white font-mono">
              {isLoading ? '...' : formatSTX(Number(poolData?.['total-pool-balance']?.value ?? 0))}
            </p>
            <p className="text-small text-warm-gray mt-1">STX</p>
          </div>

          {/* Participants */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sunset-orange/20 rounded-lg">
                <Users className="w-6 h-6 text-sunset-orange" />
              </div>
              <h3 className="text-h3 text-soft-white">Participants</h3>
            </div>
            <p className="text-h2 text-soft-white font-mono">
              {isLoading ? '...' : (poolData?.['total-participants']?.value ?? '0')}
            </p>
            <p className="text-small text-warm-gray mt-1">Players</p>
          </div>

          {/* Next Draw */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-bitcoin-gold/20 rounded-lg">
                <Clock className="w-6 h-6 text-bitcoin-gold" />
              </div>
              <h3 className="text-h3 text-soft-white">Next Draw</h3>
            </div>
            <p className="text-h2 text-soft-white font-mono">
              {isLoading ? '...' : poolData?.['blocks-until-next-draw']?.value ?? '0'}
            </p>
            <p className="text-small text-warm-gray mt-1">Bitcoin Blocks (~{isLoading ? '...' : Math.floor(Number(poolData?.['blocks-until-next-draw']?.value ?? 0) * 10)} min)</p>
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
        <section className="text-center">
          <div className="glass-card p-8 rounded-xl max-w-2xl mx-auto">
            <h3 className="text-h2 text-soft-white mb-4">Ready to Play?</h3>
            <p className="text-body text-warm-gray mb-6">
              {isConnected
                ? 'Deposit STX and start playing. Your principal is always safe—withdraw anytime.'
                : 'Connect your wallet to deposit STX and start playing. Your principal is always safe—withdraw anytime.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="px-8 py-4 bg-hero-gradient text-soft-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={!isConnected}
              >
                Deposit STX
              </button>
              <button className="px-8 py-4 glass-card text-soft-white font-semibold rounded-lg hover:bg-slate-gray transition-colors">
                Learn More
              </button>
            </div>
            {!isConnected && (
              <p className="text-small text-warm-gray mt-4">
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

        {/* Last Winner */}
        {!isLoading && poolData && Number(poolData?.['current-draw-id']?.value ?? 0) > 0 && (
          <section className="mt-12">
            <div className="glass-card p-6 rounded-xl max-w-2xl mx-auto">
              <h3 className="text-h3 text-soft-white mb-4 text-center">🎉 Last Winner</h3>
              <div className="text-center">
                {poolData['last-draw-info']?.value?.value ? (
                  <>
                    <p className="text-mono text-electric-violet mb-2 text-h3">
                      {String(poolData['last-draw-info']?.value?.value?.winner?.value?.value ?? poolData['last-draw-info']?.value?.value?.winner?.value ?? 'No winner selected')}
                    </p>
                    <p className="text-body text-warm-gray mb-4">
                      Won <span className="text-bitcoin-gold font-semibold">{formatBTC(Number(poolData['last-draw-info']?.value?.value?.['prize-amount']?.value ?? 0))} BTC</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-charcoal/50 border border-border-gray rounded-lg text-small">
                      <div>
                        <span className="text-warm-gray">Draw Block: </span>
                        <span className="text-soft-white font-mono">
                          {String(poolData['last-draw-info']?.value?.value?.['draw-block']?.value ?? 'N/A')}
                        </span>
                      </div>
                      <div>
                        <span className="text-warm-gray">Participants: </span>
                        <span className="text-soft-white font-mono">
                          {String(poolData['last-draw-info']?.value?.value?.['participants-count']?.value ?? '0')}
                        </span>
                      </div>
                      <div>
                        <span className="text-warm-gray">Winner Balance: </span>
                        <span className="text-soft-white font-mono">
                          {formatSTX(Number(poolData['last-draw-info']?.value?.value?.['winner-balance']?.value ?? 0))} STX
                        </span>
                      </div>
                      <div>
                        <span className="text-warm-gray">Claimed: </span>
                        <span className={`font-mono ${poolData['last-draw-info']?.value?.value?.claimed?.value ? 'text-success-green' : 'text-warm-gray'}`}>
                          {poolData['last-draw-info']?.value?.value?.claimed?.value ? 'Yes ✓' : 'No'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-warm-gray">
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
