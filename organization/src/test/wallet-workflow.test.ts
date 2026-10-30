import { describe, it, expect, vi, beforeEach } from "vitest";

// In-memory data store for testing
let mockTransactions: any[] = [];
let mockWallets: any[] = [];
let mockAuditEvents: any[] = [];

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => {
  return {
    supabase: {
      from: (table: string) => {
        let selectedFields = "*";
        let filters: Array<(row: any) => boolean> = [];
        let sortFn = (a: any, b: any) => 0;

        const builder = {
          select: (fields: string = "*") => {
            selectedFields = fields;
            return builder;
          },
          eq: (field: string, val: any) => {
            filters.push((row: any) => row[field] === val);
            return builder;
          },
          neq: (field: string, val: any) => {
            filters.push((row: any) => row[field] !== val);
            return builder;
          },
          in: (field: string, vals: any[]) => {
            filters.push((row: any) => vals.includes(row[field]));
            return builder;
          },
          order: (field: string, { ascending = true }: { ascending?: boolean } = {}) => {
            sortFn = (a: any, b: any) => {
              if (a[field] < b[field]) return ascending ? -1 : 1;
              if (a[field] > b[field]) return ascending ? 1 : -1;
              return 0;
            };
            return builder;
          },
          limit: (n: number) => builder,
          single: async () => {
            const rows = getTableRows(table).filter((r) => filters.every((f) => f(r)));
            if (rows.length === 0) {
              return { data: null, error: { message: "Row not found", code: "PGRST116" } };
            }
            return { data: { ...rows[0] }, error: null };
          },
          maybeSingle: async () => {
            const rows = getTableRows(table).filter((r) => filters.every((f) => f(r)));
            return { data: rows.length > 0 ? { ...rows[0] } : null, error: null };
          },
          insert: (record: any) => {
            const newRecord = {
              id: record.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...record,
            };
            getTableRows(table).push(newRecord);
            return {
              select: () => ({
                single: async () => ({ data: { ...newRecord }, error: null }),
              }),
            };
          },
          // A real PostgREST update chains any number of filters and only runs
          // when the builder is awaited, which is what lets the approval code
          // guard on `id` *and* `status` in one statement. Applying the write on
          // the first `.eq()` would ignore every filter after it.
          update: (updates: any) => {
            const updateFilters: Array<(row: any) => boolean> = [];

            const apply = () => {
              const rows = getTableRows(table);
              const matched: any[] = [];
              for (let i = 0; i < rows.length; i++) {
                if (updateFilters.every((f) => f(rows[i]))) {
                  rows[i] = { ...rows[i], ...updates, updatedAt: new Date().toISOString() };
                  matched.push(rows[i]);
                }
              }
              return matched;
            };

            const updateBuilder: any = {
              eq: (field: string, val: any) => {
                updateFilters.push((row: any) => row[field] === val);
                return updateBuilder;
              },
              select: () => {
                const selectBuilder: any = {
                  single: async () => {
                    const matched = apply();
                    return matched.length > 0
                      ? { data: { ...matched[0] }, error: null }
                      : { data: null, error: { message: "Row not found", code: "PGRST116" } };
                  },
                  then: (resolve: any) =>
                    resolve({ data: apply().map((r) => ({ ...r })), error: null }),
                };
                return selectBuilder;
              },
              then: (resolve: any) => {
                const matched = apply();
                resolve({ data: matched.length > 0 ? matched[0] : null, error: null });
              },
            };

            return updateBuilder;
          },
          then: (resolve: any) => {
            let rows = getTableRows(table).filter((r) => filters.every((f) => f(r)));
            rows.sort(sortFn);
            resolve({ data: rows.map((r) => ({ ...r })), error: null });
          },
        };

        function getTableRows(tbl: string) {
          if (tbl === "branch_transactions") return mockTransactions;
          if (tbl === "branch_wallets") return mockWallets;
          if (tbl === "audit_events") return mockAuditEvents;
          if (tbl === "branches") {
            return [
              { id: "b1", name: "Cantonment Branch", code: "CAN-01", organizationId: "org-1", isActive: true },
              { id: "b2", name: "City Center Branch", code: "CIT-02", organizationId: "org-1", isActive: true },
            ];
          }
          return [];
        }

        return builder;
      },
    },
  };
});

// Import wallet functions
const {
  submitRechargeRequest,
  approveRechargeTransaction,
  rejectRechargeTransaction,
  bulkApproveRecharges,
  bulkRejectRecharges,
  getWalletTransactions,
} = await import("@/lib/supabase/data");

describe("Wallet Recharge & Approval Workflow", () => {
  beforeEach(() => {
    mockTransactions = [];
    mockWallets = [
      { id: "w1", branchId: "b1", balance: 50000, isActive: true },
      { id: "w2", branchId: "b2", balance: 25000, isActive: true },
    ];
    mockAuditEvents = [];
  });

  describe("Validation & Submission Layer", () => {
    it("fails when branch is not provided", async () => {
      const res = await submitRechargeRequest({
        branchId: "",
        amount: 10000,
        paymentMethod: "UPI",
        reference: "UTR-1001",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("branch");
    });

    it("fails when amount is zero or negative", async () => {
      const res = await submitRechargeRequest({
        branchId: "b1",
        amount: 0,
        paymentMethod: "UPI",
        reference: "UTR-1001",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("greater than zero");
    });

    it("fails when UTR / reference is empty", async () => {
      const res = await submitRechargeRequest({
        branchId: "b1",
        amount: 5000,
        paymentMethod: "UPI",
        reference: "   ",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("Reference / UTR");
    });

    it("successfully creates recharge in PENDING state without crediting wallet", async () => {
      const initialWallet = mockWallets.find((w) => w.branchId === "b1");
      expect(initialWallet.balance).toBe(50000);

      const res = await submitRechargeRequest({
        branchId: "b1",
        amount: 10000,
        paymentMethod: "UPI",
        reference: "UTR-999001",
        submittedBy: { id: "u-staff", name: "Rahul Staff" },
      });

      expect(res.success).toBe(true);
      expect(res.data?.status).toBe("PENDING");
      expect(res.data?.amount).toBe(10000);
      expect(res.data?.reference).toBe("UTR-999001");

      // Wallet balance must NOT be credited at submission stage
      const updatedWallet = mockWallets.find((w) => w.branchId === "b1");
      expect(updatedWallet.balance).toBe(50000);

      // Audit log must record submission
      expect(mockAuditEvents.length).toBe(1);
      expect(mockAuditEvents[0].action).toBe("RECHARGE_SUBMITTED");
    });

    it("prevents duplicate UTR submission", async () => {
      // First submission
      await submitRechargeRequest({
        branchId: "b1",
        amount: 5000,
        paymentMethod: "UPI",
        reference: "DUPLICATE-UTR-123",
      });

      // Second submission with exact same UTR
      const dupRes = await submitRechargeRequest({
        branchId: "b1",
        amount: 8000,
        paymentMethod: "UPI",
        reference: "DUPLICATE-UTR-123",
      });

      expect(dupRes.success).toBe(false);
      expect(dupRes.error).toContain("Duplicate UTR / Reference");
    });
  });

  describe("Approval & Balance Credit Layer", () => {
    it("approves pending recharge and atomically credits branch wallet", async () => {
      // Create pending item
      const subRes = await submitRechargeRequest({
        branchId: "b1",
        amount: 15000,
        paymentMethod: "UPI",
        reference: "UTR-APPROVE-1",
      });
      const txId = subRes.data!.id;

      // Approve
      const appRes = await approveRechargeTransaction(txId, {
        id: "admin-1",
        name: "Head Admin",
      });

      expect(appRes.success).toBe(true);
      expect(appRes.data?.status).toBe("COMPLETED");
      expect(appRes.data?.reviewedBy).toBe("Head Admin");
      expect(appRes.newBalance).toBe(65000); // 50000 + 15000

      // Wallet in store is updated
      const wallet = mockWallets.find((w) => w.branchId === "b1");
      expect(wallet.balance).toBe(65000);

      // Audit event logged
      const appAudit = mockAuditEvents.find((e) => e.action === "RECHARGE_APPROVED");
      expect(appAudit).toBeDefined();
      expect(appAudit.after.balanceAfter).toBe(65000);
    });

    it("protects against double approval (idempotency)", async () => {
      const subRes = await submitRechargeRequest({
        branchId: "b1",
        amount: 10000,
        paymentMethod: "UPI",
        reference: "UTR-DOUBLE-APP",
      });
      const txId = subRes.data!.id;

      // 1st approval
      await approveRechargeTransaction(txId, { id: "admin-1", name: "Admin 1" });

      // 2nd approval attempt must fail
      const secondApp = await approveRechargeTransaction(txId, {
        id: "admin-2",
        name: "Admin 2",
      });
      expect(secondApp.success).toBe(false);
      expect(secondApp.error).toContain("already been approved");

      // Balance credited only once
      const wallet = mockWallets.find((w) => w.branchId === "b1");
      expect(wallet.balance).toBe(60000);
    });

    it("cannot approve a rejected transaction", async () => {
      const subRes = await submitRechargeRequest({
        branchId: "b1",
        amount: 5000,
        paymentMethod: "CARD",
        reference: "UTR-REJ-APP",
      });
      const txId = subRes.data!.id;

      // Reject first
      await rejectRechargeTransaction(txId, { id: "admin-1", name: "Admin" }, "Invalid payment slip");

      // Attempt to approve
      const appRes = await approveRechargeTransaction(txId, { id: "admin-1", name: "Admin" });
      expect(appRes.success).toBe(false);
      expect(appRes.error).toContain("already been rejected");
    });
  });

  describe("Rejection Layer", () => {
    it("requires a mandatory rejection reason", async () => {
      const subRes = await submitRechargeRequest({
        branchId: "b1",
        amount: 5000,
        paymentMethod: "UPI",
        reference: "UTR-REJ-1",
      });
      const txId = subRes.data!.id;

      const rejRes = await rejectRechargeTransaction(txId, { name: "Admin" }, "   ");
      expect(rejRes.success).toBe(false);
      expect(rejRes.error).toContain("reason");
    });

    it("marks transaction as FAILED without altering wallet balance", async () => {
      const initialBal = mockWallets.find((w) => w.branchId === "b2").balance;

      const subRes = await submitRechargeRequest({
        branchId: "b2",
        amount: 10000,
        paymentMethod: "NET_BANKING",
        reference: "UTR-REJ-2",
      });
      const txId = subRes.data!.id;

      const rejRes = await rejectRechargeTransaction(
        txId,
        { id: "admin-1", name: "Auditor" },
        "Bank reference not credited to trust account"
      );

      expect(rejRes.success).toBe(true);
      expect(rejRes.data?.status).toBe("FAILED");
      expect(rejRes.data?.rejectionReason).toBe("Bank reference not credited to trust account");

      // Wallet balance must remain identical
      const wallet = mockWallets.find((w) => w.branchId === "b2");
      expect(wallet.balance).toBe(initialBal);

      // Audit log recorded
      const rejAudit = mockAuditEvents.find((e) => e.action === "RECHARGE_REJECTED");
      expect(rejAudit).toBeDefined();
    });
  });

  describe("Bulk Operations Layer", () => {
    it("bulk approves multiple pending transactions safely", async () => {
      const t1 = await submitRechargeRequest({ branchId: "b1", amount: 5000, paymentMethod: "UPI", reference: "B1-01" });
      const t2 = await submitRechargeRequest({ branchId: "b1", amount: 7000, paymentMethod: "UPI", reference: "B1-02" });

      const bulkRes = await bulkApproveRecharges([t1.data!.id, t2.data!.id], {
        id: "admin-bulk",
        name: "Admin Bulk",
      });

      expect(bulkRes.success).toBe(true);
      expect(bulkRes.succeeded.length).toBe(2);
      expect(bulkRes.failed.length).toBe(0);

      // Total balance updated: 50000 + 5000 + 7000 = 62000
      const wallet = mockWallets.find((w) => w.branchId === "b1");
      expect(wallet.balance).toBe(62000);
    });

    it("bulk rejects multiple pending transactions with common reason", async () => {
      const t1 = await submitRechargeRequest({ branchId: "b2", amount: 3000, paymentMethod: "UPI", reference: "BR-01" });
      const t2 = await submitRechargeRequest({ branchId: "b2", amount: 4000, paymentMethod: "UPI", reference: "BR-02" });

      const bulkRes = await bulkRejectRecharges(
        [t1.data!.id, t2.data!.id],
        { id: "admin", name: "Admin" },
        "Batch reconciliation failure"
      );

      expect(bulkRes.success).toBe(true);
      expect(bulkRes.succeeded.length).toBe(2);
    });
  });

  describe("Ledger Filtering & Breakdown Counts", () => {
    it("correctly computes breakdown counts for All, Pending, Approved, Rejected", async () => {
      // 1. Pending
      await submitRechargeRequest({ branchId: "b1", amount: 1000, paymentMethod: "UPI", reference: "REF-P1" });
      await submitRechargeRequest({ branchId: "b1", amount: 2000, paymentMethod: "UPI", reference: "REF-P2" });

      // 2. Approved
      const a1 = await submitRechargeRequest({ branchId: "b1", amount: 3000, paymentMethod: "UPI", reference: "REF-A1" });
      await approveRechargeTransaction(a1.data!.id, { name: "Admin" });

      // 3. Rejected
      const r1 = await submitRechargeRequest({ branchId: "b1", amount: 4000, paymentMethod: "UPI", reference: "REF-R1" });
      await rejectRechargeTransaction(r1.data!.id, { name: "Admin" }, "Invalid receipt");

      const res = await getWalletTransactions({ status: "ALL" });
      expect(res.counts.all).toBe(4);
      expect(res.counts.pending).toBe(2);
      expect(res.counts.approved).toBe(1);
      expect(res.counts.rejected).toBe(1);
      expect(res.totals.pendingAmount).toBe(3000);
      expect(res.totals.approvedAmount).toBe(3000);
    });
  });
});
