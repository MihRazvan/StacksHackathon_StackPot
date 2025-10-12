'use client';

import { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useDemoMode, useSimulateYield } from '@/features/pool/hooks/use-demo-mode';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { formatSTX } from '@/lib/utils';
import { CONSTANTS } from '@/lib/stacks/config';

const DEPLOYER_ADDRESS = 'ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA';

export function DemoControls() {
  const { stxAddress } = useWallet();
  const { data: isDemoModeActive } = useDemoMode();
  const { mutate: simulateYield, isPending } = useSimulateYield();
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('1000');

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

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="flat-card overflow-hidden shadow-2xl max-w-sm">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-cyber-teal/10 hover:bg-cyber-teal/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyber-teal" />
            <span className="text-cyber-teal font-semibold text-small">Demo Mode Controls</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-cyber-teal" />
          ) : (
            <ChevronUp className="w-5 h-5 text-cyber-teal" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            <p className="text-small text-text-muted">
              Fast-forward yield accumulation for demo purposes. This simulates time passing and yield being generated.
            </p>

            {/* Amount Input */}
            <div>
              <label className="block text-small text-text-muted mb-2">
                Yield Amount (STX)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                step="1"
                min="0"
                className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyber-teal transition-all"
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
                  className="px-3 py-2 flat-card-elevated hover:border-cyber-teal text-text-primary text-small transition-all"
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
              className="w-full px-4 py-3 bg-cyber-teal text-bg-main hover:bg-teal-hover font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isPending ? 'Simulating...' : 'Fast-Forward Yield'}
            </button>

            {/* Warning */}
            <div className="p-3 bg-bitcoin-gold/10 border border-bitcoin-gold/20 rounded-lg">
              <p className="text-small text-text-muted">
                <span className="text-bitcoin-gold font-semibold">Note:</span> This is for demonstration only. In production, yield accumulates naturally over stacking cycles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
