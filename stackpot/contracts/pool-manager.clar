;; StackPot Pool Manager
;; Handles STX deposits, withdrawals, and participant tracking

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-AMOUNT (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-TRANSFER-FAILED (err u103))
(define-constant ERR-PARTICIPANT-LIMIT-REACHED (err u104))

;; Constants
(define-constant MAX-PARTICIPANTS u1000)
(define-constant MIN-DEPOSIT u1000000) ;; 1 STX minimum (1,000,000 microSTX)

;; Data variables
(define-data-var total-pool-balance uint u0)
(define-data-var participant-count uint u0)
(define-data-var contract-owner principal tx-sender)

;; Data maps
;; Track each participant's balance
(define-map participant-balances principal uint)

;; Track participant list for winner selection (index -> principal)
(define-map participant-list uint principal)

;; Track participant index (principal -> index) for efficient lookups
(define-map participant-index principal uint)

;; Public functions

;; Deposit STX into the pool
;; @param amount: Amount of STX to deposit (in microSTX)
(define-public (deposit (amount uint))
  (let (
    (sender tx-sender)
    (current-balance (default-to u0 (map-get? participant-balances sender)))
    (new-balance (+ current-balance amount))
    (current-count (var-get participant-count))
  )
    ;; Validate amount
    (asserts! (>= amount MIN-DEPOSIT) ERR-INVALID-AMOUNT)

    ;; Check participant limit if this is a new participant
    (asserts! (or (> current-balance u0) (< current-count MAX-PARTICIPANTS))
              ERR-PARTICIPANT-LIMIT-REACHED)

    ;; Transfer STX from sender to contract
    (try! (stx-transfer? amount sender (as-contract tx-sender)))

    ;; If new participant, add to participant list
    (if (is-eq current-balance u0)
      (begin
        (map-set participant-list current-count sender)
        (map-set participant-index sender current-count)
        (var-set participant-count (+ current-count u1))
      )
      true
    )

    ;; Update balances
    (map-set participant-balances sender new-balance)
    (var-set total-pool-balance (+ (var-get total-pool-balance) amount))

    (ok {
      deposited: amount,
      new-balance: new-balance,
      total-pool: (var-get total-pool-balance)
    })
  )
)

;; Withdraw STX from the pool
;; @param amount: Amount of STX to withdraw (in microSTX)
(define-public (withdraw (amount uint))
  (let (
    (sender tx-sender)
    (current-balance (default-to u0 (map-get? participant-balances sender)))
  )
    ;; Validate amount and balance FIRST (before calculating new-balance)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)

    (let (
      (new-balance (- current-balance amount))
    )

    ;; Update balance first (checks-effects-interactions pattern)
    (if (is-eq new-balance u0)
      ;; If withdrawing everything, remove from participant list
      (begin
        (map-delete participant-balances sender)
        ;; Note: We keep them in participant-list to maintain indices
        ;; The balance check in get-participant will handle inactive participants
      )
      ;; Otherwise just update balance
      (map-set participant-balances sender new-balance)
    )

    (var-set total-pool-balance (- (var-get total-pool-balance) amount))

    ;; Transfer STX from contract to sender
    (try! (as-contract (stx-transfer? amount tx-sender sender)))

    (ok {
      withdrawn: amount,
      remaining-balance: new-balance,
      total-pool: (var-get total-pool-balance)
    })
    ) ;; close inner let
  )
)

;; Withdraw all STX from the pool
(define-public (withdraw-all)
  (let (
    (sender tx-sender)
    (balance (default-to u0 (map-get? participant-balances sender)))
  )
    (asserts! (> balance u0) ERR-INSUFFICIENT-BALANCE)
    (withdraw balance)
  )
)

;; Read-only functions

;; Get participant's current balance
(define-read-only (get-balance (participant principal))
  (ok (default-to u0 (map-get? participant-balances participant)))
)

;; Get total pool balance
(define-read-only (get-total-pool)
  (ok (var-get total-pool-balance))
)

;; Get total number of participants (including inactive ones)
(define-read-only (get-participant-count)
  (ok (var-get participant-count))
)

;; Get number of active participants (with non-zero balance)
(define-read-only (get-active-participant-count)
  (ok (fold count-active-participants
    (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9) ;; This is a simplified version
    u0))
)

;; Get participant by index (for winner selection)
(define-read-only (get-participant (index uint))
  (let (
    (participant (map-get? participant-list index))
  )
    (match participant
      addr (let ((balance (default-to u0 (map-get? participant-balances addr))))
        (if (> balance u0)
          (ok (some {participant: addr, balance: balance}))
          (ok none) ;; Inactive participant
        )
      )
      (ok none) ;; No participant at this index
    )
  )
)

;; Get participant index by principal
(define-read-only (get-participant-index (participant principal))
  (ok (map-get? participant-index participant))
)

;; Get contract info
(define-read-only (get-contract-info)
  (ok {
    total-pool: (var-get total-pool-balance),
    participant-count: (var-get participant-count),
    contract-owner: (var-get contract-owner),
    min-deposit: MIN-DEPOSIT,
    max-participants: MAX-PARTICIPANTS
  })
)

;; Get total shares (sum of all participant balances)
;; Shares are 1:1 with microSTX (1 STX = 1,000,000 shares)
(define-read-only (get-total-shares)
  (ok (var-get total-pool-balance))
)

;; Get cumulative shares up to and including participant at given index
;; Used for weighted random selection
(define-read-only (get-cumulative-shares (target-index uint))
  (let (
    (count (var-get participant-count))
    (result (fold sum-participant-balance-at-index
      (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19
            u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30 u31 u32 u33 u34 u35 u36 u37 u38 u39
            u40 u41 u42 u43 u44 u45 u46 u47 u48 u49 u50 u51 u52 u53 u54 u55 u56 u57 u58 u59
            u60 u61 u62 u63 u64 u65 u66 u67 u68 u69 u70 u71 u72 u73 u74 u75 u76 u77 u78 u79
            u80 u81 u82 u83 u84 u85 u86 u87 u88 u89 u90 u91 u92 u93 u94 u95 u96 u97 u98 u99)
      {target: target-index, cumulative: u0}))
  )
    (ok (get cumulative result))
  )
)

;; Private functions (helpers)

;; Helper to count active participants (simplified for now)
(define-private (count-active-participants (index uint) (count uint))
  (let (
    (participant (map-get? participant-list index))
  )
    (match participant
      addr (if (> (default-to u0 (map-get? participant-balances addr)) u0)
        (+ count u1)
        count
      )
      count
    )
  )
)

;; Helper function for fold: sum balances up to target index
(define-private (sum-participant-balance-at-index (current-index uint) (state {target: uint, cumulative: uint}))
  (let (
    (target (get target state))
    (cumulative (get cumulative state))
  )
    (if (<= current-index target)
      (let (
        (participant-opt (map-get? participant-list current-index))
      )
        (match participant-opt
          addr {
            target: target,
            cumulative: (+ cumulative (default-to u0 (map-get? participant-balances addr)))
          }
          state ;; No participant at this index
        )
      )
      state ;; Beyond target, return unchanged
    )
  )
)
