;; StackPot Prize Distributor
;; Handles winner selection using block hash randomness and prize distribution

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-DRAW-TOO-EARLY (err u201))
(define-constant ERR-NO-PARTICIPANTS (err u202))
(define-constant ERR-INVALID-DRAW (err u203))
(define-constant ERR-NOT-WINNER (err u204))
(define-constant ERR-ALREADY-CLAIMED (err u205))
(define-constant ERR-NO-PRIZE (err u206))
(define-constant ERR-BLOCK-HASH-UNAVAILABLE (err u207))

;; Constants
(define-constant BLOCKS-PER-DRAW u30) ;; Demo: ~5 minutes (use u1008 for production ~1 week)
(define-constant SIMULATED-PRIZE-PER-DRAW u10000000) ;; 0.1 BTC in sats for testing
(define-constant CONTRACT-OWNER tx-sender)

;; Note: pool-manager contract reference is .pool-manager (used directly in contract-call?)

;; Data variables
(define-data-var last-draw-block uint u0)
(define-data-var current-draw-id uint u0)
(define-data-var total-prize-pool uint u0)

;; Data maps
;; Track draw information
(define-map draws
  uint  ;; draw-id
  {
    winner: (optional principal),
    prize-amount: uint,
    draw-block: uint,
    participants-count: uint,
    claimed: bool
  }
)

;; Track which draws a user has won
(define-map user-wins principal (list 100 uint))

;; Public functions

;; Trigger a new draw (permissionless - anyone can call after BLOCKS-PER-DRAW)
(define-public (trigger-draw)
  (let (
    (current-block burn-block-height)
    (last-draw (var-get last-draw-block))
    (blocks-since-last-draw (- current-block last-draw))
  )
    ;; Check if enough blocks have passed
    (asserts! (>= blocks-since-last-draw BLOCKS-PER-DRAW) ERR-DRAW-TOO-EARLY)

    ;; Get participant count from pool-manager
    (let (
      (participant-count (unwrap-panic (contract-call? .pool-manager get-participant-count)))
    )
      ;; Must have at least one participant
      (asserts! (> participant-count u0) ERR-NO-PARTICIPANTS)

      ;; Select winner using Bitcoin block hash randomness
      (let (
        (winner-result (try! (select-winner participant-count current-block)))
        (draw-id (var-get current-draw-id))
        (prize-amount SIMULATED-PRIZE-PER-DRAW)
      )
        ;; Record draw information
        (map-set draws draw-id {
          winner: (some winner-result),
          prize-amount: prize-amount,
          draw-block: current-block,
          participants-count: participant-count,
          claimed: false
        })

        ;; Update state
        (var-set last-draw-block current-block)
        (var-set current-draw-id (+ draw-id u1))
        (var-set total-prize-pool (+ (var-get total-prize-pool) prize-amount))

        (ok {
          draw-id: draw-id,
          winner: winner-result,
          prize-amount: prize-amount
        })
      )
    )
  )
)

;; Claim prize for a specific draw
(define-public (claim-prize (draw-id uint))
  (let (
    (draw-info (unwrap! (map-get? draws draw-id) ERR-INVALID-DRAW))
    (winner (unwrap! (get winner draw-info) ERR-NO-PRIZE))
  )
    ;; Verify caller is the winner
    (asserts! (is-eq tx-sender winner) ERR-NOT-WINNER)

    ;; Verify not already claimed
    (asserts! (not (get claimed draw-info)) ERR-ALREADY-CLAIMED)

    ;; Mark as claimed
    (map-set draws draw-id (merge draw-info { claimed: true }))

    ;; TODO: Transfer actual BTC (for now, just return success)
    ;; In production, this would transfer from accumulated stacking rewards

    (ok {
      draw-id: draw-id,
      prize-amount: (get prize-amount draw-info)
    })
  )
)

;; Read-only functions

;; Check if a draw can be triggered
(define-read-only (can-trigger-draw)
  (let (
    (current-block burn-block-height)
    (last-draw (var-get last-draw-block))
    (blocks-since-last-draw (- current-block last-draw))
  )
    (ok (>= blocks-since-last-draw BLOCKS-PER-DRAW))
  )
)

;; Get blocks remaining until next draw
(define-read-only (blocks-until-next-draw)
  (let (
    (current-block burn-block-height)
    (last-draw (var-get last-draw-block))
    (blocks-since-last-draw (- current-block last-draw))
  )
    (if (>= blocks-since-last-draw BLOCKS-PER-DRAW)
      (ok u0)
      (ok (- BLOCKS-PER-DRAW blocks-since-last-draw))
    )
  )
)

;; Get current draw info
(define-read-only (get-current-draw-info)
  (ok {
    current-draw-id: (var-get current-draw-id),
    last-draw-block: (var-get last-draw-block),
    total-prize-pool: (var-get total-prize-pool),
    blocks-until-next: (unwrap-panic (blocks-until-next-draw))
  })
)

;; Get info for a specific draw
(define-read-only (get-draw-info (draw-id uint))
  (ok (map-get? draws draw-id))
)

;; Get the winner of a specific draw
(define-read-only (get-draw-winner (draw-id uint))
  (match (map-get? draws draw-id)
    draw-data (ok (get winner draw-data))
    (ok none)
  )
)

;; Check if a prize has been claimed
(define-read-only (is-prize-claimed (draw-id uint))
  (match (map-get? draws draw-id)
    draw-data (ok (get claimed draw-data))
    (ok false)
  )
)

;; Get total accumulated prize pool
(define-read-only (get-prize-pool)
  (ok (var-get total-prize-pool))
)

;; Private functions

;; Select winner using Bitcoin block hash randomness
(define-private (select-winner (participant-count uint) (draw-block uint))
  (let (
    ;; Try to get Bitcoin burn block hash for true randomness (production)
    ;; Get current burn block height and use the previous block's hash
    (burn-block (- burn-block-height u1))
    (btc-hash-opt (get-burn-block-info? header-hash burn-block))

    ;; Create a deterministic random number with fallback chain:
    ;; 1. Bitcoin block hash (best - production)
    ;; 2. Stacks block hash (good - if Bitcoin unavailable)
    ;; 3. Block height (acceptable - simnet testing only)
    (random-seed (match btc-hash-opt
      ;; Bitcoin hash available - convert first 16 bytes to uint
      btc-hash (match (as-max-len? btc-hash u16)
        hash-slice (buff-to-uint-be hash-slice)
        ;; Fallback to Stacks block hash
        (match (get-stacks-block-info? id-header-hash (- draw-block u1))
          stacks-hash (match (as-max-len? stacks-hash u16)
            stacks-slice (buff-to-uint-be stacks-slice)
            burn-block
          )
          burn-block
        )
      )
      ;; Bitcoin hash not available, try Stacks block hash
      (match (get-stacks-block-info? id-header-hash (- draw-block u1))
        stacks-hash (match (as-max-len? stacks-hash u16)
          stacks-slice (buff-to-uint-be stacks-slice)
          burn-block
        )
        ;; Final fallback: use burn block height (simnet)
        burn-block
      )
    ))

    ;; Calculate winner index using modulo
    (winner-index (mod random-seed participant-count))
  )
    ;; Get participant from pool-manager using the random index
    (let (
      (participant-optional (unwrap-panic (contract-call? .pool-manager get-participant winner-index)))
    )
      ;; participant-optional is (optional {participant: principal, balance: uint})
      (match participant-optional
        data (ok (get participant data))
        ERR-NO-PARTICIPANTS
      )
    )
  )
)
