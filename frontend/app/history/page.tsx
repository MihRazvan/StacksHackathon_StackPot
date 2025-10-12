'use client';

import { useQuery } from '@tanstack/react-query';
import { getPoolDashboard, getUserDashboard, getDrawInfo } from '@/lib/stacks/contracts';
import { useWallet } from '@/features/wallet/hooks/use-wallet';
import { Trophy, History as HistoryIcon, TrendingUp, Users, Award, Calendar } from 'lucide-react';
import { formatBTC, formatSTX, shortenAddress } from '@/lib/utils';

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
    <main className="min-h-screen mesh-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-royal-purple/20 rounded-lg">
            <HistoryIcon className="w-8 h-8 text-royal-purple" />
          </div>
          <div>
            <h1 className="text-h1 text-soft-lavender">Draw History</h1>
            <p className="text-body text-purple-gray">Past draws and your stats</p>
          </div>
        </div>

        {/* User Stats Section */}
        {isConnected && userData && (
          <section className="mb-12">
            <div className="bg-dark-purple border border-border-purple p-6 rounded-xl purple-glow">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-royal-purple" />
                <h2 className="text-h2 text-soft-lavender">Your Stats</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Current Balance */}
                <div className="p-4 bg-royal-purple/10 border border-royal-purple/30 rounded-lg">
                  <p className="text-small text-purple-gray mb-1">Current Balance</p>
                  <p className="text-h2 text-soft-lavender font-mono">
                    {formatSTX(Number(userData.value?.balance?.value ?? 0))}
                  </p>
                  <p className="text-small text-purple-gray mt-1">STX</p>
                </div>

                {/* Current Tickets */}
                <div className="p-4 bg-electric-violet/10 border border-electric-violet/30 rounded-lg">
                  <p className="text-small text-purple-gray mb-1">Your Tickets</p>
                  <p className="text-h2 text-soft-lavender font-mono">
                    {Number(userData.value?.tickets?.value ?? 0).toLocaleString()}
                  </p>
                  <p className="text-small text-purple-gray mt-1">Entries</p>
                </div>

                {/* Win Probability */}
                <div className="p-4 bg-bright-purple/10 border border-bright-purple/30 rounded-lg">
                  <p className="text-small text-purple-gray mb-1">Win Chance</p>
                  <p className="text-h2 text-soft-lavender font-mono">
                    {((Number(userData.value?.['win-probability']?.value?.['probability-basis-points']?.value ?? 0)) / 100).toFixed(2)}%
                  </p>
                  <p className="text-small text-purple-gray mt-1">Probability</p>
                </div>

                {/* Draws Entered */}
                <div className="p-4 bg-bitcoin-gold/10 border border-bitcoin-gold/30 rounded-lg">
                  <p className="text-small text-purple-gray mb-1">Draws Entered</p>
                  <p className="text-h2 text-soft-lavender font-mono">
                    {currentDrawId}
                  </p>
                  <p className="text-small text-purple-gray mt-1">Total</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Draw History Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-bitcoin-gold" />
            <h2 className="text-h2 text-soft-lavender">Past Draws</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-purple border border-border-purple p-6 rounded-xl">
                  <div className="h-6 animated-gradient-purple rounded w-32 mb-4"></div>
                  <div className="h-4 animated-gradient-purple rounded w-full mb-2"></div>
                  <div className="h-4 animated-gradient-purple rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : currentDrawId === 0 ? (
            <div className="bg-dark-purple border border-border-purple p-12 rounded-xl text-center">
              <Trophy className="w-16 h-16 text-purple-gray mx-auto mb-4" />
              <h3 className="text-h3 text-soft-lavender mb-2">No Draws Yet</h3>
              <p className="text-body text-purple-gray">
                The first draw hasn't happened yet. Check back soon!
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
                    className={`bg-dark-purple border rounded-xl overflow-hidden hover:purple-glow transition-all ${
                      isUserWinner ? 'border-success-green' : 'border-border-purple'
                    }`}
                  >
                    {/* Header */}
                    <div className="case-card-gradient p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award className="w-6 h-6 text-bitcoin-gold" />
                          <div>
                            <h3 className="text-h3 text-soft-lavender font-bold">
                              Draw #{draw.id}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-purple-gray" />
                              <p className="text-small text-purple-gray">Block {drawBlock}</p>
                            </div>
                          </div>
                        </div>
                        {isUserWinner && (
                          <div className="px-3 py-1 bg-success-green/20 border border-success-green rounded-full">
                            <p className="text-small text-success-green font-semibold">You Won!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Winner Info */}
                      <div className="mb-4">
                        <p className="text-small text-purple-gray mb-2">Winner</p>
                        <p className="text-body text-soft-lavender font-mono">
                          {winner ? shortenAddress(String(winner)) : 'No winner'}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-bitcoin-gold/10 border border-bitcoin-gold/30 rounded-lg">
                          <p className="text-small text-purple-gray mb-1">Prize</p>
                          <p className="text-body text-bitcoin-gold font-bold font-mono">
                            {formatBTC(prizeAmount)} BTC
                          </p>
                        </div>

                        <div className="p-3 bg-royal-purple/10 border border-royal-purple/30 rounded-lg">
                          <p className="text-small text-purple-gray mb-1">Participants</p>
                          <p className="text-body text-soft-lavender font-mono">
                            {participants}
                          </p>
                        </div>

                        <div className="p-3 bg-electric-violet/10 border border-electric-violet/30 rounded-lg">
                          <p className="text-small text-purple-gray mb-1">Winner Balance</p>
                          <p className="text-body text-soft-lavender font-mono">
                            {formatSTX(winnerBalance)} STX
                          </p>
                        </div>

                        <div className="p-3 bg-bright-purple/10 border border-bright-purple/30 rounded-lg">
                          <p className="text-small text-purple-gray mb-1">Status</p>
                          <p className={`text-body font-semibold ${claimed ? 'text-success-green' : 'text-warning-purple'}`}>
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
    </main>
  );
}
