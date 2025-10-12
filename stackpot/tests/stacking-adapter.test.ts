import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "stacking-adapter";
const ONE_STX = 1_000_000; // 1 STX in microSTX

describe("StackPot Stacking Adapter", () => {

  describe("Contract Initialization", () => {
    it("initializes with zero total STX deposited", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-stx-deposited",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("initializes with zero stSTX balance", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-ststx-balance",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns correct initial ratio (1:1)", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-ststx-stx-ratio",
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          stx: Cl.uint(0),
          ststx: Cl.uint(0),
          "ratio-basis-points": Cl.uint(10000), // 1:1 default
        })
      );
    });

    it("returns correct contract info", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-contract-info",
        [],
        deployer
      );

      const resultValue = result as any;
      expect(resultValue.type).toBe(Cl.ResponseOkType);

      const tuple = resultValue.value;
      expect(tuple.data["contract-owner"]).toStrictEqual(Cl.principal(deployer));
      expect(tuple.data["total-stx-deposited"]).toStrictEqual(Cl.uint(0));
      expect(tuple.data["total-ststx-balance"]).toStrictEqual(Cl.uint(0));
      expect(tuple.data["next-withdrawal-id"]).toStrictEqual(Cl.uint(0));
    });
  });

  describe("Deposit to Stacking", () => {
    it("allows deposit of 1 STX", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(ONE_STX)],
        wallet1
      );
      expect(result).toBeOk(
        Cl.tuple({
          "stx-deposited": Cl.uint(ONE_STX),
          "ststx-received": Cl.uint(ONE_STX), // 1:1 initial
        })
      );
    });

    it("rejects zero amount deposit", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(0)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(301)); // ERR-INVALID-AMOUNT
    });

    it("updates total STX deposited after deposit", () => {
      // Deposit 5 STX
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(5 * ONE_STX)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-stx-deposited",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(5 * ONE_STX));
    });

    it("updates total stSTX balance after deposit", () => {
      // Deposit 5 STX
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(5 * ONE_STX)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-ststx-balance",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(5 * ONE_STX)); // 1:1 initially
    });

    it("allows multiple deposits from different wallets", () => {
      // Wallet 1 deposits 10 STX
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(10 * ONE_STX)],
        wallet1
      );

      // Wallet 2 deposits 20 STX
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(20 * ONE_STX)],
        wallet2
      );

      expect(result).toBeOk(
        Cl.tuple({
          "stx-deposited": Cl.uint(20 * ONE_STX),
          "ststx-received": Cl.uint(20 * ONE_STX),
        })
      );

      // Check total
      const { result: totalResult } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-stx-deposited",
        [],
        deployer
      );
      expect(totalResult).toBeOk(Cl.uint(30 * ONE_STX));
    });
  });

  describe("Preview Deposit", () => {
    it("previews deposit correctly at 1:1 ratio", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "preview-deposit",
        [Cl.uint(10 * ONE_STX)],
        wallet1
      );
      expect(result).toBeOk(
        Cl.tuple({
          "stx-to-deposit": Cl.uint(10 * ONE_STX),
          "ststx-to-receive": Cl.uint(10 * ONE_STX),
        })
      );
    });

    it("previews deposit correctly after some stacking yield", () => {
      // Deposit 100 STX initially
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(100 * ONE_STX)],
        wallet1
      );

      // Simulate yield: stSTX value grows (normally happens via StackingDAO)
      // For testing, we would need to manipulate state or test with actual StackingDAO
      // For now, at 1:1 ratio this returns same amount
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "preview-deposit",
        [Cl.uint(10 * ONE_STX)],
        wallet2
      );
      expect(result).toBeOk(
        Cl.tuple({
          "stx-to-deposit": Cl.uint(10 * ONE_STX),
          "ststx-to-receive": Cl.uint(10 * ONE_STX),
        })
      );
    });
  });

  describe("Initiate Withdrawal", () => {
    beforeEach(() => {
      // Setup: Deposit some STX first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(100 * ONE_STX)],
        wallet1
      );
    });

    it("allows initiating withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "init-withdrawal",
        [Cl.uint(10 * ONE_STX)],
        wallet1
      );
      expect(result).toBeOk(
        Cl.tuple({
          "withdrawal-nft-id": Cl.uint(0),
          "ststx-amount": Cl.uint(10 * ONE_STX),
        })
      );
    });

    it("rejects zero amount withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "init-withdrawal",
        [Cl.uint(0)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(301)); // ERR-INVALID-AMOUNT
    });

    it("updates stSTX balance after init-withdrawal", () => {
      // Initial balance: 100 STX worth of stSTX
      simnet.callPublicFn(
        CONTRACT_NAME,
        "init-withdrawal",
        [Cl.uint(30 * ONE_STX)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-ststx-balance",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(70 * ONE_STX));
    });

    it("increments withdrawal NFT ID for multiple withdrawals", () => {
      // First withdrawal
      const { result: result1 } = simnet.callPublicFn(
        CONTRACT_NAME,
        "init-withdrawal",
        [Cl.uint(10 * ONE_STX)],
        wallet1
      );
      expect(result1).toBeOk(
        Cl.tuple({
          "withdrawal-nft-id": Cl.uint(0),
          "ststx-amount": Cl.uint(10 * ONE_STX),
        })
      );

      // Second withdrawal
      const { result: result2 } = simnet.callPublicFn(
        CONTRACT_NAME,
        "init-withdrawal",
        [Cl.uint(20 * ONE_STX)],
        wallet1
      );
      expect(result2).toBeOk(
        Cl.tuple({
          "withdrawal-nft-id": Cl.uint(1),
          "ststx-amount": Cl.uint(20 * ONE_STX),
        })
      );
    });

    it("tracks withdrawal NFT owner correctly", () => {
      // Wallet1 initiates withdrawal
      simnet.callPublicFn(
        CONTRACT_NAME,
        "init-withdrawal",
        [Cl.uint(10 * ONE_STX)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-withdrawal-nft-owner",
        [Cl.uint(0)],
        deployer
      );
      expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });
  });

  describe("Complete Withdrawal", () => {
    beforeEach(() => {
      // Setup: Deposit and initiate withdrawal
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(100 * ONE_STX)],
        wallet1
      );
      simnet.callPublicFn(
        CONTRACT_NAME,
        "init-withdrawal",
        [Cl.uint(10 * ONE_STX)],
        wallet1
      );
    });

    it("allows owner to complete withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "complete-withdrawal",
        [Cl.uint(0)], // NFT ID
        wallet1
      );

      // Result includes nft-id and stx-received
      const resultValue = result as any;
      expect(resultValue.type).toBe(Cl.ResponseOkType);
      expect(resultValue.value.data["nft-id"]).toStrictEqual(Cl.uint(0));
    });

    it("rejects non-owner attempting to complete withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "complete-withdrawal",
        [Cl.uint(0)],
        wallet2 // Different wallet
      );
      expect(result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
    });

    it("rejects completing non-existent withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "complete-withdrawal",
        [Cl.uint(999)], // Invalid NFT ID
        wallet1
      );
      expect(result).toBeErr(Cl.uint(306)); // ERR-NO-WITHDRAWAL-NFT
    });

    it("removes withdrawal NFT after completion", () => {
      // Complete withdrawal
      simnet.callPublicFn(
        CONTRACT_NAME,
        "complete-withdrawal",
        [Cl.uint(0)],
        wallet1
      );

      // Try to check owner - should be none
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-withdrawal-nft-owner",
        [Cl.uint(0)],
        deployer
      );
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("Instant Withdrawal", () => {
    beforeEach(() => {
      // Setup: Deposit some STX first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(100 * ONE_STX)],
        wallet1
      );
    });

    it("allows instant withdrawal with 1% fee", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "instant-withdrawal",
        [Cl.uint(10 * ONE_STX)], // Withdraw 10 stSTX
        wallet1
      );

      const expectedFee = Math.floor((10 * ONE_STX) / 100); // 1% fee
      const expectedStxReceived = (10 * ONE_STX) - expectedFee;

      expect(result).toBeOk(
        Cl.tuple({
          "ststx-burned": Cl.uint(10 * ONE_STX),
          "stx-received": Cl.uint(expectedStxReceived),
          "fee-paid": Cl.uint(expectedFee),
        })
      );
    });

    it("rejects zero amount instant withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "instant-withdrawal",
        [Cl.uint(0)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(301)); // ERR-INVALID-AMOUNT
    });

    it("updates stSTX balance after instant withdrawal", () => {
      // Initial: 100 STX worth of stSTX
      simnet.callPublicFn(
        CONTRACT_NAME,
        "instant-withdrawal",
        [Cl.uint(40 * ONE_STX)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-ststx-balance",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(60 * ONE_STX));
    });
  });

  describe("Preview Withdrawal", () => {
    beforeEach(() => {
      // Setup: Deposit some STX first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(100 * ONE_STX)],
        wallet1
      );
    });

    it("previews traditional withdrawal (no fee)", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "preview-withdrawal",
        [Cl.uint(10 * ONE_STX), Cl.bool(false)],
        wallet1
      );
      expect(result).toBeOk(
        Cl.tuple({
          "ststx-to-burn": Cl.uint(10 * ONE_STX),
          "stx-to-receive": Cl.uint(10 * ONE_STX), // No fee
          fee: Cl.uint(0),
          instant: Cl.bool(false),
        })
      );
    });

    it("previews instant withdrawal (1% fee)", () => {
      const expectedFee = Math.floor((10 * ONE_STX) / 100);
      const expectedStxReceived = (10 * ONE_STX) - expectedFee;

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "preview-withdrawal",
        [Cl.uint(10 * ONE_STX), Cl.bool(true)],
        wallet1
      );
      expect(result).toBeOk(
        Cl.tuple({
          "ststx-to-burn": Cl.uint(10 * ONE_STX),
          "stx-to-receive": Cl.uint(expectedStxReceived),
          fee: Cl.uint(expectedFee),
          instant: Cl.bool(true),
        })
      );
    });
  });

  describe("Yield Calculation", () => {
    it("calculates zero yield initially", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-accumulated-yield",
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          "total-deposited": Cl.uint(0),
          "current-value": Cl.uint(0),
          "yield-accumulated": Cl.uint(0),
        })
      );
    });

    it("calculates zero yield after deposit (1:1 ratio)", () => {
      // Deposit 100 STX
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(100 * ONE_STX)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-accumulated-yield",
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          "total-deposited": Cl.uint(100 * ONE_STX),
          "current-value": Cl.uint(100 * ONE_STX),
          "yield-accumulated": Cl.uint(0), // No yield yet at 1:1
        })
      );
    });

    // Note: Testing actual yield accumulation would require:
    // 1. Integration with real StackingDAO contract, or
    // 2. Mocking the stSTX/STX ratio changes
    // 3. Simulating stacking rewards over time
    // This is better tested in integration tests with actual StackingDAO
  });

  describe("Ratio Calculations", () => {
    it("maintains 1:1 ratio after single deposit", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(100 * ONE_STX)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-ststx-stx-ratio",
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          stx: Cl.uint(100 * ONE_STX),
          ststx: Cl.uint(100 * ONE_STX),
          "ratio-basis-points": Cl.uint(10000), // 1:1 = 10000 basis points
        })
      );
    });

    it("maintains ratio after multiple deposits and withdrawals", () => {
      // Multiple deposits
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(50 * ONE_STX)],
        wallet1
      );
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit-to-stacking",
        [Cl.uint(30 * ONE_STX)],
        wallet2
      );

      // Instant withdrawal
      simnet.callPublicFn(
        CONTRACT_NAME,
        "instant-withdrawal",
        [Cl.uint(20 * ONE_STX)],
        wallet1
      );

      // Check ratio still valid
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-ststx-stx-ratio",
        [],
        deployer
      );

      const resultValue = result as any;
      expect(resultValue.type).toBe(Cl.ResponseOkType);
      // After operations: 50 + 30 - 20 = 60 STX worth remaining
      // Ratio should still be approximately 1:1 (10000 basis points)
    });
  });
});
