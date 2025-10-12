'use client';

import { useState } from 'react';
import { X, ArrowDownCircle } from 'lucide-react';
import { deposit } from '@/lib/stacks/contracts';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { formatSTX } from '@/lib/utils';
import { CONSTANTS } from '@/lib/stacks/config';
import { useDepositPreview } from '../hooks/use-deposit-preview';
import { DepositPreview } from './deposit-preview';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { stxAddress } = useWallet();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get deposit preview data
  const preview = useDepositPreview(stxAddress, amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('💰 [DepositModal] Form submitted');
    console.log('💰 [DepositModal] Input amount:', amount);
    console.log('💰 [DepositModal] User address:', stxAddress);

    if (!stxAddress) {
      console.error('❌ [DepositModal] No wallet address found');
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.warn('⚠️ [DepositModal] Invalid amount entered');
      setError('Please enter a valid amount');
      return;
    }

    const amountMicroStx = Math.floor(amountNum * CONSTANTS.MICROSTX_PER_STX);
    console.log('💰 [DepositModal] Converted to microSTX:', amountMicroStx);

    if (amountMicroStx < CONSTANTS.MIN_DEPOSIT_MICROSTX) {
      console.warn('⚠️ [DepositModal] Amount below minimum:', {
        amountMicroStx,
        minimum: CONSTANTS.MIN_DEPOSIT_MICROSTX,
      });
      setError(`Minimum deposit is ${formatSTX(CONSTANTS.MIN_DEPOSIT_MICROSTX)} STX`);
      return;
    }

    setIsSubmitting(true);
    console.log('💰 [DepositModal] Validation passed, calling deposit...');

    try {
      const result = await deposit(amountMicroStx, stxAddress);
      console.log('✅ [DepositModal] Transaction initiated successfully!');
      console.log('📦 [DepositModal] Transaction result:', result);

      // Reset and close
      setAmount('');
      onClose();

      console.log('✅ [DepositModal] Modal closed, deposit complete');
    } catch (err: any) {
      console.error('❌ [DepositModal] Deposit failed with error:', err);
      console.error('❌ [DepositModal] Error details:', {
        message: err?.message,
        code: err?.code,
        name: err?.name,
      });
      setError(err?.message || 'Failed to deposit. Please try again.');
    } finally {
      setIsSubmitting(false);
      console.log('💰 [DepositModal] Submission process finished');
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-navy/90 backdrop-blur-lg">
      <div className="glass-card p-6 rounded-xl max-w-md w-full purple-glow-strong">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-royal-purple/20 rounded-lg">
              <ArrowDownCircle className="w-6 h-6 text-royal-purple" />
            </div>
            <h2 className="text-h2 text-soft-lavender">Deposit STX</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-purple/50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-purple-gray" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-small text-purple-gray mb-2">
              Amount (STX)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 bg-dark-purple/50 border border-border-purple rounded-lg text-soft-lavender placeholder-purple-gray focus:outline-none focus:border-royal-purple focus:purple-glow transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[1, 5, 10, 25].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleQuickAmount(value)}
                className="flex-1 px-3 py-2 bg-royal-purple/10 hover:bg-royal-purple/20 border border-royal-purple/30 hover:border-royal-purple rounded-lg text-soft-lavender text-small transition-all"
                disabled={isSubmitting}
              >
                {value} STX
              </button>
            ))}
          </div>

          {/* Deposit Preview - Odds Calculator */}
          {preview.shouldShow && preview.data && (
            <DepositPreview data={preview.data} isLoading={preview.isLoading} />
          )}

          {/* Show message if amount is too low */}
          {preview.isValidAmount && !preview.meetsMinimum && (
            <div className="p-3 bg-royal-purple/10 border border-royal-purple/30 rounded-lg">
              <p className="text-small text-purple-gray text-center">
                Enter at least {formatSTX(CONSTANTS.MIN_DEPOSIT_MICROSTX)} STX to preview odds
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-royal-purple/10 border border-royal-purple/30 rounded-lg">
            <p className="text-small text-purple-gray">
              Your STX will be deposited into the pool. You can withdraw at any time with no loss.
              You'll earn tickets based on your deposit amount and duration.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error-red/10 border border-error-red/20 rounded-lg">
              <p className="text-small text-error-red">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className="w-full px-6 py-3 bg-hero-gradient text-soft-lavender font-semibold rounded-lg hover:opacity-90 hover:purple-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Deposit STX'}
          </button>
        </form>
      </div>
    </div>
  );
}
