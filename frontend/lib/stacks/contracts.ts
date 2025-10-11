import { request } from '@stacks/connect';
import { callReadOnlyFunction, cvToValue, hexToCV } from '@stacks/transactions';
import { CONTRACTS, NETWORK, getContractParts } from './config';
import { uintCV, principalCV } from '@stacks/transactions';

// ===== WRITE FUNCTIONS (require wallet signature) =====

export async function deposit(amountMicroStx: number) {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  return await request('stx_callContract', {
    contractAddress: address,
    contractName: name,
    functionName: 'deposit',
    functionArgs: [uintCV(amountMicroStx)],
  });
}

export async function withdraw(amountMicroStx: number) {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  return await request('stx_callContract', {
    contractAddress: address,
    contractName: name,
    functionName: 'withdraw',
    functionArgs: [uintCV(amountMicroStx)],
  });
}

export async function withdrawAll() {
  const { address, name } = getContractParts(CONTRACTS.POOL_MANAGER);

  return await request('stx_callContract', {
    contractAddress: address,
    contractName: name,
    functionName: 'withdraw-all',
    functionArgs: [],
  });
}

export async function triggerDraw() {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  return await request('stx_callContract', {
    contractAddress: address,
    contractName: name,
    functionName: 'trigger-draw',
    functionArgs: [],
  });
}

export async function claimPrize(drawId: number) {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  return await request('stx_callContract', {
    contractAddress: address,
    contractName: name,
    functionName: 'claim-prize',
    functionArgs: [uintCV(drawId)],
  });
}

// ===== READ-ONLY FUNCTIONS =====

export async function getPoolDashboard() {
  const { address, name } = getContractParts(CONTRACTS.PRIZE_DISTRIBUTOR);

  const result = await callReadOnlyFunction({
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

  const result = await callReadOnlyFunction({
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

  const result = await callReadOnlyFunction({
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

  const result = await callReadOnlyFunction({
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

  const result = await callReadOnlyFunction({
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

  const result = await callReadOnlyFunction({
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

  const result = await callReadOnlyFunction({
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

  const result = await callReadOnlyFunction({
    contractAddress: address,
    contractName: name,
    functionName: 'get-current-draw-info',
    functionArgs: [],
    network: NETWORK,
    senderAddress: address,
  });

  return cvToValue(result);
}
