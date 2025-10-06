# StackPot - No-Loss Lottery on Stacks

A prize-linked savings protocol on Stacks blockchain. Users deposit STX tokens into a pool that automatically Stacks to earn Bitcoin rewards. One random winner takes the weekly prize pool while all participants keep 100% of their deposits.

## Project Structure

```
stackpot/
├── contracts/
│   └── pool-manager.clar         # Core pool management contract
├── tests/
│   └── pool-manager.test.ts      # Vitest unit tests
├── settings/
│   ├── Devnet.toml
│   ├── Testnet.toml
│   └── Mainnet.toml
└── Clarinet.toml                 # Project configuration
```

## Contracts

### pool-manager.clar

The core contract handling:
- **STX deposits** with 1 STX minimum (`deposit`)
- **STX withdrawals** anytime (`withdraw`, `withdraw-all`)
- **Participant tracking** for winner selection
- **Balance management** with security checks

#### Key Functions

**Public Functions:**
- `(deposit (amount uint))` - Deposit STX into pool
- `(withdraw (amount uint))` - Withdraw specific amount
- `(withdraw-all)` - Withdraw entire balance

**Read-Only Functions:**
- `(get-balance (participant principal))` - Get user's balance
- `(get-total-pool)` - Get total pool size
- `(get-participant-count)` - Get number of participants
- `(get-participant (index uint))` - Get participant by index (for winner selection)
- `(get-contract-info)` - Get contract constants and state

#### Security Features

1. **Checks-Effects-Interactions Pattern**: Updates state before transfers
2. **Input Validation**: Minimum deposit enforcement (1 STX)
3. **Reentrancy Protection**: State updates before external calls
4. **Participant Limit**: Max 1,000 participants
5. **Balance Verification**: Prevents over-withdrawal

#### Data Structures

```clarity
;; Track individual balances
(define-map participant-balances principal uint)

;; Track participant list for winner selection
(define-map participant-list uint principal)

;; Reverse lookup for participant indices
(define-map participant-index principal uint)

;; Total pool balance
(define-data-var total-pool-balance uint u0)

;; Participant counter
(define-data-var participant-count uint u0)
```

## Getting Started

### Prerequisites

- Clarinet 3.7.0+ installed
- Node.js 20+ (for unit tests)

### Installation

```bash
# Install dependencies
npm install

# Check contract syntax
clarinet check

# Run unit tests (requires Node.js 20+)
npm test
```

### Manual Testing

Since the project requires Node.js 20+ for vitest, you can test manually using Clarinet console:

```bash
# Start Clarinet console
clarinet console

# In the console, run:
(contract-call? .pool-manager get-total-pool)
(contract-call? .pool-manager deposit u1000000)  ;; Deposit 1 STX
(contract-call? .pool-manager get-balance tx-sender)
(contract-call? .pool-manager withdraw u500000)  ;; Withdraw 0.5 STX
(contract-call? .pool-manager withdraw-all)
```

Or use the provided test script:
```bash
# In clarinet console:
::load test-script.clar
```

## Development Status

### ✅ Completed (Week 1)
- [x] Clarinet project setup
- [x] Pool manager contract with deposit/withdraw
- [x] Participant tracking system
- [x] Balance management
- [x] Basic security measures
- [x] Unit tests (vitest)
- [x] Manual test script

### 🚧 Next Steps (Week 2)

1. **Prize Distribution Contract**
   - Bitcoin block-based randomness
   - Winner selection using `(mod block-hash participant-count)`
   - Prize claiming mechanism
   - Weekly draw timing (~1,008 blocks)

2. **StackingDAO Integration**
   - Interface with StackingDAO contracts
   - Automatic stacking of pooled STX
   - Bitcoin reward collection
   - Prize pool accumulation

3. **Frontend Development**
   - React/Next.js setup
   - Stacks.js wallet integration (Leather/Xverse)
   - Pool stats dashboard
   - Deposit/withdraw UI
   - Winner history display

4. **Testing & Deployment**
   - Integration tests
   - Testnet deployment
   - Frontend-contract integration
   - Security review

## Architecture Notes

### Participant Management

The contract maintains three data structures for efficient participant tracking:

1. **participant-balances**: `principal -> uint` - Fast balance lookups
2. **participant-list**: `uint -> principal` - Array-like structure for winner selection
3. **participant-index**: `principal -> uint` - Reverse lookup for indices

When a user withdraws all funds, their balance is set to zero but they remain in the participant list to maintain index stability. The `get-participant` function filters out inactive participants.

### Winner Selection (To Be Implemented)

```clarity
;; Pseudocode for next contract
(define-read-only (select-winner)
  (let (
    (block-hash (unwrap! (get-block-info? header-hash (- burn-block-height u1)) none))
    (active-count (get-active-participant-count))
    (winner-index (mod (buff-to-uint block-hash) active-count))
  )
    (get-participant winner-index)
  )
)
```

### Edge Cases Handled

1. **Empty pool during draw**: Check participant count before selection
2. **User withdraws during draw**: Snapshot participants at draw time
3. **List growth beyond 1000**: Enforced MAX_PARTICIPANTS limit
4. **Reentrancy attacks**: State updates before transfers
5. **Integer overflow**: Clarity has built-in overflow protection

## Error Codes

- `u100` - ERR-NOT-AUTHORIZED
- `u101` - ERR-INVALID-AMOUNT
- `u102` - ERR-INSUFFICIENT-BALANCE
- `u103` - ERR-TRANSFER-FAILED
- `u104` - ERR-PARTICIPANT-LIMIT-REACHED

## Contract Addresses (TBD)

- Testnet: (deploy after testing)
- Mainnet: (deploy after audit)

## Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity/)
- [Clarinet Documentation](https://docs.hiro.so/clarinet/)
- [StackingDAO](https://www.stackingdao.com/)
- [PoolTogether Inspiration](https://pooltogether.com/)

## License

MIT

## Hackathon Deadline

**October 17th, 2025**

---

Built with Claude Code for Stacks Hackathon
