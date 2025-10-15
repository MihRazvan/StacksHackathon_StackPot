'use client';

import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { formatPercentage, formatPercentageChange, formatTickets } from '@/lib/utils';

interface DepositPreviewProps {
  data: {
    currentTickets: number;
    newTickets: number;
    ticketsAdded: number;
    currentTotalTickets: number;
    newTotalTickets: number;
    currentProbabilityBasisPoints: number;
    newProbabilityBasisPoints: number;
  };
  isLoading: boolean;
}

export function DepositPreview({ data, isLoading }: DepositPreviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyber-teal" />
          <p className="text-small font-semibold text-text-primary">Odds Preview</p>
        </div>

        {/* Loading Skeletons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 flat-card-elevated">
            <div className="h-4 bg-bg-elevated animate-shimmer rounded w-20 mb-2"></div>
            <div className="h-6 bg-bg-elevated animate-shimmer rounded w-16 mb-1"></div>
            <div className="h-3 bg-bg-elevated animate-shimmer rounded w-24"></div>
          </div>
          <div className="p-4 flat-card-elevated">
            <div className="h-4 bg-bg-elevated animate-shimmer rounded w-24 mb-2"></div>
            <div className="h-6 bg-bg-elevated animate-shimmer rounded w-20 mb-1"></div>
            <div className="h-3 bg-bg-elevated animate-shimmer rounded w-28"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentPercent = formatPercentage(data.currentProbabilityBasisPoints);
  const newPercent = formatPercentage(data.newProbabilityBasisPoints);
  const percentChange = formatPercentageChange(
    data.currentProbabilityBasisPoints,
    data.newProbabilityBasisPoints
  );
  const isIncrease = data.newProbabilityBasisPoints > data.currentProbabilityBasisPoints;

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-cyber-teal" />
        <p className="text-small font-semibold text-text-primary">Odds Preview</p>
      </div>

      {/* Current vs After Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current State */}
        <div className="p-4 flat-card-elevated">
          <p className="text-small text-text-muted mb-2">Current Chance</p>
          <p className="text-h3 text-text-primary font-bold font-mono break-words">
            {currentPercent}%
          </p>
          <p className="text-small text-text-muted mt-1 break-words">
            {formatTickets(data.currentTickets)} tickets
          </p>
        </div>

        {/* After Deposit */}
        <div className="p-4 flat-card-elevated">
          <div className="flex items-center gap-1 mb-2">
            <p className="text-small text-cyber-teal font-semibold">After Deposit</p>
            {isIncrease && <ArrowUpRight className="w-3 h-3 text-success-green" />}
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-h3 text-text-primary font-bold font-mono break-words">
              {newPercent}%
            </p>
            <p className={`text-small font-semibold whitespace-nowrap ${isIncrease ? 'text-success-green' : 'text-text-muted'}`}>
              {percentChange}
            </p>
          </div>
          <p className="text-small text-text-muted mt-1 break-words">
            {formatTickets(data.newTickets)} tickets
            <span className="text-success-green ml-1 whitespace-nowrap">
              (+{formatTickets(data.ticketsAdded)})
            </span>
          </p>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="p-3 flat-card-elevated">
        <p className="text-small text-text-muted">
          <span className="text-text-muted">Pool tickets: </span>
          <span className="text-text-primary font-mono">{formatTickets(data.currentTotalTickets)}</span>
          <span className="text-text-muted"> → </span>
          <span className="text-text-primary font-mono">{formatTickets(data.newTotalTickets)}</span>
        </p>
      </div>
    </div>
  );
}
