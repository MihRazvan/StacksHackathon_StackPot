#!/bin/bash

# ========================================
# StackPot Testnet Deployment Script
# ========================================
# This script deploys StackPot contracts to Stacks testnet
# with DEMO MODE ENABLED for presentations
#
# Requirements:
# - Clarinet CLI installed
# - Testnet STX in deployer wallet
#
# Usage:
#   chmod +x scripts/deploy-testnet.sh
#   ./scripts/deploy-testnet.sh
# ========================================

set -e  # Exit on error

echo "======================================"
echo "StackPot Testnet Deployment (DEMO MODE)"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo -e "${RED}ERROR: Clarinet is not installed${NC}"
    echo "Please install Clarinet: https://docs.hiro.so/clarinet"
    exit 1
fi

echo -e "${BLUE}1. Validating contracts...${NC}"
clarinet check
echo -e "${GREEN}✓ All contracts valid${NC}"
echo ""

echo -e "${BLUE}2. Deployment Configuration:${NC}"
echo "   Network: Testnet"
echo "   Node: https://api.testnet.hiro.so"
echo "   Demo Mode: ENABLED (true)"
echo "   Contracts to deploy:"
echo "     - stacking-adapter.clar"
echo "     - pool-manager.clar"
echo "     - prize-distributor.clar"
echo ""

echo -e "${YELLOW}IMPORTANT: Demo Mode Configuration${NC}"
echo "   ✓ demo-mode = true (for presentations)"
echo "   ✓ Simulated yield enabled"
echo "   ✓ StackingDAO calls commented (simulated 1:1 ratio)"
echo ""

# Confirm deployment
echo -e "${YELLOW}Ready to deploy to TESTNET?${NC}"
read -p "Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo -e "${BLUE}3. Deploying contracts to testnet...${NC}"

# Deploy using Clarinet
# Note: Clarinet will use settings/Testnet.toml configuration
# Create deployment plan if it doesn't exist
if [ ! -f "deployments/default.testnet-plan.yaml" ]; then
    echo "Generating testnet deployment plan..."
    clarinet deployments generate --testnet
fi

# Apply the deployment
clarinet deployments apply -p deployments/default.testnet-plan.yaml

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}Deployment Details:${NC}"
echo "   Network: Testnet"
echo "   Explorer: https://explorer.hiro.so/?chain=testnet"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "   1. Find your contract addresses in the output above"
echo "   2. Update frontend with new contract addresses"
echo "   3. Test the complete flow:"
echo "      - Deposit STX"
echo "      - Call simulate-yield-for-demo (owner only)"
echo "      - Trigger draw"
echo "      - Withdraw STX"
echo ""

echo -e "${BLUE}Demo Mode Functions:${NC}"
echo "   • (contract-call? .stacking-adapter simulate-yield-for-demo u5000000)"
echo "     → Simulates 5 STX of yield"
echo "   • (contract-call? .stacking-adapter get-accumulated-yield)"
echo "     → Check current yield"
echo "   • (contract-call? .stacking-adapter set-demo-mode false)"
echo "     → Disable demo mode (not recommended for testnet)"
echo ""

echo -e "${GREEN}Ready for demo! 🚀${NC}"
echo ""
