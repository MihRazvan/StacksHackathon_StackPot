'use client';

import { useState } from 'react';
import { Zap, Clock } from 'lucide-react';
import { triggerDraw } from '@/lib/stacks/contracts';

interface TriggerDrawCardProps {
  canDrawNow: boolean;
  blocksUntilNextDraw: number;
  currentDrawId: number;
  totalParticipants: number;
  isLoading?: boolean;
}

export function TriggerDrawCard({
  canDrawNow,
  blocksUntilNextDraw,
  currentDrawId,
  totalParticipants,
  isLoading = false,
}: TriggerDrawCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTriggerDraw = async () => {
    setError(null);
    setSuccess(false);

    console.log('🎰 [TriggerDrawCard] Trigger Draw clicked');
    console.log('🎰 [TriggerDrawCard] Can draw now:', canDrawNow);
    console.log('🎰 [TriggerDrawCard] Current draw ID:', currentDrawId);

    if (!canDrawNow) {
      console.warn('⚠️ [TriggerDrawCard] Cannot trigger draw yet');
      setError(`Draw not ready. Wait ${blocksUntilNextDraw} more blocks.`);
      return;
    }

    if (totalParticipants === 0) {
      console.warn('⚠️ [TriggerDrawCard] No participants in pool');
      setError('Cannot trigger draw with no participants.');
      return;
    }

    setIsSubmitting(true);
    console.log('🎰 [TriggerDrawCard] Calling trigger-draw...');

    try {
      const result = await triggerDraw();
      console.log('✅ [TriggerDrawCard] Draw triggered successfully!');
      console.log('📦 [TriggerDrawCard] Transaction result:', result);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000); // Clear success message after 5s
    } catch (err: any) {
      console.error('❌ [TriggerDrawCard] Trigger draw failed:', err);
      console.error('❌ [TriggerDrawCard] Error details:', {
        message: err?.message,
        code: err?.code,
        name: err?.name,
      });
      setError(err?.message || 'Failed to trigger draw. Please try again.');
    } finally {
      setIsSubmitting(false);
      console.log('🎰 [TriggerDrawCard] Trigger draw process finished');
    }
  };

  // Bitcoin blocks average ~10 minutes each (not Stacks blocks which are ~10 seconds)
  const estimatedMinutes = blocksUntilNextDraw * 10;
  const estimatedHours = Math.floor(estimatedMinutes / 60);
  const remainingMinutes = estimatedMinutes % 60;

  const timeDisplay = estimatedHours > 0
    ? `~${estimatedHours}h ${remainingMinutes}m`
    : `~${remainingMinutes}m`;

  return (
    <section className="mb-12">
      <div className="flat-card p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-teal/20 rounded-lg">
              <Zap className="w-6 h-6 text-cyber-teal" />
            </div>
            <div>
              <h2 className="text-h2 text-text-primary">Lottery Draw #{currentDrawId + 1}</h2>
              <p className="text-small text-text-muted">
                {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''} in pool
              </p>
            </div>
          </div>
        </div>

        {/* Draw Status */}
        <div className="mb-6">
          {canDrawNow ? (
            <div className="p-4 teal-accent-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-cyber-teal" />
                <p className="text-cyber-teal font-semibold">Draw Ready!</p>
              </div>
              <p className="text-small text-text-secondary">
                The lottery is ready to draw a winner. Anyone can trigger the draw.
              </p>
            </div>
          ) : (
            <div className="p-4 flat-card-elevated">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-text-secondary" />
                <p className="text-text-primary font-semibold">Draw Countdown</p>
              </div>
              <p className="text-small text-text-secondary">
                Next draw available in <span className="text-text-primary font-mono">{blocksUntilNextDraw}</span> Bitcoin blocks
                {estimatedMinutes > 0 && ` (${timeDisplay})`}
              </p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 teal-accent-card">
            <p className="text-cyber-teal text-center font-semibold">
              Draw triggered successfully! Check back soon to see the winner.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-error-red/10 border border-error-red/20 rounded-lg">
            <p className="text-small text-error-red">{error}</p>
          </div>
        )}

        {/* Trigger Button */}
        <button
          onClick={handleTriggerDraw}
          disabled={!canDrawNow || isSubmitting || isLoading || totalParticipants === 0}
          className="w-full px-8 py-4 bg-cyber-teal text-bg-main font-semibold rounded-lg hover:bg-teal-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Triggering Draw...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Trigger Draw</span>
            </>
          )}
        </button>

        {!canDrawNow && totalParticipants > 0 && (
          <p className="text-center text-small text-text-muted mt-3">
            Button will be enabled when the draw is ready
          </p>
        )}

        {totalParticipants === 0 && (
          <p className="text-center text-small text-text-muted mt-3">
            Pool needs at least one participant to trigger a draw
          </p>
        )}
      </div>
    </section>
  );
}
