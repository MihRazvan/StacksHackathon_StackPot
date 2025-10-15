'use client';

import { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { useDemoMode, useSimulateYield } from '@/features/pool/hooks/use-demo-mode';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { formatSTX } from '@/lib/utils';
import { CONSTANTS } from '@/lib/stacks/config';
import { triggerDraw } from '@/lib/stacks/contracts';
import { usePoolDashboard } from '@/features/pool/hooks/use-pool-dashboard';

const DEPLOYER_ADDRESS = 'ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA';

export function DemoControls() {
  const { stxAddress } = useWallet();
  const { data: isDemoModeActive } = useDemoMode();
  const { mutate: simulateYield, isPending } = useSimulateYield();
  const { data: poolData } = usePoolDashboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [isTriggeringDraw, setIsTriggeringDraw] = useState(false);

  const blocksUntilDraw = Number(poolData?.['blocks-until-next-draw']?.value ?? 0);

  // Only show for contract owner and when demo mode is active
  if (!stxAddress || stxAddress !== DEPLOYER_ADDRESS || !isDemoModeActive) {
    return null;
  }

  const handleSimulate = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const amountMicroStx = Math.floor(amountNum * CONSTANTS.MICROSTX_PER_STX);
    simulateYield(amountMicroStx);
  };

  const handleTriggerDraw = async () => {
    setIsTriggeringDraw(true);
    try {
      await triggerDraw();
    } catch (error) {
      console.error('Failed to trigger draw:', error);
    } finally {
      setIsTriggeringDraw(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm max-w-sm">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">Demo Mode Controls</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-emerald-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-emerald-400" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-400">
              Fast-forward yield accumulation for demo purposes. This simulates time passing and yield being generated.
            </p>

            {/* Amount Input */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Yield Amount (STX)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                step="1"
                min="0"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                disabled={isPending}
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-700 hover:border-emerald-500 text-white text-sm rounded-lg transition-all"
                  disabled={isPending}
                >
                  {formatSTX(quickAmount * CONSTANTS.MICROSTX_PER_STX)} STX
                </button>
              ))}
            </div>

            {/* Simulate Button */}
            <button
              onClick={handleSimulate}
              disabled={isPending || !amount || parseFloat(amount) <= 0}
              className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isPending ? 'Simulating...' : 'Fast-Forward Yield'}
            </button>

            {/* Divider */}
            <div className="border-t border-slate-700 my-4" />

            {/* Trigger Draw Button */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Trigger Lottery Draw
              </label>
              <button
                onClick={handleTriggerDraw}
                disabled={isTriggeringDraw || blocksUntilDraw > 0}
                className="w-full px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                {isTriggeringDraw ? 'Triggering Draw...' : blocksUntilDraw > 0 ? 'Draw Not Ready' : 'Trigger Draw'}
              </button>
              {blocksUntilDraw > 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  Wait for countdown to reach zero
                </p>
              )}
            </div>

            {/* Warning */}
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm text-slate-400">
                <span className="text-orange-400 font-semibold">Note:</span> This is for demonstration only. In production, yield accumulates naturally over stacking cycles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
