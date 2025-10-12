# StackPot Frontend - Current Status

## ✅ Completed (MVP Core Features)

### 1. Project Setup
- ✅ Next.js 15 with TypeScript
- ✅ Tailwind CSS v4 (CSS-first configuration)
- ✅ All dependencies installed (Stacks.js, React Query, Zustand, Lucide icons)

### 2. Configuration
- ✅ Tailwind v4 theme with StackPot design system (all colors, gradients, animations)
- ✅ Stacks configuration (testnet network, contract addresses)
- ✅ Utility functions (formatSTX, formatBTC, formatProbability, shortenAddress)

### 3. Wallet Integration
- ✅ Zustand store for wallet state (`features/wallet/hooks/use-wallet.ts`)
- ✅ Connect/disconnect functionality
- ✅ Persistent storage (localStorage)
- ✅ Connect Wallet button component
- ✅ Integrated into navbar

### 4. Contract Integration
- ✅ Contract call wrappers (`lib/stacks/contracts.ts`):
  - Write functions: deposit, withdraw, withdrawAll, triggerDraw, claimPrize
  - Read functions: getPoolDashboard, getUserDashboard, getBalance, etc.
- ✅ React Query provider configured
- ✅ Pool dashboard hook with auto-polling (10s)

### 5. Homepage
- ✅ Hero section with prize display
- ✅ Pool stats cards (Total Pool, Participants, Next Draw countdown)
- ✅ Last winner display (if draw occurred)
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Beautiful glassmorphism cards with gradients

## 🔄 To Do Next

### Priority 1: Test Current Features
```bash
cd /Users/razvanmihailescu/VSC_repos/StacksHackathon_StackPot/frontend
npm run dev
```

Then:
1. Open http://localhost:3000
2. Connect wallet (Leather or Xverse on testnet)
3. Verify pool data loads correctly
4. Check wallet connection persists on refresh

### Priority 2: User Dashboard
Create `features/user/hooks/use-user-dashboard.ts`:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserDashboard } from '@/lib/stacks/contracts';

export function useUserDashboard(address: string | null) {
  return useQuery({
    queryKey: ['user-dashboard', address],
    queryFn: async () => {
      if (!address) return null;
      const result = await getUserDashboard(address);
      return result.value;
    },
    enabled: !!address,
    refetchInterval: 10000,
  });
}
```

### Priority 3: Deposit Modal
Create `features/pool/components/deposit-modal.tsx`:
- Input for STX amount (validate >= 1 STX)
- Preview odds increase using `previewDeposit`
- Submit triggers `deposit()` hook
- Show transaction status

### Priority 4: Withdraw Modal
Create `features/pool/components/withdraw-modal.tsx`:
- Input for withdrawal amount or "Withdraw All" button
- Show current balance
- Validate amount <= balance
- Submit triggers `withdraw()` or `withdrawAll()`

### Priority 5: Draw Trigger
Create `features/draw/components/trigger-draw-button.tsx`:
- Only enabled when `canTriggerDraw()` returns true
- Large, prominent button
- Shows transaction loading state
- Winner announcement modal on success

## 📁 File Structure

```
frontend/
├── app/
│   ├── layout.tsx           ✅ With providers & navbar
│   ├── page.tsx             ✅ Homepage with pool stats
│   ├── providers.tsx        ✅ React Query provider
│   └── globals.css          ✅ Tailwind v4 config
├── features/
│   ├── wallet/
│   │   ├── hooks/
│   │   │   └── use-wallet.ts          ✅
│   │   └── components/
│   │       └── connect-button.tsx     ✅
│   ├── pool/
│   │   ├── hooks/
│   │   │   ├── use-pool-dashboard.ts  ✅
│   │   │   ├── use-deposit.ts         ⏳ TODO
│   │   │   └── use-withdraw.ts        ⏳ TODO
│   │   └── components/
│   │       ├── deposit-modal.tsx      ⏳ TODO
│   │       └── withdraw-modal.tsx     ⏳ TODO
│   ├── draw/
│   │   ├── hooks/
│   │   │   └── use-trigger-draw.ts    ⏳ TODO
│   │   └── components/
│   │       └── trigger-draw-button.tsx ⏳ TODO
│   └── user/
│       ├── hooks/
│       │   └── use-user-dashboard.ts  ⏳ TODO
│       └── components/
│           └── user-stats.tsx         ⏳ TODO
├── lib/
│   ├── stacks/
│   │   ├── config.ts        ✅
│   │   └── contracts.ts     ✅
│   └── utils.ts             ✅
└── components/
    └── ui/                  ⏳ Reusable UI components as needed
```

## 🎨 Design System (Already Configured)

### Colors
- `sunset-orange`: #FF6B35
- `deep-plum`: #4A1D7C
- `electric-violet`: #7B2FBF
- `charcoal`: #1A1A1A
- `slate-gray`: #2D2D2D
- `soft-white`: #F8F8F8
- `bitcoin-gold`: #F7931A

### Gradients
- `bg-hero-gradient`: Orange to violet
- `bg-card-gradient`: Deep plum to electric violet
- `bg-mesh`: Mesh background with radial gradients

### Custom Utilities
- `text-hero`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`
- `glass-card`: Glassmorphism effect
- `mesh-background`: Background with mesh gradient
- `animate-shimmer`, `animate-spin-slow`

## 🔗 Contract Addresses (Testnet)

- **Pool Manager**: `ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.pool-manager`
- **Prize Distributor**: `ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.prize-distributor`

## 🧪 Testing Checklist

- [ ] `npm run dev` starts successfully
- [ ] Homepage loads without errors
- [ ] Pool stats display correctly
- [ ] Connect wallet works (Leather/Xverse)
- [ ] Wallet address shows in navbar
- [ ] Wallet persists on refresh
- [ ] Pool data updates every 10 seconds
- [ ] Responsive design works on mobile

## 🚀 Next Steps Summary

1. **Test current implementation** - Make sure everything runs
2. **Add deposit flow** - Modal + transaction
3. **Add withdraw flow** - Modal + transaction
4. **Add user dashboard** - Show user's stats when connected
5. **Add draw trigger** - Button to trigger draws
6. **Polish & animations** - Add loading states, transitions
7. **Deploy to Vercel** - `npx vercel --prod`

## 📝 Notes

- Using Tailwind v4 CSS-first configuration (not JavaScript config)
- All contract interactions go through `@stacks/connect` for wallet signing
- Read-only calls use `callReadOnlyFunction` from `@stacks/transactions`
- Real-time updates via React Query polling (10s interval)
- Testnet only (change NETWORK constant for mainnet)

## 🐛 Known Issues

None yet - need to test!

## 💡 Tips

- Check browser console for any connection errors
- Make sure you're on testnet with your wallet
- Ensure you have testnet STX to test deposits
- The contract may return no data if no one has deposited yet
