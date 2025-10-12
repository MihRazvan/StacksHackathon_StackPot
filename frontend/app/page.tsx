'use client';

import { useState } from 'react';
import { usePoolDashboard } from '@/features/pool/hooks/use-pool-dashboard';
import { usePoolYield, useContractStSTXValue } from '@/features/pool/hooks/use-pool-yield';
import { useDemoMode } from '@/features/pool/hooks/use-demo-mode';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { DepositModal } from '@/features/pool/components/deposit-modal';
import { WithdrawModal } from '@/features/pool/components/withdraw-modal';
import { UserDashboard } from '@/features/user/components/user-dashboard';
import { TriggerDrawCard } from '@/features/draw/components/trigger-draw-card';
import { DemoControls } from '@/features/demo/components/demo-controls';
import { formatSTX, formatBTC } from '@/lib/utils';
import { Bitcoin, Trophy, Award, TrendingUp } from 'lucide-react';

export default function Home() {
  const { data: poolData, isLoading, error } = usePoolDashboard();
  const { data: poolYield, isLoading: isYieldLoading } = usePoolYield();
  const { data: stSTXValue, isLoading: isStSTXLoading } = useContractStSTXValue();
  const { data: isDemoModeActive } = useDemoMode();
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
          <p className="text-text-secondary">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-h1 text-text-primary mb-4">
            Win Bitcoin. <span className="text-cyber-teal">Keep Your STX.</span>
          </h2>
          <p className="text-body text-text-secondary max-w-2xl mx-auto mb-8">
            The no-loss lottery on Stacks. Deposit STX, win BTC prizes from stacking yield, withdraw anytime.
          </p>

          {/* Prize Pool Display */}
          <div className="inline-flex items-center gap-4 flat-card p-8">
            <div className="p-3 bg-bitcoin-gold/20 rounded-lg">
              <Bitcoin className="w-8 h-8 text-bitcoin-gold" />
            </div>
            <div className="text-left">
              <p className="text-text-muted text-small uppercase tracking-wide font-semibold">
                Accumulated Yield {isDemoModeActive && <span className="text-cyber-teal">(Demo Mode)</span>}
              </p>
              <p className="text-h2 text-bitcoin-gold font-bold font-mono">
                {isYieldLoading ? '...' : formatSTX(Number(poolYield ?? 0))} STX
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
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Pool */}
          <div className="flat-card p-8 hover:border-cyber-teal transition-colors duration-300">
            <h3 className="text-body text-text-muted mb-2">Total Pool</h3>
            <p className="text-h2 text-text-primary font-mono">
              {isLoading ? '...' : formatSTX(Number(poolData?.['total-pool-balance']?.value ?? 0))}
            </p>
            <p className="text-small text-text-muted mt-1">STX Deposited</p>
          </div>

          {/* stSTX Value */}
          <div className="flat-card p-8 hover:border-cyber-teal transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success-green" />
              <h3 className="text-body text-text-muted">Stacking Value</h3>
            </div>
            <p className="text-h2 text-text-primary font-mono">
              {isStSTXLoading ? '...' : formatSTX(Number(stSTXValue ?? 0))}
            </p>
            <p className="text-small text-text-muted mt-1">stSTX Holdings</p>
          </div>

          {/* Participants */}
          <div className="flat-card p-8 hover:border-cyber-teal transition-colors duration-300">
            <h3 className="text-body text-text-muted mb-2">Participants</h3>
            <p className="text-h2 text-text-primary font-mono">
              {isLoading ? '...' : (poolData?.['total-participants']?.value ?? '0')}
            </p>
            <p className="text-small text-text-muted mt-1">Active Players</p>
          </div>

          {/* Next Draw */}
          <div className="flat-card p-8 hover:border-cyber-teal transition-colors duration-300">
            <h3 className="text-body text-text-muted mb-2">Next Draw</h3>
            <p className="text-h2 text-text-primary font-mono">
              {isLoading ? '...' : poolData?.['blocks-until-next-draw']?.value ?? '0'}
            </p>
            <p className="text-small text-text-muted mt-1">Bitcoin Blocks (~{isLoading ? '...' : Math.floor(Number(poolData?.['blocks-until-next-draw']?.value ?? 0) * 10)} min)</p>
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
          <div className="flat-card p-8 max-w-2xl mx-auto">
            <h3 className="text-h2 text-text-primary mb-4">Ready to Play?</h3>
            <p className="text-body text-text-secondary mb-6">
              {isConnected
                ? 'Deposit STX and start playing. Your principal is always safe—withdraw anytime.'
                : 'Connect your wallet to deposit STX and start playing. Your principal is always safe—withdraw anytime.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="px-8 py-4 bg-cyber-teal text-bg-main font-semibold rounded-lg hover:bg-teal-hover hover:teal-glow transition-all disabled:opacity-50"
                disabled={!isConnected}
              >
                Deposit STX
              </button>
              <button className="px-8 py-4 flat-card text-text-primary font-semibold hover:border-cyber-teal transition-colors">
                Learn More
              </button>
            </div>
            {!isConnected && (
              <p className="text-small text-text-muted mt-4">
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
            <div className="max-w-2xl mx-auto flat-card overflow-hidden">
              {/* Header */}
              <div className="bg-bg-elevated p-6 border-b border-border-subtle">
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="w-6 h-6 text-bitcoin-gold" />
                  <h3 className="text-h3 text-text-primary font-bold">Last Winner</h3>
                </div>
              </div>

              {/* Winner Content */}
              <div className="p-8">
                {poolData['last-draw-info']?.value?.value ? (
                  <>
                    {/* Winner Address with Award Badge */}
                    <div className="bitcoin-accent-card p-6 mb-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-bitcoin-gold" />
                        <p className="text-mono text-text-primary text-body font-semibold">
                          {String(poolData['last-draw-info']?.value?.value?.winner?.value?.value ?? poolData['last-draw-info']?.value?.value?.winner?.value ?? 'No winner selected')}
                        </p>
                      </div>
                      <p className="text-center text-h2 text-bitcoin-gold font-bold">
                        {formatBTC(Number(poolData['last-draw-info']?.value?.value?.['prize-amount']?.value ?? 0))} BTC
                      </p>
                    </div>

                    {/* Draw Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 flat-card-elevated">
                        <p className="text-text-muted text-small mb-1">Draw Block</p>
                        <p className="text-text-primary font-mono font-semibold">
                          {String(poolData['last-draw-info']?.value?.value?.['draw-block']?.value ?? 'N/A')}
                        </p>
                      </div>
                      <div className="p-4 flat-card-elevated">
                        <p className="text-text-muted text-small mb-1">Participants</p>
                        <p className="text-text-primary font-mono font-semibold">
                          {String(poolData['last-draw-info']?.value?.value?.['participants-count']?.value ?? '0')}
                        </p>
                      </div>
                      <div className="p-4 flat-card-elevated">
                        <p className="text-text-muted text-small mb-1">Winner Balance</p>
                        <p className="text-text-primary font-mono font-semibold">
                          {formatSTX(Number(poolData['last-draw-info']?.value?.value?.['winner-balance']?.value ?? 0))} STX
                        </p>
                      </div>
                      <div className="p-4 flat-card-elevated">
                        <p className="text-text-muted text-small mb-1">Prize Claimed</p>
                        <p className={`font-mono font-semibold ${poolData['last-draw-info']?.value?.value?.claimed?.value ? 'text-success-green' : 'text-text-muted'}`}>
                          {poolData['last-draw-info']?.value?.value?.claimed?.value ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-text-secondary text-center py-4">
                    Draw has been triggered. Waiting for winner data to load...
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Demo Mode Controls - Only visible for contract owner when demo mode is active */}
      <DemoControls />
    </main>
  );
}
