import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "pool-manager";
const MIN_DEPOSIT = 1_000_000; // 1 STX

describe("StackPot Pool Manager", () => {

  describe("Contract Initialization", () => {
    it("initializes with zero pool balance", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-pool",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("initializes with zero participants", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant-count",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns correct contract info", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-contract-info",
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.tuple({
          "total-pool": Cl.uint(0),
          "participant-count": Cl.uint(0),
          "contract-owner": Cl.principal(deployer),
          "min-deposit": Cl.uint(MIN_DEPOSIT),
          "max-participants": Cl.uint(1000),
        })
      );
    });
  });

  describe("Deposits", () => {
    it("allows minimum deposit", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT)],
        wallet1
      );
      expect(result).toBeOk(
        Cl.tuple({
          deposited: Cl.uint(MIN_DEPOSIT),
          "new-balance": Cl.uint(MIN_DEPOSIT),
          "total-pool": Cl.uint(MIN_DEPOSIT),
        })
      );
    });

    it("rejects deposit below minimum", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT - 1)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-AMOUNT
    });

    it("allows multiple deposits from same user", () => {
      // First deposit
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT)],
        wallet1
      );

      // Second deposit
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 2)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          deposited: Cl.uint(MIN_DEPOSIT * 2),
          "new-balance": Cl.uint(MIN_DEPOSIT * 3),
          "total-pool": Cl.uint(MIN_DEPOSIT * 3),
        })
      );
    });

    it("tracks multiple participants correctly", () => {
      // Wallet1 deposits
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT)],
        wallet1
      );

      // Wallet2 deposits
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 2)],
        wallet2
      );

      // Check participant count
      const { result: countResult } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant-count",
        [],
        deployer
      );
      expect(countResult).toBeOk(Cl.uint(2));

      // Check total pool
      const { result: poolResult } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-pool",
        [],
        deployer
      );
      expect(poolResult).toBeOk(Cl.uint(MIN_DEPOSIT * 3));

      // Check individual balances
      const { result: balance1 } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance1).toBeOk(Cl.uint(MIN_DEPOSIT));

      const { result: balance2 } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(balance2).toBeOk(Cl.uint(MIN_DEPOSIT * 2));
    });

    it("adds participant to list with correct index", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT)],
        wallet1
      );

      // Check participant index
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant-index",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.some(Cl.uint(0)));

      // Check participant by index
      const { result: participantResult } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant",
        [Cl.uint(0)],
        deployer
      );
      expect(participantResult).toBeOk(
        Cl.some(
          Cl.tuple({
            participant: Cl.principal(wallet1),
            balance: Cl.uint(MIN_DEPOSIT),
          })
        )
      );
    });
  });

  describe("Withdrawals", () => {
    beforeEach(() => {
      // Setup: wallet1 deposits 5 STX
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 5)],
        wallet1
      );
    });

    it("allows partial withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(MIN_DEPOSIT * 2)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          withdrawn: Cl.uint(MIN_DEPOSIT * 2),
          "remaining-balance": Cl.uint(MIN_DEPOSIT * 3),
          "total-pool": Cl.uint(MIN_DEPOSIT * 3),
        })
      );
    });

    it("allows full withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(MIN_DEPOSIT * 5)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          withdrawn: Cl.uint(MIN_DEPOSIT * 5),
          "remaining-balance": Cl.uint(0),
          "total-pool": Cl.uint(0),
        })
      );

      // Check balance is zero
      const { result: balance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance).toBeOk(Cl.uint(0));
    });

    it("allows withdraw-all", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw-all",
        [],
        wallet1
      );

      expect(result).toBeOk(
        Cl.tuple({
          withdrawn: Cl.uint(MIN_DEPOSIT * 5),
          "remaining-balance": Cl.uint(0),
          "total-pool": Cl.uint(0),
        })
      );
    });

    it("rejects withdrawal exceeding balance", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(MIN_DEPOSIT * 10)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-INSUFFICIENT-BALANCE
    });

    it("rejects withdrawal with zero amount", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(0)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-AMOUNT
    });

    it("rejects withdraw-all with zero balance", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw-all",
        [],
        wallet2 // wallet2 has no balance
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-INSUFFICIENT-BALANCE
    });
  });

  describe("Balance Queries", () => {
    it("returns zero balance for non-participant", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("tracks balance changes correctly", () => {
      // Deposit
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 10)],
        wallet1
      );

      let { result: balance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance).toBeOk(Cl.uint(MIN_DEPOSIT * 10));

      // Withdraw
      simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(MIN_DEPOSIT * 3)],
        wallet1
      );

      ({ result: balance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      ));
      expect(balance).toBeOk(Cl.uint(MIN_DEPOSIT * 7));
    });
  });

  describe("Participant Management", () => {
    it("handles multiple participants with deposits and withdrawals", () => {
      // Three participants deposit
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 5)],
        wallet1
      );
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 10)],
        wallet2
      );
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT * 3)],
        wallet3
      );

      // Check count
      const { result: count } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant-count",
        [],
        deployer
      );
      expect(count).toBeOk(Cl.uint(3));

      // Check total pool
      const { result: pool } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-pool",
        [],
        deployer
      );
      expect(pool).toBeOk(Cl.uint(MIN_DEPOSIT * 18));

      // Wallet2 withdraws everything
      simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw-all",
        [],
        wallet2
      );

      // Total pool should decrease
      const { result: newPool } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-pool",
        [],
        deployer
      );
      expect(newPool).toBeOk(Cl.uint(MIN_DEPOSIT * 8));

      // Participant count stays the same (we keep them in the list)
      const { result: newCount } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant-count",
        [],
        deployer
      );
      expect(newCount).toBeOk(Cl.uint(3));
    });

    it("returns none for inactive participant in get-participant", () => {
      // Wallet1 deposits then withdraws all
      simnet.callPublicFn(
        CONTRACT_NAME,
        "deposit",
        [Cl.uint(MIN_DEPOSIT)],
        wallet1
      );
      simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw-all",
        [],
        wallet1
      );

      // Should return none since balance is zero
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant",
        [Cl.uint(0)],
        deployer
      );
      expect(result).toBeOk(Cl.none());
    });

    it("returns none for non-existent index", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant",
        [Cl.uint(999)],
        deployer
      );
      expect(result).toBeOk(Cl.none());
    });
  });
});
