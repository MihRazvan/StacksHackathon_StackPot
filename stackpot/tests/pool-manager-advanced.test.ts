/**
 * Advanced Pool Manager Tests
 *
 * This file demonstrates advanced testing patterns using simnet features:
 * 1. Direct state inspection (getDataVar, getMapEntry)
 * 2. Event verification
 * 3. Block height manipulation
 *
 * These patterns are based on the official Stacks stream example.
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "pool-manager";
const MIN_DEPOSIT = 1_000_000; // 1 STX

describe("Advanced Pool Manager Tests", () => {

  describe("Direct State Inspection", () => {
    it("verifies internal state using getDataVar", () => {
      // Initial state
      const initialPool = simnet.getDataVar(CONTRACT_NAME, "total-pool-balance");
      expect(initialPool).toBeUint(0);

      const initialCount = simnet.getDataVar(CONTRACT_NAME, "participant-count");
      expect(initialCount).toBeUint(0);

      // After deposit
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 5)],
        wallet1
      );

      const poolAfterDeposit = simnet.getDataVar(CONTRACT_NAME, "total-pool-balance");
      expect(poolAfterDeposit).toBeUint(MIN_DEPOSIT * 5);

      const countAfterDeposit = simnet.getDataVar(CONTRACT_NAME, "participant-count");
      expect(countAfterDeposit).toBeUint(1);
    });

    it("verifies map entries using getMapEntry", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 3)],
        wallet1
      );

      // Check participant-balances map directly
      const balance = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-balances",
        Cl.principal(wallet1)
      );
      expect(balance).toBeSome(Cl.uint(MIN_DEPOSIT * 3));

      // Check participant-list map (index 0 should be wallet1)
      const participant = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-list",
        Cl.uint(0)
      );
      expect(participant).toBeSome(Cl.principal(wallet1));

      // Check participant-index map (wallet1 should have index 0)
      const index = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-index",
        Cl.principal(wallet1)
      );
      expect(index).toBeSome(Cl.uint(0));
    });

    it("tracks multiple participants in maps", () => {
      // Add three participants
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 2)], wallet2);
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 3)], wallet3);

      // Verify all three are in participant-list
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-list", Cl.uint(0)))
        .toBeSome(Cl.principal(wallet1));
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-list", Cl.uint(1)))
        .toBeSome(Cl.principal(wallet2));
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-list", Cl.uint(2)))
        .toBeSome(Cl.principal(wallet3));

      // Verify total pool
      expect(simnet.getDataVar(CONTRACT_NAME, "total-pool-balance"))
        .toBeUint(MIN_DEPOSIT * 6);
    });

    it("handles withdrawal map updates correctly", () => {
      // Deposit first
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 10)], wallet1);

      // Verify balance before withdrawal
      let balance = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-balances",
        Cl.principal(wallet1)
      );
      expect(balance).toBeSome(Cl.uint(MIN_DEPOSIT * 10));

      // Partial withdrawal
      simnet.callPublicFn(CONTRACT_NAME, "withdraw", [Cl.uint(MIN_DEPOSIT * 3)], wallet1);

      // Verify balance updated
      balance = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-balances",
        Cl.principal(wallet1)
      );
      expect(balance).toBeSome(Cl.uint(MIN_DEPOSIT * 7));

      // Full withdrawal
      simnet.callPublicFn(CONTRACT_NAME, "withdraw-all", [], wallet1);

      // Balance should be none (deleted from map)
      balance = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-balances",
        Cl.principal(wallet1)
      );
      expect(balance).toBeNone();

      // But participant-list entry remains (to maintain indices)
      const participant = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-list",
        Cl.uint(0)
      );
      expect(participant).toBeSome(Cl.principal(wallet1));
    });
  });

  describe("Event Verification", () => {
    it("emits STX transfer event on deposit", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 5)],
        wallet1
      );

      // Verify event was emitted
      expect(result.events).toHaveLength(1);
      expect(result.events[0].event).toBe("stx_transfer_event");

      // Verify event data
      const transferEvent = result.events[0].data as {
        sender: string;
        recipient: string;
        amount: string;
      };

      expect(transferEvent.sender).toBe(wallet1);
      expect(transferEvent.amount).toBe((MIN_DEPOSIT * 5).toString());

      // Recipient should be the contract
      expect(transferEvent.recipient).toContain(".pool-manager");
    });

    it("emits STX transfer event on withdrawal", () => {
      // Setup: deposit first
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 10)], wallet1);

      // Withdraw
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(MIN_DEPOSIT * 3)],
        wallet1
      );

      // Verify withdrawal event
      expect(result.events).toHaveLength(1);
      expect(result.events[0].event).toBe("stx_transfer_event");

      const transferEvent = result.events[0].data as {
        sender: string;
        recipient: string;
        amount: string;
      };

      // On withdrawal, contract is sender, user is recipient
      expect(transferEvent.sender).toContain(".pool-manager");
      expect(transferEvent.recipient).toBe(wallet1);
      expect(transferEvent.amount).toBe((MIN_DEPOSIT * 3).toString());
    });

    it("tracks multiple deposit events", () => {
      const result1 = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT)],
        wallet1
      );
      expect(result1.events[0].data.amount).toBe(MIN_DEPOSIT.toString());

      const result2 = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 2)],
        wallet2
      );
      expect(result2.events[0].data.amount).toBe((MIN_DEPOSIT * 2).toString());
    });
  });

  describe("Block Height Manipulation", () => {
    it("demonstrates block advancement", () => {
      const initialHeight = simnet.blockHeight;

      // Deposit at current block (this also advances 1 block)
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);

      // Advance 100 blocks (useful for time-based testing)
      simnet.mineEmptyBlocks(100);

      // Height = initial + 1 (deposit call) + 100 (mined blocks)
      expect(simnet.blockHeight).toBe(initialHeight + 101);

      // Contract state persists across blocks
      const balance = simnet.getDataVar(CONTRACT_NAME, "total-pool-balance");
      expect(balance).toBeUint(MIN_DEPOSIT);
    });

    it("simulates weekly draw period (1,008 blocks)", () => {
      // Deposit at block height X
      const startBlock = simnet.blockHeight;
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 100)], wallet1);

      // Simulate one week (1,008 Bitcoin blocks ≈ 1 week)
      const BLOCKS_PER_WEEK = 1008;
      simnet.mineEmptyBlocks(BLOCKS_PER_WEEK);

      // Height = start + 1 (deposit) + 1008 (mined) = 1009
      expect(simnet.blockHeight).toBe(startBlock + BLOCKS_PER_WEEK + 1);

      // Pool balance should still be intact
      expect(simnet.getDataVar(CONTRACT_NAME, "total-pool-balance"))
        .toBeUint(MIN_DEPOSIT * 100);

      // This pattern will be useful for testing prize distribution timing
    });

    it("tests participant behavior over time", () => {
      // Week 1: Participants join
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 10)], wallet1);
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 20)], wallet2);

      expect(simnet.getDataVar(CONTRACT_NAME, "participant-count")).toBeUint(2);

      // Advance 504 blocks (half week)
      simnet.mineEmptyBlocks(504);

      // Week 2: Another participant joins
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 15)], wallet3);

      expect(simnet.getDataVar(CONTRACT_NAME, "participant-count")).toBeUint(3);

      // Advance another half week
      simnet.mineEmptyBlocks(504);

      // All participants still have balances
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-balances", Cl.principal(wallet1)))
        .toBeSome(Cl.uint(MIN_DEPOSIT * 10));
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-balances", Cl.principal(wallet2)))
        .toBeSome(Cl.uint(MIN_DEPOSIT * 20));
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-balances", Cl.principal(wallet3)))
        .toBeSome(Cl.uint(MIN_DEPOSIT * 15));
    });
  });

  describe("Combined Advanced Patterns", () => {
    it("full lifecycle test with all simnet features", () => {
      // === Phase 1: Initial deposits (Block 0-10) ===
      const startBlock = simnet.blockHeight;

      // Three users deposit different amounts
      const deposit1 = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 5)],
        wallet1
      );
      expect(deposit1.events[0].event).toBe("stx_transfer_event");

      simnet.mineEmptyBlock(); // Advance 1 block

      const deposit2 = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 10)],
        wallet2
      );
      expect(deposit2.events[0].data.amount).toBe((MIN_DEPOSIT * 10).toString());

      simnet.mineEmptyBlocks(5); // Advance 5 blocks

      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 7)], wallet3);

      // Verify state via direct inspection
      expect(simnet.getDataVar(CONTRACT_NAME, "total-pool-balance"))
        .toBeUint(MIN_DEPOSIT * 22);
      expect(simnet.getDataVar(CONTRACT_NAME, "participant-count")).toBeUint(3);

      // === Phase 2: Simulate week 1 (1,008 blocks) ===
      simnet.mineEmptyBlocks(1000);

      // Wallet2 adds more
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 5)], wallet2);
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-balances", Cl.principal(wallet2)))
        .toBeSome(Cl.uint(MIN_DEPOSIT * 15));

      // === Phase 3: Partial withdrawal ===
      const withdrawal = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(MIN_DEPOSIT * 3)],
        wallet1
      );

      expect(withdrawal.events[0].event).toBe("stx_transfer_event");
      expect(withdrawal.events[0].data.recipient).toBe(wallet1);

      // Verify balances via map
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-balances", Cl.principal(wallet1)))
        .toBeSome(Cl.uint(MIN_DEPOSIT * 2));

      // === Phase 4: Full withdrawal ===
      simnet.callPublicFn(CONTRACT_NAME, "withdraw-all", [], wallet3);

      // wallet3 should be removed from balances map
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-balances", Cl.principal(wallet3)))
        .toBeNone();

      // But still in participant-list
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-list", Cl.uint(2)))
        .toBeSome(Cl.principal(wallet3));

      // === Final verification ===
      const finalBlock = simnet.blockHeight;
      expect(finalBlock).toBeGreaterThan(startBlock + 1000);

      // Total pool = wallet1(2) + wallet2(15) = 17 STX
      expect(simnet.getDataVar(CONTRACT_NAME, "total-pool-balance"))
        .toBeUint(MIN_DEPOSIT * 17);
    });
  });

  describe("Edge Cases with Direct Inspection", () => {
    it("verifies participant remains in list after full withdrawal", () => {
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);

      // Verify index assignment
      const indexBefore = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-index",
        Cl.principal(wallet1)
      );
      expect(indexBefore).toBeSome(Cl.uint(0));

      // Withdraw all
      simnet.callPublicFn(CONTRACT_NAME, "withdraw-all", [], wallet1);

      // Balance deleted
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-balances", Cl.principal(wallet1)))
        .toBeNone();

      // Index still exists (this is intentional for index stability)
      const indexAfter = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-index",
        Cl.principal(wallet1)
      );
      expect(indexAfter).toBeSome(Cl.uint(0));
    });

    it("verifies map contains expected participants only", () => {
      // Add two participants
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);
      simnet.callPublicFn(CONTRACT_NAME, "deposit", [Cl.uint(MIN_DEPOSIT * 2)], wallet2);

      // Verify wallet1 exists in maps
      const balance1 = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-balances",
        Cl.principal(wallet1)
      );
      expect(balance1).toBeSome(Cl.uint(MIN_DEPOSIT));

      // Verify wallet2 exists in maps
      const balance2 = simnet.getMapEntry(
        CONTRACT_NAME,
        "participant-balances",
        Cl.principal(wallet2)
      );
      expect(balance2).toBeSome(Cl.uint(MIN_DEPOSIT * 2));

      // Verify participants are at correct indices
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-list", Cl.uint(0)))
        .toBeSome(Cl.principal(wallet1));
      expect(simnet.getMapEntry(CONTRACT_NAME, "participant-list", Cl.uint(1)))
        .toBeSome(Cl.principal(wallet2));
    });

    it("verifies contract owner is set correctly", () => {
      const owner = simnet.getDataVar(CONTRACT_NAME, "contract-owner");

      // Contract owner should be the deployer
      expect(owner).toBePrincipal(deployer);
    });
  });
});
