#!/bin/bash

# ========================================
# StackPot Mainnet Deployment Script
# ========================================
# This script deploys StackPot contracts to Stacks mainnet
# with DEMO MODE DISABLED and REAL StackingDAO integration
#
# ⚠️  IMPORTANT PREREQUISITES:
# 1. Uncomment StackingDAO calls in stacking-adapter.clar
# 2. Set demo-mode = false in stacking-adapter.clar
# 3. Update Mainnet.toml with your production mnemonic
# 4. Test thoroughly on testnet first
# 5. Have sufficient STX for deployment fees
#
# Usage:
#   chmod +x scripts/deploy-mainnet.sh
#   ./scripts/deploy-mainnet.sh
# ========================================

set -e  # Exit on error

echo "======================================"
echo "StackPot Mainnet Deployment (PRODUCTION)"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Check if Clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo -e "${RED}ERROR: Clarinet is not installed${NC}"
    echo "Please install Clarinet: https://docs.hiro.so/clarinet"
    exit 1
fi

echo -e "${RED}⚠️  MAINNET DEPLOYMENT - PRODUCTION CHECKLIST ⚠️${NC}"
echo ""

# Checklist
echo -e "${YELLOW}Required Configuration Changes:${NC}"
echo ""
echo "1. stacking-adapter.clar:"
echo "   [ ] Line 29: (define-data-var demo-mode bool false)"
echo "   [ ] Line ~54: Uncomment StackingDAO deposit call"
echo "   [ ] Line ~114: Uncomment StackingDAO instant-withdrawal call"
echo "   [ ] Line ~93: Uncomment StackingDAO init-withdraw call"
echo "   [ ] Line ~142: Uncomment StackingDAO withdraw call"
echo ""
echo "2. settings/Mainnet.toml:"
echo "   [ ] Update mnemonic with production wallet"
echo "   [ ] Verify wallet has sufficient STX for deployment"
echo ""
echo "3. Testing:"
echo "   [ ] All tests passing on testnet"
echo "   [ ] Frontend tested with testnet deployment"
echo "   [ ] Smart contract audited (recommended)"
echo ""

# Confirmation
echo -e "${RED}Have you completed ALL checklist items above?${NC}"
read -p "Continue with mainnet deployment? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Deployment cancelled. Please complete checklist first."
    exit 1
fi

echo ""
echo -e "${BLUE}Validating contracts...${NC}"
clarinet check
echo -e "${GREEN}✓ All contracts valid${NC}"
echo ""

# Verify demo mode is disabled
echo -e "${BLUE}Checking configuration...${NC}"
if grep -q "define-data-var demo-mode bool true" contracts/stacking-adapter.clar; then
    echo -e "${RED}ERROR: Demo mode is still ENABLED!${NC}"
    echo "Please set: (define-data-var demo-mode bool false)"
    echo "in contracts/stacking-adapter.clar line 29"
    exit 1
fi
echo -e "${GREEN}✓ Demo mode is disabled${NC}"

# Check if StackingDAO calls are uncommented
if grep -q "TODO: Call StackingDAO" contracts/stacking-adapter.clar; then
    echo -e "${RED}WARNING: StackingDAO calls may still be commented!${NC}"
    echo "Please uncomment all TODO sections in stacking-adapter.clar"
    read -p "Continue anyway? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        exit 1
    fi
fi
echo ""

echo -e "${BLUE}Deployment Configuration:${NC}"
echo "   Network: Mainnet"
echo "   Node: https://api.hiro.so"
echo "   Demo Mode: DISABLED (false)"
echo "   StackingDAO: ENABLED (real integration)"
echo "   Contracts to deploy:"
echo "     - stacking-adapter.clar"
echo "     - pool-manager.clar"
echo "     - prize-distributor.clar"
echo ""

# Final confirmation
echo -e "${RED}⚠️  FINAL WARNING ⚠️${NC}"
echo -e "${RED}You are about to deploy to MAINNET with REAL STX.${NC}"
echo -e "${RED}This action cannot be undone.${NC}"
echo ""
read -p "Type 'DEPLOY' to confirm: " -r
echo ""
if [[ ! $REPLY == "DEPLOY" ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo -e "${BLUE}Deploying contracts to mainnet...${NC}"

# Deploy using Clarinet
# Note: Clarinet will use settings/Mainnet.toml configuration
# Create deployment plan if it doesn't exist
if [ ! -f "deployments/default.mainnet-plan.yaml" ]; then
    echo "Generating mainnet deployment plan..."
    clarinet deployments generate --mainnet
fi

# Apply the deployment
clarinet deployments apply -p deployments/default.mainnet-plan.yaml

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Mainnet Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}Deployment Details:${NC}"
echo "   Network: Mainnet"
echo "   Explorer: https://explorer.hiro.so/?chain=mainnet"
echo ""

echo -e "${YELLOW}Post-Deployment Tasks:${NC}"
echo "   1. Verify contracts on Stacks Explorer"
echo "   2. Test deposit with small amount (1-10 STX)"
echo "   3. Monitor StackingDAO integration"
echo "   4. Update frontend with mainnet contract addresses"
echo "   5. Wait 14+ days for first stacking rewards"
echo "   6. Test draw trigger when yield accumulates"
echo ""

echo -e "${BLUE}Important Contract Functions:${NC}"
echo "   • Deposit: Automatically routes to StackingDAO"
echo "   • Withdraw: Uses instant withdrawal (1% fee)"
echo "   • Check yield: (contract-call? .stacking-adapter get-accumulated-yield)"
echo "   • Trigger draw: (contract-call? .prize-distributor trigger-draw)"
echo ""

echo -e "${MAGENTA}Monitor your deployment:${NC}"
echo "   Explorer: https://explorer.hiro.so/?chain=mainnet"
echo "   StackingDAO: https://app.stackingdao.com"
echo ""

echo -e "${GREEN}Production deployment successful! 🎉${NC}"
echo ""
