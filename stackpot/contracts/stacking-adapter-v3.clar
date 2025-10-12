;; StackPot Stacking Adapter
;; Abstracts StackingDAO Core V6 integration for STX stacking
;; Handles deposits to receive stSTX and withdrawals to convert back to STX

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-INVALID-AMOUNT (err u301))
(define-constant ERR-DEPOSIT-FAILED (err u302))
(define-constant ERR-WITHDRAWAL-FAILED (err u303))
(define-constant ERR-INSTANT-WITHDRAWAL-FAILED (err u304))
(define-constant ERR-WITHDRAWAL-INIT-FAILED (err u305))
(define-constant ERR-NO-WITHDRAWAL-NFT (err u306))

;; StackingDAO Core V6 contract addresses (mainnet)
(define-constant STACKING-DAO-CORE 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v6)
(define-constant RESERVE-CONTRACT 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.reserve-v1)
(define-constant COMMISSION-CONTRACT 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.commission-v2)
(define-constant STAKING-CONTRACT 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.staking-v0)
(define-constant DIRECT-HELPERS 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.direct-helpers-v4)

;; stSTX token contract (for balance checks and ratio calculations)
(define-constant STSTX-TOKEN 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token)

;; Contract owner (for admin functions)
(define-data-var contract-owner principal tx-sender)

;; Demo mode flag - enables yield simulation for presentations
;; Set to false for production deployment
(define-data-var demo-mode bool true)

;; Track total STX deposited into StackingDAO
(define-data-var total-stx-deposited uint u0)

;; Track total stSTX received from StackingDAO
(define-data-var total-ststx-balance uint u0)

;; Simulated yield for demo purposes (only used when demo-mode is true)
(define-data-var simulated-yield uint u0)

;; Track pending withdrawals by user (NFT ID -> user principal)
;; Note: In production, this should be a map tracking withdrawal NFT IDs
(define-map withdrawal-nfts uint principal)
(define-data-var next-withdrawal-id uint u0)

;; Public functions

;; Deposit STX into StackingDAO and receive stSTX
;; @param amount: Amount of STX to deposit (in microSTX)
;; @returns: Amount of stSTX received
(define-public (deposit-to-stacking (amount uint))
  (let (
    (sender tx-sender)
  )
    ;; Validate amount
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer STX from sender to this contract
    (try! (stx-transfer? amount sender (as-contract tx-sender)))

    ;; TODO: Call StackingDAO Core V6 deposit function
    ;; (as-contract (contract-call? STACKING-DAO-CORE deposit
    ;;   RESERVE-CONTRACT COMMISSION-CONTRACT STAKING-CONTRACT
    ;;   DIRECT-HELPERS amount none none))

    ;; For now, we'll simulate 1:1 conversion
    ;; In production, this will call StackingDAO and track actual stSTX received
    (let (
      (ststx-received amount) ;; Simplified: 1:1 conversion
    )
      ;; Update tracking variables
      (var-set total-stx-deposited (+ (var-get total-stx-deposited) amount))
      (var-set total-ststx-balance (+ (var-get total-ststx-balance) ststx-received))

      (ok {
        stx-deposited: amount,
        ststx-received: ststx-received
      })
    )
  )
)

;; Initiate withdrawal from StackingDAO (traditional 14-day cycle)
;; Returns an NFT ID representing the withdrawal position
;; @param ststx-amount: Amount of stSTX to withdraw
;; @returns: Withdrawal NFT ID
(define-public (init-withdrawal (ststx-amount uint))
  (let (
    (sender tx-sender)
    (withdrawal-id (var-get next-withdrawal-id))
  )
    ;; Validate amount
    (asserts! (> ststx-amount u0) ERR-INVALID-AMOUNT)

    ;; TODO: Call StackingDAO init-withdraw
    ;; (as-contract (contract-call? STACKING-DAO-CORE init-withdraw
    ;;   RESERVE-CONTRACT DIRECT-HELPERS ststx-amount))

    ;; Track this withdrawal
    (map-set withdrawal-nfts withdrawal-id sender)
    (var-set next-withdrawal-id (+ withdrawal-id u1))

    ;; Update balance (stSTX is burned during init-withdraw)
    (var-set total-ststx-balance (- (var-get total-ststx-balance) ststx-amount))

    (ok {
      withdrawal-nft-id: withdrawal-id,
      ststx-amount: ststx-amount
    })
  )
)

;; Complete withdrawal after cycle ends using NFT ID
;; @param nft-id: The withdrawal NFT ID from init-withdrawal
;; @returns: Amount of STX received
(define-public (complete-withdrawal (nft-id uint))
  (let (
    (sender tx-sender)
    (withdrawal-owner (unwrap! (map-get? withdrawal-nfts nft-id) ERR-NO-WITHDRAWAL-NFT))
  )
    ;; Verify sender owns this withdrawal NFT
    (asserts! (is-eq sender withdrawal-owner) ERR-NOT-AUTHORIZED)

    ;; TODO: Call StackingDAO withdraw with NFT ID
    ;; (as-contract (contract-call? STACKING-DAO-CORE withdraw
    ;;   RESERVE-CONTRACT COMMISSION-CONTRACT STAKING-CONTRACT nft-id))

    ;; For now, simulate receiving STX based on current ratio
    (let (
      (stx-received u1000000) ;; Placeholder - will be actual amount from StackingDAO
    )
      ;; Remove withdrawal tracking
      (map-delete withdrawal-nfts nft-id)

      ;; Update total deposited (received amount might be more due to yield)
      (var-set total-stx-deposited
        (if (> (var-get total-stx-deposited) stx-received)
          (- (var-get total-stx-deposited) stx-received)
          u0))

      ;; Transfer STX to sender
      (try! (as-contract (stx-transfer? stx-received tx-sender sender)))

      (ok {
        nft-id: nft-id,
        stx-received: stx-received
      })
    )
  )
)

;; Instant withdrawal using StackingDAO's idle liquidity (1% fee)
;; @param ststx-amount: Amount of stSTX to withdraw instantly
;; @returns: Amount of STX received (after 1% fee)
(define-public (instant-withdrawal (ststx-amount uint))
  (let (
    (sender tx-sender)
  )
    ;; Validate amount
    (asserts! (> ststx-amount u0) ERR-INVALID-AMOUNT)

    ;; TODO: Call StackingDAO withdraw-idle
    ;; (as-contract (contract-call? STACKING-DAO-CORE withdraw-idle
    ;;   RESERVE-CONTRACT DIRECT-HELPERS COMMISSION-CONTRACT
    ;;   STAKING-CONTRACT ststx-amount))

    ;; For now, simulate instant withdrawal with 1% fee
    (let (
      ;; Convert stSTX to STX using current ratio
      (stx-amount ststx-amount) ;; Simplified 1:1
      ;; Apply 1% fee
      (fee (/ stx-amount u100))
      (stx-after-fee (- stx-amount fee))
    )
      ;; Update balances
      (var-set total-ststx-balance (- (var-get total-ststx-balance) ststx-amount))
      (var-set total-stx-deposited
        (if (> (var-get total-stx-deposited) stx-after-fee)
          (- (var-get total-stx-deposited) stx-after-fee)
          u0))

      ;; Transfer STX to sender
      (try! (as-contract (stx-transfer? stx-after-fee tx-sender sender)))

      (ok {
        ststx-burned: ststx-amount,
        stx-received: stx-after-fee,
        fee-paid: fee
      })
    )
  )
)

;; Read-only functions

;; Get current stSTX/STX ratio
;; In production, this will query the actual StackingDAO contract
;; stSTX appreciates over time as rewards accumulate
(define-read-only (get-ststx-stx-ratio)
  (let (
    (total-stx (var-get total-stx-deposited))
    (total-ststx (var-get total-ststx-balance))
  )
    (if (and (> total-stx u0) (> total-ststx u0))
      (ok {
        stx: total-stx,
        ststx: total-ststx,
        ;; Ratio in basis points (10000 = 1.0)
        ratio-basis-points: (/ (* total-stx u10000) total-ststx)
      })
      (ok {
        stx: u0,
        ststx: u0,
        ratio-basis-points: u10000 ;; 1:1 default
      })
    )
  )
)

;; Calculate how much stSTX would be received for depositing amount STX
;; @param stx-amount: Amount of STX to deposit
;; @returns: Estimated stSTX to receive
(define-read-only (preview-deposit (stx-amount uint))
  (let (
    (ratio-data (unwrap-panic (get-ststx-stx-ratio)))
    (ratio (get ratio-basis-points ratio-data))
  )
    (ok {
      stx-to-deposit: stx-amount,
      ;; Convert using ratio: stSTX = STX * 10000 / ratio
      ststx-to-receive: (/ (* stx-amount u10000) ratio)
    })
  )
)

;; Calculate how much STX would be received for withdrawing amount stSTX
;; @param ststx-amount: Amount of stSTX to withdraw
;; @param instant: Whether using instant withdrawal (applies 1% fee)
;; @returns: Estimated STX to receive
(define-read-only (preview-withdrawal (ststx-amount uint) (instant bool))
  (let (
    (ratio-data (unwrap-panic (get-ststx-stx-ratio)))
    (ratio (get ratio-basis-points ratio-data))
    ;; Convert using ratio: STX = stSTX * ratio / 10000
    (stx-amount (/ (* ststx-amount ratio) u10000))
    ;; Apply 1% fee if instant withdrawal
    (fee (if instant (/ stx-amount u100) u0))
    (stx-after-fee (- stx-amount fee))
  )
    (ok {
      ststx-to-burn: ststx-amount,
      stx-to-receive: stx-after-fee,
      fee: fee,
      instant: instant
    })
  )
)

;; Calculate total yield accumulated in the pool
;; Yield = (current stSTX value in STX) - (original STX deposited)
;; This is the BTC rewards that have been converted to STX and auto-compounded
;; In DEMO MODE: adds simulated yield to the calculation
(define-read-only (get-accumulated-yield)
  (let (
    (deposited-amount (var-get total-stx-deposited))
    (total-ststx (var-get total-ststx-balance))
    (ratio-data (unwrap-panic (get-ststx-stx-ratio)))
    (ratio (get ratio-basis-points ratio-data))
    ;; Current STX value = stSTX * ratio / 10000
    (current-stx-value (/ (* total-ststx ratio) u10000))
    ;; Add simulated yield if in demo mode
    (demo-yield (if (var-get demo-mode) (var-get simulated-yield) u0))
    (total-value (+ current-stx-value demo-yield))
  )
    (ok {
      total-deposited: deposited-amount,
      current-value: total-value,
      real-value: current-stx-value,
      simulated-yield: demo-yield,
      demo-mode: (var-get demo-mode),
      ;; Yield is the difference (can be negative if withdrawals > deposits + yield)
      yield-accumulated: (if (> total-value deposited-amount)
        (- total-value deposited-amount)
        u0)
    })
  )
)

;; Get total stSTX balance held by this contract
(define-read-only (get-total-ststx-balance)
  (ok (var-get total-ststx-balance))
)

;; Get total STX deposited into stacking
(define-read-only (get-total-stx-deposited)
  (ok (var-get total-stx-deposited))
)

;; Check if a withdrawal NFT exists and who owns it
(define-read-only (get-withdrawal-nft-owner (nft-id uint))
  (ok (map-get? withdrawal-nfts nft-id))
)

;; Get contract info
(define-read-only (get-contract-info)
  (ok {
    contract-owner: (var-get contract-owner),
    total-stx-deposited: (var-get total-stx-deposited),
    total-ststx-balance: (var-get total-ststx-balance),
    next-withdrawal-id: (var-get next-withdrawal-id),
    demo-mode: (var-get demo-mode),
    simulated-yield: (var-get simulated-yield),
    ;; StackingDAO contract addresses
    stacking-dao-core: STACKING-DAO-CORE,
    reserve-contract: RESERVE-CONTRACT,
    commission-contract: COMMISSION-CONTRACT,
    staking-contract: STAKING-CONTRACT,
    direct-helpers: DIRECT-HELPERS
  })
)

;; ============================================
;; DEMO MODE FUNCTIONS (For Presentations)
;; ============================================
;; IMPORTANT: These functions are for demonstration purposes only
;; Set demo-mode to false before mainnet production deployment

;; Enable or disable demo mode (owner only)
(define-public (set-demo-mode (enabled bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (var-set demo-mode enabled)
    (ok {
      demo-mode: enabled,
      note: (if enabled "Demo mode ENABLED - Yield simulation active" "Demo mode DISABLED - Using real StackingDAO")
    })
  )
)

;; Simulate stacking yield for demo purposes
;; This artificially increases the stSTX/STX ratio to show how yield accumulates
;; @param yield-amount: Amount of "yield" to add (in microSTX)
(define-public (simulate-yield-for-demo (yield-amount uint))
  (begin
    ;; Only owner can simulate yield
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)

    ;; Only works in demo mode
    (asserts! (var-get demo-mode) (err u999)) ;; ERR-NOT-IN-DEMO-MODE

    ;; Validate amount
    (asserts! (> yield-amount u0) ERR-INVALID-AMOUNT)

    ;; Add to simulated yield
    (var-set simulated-yield (+ (var-get simulated-yield) yield-amount))

    (ok {
      simulated-yield-added: yield-amount,
      total-simulated-yield: (var-get simulated-yield),
      note: "Fast-forwarded stacking time! Yield simulated for demo.",
      warning: "DEMO MODE - This is not real yield. Disable demo-mode for production."
    })
  )
)

;; Reset simulated yield to zero (owner only, demo mode only)
(define-public (reset-simulated-yield)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (var-get demo-mode) (err u999))

    (var-set simulated-yield u0)
    (ok { note: "Simulated yield reset to 0" })
  )
)

;; Check if contract is in demo mode
(define-read-only (is-demo-mode)
  (ok (var-get demo-mode))
)

;; Get current simulated yield amount
(define-read-only (get-simulated-yield)
  (ok (var-get simulated-yield))
)
