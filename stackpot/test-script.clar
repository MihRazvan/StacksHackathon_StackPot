;; Manual test script for pool-manager
;; Run this in clarinet console with: ::load test-script.clar

;; Test 1: Check initial pool balance
(print "Test 1: Initial pool balance should be 0")
(contract-call? .pool-manager get-total-pool)

;; Test 2: Check initial participant count
(print "Test 2: Initial participant count should be 0")
(contract-call? .pool-manager get-participant-count)

;; Test 3: Deposit 1 STX
(print "Test 3: Deposit 1 STX (1,000,000 microSTX)")
(contract-call? .pool-manager deposit u1000000)

;; Test 4: Check balance after deposit
(print "Test 4: Check pool balance after deposit")
(contract-call? .pool-manager get-total-pool)

;; Test 5: Check participant count after deposit
(print "Test 5: Check participant count after deposit")
(contract-call? .pool-manager get-participant-count)

;; Test 6: Check sender's balance
(print "Test 6: Check sender's balance")
(contract-call? .pool-manager get-balance tx-sender)

;; Test 7: Partial withdrawal
(print "Test 7: Withdraw 0.5 STX (500,000 microSTX)")
(contract-call? .pool-manager withdraw u500000)

;; Test 8: Check balance after withdrawal
(print "Test 8: Check pool balance after withdrawal")
(contract-call? .pool-manager get-total-pool)

;; Test 9: Check sender's balance after withdrawal
(print "Test 9: Check sender's balance after withdrawal")
(contract-call? .pool-manager get-balance tx-sender)

;; Test 10: Withdraw all remaining
(print "Test 10: Withdraw all remaining")
(contract-call? .pool-manager withdraw-all)

;; Test 11: Check final pool balance
(print "Test 11: Final pool balance should be 0")
(contract-call? .pool-manager get-total-pool)
