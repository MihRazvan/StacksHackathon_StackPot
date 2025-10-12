# StackPot Deployment Guide

## 🎯 Quick Start

### For Hackathon Demo (Testnet)
```bash
cd stackpot
./scripts/deploy-testnet.sh
```

### For Production (Mainnet)
```bash
# 1. First, update contracts for production:
#    - Set demo-mode = false in stacking-adapter.clar
#    - Uncomment StackingDAO calls
#    - Update Mainnet.toml with production mnemonic

# 2. Then deploy:
./scripts/deploy-mainnet.sh
```

---

## 📦 What's Included

### Smart Contracts

1. **[stacking-adapter.clar](contracts/stacking-adapter.clar)** (NEW)
   - Abstracts StackingDAO integration
   - Handles STX → stSTX conversion
   - Manages withdrawals (instant + traditional)
   - **Demo Mode Functions:**
     - `simulate-yield-for-demo` - Add fake yield for presentations
     - `set-demo-mode` - Toggle demo mode on/off
     - `get-simulated-yield` - Check current simulated yield
     - `reset-simulated-yield` - Clear simulated yield

2. **[pool-manager.clar](contracts/pool-manager.clar)** (UPDATED)
   - Routes deposits through stacking-adapter
   - Uses instant withdrawal with 1% fee
   - New functions:
     - `get-contract-ststx-value` - Total value with yield
     - `get-user-withdrawal-estimate` - Preview withdrawal
     - `get-pool-yield` - Current accumulated yield

3. **[prize-distributor.clar](contracts/prize-distributor.clar)** (UPDATED)
   - Calculates prizes from real yield
   - No more simulated prizes
   - Works with both demo and production mode

### Deployment Scripts

- **[scripts/deploy-testnet.sh](scripts/deploy-testnet.sh)**
  - Deploys with demo-mode = true
  - Perfect for presentations
  - Uses simulated yield

- **[scripts/deploy-mainnet.sh](scripts/deploy-mainnet.sh)**
  - Deploys with demo-mode = false
  - Real StackingDAO integration
  - Production checklist included

### Documentation

- **[DEMO_GUIDE.md](../DEMO_GUIDE.md)** - Complete presentation guide
- **[STACKING_INTEGRATION_STATUS.md](../STACKING_INTEGRATION_STATUS.md)** - Technical details
- **[stackingdao_docs.md](../stackingdao_docs.md)** - StackingDAO reference

---

## 🔧 Configuration

### Demo Mode (Testnet)

**Current state:** `demo-mode = true` (line 29 in stacking-adapter.clar)

**What this means:**
- ✅ Yield can be simulated for demos
- ✅ No real StackingDAO calls (commented out)
- ✅ 1:1 stSTX/STX ratio (simulated)
- ✅ Perfect for controlled presentations

**To simulate yield:**
```clarity
;; Via Clarinet console or frontend
(contract-call? .stacking-adapter simulate-yield-for-demo u5000000)
;; Adds 5 STX of simulated yield
```

### Production Mode (Mainnet)

**Required changes:**

1. **Set demo-mode = false:**
   ```clarity
   ;; Line 29 in stacking-adapter.clar
   (define-data-var demo-mode bool false)  ;; Change true → false
   ```

2. **Uncomment StackingDAO calls:**
   - Line ~54: `deposit` function
   - Line ~93: `init-withdrawal` function
   - Line ~142: `withdraw` function
   - Line ~114: `instant-withdrawal` function

3. **Update Mainnet.toml:**
   ```toml
   [accounts.deployer]
   mnemonic = "your production mnemonic here"
   ```

---

## 🚀 Deployment Steps

### Testnet Deployment

```bash
# 1. Validate contracts
clarinet check

# 2. Run deployment script
./scripts/deploy-testnet.sh

# 3. Note contract addresses from output
# Example:
# stacking-adapter: ST1ABC...XYZ.stacking-adapter
# pool-manager: ST1ABC...XYZ.pool-manager
# prize-distributor: ST1ABC...XYZ.prize-distributor

# 4. Update frontend with addresses

# 5. Test demo flow:
#    a. Deposit STX
#    b. Simulate yield: (contract-call? .stacking-adapter simulate-yield-for-demo u5000000)
#    c. Trigger draw
#    d. Withdraw
```

### Mainnet Deployment

```bash
# 1. Complete production checklist (see mainnet script)
# 2. Set demo-mode = false
# 3. Uncomment StackingDAO calls
# 4. Update Mainnet.toml
# 5. Run deployment:

./scripts/deploy-mainnet.sh

# 6. Verify on Explorer:
# https://explorer.hiro.so/?chain=mainnet

# 7. Test with small amount (10 STX)
# 8. Monitor yield accumulation over days/weeks
```

---

## 📊 Testing Demo Mode

### Via Clarinet Console

```bash
clarinet console
```

```clarity
;; Check if demo mode is enabled
(contract-call? .stacking-adapter is-demo-mode)
;; Returns: (ok true)

;; Deposit 100 STX
(contract-call? .pool-manager deposit u100000000)

;; Simulate 2 weeks of stacking (5 STX yield)
(contract-call? .stacking-adapter simulate-yield-for-demo u5000000)

;; Check accumulated yield
(contract-call? .pool-manager get-pool-yield)
;; Returns: (ok {
;;   yield-accumulated: u5000000,
;;   demo-mode: true,
;;   simulated-yield: u5000000
;; })

;; Trigger draw (prize will be 5 STX!)
(contract-call? .prize-distributor trigger-draw)

;; Withdraw
(contract-call? .pool-manager withdraw u100000000)
```

### Via Frontend

```typescript
// Check demo mode
const isDemoMode = await contract.callReadOnly('is-demo-mode');
console.log('Demo mode:', isDemoMode.value); // true

// Simulate yield (owner only)
await contract.callPublic('simulate-yield-for-demo', [
  uintCV(5000000) // 5 STX
]);

// Get yield
const yield = await contract.callReadOnly('get-pool-yield');
console.log('Yield:', yield.value['yield-accumulated']); // 5000000
```

---

## ⚠️ Important Notes

### Demo Mode Security

**Demo mode functions are OWNER ONLY:**
- Only the contract deployer can call `simulate-yield-for-demo`
- Only owner can toggle `set-demo-mode`
- This prevents abuse in production

**For production:**
- Set `demo-mode = false` BEFORE mainnet deployment
- Demo functions will return errors if called
- Removes temptation to manipulate yield

### Gas Costs

**Testnet:**
- Free testnet STX from faucet
- Use for unlimited testing

**Mainnet:**
- Each deployment costs ~0.05-0.1 STX
- Keep extra STX for contract calls
- Test thoroughly on testnet first!

### Withdrawal Fees

**Instant Withdrawal:** 1% fee
- Example: Withdraw 100 STX → Receive 99 STX
- Fee compensates StackingDAO liquidity pool

**Traditional Withdrawal:** 0% fee
- Must wait 14 days (one stacking cycle)
- Receive NFT receipt
- Claim after cycle ends

---

## 🔍 Verification

### After Testnet Deployment

1. **Check contracts deployed:**
   ```bash
   # Visit Explorer
   https://explorer.hiro.so/?chain=testnet
   # Search for your deployer address
   ```

2. **Verify demo mode enabled:**
   ```clarity
   (contract-call? .stacking-adapter is-demo-mode)
   ;; Should return: (ok true)
   ```

3. **Test simulate function:**
   ```clarity
   (contract-call? .stacking-adapter simulate-yield-for-demo u1000000)
   ;; Should succeed if you're owner
   ```

### After Mainnet Deployment

1. **Verify demo mode disabled:**
   ```clarity
   (contract-call? .stacking-adapter is-demo-mode)
   ;; Should return: (ok false)
   ```

2. **Verify StackingDAO integration:**
   ```clarity
   ;; Try a small deposit
   (contract-call? .pool-manager deposit u10000000)
   ;; Check if stSTX was minted
   ```

3. **Monitor yield over time:**
   ```clarity
   ;; Check daily for ratio growth
   (contract-call? .stacking-adapter get-ststx-stx-ratio)
   ;; Should increase over days: 1.0000 → 1.0023 → 1.0045...
   ```

---

## 🆘 Troubleshooting

### "Clarinet command not found"
**Solution:** Install Clarinet: https://docs.hiro.so/clarinet

### "Demo mode already disabled"
**Solution:** You're ready for mainnet! Skip to production deployment

### "simulate-yield-for-demo returns error u300"
**Solution:** Only contract owner can call this. Use deployer wallet

### "simulate-yield-for-demo returns error u999"
**Solution:** Demo mode is disabled. This is expected for mainnet

### "Deployment failed: insufficient funds"
**Solution:** Get testnet STX from faucet or add mainnet STX

---

## 📞 Next Steps

1. **Deploy to testnet** → Test complete flow
2. **Update frontend** → Connect to deployed contracts
3. **Practice demo** → Use simulate-yield-for-demo
4. **Deploy to mainnet** → When ready for production
5. **Monitor yield** → Watch real BTC rewards accumulate

---

## 🎉 You're Ready!

Everything is set up for your hackathon demo. The contracts are ready to deploy, scripts are executable, and documentation is complete.

**For demo day:**
1. Run `./scripts/deploy-testnet.sh`
2. Use `simulate-yield-for-demo` to fast-forward time
3. Show judges the complete flow
4. Prove real integration with mainnet screenshots

**Good luck! 🚀**
