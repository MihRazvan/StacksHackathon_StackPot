# StackPot - Quick Start Guide

## What We Built (Week 1 - Complete ✅)

A fully functional **pool-manager** contract that handles:
- STX deposits (minimum 1 STX)
- STX withdrawals (partial or full, anytime)
- Participant tracking for winner selection
- Security features (reentrancy protection, input validation)

## Project Location

All code is in: `./stackpot/`

```
stackpot/
├── contracts/pool-manager.clar    # 194 lines - DONE
├── tests/pool-manager.test.ts     # Comprehensive tests - DONE
└── test-script.clar               # Manual test script
```

## Testing Your Contract

### Option 1: Clarinet Console (Easiest)

```bash
cd stackpot
clarinet console
```

Then in the console:
```clarity
;; Check initial state
(contract-call? .pool-manager get-total-pool)
>> (ok u0)

;; Deposit 5 STX
(contract-call? .pool-manager deposit u5000000)
>> (ok {deposited: u5000000, new-balance: u5000000, total-pool: u5000000})

;; Check your balance
(contract-call? .pool-manager get-balance tx-sender)
>> (ok u5000000)

;; Check participant info
(contract-call? .pool-manager get-participant-count)
>> (ok u1)

(contract-call? .pool-manager get-participant u0)
>> (ok (some {participant: ST1..., balance: u5000000}))

;; Withdraw 2 STX
(contract-call? .pool-manager withdraw u2000000)
>> (ok {withdrawn: u2000000, remaining-balance: u3000000, total-pool: u3000000})

;; Withdraw everything
(contract-call? .pool-manager withdraw-all)
>> (ok {withdrawn: u3000000, remaining-balance: u0, total-pool: u0})
```

### Option 2: Run Test Script

```bash
cd stackpot
clarinet console

# In console:
::load test-script.clar
```

### Option 3: Unit Tests (Requires Node.js 20+)

```bash
cd stackpot
npm install
npm test
```

## What to Build Next (Week 2)

### Priority 1: Prize Distribution Contract

Create `contracts/prize-distributor.clar`:

```clarity
;; Key features needed:
;; 1. Read Bitcoin block hash for randomness
(define-read-only (get-block-hash)
  (get-block-info? header-hash (- burn-block-height u1)))

;; 2. Select winner using modulo
(define-read-only (select-winner (participant-count uint))
  (let (
    (block-hash (unwrap! (get-block-hash) (err u200)))
    (hash-uint (buff-to-uint-be block-hash))
    (winner-index (mod hash-uint participant-count))
  )
    (ok winner-index)))

;; 3. Track draw schedule (every 1,008 blocks ≈ 1 week)
(define-data-var last-draw-height uint u0)
(define-constant BLOCKS-PER-WEEK u1008)

;; 4. Distribute Bitcoin prizes to winner
;; 5. Emit winner events
```

**Why this matters**: This is the core "lottery" logic. Without it, you just have a savings pool.

### Priority 2: StackingDAO Integration

Create `contracts/stacking-manager.clar`:

```clarity
;; Interface with StackingDAO
;; Key tasks:
;; 1. Call StackingDAO's deposit function with pooled STX
;; 2. Track Bitcoin rewards earned
;; 3. Accumulate rewards into prize pool
;; 4. Handle Stacking cycles (~2 weeks)

;; Note: You may simulate this for MVP if StackingDAO integration is complex
```

**MVP Alternative**: For the hackathon, you could simulate Bitcoin rewards by:
- Having contract owner manually add "mock rewards" to prize pool
- This lets you demo the lottery without full Stacking integration
- Document: "StackingDAO integration pending - using simulated rewards"

### Priority 3: Frontend (React + Stacks.js)

```bash
# In project root (not stackpot/)
npx create-next-app@latest stackpot-ui
cd stackpot-ui
npm install @stacks/connect @stacks/transactions @stacks/network
```

**Pages needed**:
1. **Home/Dashboard** (`/`)
   - Current pool size
   - Time to next draw (blocks countdown)
   - Your deposited amount
   - Your winning odds
   - Deposit/Withdraw buttons

2. **History** (`/history`)
   - Past winners
   - Prize amounts
   - Draw dates (block heights)

**Key Components**:
```typescript
// WalletConnect.tsx - Connect Leather/Xverse
// DepositForm.tsx - Call pool-manager.deposit
// WithdrawForm.tsx - Call pool-manager.withdraw
// PoolStats.tsx - Display get-total-pool, get-participant-count
// CountdownTimer.tsx - Show blocks until next draw
```

### Priority 4: Testing & Deployment

```bash
# Deploy to testnet
cd stackpot
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Test with real testnet STX
# Get testnet STX from faucet: https://explorer.hiro.so/sandbox/faucet
```

## Architecture Decisions Explained

### Why separate participant-list and participant-balances?

**Answer**: Clarity doesn't have dynamic arrays. We need:
- `participant-list`: For winner selection (iterate by index)
- `participant-balances`: For fast balance lookups
- `participant-index`: For reverse lookups

### Why keep inactive participants in the list?

**Answer**: Removing them would shift all indices, breaking the array-like structure. Instead:
- Mark balance as 0 when they withdraw
- `get-participant` returns `none` for zero-balance users
- Winner selection skips inactive participants

### How to handle list growth beyond 1,000?

**Current**: Hard limit at 1,000 (ERR-PARTICIPANT-LIMIT-REACHED)

**For production**: Consider:
1. Multiple "cohorts" with separate participant lists
2. Periodic list compaction (remove inactive users)
3. Weighted selection (users with more STX have more entries)

### Security concerns?

✅ **Handled**:
- Reentrancy: State updates before transfers
- Input validation: Minimum deposits, balance checks
- Integer overflow: Clarity has built-in protection

⚠️ **Still needed**:
- Front-running prevention: Draw timing should be deterministic
- Miner manipulation: Bitcoin block hashes are less gameable than Stacks blocks
- Prize distribution fairness: Ensure one-time claims per draw

## Timeline (8 Days Remaining)

**Days 1-2** (Oct 7-8): Prize distributor contract + tests
**Days 3-4** (Oct 9-10): Frontend basics (connect wallet, deposit/withdraw)
**Days 5-6** (Oct 11-12): Winner selection UI, history, styling
**Day 7** (Oct 13): Testnet deployment, integration testing
**Day 8** (Oct 14): Bug fixes, demo video, documentation
**Days 9-10** (Oct 15-16): Buffer for issues, polish presentation
**Day 11** (Oct 17): SUBMIT! 🚀

## Quick Commands Reference

```bash
# Check contract syntax
clarinet check

# Open console for testing
clarinet console

# Run tests (Node 20+ required)
npm test

# Generate deployment plan
clarinet deployments generate --testnet

# Deploy to testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

## Getting Help

- **Clarity docs**: https://docs.stacks.co/clarity/
- **Clarinet docs**: https://docs.hiro.so/clarinet/
- **Stacks.js docs**: https://stacks.js.org/
- **StackingDAO**: https://docs.stackingdao.com/

## What Questions to Ask Next

1. **"Help me implement the Bitcoin block hash randomness for winner selection"**
2. **"Create a simple prize-distributor contract"**
3. **"Show me how to integrate StackingDAO or simulate rewards"**
4. **"Help me set up a Next.js frontend with Stacks.js"**
5. **"How do I deploy to testnet and get testnet STX?"**

---

**You're off to a great start!** The hardest part (understanding Clarity and building the core contract) is done. Now it's about building on this foundation.

Your pool-manager contract is production-quality in terms of:
- Code structure ✅
- Security patterns ✅
- Data management ✅
- Error handling ✅

Next step: Make the lottery part work (randomness + prize distribution) 🎰
