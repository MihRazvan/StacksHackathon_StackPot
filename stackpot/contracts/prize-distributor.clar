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

    ;; Get total shares and participant count from pool-manager
    (let (
      (participant-count (unwrap-panic (contract-call? .pool-manager get-participant-count)))
      (total-shares (unwrap-panic (contract-call? .pool-manager get-total-shares)))
    )
      ;; Must have at least one participant and shares > 0
      (asserts! (> participant-count u0) ERR-NO-PARTICIPANTS)
      (asserts! (> total-shares u0) ERR-NO-PARTICIPANTS)

      ;; Select winner using weighted Bitcoin block hash randomness
      (let (
        (winner-result (try! (select-winner-weighted total-shares participant-count current-block)))
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

;; Select winner using weighted Bitcoin block hash randomness
;; More shares (STX deposited) = higher probability of winning
(define-private (select-winner-weighted (total-shares uint) (participant-count uint) (draw-block uint))
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

    ;; Calculate winning share number (0 to total-shares-1)
    (winning-share (mod random-seed total-shares))
  )
    ;; Find which participant owns this share via linear search
    (find-share-owner winning-share participant-count u0)
  )
)

;; Helper: Find which participant owns the target share using fold
;; Uses a fold over a list of indices to find the winner
(define-private (find-share-owner (target-share uint) (participant-count uint) (start-index uint))
  (let (
    ;; Use fold to iterate through participants
    (result (fold check-participant-for-share
      (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19
            u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30 u31 u32 u33 u34 u35 u36 u37 u38 u39
            u40 u41 u42 u43 u44 u45 u46 u47 u48 u49 u50 u51 u52 u53 u54 u55 u56 u57 u58 u59
            u60 u61 u62 u63 u64 u65 u66 u67 u68 u69 u70 u71 u72 u73 u74 u75 u76 u77 u78 u79
            u80 u81 u82 u83 u84 u85 u86 u87 u88 u89 u90 u91 u92 u93 u94 u95 u96 u97 u98 u99)
      {target: target-share, participant-count: participant-count, winner: none}))
  )
    (match (get winner result)
      winner-principal (ok winner-principal)
      ERR-NO-PARTICIPANTS
    )
  )
)

;; Helper for fold: check if current participant owns the target share
(define-private (check-participant-for-share (index uint) (state {target: uint, participant-count: uint, winner: (optional principal)}))
  (let (
    (target (get target state))
    (participant-count (get participant-count state))
    (current-winner (get winner state))
  )
    ;; If we already found a winner, return state unchanged
    (match current-winner
      found state
      ;; No winner yet, check this participant
      (if (< index participant-count)
        (let (
          (cumulative (unwrap! (contract-call? .pool-manager get-cumulative-shares index) state))
        )
          (if (< target cumulative)
            ;; Found the winner!
            (let (
              (participant-opt (unwrap! (contract-call? .pool-manager get-participant index) state))
            )
              (match participant-opt
                data {
                  target: target,
                  participant-count: participant-count,
                  winner: (some (get participant data))
                }
                state
              )
            )
            ;; Not this one, continue
            state
          )
        )
        state
      )
    )
  )
)
