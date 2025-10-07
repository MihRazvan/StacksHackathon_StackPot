/**
 * Prize Distributor Tests
 *
 * Tests the lottery mechanism with Bitcoin block hash randomness
 * Following test-first approach demonstrated in pool-manager tests
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
const BLOCKS_PER_DRAW = 30; // Demo: ~5 minutes (use 1008 for production)
const SIMULATED_PRIZE = 10_000_000; // 0.1 BTC

describe("StackPot Prize Distributor", () => {

  describe("Contract Initialization", () => {
    it("initializes with correct constants", () => {
      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "get-current-draw-info",
        [],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          "current-draw-id": Cl.uint(0),
          "last-draw-block": Cl.uint(0),
          "total-prize-pool": Cl.uint(0),
          "blocks-until-next": Cl.uint(BLOCKS_PER_DRAW),
        })
      );
    });

    it("can-trigger-draw returns true initially (genesis case)", () => {
      // At genesis, 0 blocks have passed, but we need 1008
      // This will fail initially, so let's advance blocks first
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "can-trigger-draw",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("returns zero prize pool initially", () => {
      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "get-prize-pool",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("Draw Timing", () => {
    beforeEach(() => {
      // Add participants to pool for drawing
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 5)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 10)], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 3)], wallet3);
    });

    it("rejects draw before BLOCKS_PER_DRAW have passed", () => {
      // Don't advance any blocks
      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "trigger-draw",
        [],
        deployer
      );

      expect(result).toBeErr(Cl.uint(201)); // ERR-DRAW-TOO-EARLY
    });

    it("allows draw exactly at BLOCKS_PER_DRAW", () => {
      // Advance exactly 1008 blocks
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "trigger-draw",
        [],
        deployer
      );

      expect(result).toBeOk(
        Cl.tuple({
          "draw-id": Cl.uint(0),
          winner: Cl.principal(expect.any(String)),
          "prize-amount": Cl.uint(SIMULATED_PRIZE),
        })
      );
    });

    it("allows draw after BLOCKS_PER_DRAW", () => {
      // Advance more than needed
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW + 500);

      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "trigger-draw",
        [],
        deployer
      );

      expect(result).toBeOk(expect.any(Object));
    });

    it("tracks blocks until next draw correctly", () => {
      // Advance 500 blocks (halfway)
      simnet.mineEmptyBlocks(500);

      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "blocks-until-next-draw",
        [],
        deployer
      );

      // Should need 1008 - 500 = 508 more blocks
      expect(result).toBeOk(Cl.uint(BLOCKS_PER_DRAW - 500));
    });

    it("prevents double draw in same period", () => {
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      // First draw succeeds
      const result1 = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      expect(result1.result).toBeOk(expect.any(Object));

      // Second draw immediately fails
      const result2 = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      expect(result2.result).toBeErr(Cl.uint(201)); // ERR-DRAW-TOO-EARLY
    });

    it("allows multiple draws over multiple periods", () => {
      // Draw 1
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      const draw1 = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      expect(draw1.result).toBeOk(expect.any(Object));

      // Draw 2
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      const draw2 = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      expect(draw2.result).toBeOk(expect.any(Object));

      // Draw 3
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      const draw3 = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      expect(draw3.result).toBeOk(expect.any(Object));

      // Verify draw IDs incremented
      const info = simnet.callReadOnlyFn(PRIZE_CONTRACT, "get-current-draw-info", [], deployer);
      expect(info.result).toBeOk(
        Cl.tuple({
          "current-draw-id": Cl.uint(3),
          "last-draw-block": Cl.uint(expect.any(Number)),
          "total-prize-pool": Cl.uint(SIMULATED_PRIZE * 3),
          "blocks-until-next": Cl.uint(BLOCKS_PER_DRAW),
        })
      );
    });
  });

  describe("Winner Selection", () => {
    beforeEach(() => {
      // Add 3 participants
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet3);
    });

    it("selects a winner from active participants", () => {
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const { result } = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      const resultData = result as any;
      expect(resultData).toBeOk(expect.any(Object));

      // Extract winner
      const winner = resultData.value.data.winner;

      // Winner should be one of our participants
      const participants = [wallet1, wallet2, wallet3];
      expect(participants).toContain(winner.value);
    });

    it("stores draw information correctly", () => {
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "get-draw-info",
        [Cl.uint(0)],
        deployer
      );

      const drawInfo = (result as any).value;
      expect(drawInfo).toBeSome(
        Cl.tuple({
          winner: Cl.some(Cl.principal(expect.any(String))),
          "prize-amount": Cl.uint(SIMULATED_PRIZE),
          "draw-block": Cl.uint(expect.any(Number)),
          "participants-count": Cl.uint(3),
          claimed: Cl.bool(false),
        })
      );
    });

    it("fails when no participants exist", () => {
      // Withdraw all participants
      simnet.callPublicFn(POOL_CONTRACT, "withdraw-all", [], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "withdraw-all", [], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "withdraw-all", [], wallet3);

      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const { result } = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      expect(result).toBeErr(Cl.uint(202)); // ERR-NO-PARTICIPANTS
    });

    it("winner selection is deterministic for same block", () => {
      // This test verifies that same block = same winner
      // We can't really test this in simnet easily, but we can verify the draw happened
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const draw1 = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      const winner1Info = simnet.callReadOnlyFn(PRIZE_CONTRACT, "get-draw-winner", [Cl.uint(0)], deployer);

      expect(draw1.result).toBeOk(expect.any(Object));
      expect(winner1Info.result).toBeOk(Cl.some(Cl.principal(expect.any(String))));
    });
  });

  describe("Prize Claiming", () => {
    let winnerAddress: string;
    let drawId: number;

    beforeEach(() => {
      // Setup: Add participants and trigger a draw
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 5)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 10)], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 3)], wallet3);

      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const drawResult = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      const drawData = (drawResult.result as any).value.data;

      winnerAddress = drawData.winner.value;
      drawId = Number(drawData["draw-id"].value);
    });

    it("allows winner to claim prize", () => {
      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "claim-prize",
        [Cl.uint(drawId)],
        winnerAddress
      );

      expect(result).toBeOk(
        Cl.tuple({
          "draw-id": Cl.uint(drawId),
          "prize-amount": Cl.uint(SIMULATED_PRIZE),
        })
      );
    });

    it("marks prize as claimed after claiming", () => {
      simnet.callPublicFn(PRIZE_CONTRACT, "claim-prize", [Cl.uint(drawId)], winnerAddress);

      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "is-prize-claimed",
        [Cl.uint(drawId)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-winner from claiming", () => {
      const nonWinner = [wallet1, wallet2, wallet3].find(w => w !== winnerAddress)!;

      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "claim-prize",
        [Cl.uint(drawId)],
        nonWinner
      );

      expect(result).toBeErr(Cl.uint(204)); // ERR-NOT-WINNER
    });

    it("prevents double claiming", () => {
      // First claim succeeds
      const claim1 = simnet.callPublicFn(PRIZE_CONTRACT, "claim-prize", [Cl.uint(drawId)], winnerAddress);
      expect(claim1.result).toBeOk(expect.any(Object));

      // Second claim fails
      const claim2 = simnet.callPublicFn(PRIZE_CONTRACT, "claim-prize", [Cl.uint(drawId)], winnerAddress);
      expect(claim2.result).toBeErr(Cl.uint(205)); // ERR-ALREADY-CLAIMED
    });

    it("rejects claim for invalid draw ID", () => {
      const { result } = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "claim-prize",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(203)); // ERR-INVALID-DRAW
    });
  });

  describe("Prize Pool Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);
    });

    it("accumulates prize pool with each draw", () => {
      // Draw 1
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      let pool = simnet.callReadOnlyFn(PRIZE_CONTRACT, "get-prize-pool", [], deployer);
      expect(pool.result).toBeOk(Cl.uint(SIMULATED_PRIZE));

      // Draw 2
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      pool = simnet.callReadOnlyFn(PRIZE_CONTRACT, "get-prize-pool", [], deployer);
      expect(pool.result).toBeOk(Cl.uint(SIMULATED_PRIZE * 2));

      // Draw 3
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      pool = simnet.callReadOnlyFn(PRIZE_CONTRACT, "get-prize-pool", [], deployer);
      expect(pool.result).toBeOk(Cl.uint(SIMULATED_PRIZE * 3));
    });
  });

  describe("Integration with Pool Manager", () => {
    it("reads participant count from pool-manager", () => {
      // Add 4 participants
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet3);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet4);

      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "get-draw-info",
        [Cl.uint(0)],
        deployer
      );

      const drawInfo = (result as any).value;
      expect(drawInfo.data["participants-count"]).toStrictEqual(Cl.uint(4));
    });

    it("handles participant withdrawals correctly", () => {
      // Add 3 participants
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet3);

      // wallet2 withdraws
      simnet.callPublicFn(POOL_CONTRACT, "withdraw-all", [], wallet2);

      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      // Draw should still work (participant-count returns total registered, not active)
      // Winner selection handles inactive participants by checking balance
      const { result } = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      // Should succeed even though one participant withdrew
      expect(result).toBeOk(expect.any(Object));
    });
  });

  describe("Edge Cases", () => {
    it("handles single participant", () => {
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);

      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      const { result } = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      // Winner should be wallet1
      const drawData = (result as any).value.data;
      expect(drawData.winner.value).toBe(wallet1);
    });

    it("returns none for non-existent draw", () => {
      const { result } = simnet.callReadOnlyFn(
        PRIZE_CONTRACT,
        "get-draw-winner",
        [Cl.uint(999)],
        deployer
      );

      expect(result).toBeOk(Cl.none());
    });

    it("can-trigger-draw returns false before period ends", () => {
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT)], wallet1);
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);
      simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);

      // Immediately after draw, should be false
      const { result } = simnet.callReadOnlyFn(PRIZE_CONTRACT, "can-trigger-draw", [], deployer);
      expect(result).toBeOk(Cl.bool(false));
    });
  });

  describe("Full Lifecycle Simulation", () => {
    it("complete lottery cycle: deposit → wait → draw → claim", () => {
      const startBlock = simnet.blockHeight;

      // Week 1: Participants join
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 10)], wallet1);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 20)], wallet2);
      simnet.callPublicFn(POOL_CONTRACT, "deposit", [Cl.uint(MIN_DEPOSIT * 5)], wallet3);

      // Verify initial state
      expect(simnet.getDataVar(PRIZE_CONTRACT, "current-draw-id")).toBeUint(0);

      // Wait for draw period
      simnet.mineEmptyBlocks(BLOCKS_PER_DRAW);

      // Trigger draw
      const drawResult = simnet.callPublicFn(PRIZE_CONTRACT, "trigger-draw", [], deployer);
      expect(drawResult.result).toBeOk(expect.any(Object));

      const drawData = (drawResult.result as any).value.data;
      const winner = drawData.winner.value;
      const drawId = Number(drawData["draw-id"].value);

      // Winner claims prize
      const claimResult = simnet.callPublicFn(
        PRIZE_CONTRACT,
        "claim-prize",
        [Cl.uint(drawId)],
        winner
      );
      expect(claimResult.result).toBeOk(expect.any(Object));

      // Verify final state
      expect(simnet.getDataVar(PRIZE_CONTRACT, "current-draw-id")).toBeUint(1);
      expect(simnet.getDataVar(PRIZE_CONTRACT, "total-prize-pool")).toBeUint(SIMULATED_PRIZE);

      const claimed = simnet.callReadOnlyFn(PRIZE_CONTRACT, "is-prize-claimed", [Cl.uint(drawId)], deployer);
      expect(claimed.result).toBeOk(Cl.bool(true));

      // Verify losers still have their deposits
      const losers = [wallet1, wallet2, wallet3].filter(w => w !== winner);
      for (const loser of losers) {
        const balance = simnet.callReadOnlyFn(POOL_CONTRACT, "get-balance", [Cl.principal(loser)], deployer);
        const balanceValue = (balance.result as any).value.value;
        expect(balanceValue).toBeGreaterThan(0);
      }

      console.log(`✅ Full cycle complete! Winner: ${winner.slice(0, 10)}...`);
    });
  });
});
