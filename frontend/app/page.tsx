'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section - Full viewport height on desktop */}
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Earn Yield from </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                Bitcoin
              </span>
              <br />
              <span className="text-white">Stacking. </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                Keep Your STX.
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              No-loss lottery on Stacks. Deposit STX, win <span className="text-orange-400 font-semibold">BTC</span> yield (converted to STX), withdraw anytime with instant withdrawal.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pool">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 w-full sm:w-auto justify-center">
                  Play Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/history">
                <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 transition-all duration-200 backdrop-blur-sm w-full sm:w-auto">
                  View History
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Below the fold */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">234</div>
              <div className="text-sm text-slate-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">0%</div>
              <div className="text-sm text-slate-400">Risk of Loss</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">42</div>
              <div className="text-sm text-slate-400">Current Draw</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-slate-400">Simple, safe, and transparent</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1: No Loss */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Loss</h3>
              <p className="text-slate-400 leading-relaxed">
                Your principal is always safe. Withdraw anytime to get your full STX deposit back.
              </p>
            </div>
          </div>

          {/* Feature 2: Bitcoin Yield */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500/10 to-amber-600/10 rounded-xl flex items-center justify-center mb-6 border border-orange-500/20">
                <TrendingUp className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Bitcoin Yield</h3>
              <p className="text-slate-400 leading-relaxed">
                Win Bitcoin stacking rewards automatically converted to STX. Real BTC yield.
              </p>
            </div>
          </div>

          {/* Feature 3: Fair & Instant */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Zap className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Fair & Instant</h3>
              <p className="text-slate-400 leading-relaxed">
                Provably fair winner selection. Instant withdrawals available with small fee.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
