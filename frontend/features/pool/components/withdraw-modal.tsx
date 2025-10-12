'use client';

import { useState } from 'react';
import { X, ArrowUpCircle, AlertCircle } from 'lucide-react';
import { withdraw, withdrawAll, getInstantWithdrawalFee } from '@/lib/stacks/contracts';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { useUserDashboard } from '@/features/user/hooks/use-user-dashboard';
import { useWithdrawalEstimate } from '@/features/pool/hooks/use-withdrawal-estimate';
import { formatSTX } from '@/lib/utils';
import { CONSTANTS } from '@/lib/stacks/config';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { stxAddress } = useWallet();
  const { data: userData } = useUserDashboard(stxAddress);
  const { data: withdrawalEstimate } = useWithdrawalEstimate(stxAddress);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userBalance = Number(userData?.['balance']?.value ?? 0);
  const userBalanceSTX = userBalance / CONSTANTS.MICROSTX_PER_STX;

  // Calculate fee for entered amount
  const amountNum = parseFloat(amount) || 0;
  const amountMicroStx = Math.floor(amountNum * CONSTANTS.MICROSTX_PER_STX);
  const estimatedFee = getInstantWithdrawalFee(amountMicroStx);
  const amountAfterFee = amountMicroStx - estimatedFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('💸 [WithdrawModal] Form submitted');
    console.log('💸 [WithdrawModal] Input amount:', amount);
    console.log('💸 [WithdrawModal] User address:', stxAddress);
    console.log('💸 [WithdrawModal] User balance:', userBalance);

    if (!stxAddress) {
      console.error('❌ [WithdrawModal] No wallet address found');
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.warn('⚠️ [WithdrawModal] Invalid amount entered');
      setError('Please enter a valid amount');
      return;
    }

    const amountMicroStx = Math.floor(amountNum * CONSTANTS.MICROSTX_PER_STX);
    console.log('💸 [WithdrawModal] Converted to microSTX:', amountMicroStx);

    if (amountMicroStx > userBalance) {
      console.warn('⚠️ [WithdrawModal] Amount exceeds balance:', {
        amountMicroStx,
        userBalance,
      });
      setError(`Insufficient balance. You can withdraw up to ${formatSTX(userBalance)} STX`);
      return;
    }

    setIsSubmitting(true);
    console.log('💸 [WithdrawModal] Validation passed, calling withdraw...');

    try {
      const result = await withdraw(amountMicroStx, stxAddress);
      console.log('✅ [WithdrawModal] Transaction initiated successfully!');
      console.log('📦 [WithdrawModal] Transaction result:', result);

      // Reset and close
      setAmount('');
      onClose();

      console.log('✅ [WithdrawModal] Modal closed, withdraw complete');
    } catch (err: any) {
      console.error('❌ [WithdrawModal] Withdraw failed with error:', err);
      console.error('❌ [WithdrawModal] Error details:', {
        message: err?.message,
        code: err?.code,
        name: err?.name,
      });
      setError(err?.message || 'Failed to withdraw. Please try again.');
    } finally {
      setIsSubmitting(false);
      console.log('💸 [WithdrawModal] Submission process finished');
    }
  };

  const handleWithdrawAll = async () => {
    setError(null);

    console.log('💸 [WithdrawModal] Withdraw All clicked');
    console.log('💸 [WithdrawModal] User balance:', userBalance);

    if (!stxAddress) {
      console.error('❌ [WithdrawModal] No wallet address found');
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    if (userBalance === 0) {
      console.warn('⚠️ [WithdrawModal] No balance to withdraw');
      setError('You have no balance to withdraw');
      return;
    }

    setIsSubmitting(true);
    console.log('💸 [WithdrawModal] Calling withdraw-all...');

    try {
      const result = await withdrawAll(stxAddress);
      console.log('✅ [WithdrawModal] Withdraw-all transaction initiated successfully!');
      console.log('📦 [WithdrawModal] Transaction result:', result);

      // Reset and close
      setAmount('');
      onClose();

      console.log('✅ [WithdrawModal] Modal closed, withdraw-all complete');
    } catch (err: any) {
      console.error('❌ [WithdrawModal] Withdraw-all failed with error:', err);
      console.error('❌ [WithdrawModal] Error details:', {
        message: err?.message,
        code: err?.code,
        name: err?.name,
      });
      setError(err?.message || 'Failed to withdraw. Please try again.');
    } finally {
      setIsSubmitting(false);
      console.log('💸 [WithdrawModal] Withdraw-all process finished');
    }
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (userBalanceSTX * percentage) / 100;
    setAmount(quickAmount.toFixed(6));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-main/90 backdrop-blur-lg">
      <div className="flat-card p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-teal/20 rounded-lg">
              <ArrowUpCircle className="w-6 h-6 text-cyber-teal" />
            </div>
            <h2 className="text-h2 text-text-primary">Withdraw STX</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Available Balance */}
        <div className="mb-4 p-4 teal-accent-card">
          <p className="text-small text-text-muted mb-1">Available Balance</p>
          <p className="text-h2 text-text-primary font-mono">
            {formatSTX(userBalance)} STX
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-small text-text-muted mb-2">
              Amount (STX)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              max={userBalanceSTX}
              className="w-full px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyber-teal transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handleQuickAmount(percentage)}
                className="flex-1 px-3 py-2 flat-card-elevated hover:border-cyber-teal text-text-primary text-small transition-all"
                disabled={isSubmitting || userBalance === 0}
              >
                {percentage}%
              </button>
            ))}
          </div>

          {/* Withdrawal Fee Info */}
          {amountNum > 0 && (
            <div className="p-4 bg-bg-elevated border border-border-subtle rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                <p className="text-small text-text-primary font-semibold">Instant Withdrawal Breakdown</p>
              </div>
              <div className="space-y-2 text-small">
                <div className="flex justify-between">
                  <span className="text-text-muted">Withdrawal amount:</span>
                  <span className="text-text-primary font-mono">{formatSTX(amountMicroStx)} STX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Instant withdrawal fee (1%):</span>
                  <span className="text-error-red font-mono">-{formatSTX(estimatedFee)} STX</span>
                </div>
                <div className="pt-2 border-t border-border-subtle flex justify-between">
                  <span className="text-text-primary font-semibold">You'll receive:</span>
                  <span className="text-cyber-teal font-mono font-bold">{formatSTX(amountAfterFee)} STX</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 flat-card-elevated">
            <p className="text-small text-text-secondary">
              Withdraw your STX from the pool instantly with a 1% fee. Your tickets and win probability will decrease proportionally.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error-red/10 border border-error-red/20 rounded-lg">
              <p className="text-small text-error-red">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !amount || userBalance === 0}
              className="flex-1 px-6 py-3 bg-cyber-teal text-bg-main hover:bg-teal-hover font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Withdraw'}
            </button>
            <button
              type="button"
              onClick={handleWithdrawAll}
              disabled={isSubmitting || userBalance === 0}
              className="flex-1 px-6 py-3 flat-card hover:border-cyber-teal text-text-primary font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Withdraw All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
