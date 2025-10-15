'use client';

import { useQuery } from '@tanstack/react-query';
import { getPoolDashboard, getUserDashboard, getDrawInfo } from '@/lib/stacks/contracts';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { Trophy, History as HistoryIcon, TrendingUp, Award, Calendar } from 'lucide-react';
import { formatSTX, shortenAddress } from '@/lib/utils';

export default function HistoryPage() {
  const { stxAddress, isConnected } = useWallet();

  // Fetch pool dashboard to get current draw ID
  const { data: poolData, isLoading: isLoadingPool } = useQuery({
    queryKey: ['pool-dashboard'],
    queryFn: getPoolDashboard,
    refetchInterval: 10000,
  });

  // Fetch user dashboard for stats
  const { data: userData } = useQuery({
    queryKey: ['user-dashboard', stxAddress],
    queryFn: () => getUserDashboard(stxAddress!),
    enabled: Boolean(stxAddress),
    refetchInterval: 10000,
  });

  const currentDrawId = Number(poolData?.value?.['current-draw-id']?.value ?? 0);

  // Fetch last 10 draws (or less if fewer draws have occurred)
  const drawIds = currentDrawId > 0
    ? Array.from({ length: Math.min(currentDrawId, 10) }, (_, i) => currentDrawId - 1 - i)
    : [];

  const { data: drawsData, isLoading: isLoadingDraws } = useQuery({
    queryKey: ['draw-history', currentDrawId],
    queryFn: async () => {
      console.log('🎲 [HistoryPage] Fetching draws for IDs:', drawIds);

      const draws = await Promise.all(
        drawIds.map(async (id) => {
          const drawInfo = await getDrawInfo(id);
          console.log(`🎲 [HistoryPage] Draw #${id} raw data:`, drawInfo);
          console.log(`🎲 [HistoryPage] Draw #${id} value:`, drawInfo.value);

          // Handle the (optional tuple) structure from Clarity
          // drawInfo.value might be {type: 'optional', value: {type: 'tuple', value: {...}}}
          let actualData = drawInfo.value;

          // If it's wrapped in an optional, unwrap it
          if (actualData && typeof actualData === 'object' && 'value' in actualData) {
            console.log(`🎲 [HistoryPage] Draw #${id} unwrapped:`, actualData.value);
            actualData = actualData.value;
          }

          return { id, data: actualData };
        })
      );

      console.log('🎲 [HistoryPage] All draws processed:', draws);
      return draws.filter(draw => draw.data !== null && draw.data !== undefined);
    },
    enabled: drawIds.length > 0,
  });

  const isLoading = isLoadingPool || isLoadingDraws;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <HistoryIcon className="w-10 h-10 text-emerald-400" />
            <h1 className="text-5xl font-bold text-white">Draw History</h1>
          </div>
          <p className="text-xl text-slate-400 ml-13">Past draws and winners</p>
        </div>

        {/* User Stats Section */}
        {isConnected && userData && (
          <section className="mb-12">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <h2 className="text-3xl font-bold text-white">Your Stats</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Current Balance */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                  <p className="text-sm text-slate-400 mb-2">Current Balance</p>
                  <p className="text-3xl font-bold text-white">
                    {formatSTX(Number(userData.value?.balance?.value ?? 0))}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">STX</p>
                </div>

                {/* Current Tickets */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                  <p className="text-sm text-slate-400 mb-2">Your Tickets</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {Number(userData.value?.tickets?.value ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Entries</p>
                </div>

                {/* Win Probability */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                  <p className="text-sm text-slate-400 mb-2">Win Chance</p>
                  <p className="text-3xl font-bold text-white">
                    {((Number(userData.value?.['win-probability']?.value?.['probability-basis-points']?.value ?? 0)) / 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Probability</p>
                </div>

                {/* Draws Entered */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <p className="text-sm text-slate-400 mb-2">Draws Entered</p>
                  <p className="text-3xl font-bold text-white">
                    {currentDrawId}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Total</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Draw History Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Past Draws</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="h-6 bg-slate-800 animate-pulse rounded w-32 mb-4"></div>
                  <div className="h-4 bg-slate-800 animate-pulse rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-800 animate-pulse rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : currentDrawId === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-sm">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Draws Yet</h3>
              <p className="text-slate-400">
                The first draw hasn&apos;t happened yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {drawsData?.map((draw) => {
                const drawData = draw.data;
                const winner = drawData?.winner?.value?.value ?? drawData?.winner?.value;
                const prizeAmount = Number(drawData?.['prize-amount']?.value ?? 0);
                const drawBlock = Number(drawData?.['draw-block']?.value ?? 0);
                const participants = Number(drawData?.['participants-count']?.value ?? 0);
                const claimed = drawData?.claimed?.value ?? false;
                const winnerBalance = Number(drawData?.['winner-balance']?.value ?? 0);

                const isUserWinner = isConnected && winner && winner === stxAddress;

                return (
                  <div
                    key={draw.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm"
                  >
                    {/* Header */}
                    <div className="bg-slate-800/50 p-6 border-b border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award className="w-6 h-6 text-orange-400" />
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              Draw #{draw.id}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <p className="text-sm text-slate-400">Block {drawBlock}</p>
                            </div>
                          </div>
                        </div>
                        {isUserWinner && (
                          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <p className="text-sm text-emerald-400 font-semibold">You Won!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      {/* Winner Info */}
                      <div className="mb-6">
                        <p className="text-sm text-slate-400 mb-2">Winner</p>
                        <p className="text-lg text-white font-mono">
                          {winner ? shortenAddress(String(winner)) : 'No winner'}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-sm text-slate-400 mb-1">Prize</p>
                          <p className="text-xl font-bold text-orange-400">
                            {formatSTX(prizeAmount)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">STX</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-sm text-slate-400 mb-1">Participants</p>
                          <p className="text-xl font-bold text-white">
                            {participants}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Players</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-sm text-slate-400 mb-1">Winner Balance</p>
                          <p className="text-xl font-bold text-white">
                            {formatSTX(winnerBalance)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">STX</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-sm text-slate-400 mb-1">Status</p>
                          <p className={`text-xl font-bold ${claimed ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {claimed ? 'Claimed' : 'Unclaimed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
