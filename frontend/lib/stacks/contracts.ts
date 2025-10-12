import { request } from '@stacks/connect';
import {
  fetchCallReadOnlyFunction,
  cvToValue,
  cvToHex,
  uintCV,
  principalCV
} from '@stacks/transactions';
import { CONTRACTS, NETWORK, getContractParts } from './config';

// ===== WRITE FUNCTIONS (require wallet signature) =====

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deposit(amountMicroStx: number, userAddress: string) {
  // With v3 contracts, the deposit flow involves multiple transfers:
  // 1. User -> pool-manager-v3
  // 2. pool-manager-v3 -> stacking-adapter-v3
  // We use 'allow' mode to permit these contract-to-contract transfers
  return await request('stx_callContract', {
    contract: CONTRACTS.POOL_MANAGER,
    functionName: 'deposit',
    functionArgs: [cvToHex(uintCV(amountMicroStx))],
    postConditionMode: 'allow',
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function withdraw(amountMicroStx: number, userAddress: string) {
  // For withdrawals, the contract sends STX to the user
  // We need to set post-condition mode to 'allow' to permit the contract transfer
  return await request('stx_callContract', {
    contract: CONTRACTS.POOL_MANAGER,
    functionName: 'withdraw',
    functionArgs: [cvToHex(uintCV(amountMicroStx))],
    postConditionMode: 'allow',
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function withdrawAll(userAddress: string) {
  // For withdraw-all, we need to set post-condition mode to 'allow'
  return await request('stx_callContract', {
    contract: CONTRACTS.POOL_MANAGER,
    functionName: 'withdraw-all',
    functionArgs: [],
    postConditionMode: 'allow',
  });
}

export async function triggerDraw() {
  // Trigger draw may transfer STX to winner, so use 'allow' mode
  return await request('stx_callContract', {
    contract: CONTRACTS.PRIZE_DISTRIBUTOR,
    functionName: 'trigger-draw',
    functionArgs: [],
    postConditionMode: 'allow',
  });
}

export async function claimPrize(drawId: number) {
  return await request('stx_callContract', {
    contract: CONTRACTS.PRIZE_DISTRIBUTOR,
    functionName: 'claim-prize',
    functionArgs: [cvToHex(uintCV(drawId))],
  });
}

// ===== READ-ONLY FUNCTIONS =====

export async function getPoolDashboard() {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-pool-dashboard',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getUserDashboard(userAddress: string) {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-user-dashboard',
    functionArgs: [principalCV(userAddress)],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getBalance(userAddress: string) {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-balance',
    functionArgs: [principalCV(userAddress)],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getWinProbability(userAddress: string) {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-win-probability',
    functionArgs: [principalCV(userAddress)],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function previewDeposit(userAddress: string, amountMicroStx: number) {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'preview-deposit',
    functionArgs: [principalCV(userAddress), uintCV(amountMicroStx)],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function canTriggerDraw() {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'can-trigger-draw',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function blocksUntilNextDraw() {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'blocks-until-next-draw',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getCurrentDrawInfo() {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-current-draw-info',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getDrawInfo(drawId: number) {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-draw-info',
    functionArgs: [uintCV(drawId)],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

// ===== STACKING ADAPTER FUNCTIONS =====

export async function simulateYieldForDemo(yieldAmount: number) {
  console.log('⚡ [simulateYieldForDemo] Simulating yield for demo:', { yieldAmount });

  return await request('stx_callContract', {
    contract: CONTRACTS.STACKING_ADAPTER,
    functionName: 'simulate-yield-for-demo',
    functionArgs: [cvToHex(uintCV(yieldAmount))],
    postConditionMode: 'allow',
  });
}

export async function getAccumulatedYield() {
  const { address, name } = getContractParts(CONTRACTS.STACKING_ADAPTER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-accumulated-yield',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getPoolYield() {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-pool-yield',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getUserWithdrawalEstimate(userAddress: string) {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-user-withdrawal-estimate',
    functionArgs: [principalCV(userAddress)],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getContractStSTXValue() {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-contract-ststx-value',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function isDemoMode() {
  const { address, name } = getContractParts(CONTRACTS.STACKING_ADAPTER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'is-demo-mode',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export async function getSimulatedYield() {
  const { address, name } = getContractParts(CONTRACTS.STACKING_ADAPTER);

  const result = await fetchCallReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-simulated-yield',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}

export function getInstantWithdrawalFee(amountMicroStx: number) {
  // Calculate 1% fee locally (100 basis points = 1%)
  return Math.floor(amountMicroStx * 0.01);
}
