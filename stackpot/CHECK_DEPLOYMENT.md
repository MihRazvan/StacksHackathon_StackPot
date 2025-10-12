# Checking Your Testnet Deployment

## What Happened

You got `ContractAlreadyExists` error because you previously deployed contracts to testnet.

**Your deployer address:** `ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA`

## Check What's Already Deployed

Visit the Stacks Explorer:
```
https://explorer.hiro.so/address/ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA?chain=testnet
```

Look for these contracts:
- ✅ `pool-manager` (already exists)
- ✅ `prize-distributor` (already exists)
- ❓ `stacking-adapter` (need to verify)

## Solutions

### Solution 1: Check & Use Existing Contracts (FASTEST)

If `stacking-adapter` is already deployed (check Explorer), you can use your existing contracts!

**Your testnet contracts:**
```
ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.stacking-adapter
ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.pool-manager
ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.prize-distributor
```

**BUT:** These are the OLD versions WITHOUT demo mode functions!

### Solution 2: Deploy with New Names (RECOMMENDED)

Deploy updated contracts with version suffixes to avoid conflicts:

```bash
# 1. Update Clarinet.toml to use v2 names
# Change:
[contracts.stacking-adapter]
# To:
[contracts.stacking-adapter-v2]

# 2. Regenerate deployment plan
rm deployments/default.testnet-plan.yaml
clarinet deployments generate --testnet

# 3. Deploy
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

This will deploy:
- `ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.stacking-adapter-v2` (NEW with demo mode!)
- `ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.pool-manager-v2` (NEW with stacking integration)
- `ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.prize-distributor-v2` (NEW with real yield)

### Solution 3: Use Different Wallet

Deploy with a fresh wallet that has no existing contracts:

```bash
# 1. Create new testnet wallet in Hiro Wallet
# 2. Get testnet STX from faucet
# 3. Update settings/Testnet.toml with new mnemonic
# 4. Deploy
./scripts/deploy-testnet.sh
```

## Recommended Action

**I recommend Solution 2** - Deploy with v2 names.

This way:
- ✅ You keep the old contracts as backup
- ✅ You get new contracts with all the demo mode features
- ✅ No need to get new wallets or testnet STX
- ✅ Clear version separation

## Quick Fix Script

Want me to create a script that:
1. Backs up your Clarinet.toml
2. Updates contract names to v2
3. Regenerates deployment plan
4. Deploys the v2 contracts

Let me know and I'll create that for you!

## Check Existing Deployment

To see what you currently have on testnet:
```
https://explorer.hiro.so/address/ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA?chain=testnet
```

Click on each contract to see their source code and verify if they have demo mode functions.
