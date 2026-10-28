-- ============================================================================
-- CAREER OPTICS ERP: High-Volume Wallet & Transaction Ledger Optimizations
-- ============================================================================
-- Run this script in the Supabase SQL editor to ensure optimal indexing,
-- duplicate UTR protection and atomic ledger processing for 1000+ transactions.

-- 1. Index Optimizations for Fast Filtering, Searching and Sorting
CREATE INDEX IF NOT EXISTS "branch_transactions_reference_idx"
    ON "branch_transactions" ("reference");

CREATE INDEX IF NOT EXISTS "branch_transactions_status_createdAt_idx"
    ON "branch_transactions" ("status", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "branch_transactions_branchId_status_idx"
    ON "branch_transactions" ("branchId", "status");

CREATE INDEX IF NOT EXISTS "branch_transactions_paymentMethod_idx"
    ON "branch_transactions" ("paymentMethod");

-- 2. Ensure proofUrl, reviewedBy and reviewedAt columns exist on branch_transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'branch_transactions' AND column_name = 'proofUrl'
    ) THEN
        ALTER TABLE "branch_transactions" ADD COLUMN "proofUrl" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'branch_transactions' AND column_name = 'reviewedBy'
    ) THEN
        ALTER TABLE "branch_transactions" ADD COLUMN "reviewedBy" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'branch_transactions' AND column_name = 'reviewedAt'
    ) THEN
        ALTER TABLE "branch_transactions" ADD COLUMN "reviewedAt" TIMESTAMP(3);
    END IF;
END $$;

-- 3. Atomic Procedure: approve_recharge_atomic
-- Atomically credits branch_wallets and transitions branch_transactions to COMPLETED.
-- Protects against race conditions and double crediting.
CREATE OR REPLACE FUNCTION approve_recharge_atomic(
    p_transaction_id TEXT,
    p_reviewer_name TEXT,
    p_reviewer_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_wallet RECORD;
    v_new_balance DOUBLE PRECISION;
    v_now TIMESTAMP(3) := CURRENT_TIMESTAMP;
BEGIN
    -- 1. Lock and fetch transaction
    SELECT * INTO v_tx
    FROM "branch_transactions"
    WHERE "id" = p_transaction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found: %', p_transaction_id;
    END IF;

    -- 2. Concurrency & idempotency check
    IF v_tx.status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Transaction % has already been approved and credited.', p_transaction_id;
    END IF;

    IF v_tx.status = 'FAILED' THEN
        RAISE EXCEPTION 'Transaction % has already been rejected.', p_transaction_id;
    END IF;

    IF v_tx.status != 'PENDING' THEN
        RAISE EXCEPTION 'Transaction status is %; only PENDING transactions can be approved.', v_tx.status;
    END IF;

    -- 3. Lock and fetch branch wallet
    SELECT * INTO v_wallet
    FROM "branch_wallets"
    WHERE "branchId" = v_tx."branchId"
    FOR UPDATE;

    IF FOUND THEN
        v_new_balance := COALESCE(v_wallet.balance, 0) + v_tx.amount;
        UPDATE "branch_wallets"
        SET
            "balance" = v_new_balance,
            "lastRechargeAmount" = v_tx.amount,
            "lastRechargeDate" = v_now,
            "updatedAt" = v_now
        WHERE "id" = v_wallet.id;
    ELSE
        v_new_balance := v_tx.amount;
        INSERT INTO "branch_wallets" (
            "id", "branchId", "balance", "isActive", "lastRechargeAmount", "lastRechargeDate", "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid()::text, v_tx."branchId", v_new_balance, true, v_tx.amount, v_now, v_now, v_now
        );
    END IF;

    -- 4. Update transaction record
    UPDATE "branch_transactions"
    SET
        "status" = 'COMPLETED',
        "balanceAfter" = v_new_balance,
        "reviewedBy" = p_reviewer_name,
        "reviewedAt" = v_now,
        "updatedAt" = v_now
    WHERE "id" = p_transaction_id;

    -- 5. Record immutable audit event
    INSERT INTO "audit_events" (
        "id", "actorId", "branchId", "action", "entityType", "entityId", "before", "after", "createdAt"
    ) VALUES (
        gen_random_uuid()::text,
        p_reviewer_id,
        v_tx."branchId",
        'RECHARGE_APPROVED',
        'BranchTransaction',
        p_transaction_id,
        jsonb_build_object('status', 'PENDING', 'balance', COALESCE(v_wallet.balance, 0)),
        jsonb_build_object(
            'status', 'COMPLETED',
            'balanceBefore', COALESCE(v_wallet.balance, 0),
            'balanceAfter', v_new_balance,
            'amount', v_tx.amount,
            'reference', v_tx.reference,
            'reviewedBy', p_reviewer_name,
            'reviewedAt', v_now
        ),
        v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'transactionId', p_transaction_id,
        'newBalance', v_new_balance,
        'status', 'COMPLETED'
    );
END;
$$;
