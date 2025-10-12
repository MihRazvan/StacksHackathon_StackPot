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
          <TrendingUp className="w-4 h-4 text-royal-purple" />
          <p className="text-small font-semibold text-soft-lavender">Odds Preview</p>
        </div>

        {/* Loading Skeletons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-dark-purple border border-border-purple rounded-lg">
            <div className="h-4 animated-gradient-purple rounded w-20 mb-2"></div>
            <div className="h-6 animated-gradient-purple rounded w-16 mb-1"></div>
            <div className="h-3 animated-gradient-purple rounded w-24"></div>
          </div>
          <div className="p-3 bg-dark-purple border border-border-purple rounded-lg">
            <div className="h-4 animated-gradient-purple rounded w-24 mb-2"></div>
            <div className="h-6 animated-gradient-purple rounded w-20 mb-1"></div>
            <div className="h-3 animated-gradient-purple rounded w-28"></div>
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
        <TrendingUp className="w-4 h-4 text-royal-purple" />
        <p className="text-small font-semibold text-soft-lavender">Odds Preview</p>
      </div>

      {/* Current vs After Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current State */}
        <div className="p-3 bg-royal-purple/10 border border-royal-purple/30 rounded-lg">
          <p className="text-small text-purple-gray mb-2">Current Chance</p>
          <p className="text-h2 text-soft-lavender font-bold font-mono">
            {currentPercent}%
          </p>
          <p className="text-small text-purple-gray mt-1">
            {formatTickets(data.currentTickets)} tickets
          </p>
        </div>

        {/* After Deposit */}
        <div className="p-3 bg-electric-violet/10 border border-electric-violet/30 rounded-lg hover:purple-glow transition-all">
          <div className="flex items-center gap-1 mb-2">
            <p className="text-small text-electric-violet font-semibold">After Deposit</p>
            {isIncrease && <ArrowUpRight className="w-3 h-3 text-success-green" />}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-h2 text-soft-lavender font-bold font-mono">
              {newPercent}%
            </p>
            <p className={`text-small font-semibold ${isIncrease ? 'text-success-green' : 'text-purple-gray'}`}>
              {percentChange}
            </p>
          </div>
          <p className="text-small text-purple-gray mt-1">
            {formatTickets(data.newTickets)} tickets
            <span className="text-success-green ml-1">
              (+{formatTickets(data.ticketsAdded)})
            </span>
          </p>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="p-2 bg-dark-purple/30 border border-border-purple/50 rounded-lg">
        <p className="text-small text-purple-gray">
          <span className="text-purple-gray">Pool tickets: </span>
          <span className="text-soft-lavender font-mono">{formatTickets(data.currentTotalTickets)}</span>
          <span className="text-purple-gray"> → </span>
          <span className="text-soft-lavender font-mono">{formatTickets(data.newTotalTickets)}</span>
        </p>
      </div>
    </div>
  );
}
