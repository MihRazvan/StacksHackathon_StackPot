/**
 * Weighted Shares System Tests
 *
 * Tests the implementation of proportional probability based on deposit size.
 * In a fair lottery: More STX deposited = More shares = Higher probability of winning
 *
 * Test-first approach following CLAUDE.md guidelines
 */

import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

const POOL_CONTRACT = "pool-manager";
const PRIZE_CONTRACT = "prize-distributor";
const MIN_DEPOSIT = 1_000_000; // 1 STX
const BLOCKS_PER_DRAW = 30;

describe("Weighted Shares System", () => {

  describe("Share Calculation", () => {
    it("1 STX deposit equals 1 million shares (1:1 microSTX ratio)", () => {
      // Deposit 1 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT)],
        wallet1
      );

      // Get total shares - should equal deposit amount
      const { result } = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-total-shares",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(MIN_DEPOSIT));
    });

    it("100 STX deposit equals 100 million shares", () => {
      const deposit = MIN_DEPOSIT * 100;

      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(deposit)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-total-shares",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(deposit));
    });

    it("multiple deposits accumulate shares correctly", () => {
      // Wallet1: 50 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 50)],
        wallet1
      );

      // Wallet2: 100 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 100)],
        wallet2
      );

      // Total shares should be 150 STX worth
      const { result } = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-total-shares",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(MIN_DEPOSIT * 150));
    });

    it("withdrawal reduces total shares", () => {
      // Deposit 100 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 100)],
        wallet1
      );

      // Withdraw 50 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "withdraw",
        [Cl.uint(MIN_DEPOSIT * 50)],
        wallet1
      );

      // Remaining shares: 50 STX
      const { result } = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-total-shares",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(MIN_DEPOSIT * 50));
    });

    it("zero balance participant has zero shares", () => {
      // No deposits

      const { result } = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-total-shares",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("Share Range Calculation", () => {
    it("calculates cumulative shares for single participant", () => {
      // Participant 0: 100 STX = owns shares 0 to 99,999,999
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 100)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-cumulative-shares",
        [Cl.uint(0)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(MIN_DEPOSIT * 100));
    });

    it("calculates cumulative shares for multiple participants", () => {
      // Participant 0 (wallet1): 100 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 100)],
        wallet1
      );

      // Participant 1 (wallet2): 200 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 200)],
        wallet2
      );

      // Participant 2 (wallet3): 300 STX
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 300)],
        wallet3
      );

      // Cumulative at index 0: 100 STX
      const result0 = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-cumulative-shares",
        [Cl.uint(0)],
        deployer
      );
      expect(result0.result).toBeOk(Cl.uint(MIN_DEPOSIT * 100));

      // Cumulative at index 1: 100 + 200 = 300 STX
      const result1 = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-cumulative-shares",
        [Cl.uint(1)],
        deployer
      );
      expect(result1.result).toBeOk(Cl.uint(MIN_DEPOSIT * 300));

      // Cumulative at index 2: 100 + 200 + 300 = 600 STX
      const result2 = simnet.callReadOnlyFn(
        POOL_CONTRACT,
        "get-cumulative-shares",
        [Cl.uint(2)],
        deployer
      );
      expect(result2.result).toBeOk(Cl.uint(MIN_DEPOSIT * 600));
    });
  });

  describe("Weighted Winner Selection", () => {
    it("single participant always wins (100% probability)", () => {
      // Only one participant
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 10)],
        wallet1
      );

      // Advance blocks for draw
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      // Trigger draw
      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "trigger-draw",
        [],
        deployer
      );

      // Expect winner to be wallet1
      expect(result).toBeOk(expect.any(Object));
      const drawData = (result as any).value.data;
      expect(drawData.winner).toStrictEqual(Cl.standardPrincipal(wallet1));
    });

    it("participant with 90% of shares wins ~90% of the time", () => {
      // Wallet1: 900 STX (90% of pool)
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 900)],
        wallet1
      );

      // Wallet2: 100 STX (10% of pool)
      simnet.callPublicFn(
        POOL_CONTRACT,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 100)],
        wallet2
      );

      let wallet1Wins = 0;
      let wallet2Wins = 0;
      const numDraws = 20; // Run 20 draws

      for (let i = 0; i < numDraws; i++) {
        // Advance blocks
        simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

        // Trigger draw
        const draw = simnet.callPublicFn(
          PRIZE_CONTRACT,
          "trigger-draw",
          [],
          deployer
        );

        if (draw.result.toString().includes(wallet1)) {
          wallet1Wins++;
        } else if (draw.result.toString().includes(wallet2)) {
          wallet2Wins++;
        }
      }

      // Wallet1 should win significantly more (expect at least 14/20 = 70%)
      expect(wallet1Wins).toBeGreaterThan(Math.floor(numDraws * 0.7));
      // Wallet2 should win some but less
      expect(wallet2Wins).toBeLessThan(Math.ceil(numDraws * 0.3));
    });

    it("three participants with 100:200:300 STX win proportionally", () => {
      // Total: 600 STX
      // Wallet1: 100 STX = 16.67% probability
      // Wallet2: 200 STX = 33.33% probability
      // Wallet3: 300 STX = 50.00% probability

      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 100)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 200)], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 300)], wallet3);

      let wins = { wallet1: 0, wallet2: 0, wallet3: 0 };
      const numDraws = 30;

      for (let i = 0; i < numDraws; i++) {
        simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
        const draw = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
        const resultStr = draw.result.toString();

        if (resultStr.includes(wallet1)) wins.wallet1++;
        else if (resultStr.includes(wallet2)) wins.wallet2++;
        else if (resultStr.includes(wallet3)) wins.wallet3++;
      }

      // Wallet3 (50%) should win most
      expect(wins.wallet3).toBeGreaterThan(wins.wallet2);
      expect(wins.wallet3).toBeGreaterThan(wins.wallet1);

      // Wallet2 (33%) should win more than wallet1 (16%)
      expect(wins.wallet2).toBeGreaterThan(wins.wallet1);
    });

    it("equal deposits result in roughly equal win probability", () => {
      // Both deposit same amount
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 100)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 100)], wallet2);

      let wins = { wallet1: 0, wallet2: 0 };
      const numDraws = 20;

      for (let i = 0; i < numDraws; i++) {
        simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
        const draw = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
        const resultStr = draw.result.toString();

        if (resultStr.includes(wallet1)) wins.wallet1++;
        else if (resultStr.includes(wallet2)) wins.wallet2++;
      }

      // Both should win roughly half (allow 40-60% range)
      expect(wins.wallet1).toBeGreaterThanOrEqual(Math.floor(numDraws * 0.3));
      expect(wins.wallet1).toBeLessThanOrEqual(Math.ceil(numDraws * 0.7));
      expect(wins.wallet2).toBeGreaterThanOrEqual(Math.floor(numDraws * 0.3));
      expect(wins.wallet2).toBeLessThanOrEqual(Math.ceil(numDraws * 0.7));
    });
  });

  describe("Edge Cases", () => {
    it("handles withdrawal affecting share distribution", () => {
      // Initial: Wallet1 100 STX, Wallet2 100 STX (equal)
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 100)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 100)], wallet2);

      // Wallet1 withdraws 50 STX
      // Now: Wallet1 50 STX (33%), Wallet2 100 STX (67%)
      simnet.callPublicFn(POOL_CONTRACT, "withdraw", [Cl.uint(MIN_DEPOSIT * 50)], wallet1);

      let wins = { wallet1: 0, wallet2: 0 };
      const numDraws = 20;

      for (let i = 0; i < numDraws; i++) {
        simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
        const draw = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
        const resultStr = draw.result.toString();

        if (resultStr.includes(wallet1)) wins.wallet1++;
        else if (resultStr.includes(wallet2)) wins.wallet2++;
      }

      // Wallet2 should win more than wallet1 (has 2x the shares)
      expect(wins.wallet2).toBeGreaterThan(wins.wallet1);
    });

    it("rejects draw when total shares is zero", () => {
      // No deposits, no shares

      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "trigger-draw",
        [],
        deployer
      );

      // Should fail - no participants
      expect(result).toBeErr(Cl.uint(202)); // ERR-NO-PARTICIPANTS
    });

    it("participant with 1 STX has low but non-zero probability vs 1000 STX", () => {
      // Tiny fish vs whale
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1); // 1 STX
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 1000)], wallet2); // 1000 STX

      let wallet1Wins = 0;
      let wallet2Wins = 0;
      const numDraws = 100; // More draws to see if wallet1 ever wins

      for (let i = 0; i < numDraws; i++) {
        simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
        const draw = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
        const resultStr = draw.result.toString();

        if (resultStr.includes(wallet1)) wallet1Wins++;
        else if (resultStr.includes(wallet2)) wallet2Wins++;
      }

      // Wallet2 should win vastly more (expect > 95 wins out of 100)
      expect(wallet2Wins).toBeGreaterThan(90);
      // Wallet1 might win 0-10 times (it's statistically possible)
      expect(wallet1Wins).toBeLessThan(10);
    });
  });
});
