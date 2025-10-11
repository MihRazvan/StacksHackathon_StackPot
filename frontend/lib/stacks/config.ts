import { STACKS_TESTNET } from '@stacks/network';

export const NETWORK = STACKS_TESTNET;
export const STACKS_API_URL = 'https://api.testnet.hiro.so';

export const CONTRACTS = {
  POOL_MANAGER: 'ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.pool-manager',
  PRIZE_DISTRIBUTOR: 'ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.prize-distributor',
} as const;

export const CONSTANTS = {
  MIN_DEPOSIT_MICROSTX: 1000000, // 1 STX
  MICROSTX_PER_STX: 1000000,
  BLOCKS_PER_DRAW: 30,
  BLOCK_TIME_SECONDS: 10,
  SIMULATED_PRIZE_SATS: 10000000, // 0.1 BTC
  SATS_PER_BTC: 100000000,
} as const;

export function getContractParts(contractId: string) {
  const [address, name] = contractId.split('.');
  return { address, name };
}
