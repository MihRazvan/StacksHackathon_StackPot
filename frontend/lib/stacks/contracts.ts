import { request } from '@stacks/connect';
import {
  fetchCallReadOnlyFunction,
  cvToValue,
  cvToHex,
  Pc,
  postConditionToHex
} from '@stacks/transactions';
import { CONTRACTS, NETWORK, getContractParts } from './config';
import { uintCV, principalCV } from '@stacks/transactions';

// ===== WRITE FUNCTIONS (require wallet signature) =====

export async function deposit(amountMicroStx: number, userAddress: string) {
  console.log('💰 [deposit] Initiating deposit contract call:', { amountMicroStx, userAddress });

  // Create post-condition: user will transfer <= amountMicroStx STX
  // Using Pc builder pattern: Pc.principal(address).willSendLte(amount).ustx()
  const postCondition = Pc.principal(userAddress).willSendLte(amountMicroStx).ustx();

  console.log('💰 [deposit] Created post-condition:', postCondition);

  // Serialize post-condition to hex
  const postConditionHex = postConditionToHex(postCondition);
  console.log('💰 [deposit] Serialized post-condition to hex:', postConditionHex);

  return await request('stx_callContract', {
    contract: CONTRACTS.POOL_MANAGER,
    functionName: 'deposit',
    functionArgs: [cvToHex(uintCV(amountMicroStx))],
    postConditions: [postConditionHex],
  });
}

export async function withdraw(amountMicroStx: number, userAddress: string) {
  console.log('💸 [withdraw] Initiating withdraw contract call:', { amountMicroStx, userAddress });

  // For withdrawals, the contract sends STX to the user
  // We need to set post-condition mode to 'allow' to permit the contract transfer
  return await request('stx_callContract', {
    contract: CONTRACTS.POOL_MANAGER,
    functionName: 'withdraw',
    functionArgs: [cvToHex(uintCV(amountMicroStx))],
    postConditionMode: 'allow',
  });
}

export async function withdrawAll(userAddress: string) {
  console.log('💸 [withdrawAll] Initiating withdraw-all contract call:', { userAddress });

  // For withdraw-all, we need to set post-condition mode to 'allow'
  return await request('stx_callContract', {
    contract: CONTRACTS.POOL_MANAGER,
    functionName: 'withdraw-all',
    functionArgs: [],
    postConditionMode: 'allow',
  });
}

export async function triggerDraw() {
  console.log('🎰 [triggerDraw] Initiating trigger-draw contract call');

  return await request('stx_callContract', {
    contract: CONTRACTS.PRIZE_DISTRIBUTOR,
    functionName: 'trigger-draw',
    functionArgs: [],
  });
}

export async function claimPrize(drawId: number) {
  console.log('🎁 [claimPrize] Initiating claim-prize contract call:', { drawId });

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
