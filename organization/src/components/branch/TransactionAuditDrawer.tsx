import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Loader2,
  Calendar,
  Building,
} from "lucide-react";
import {
  getTransactionAuditTrail,
  type WalletTransactionItem,
} from "@/lib/supabase/data";

interface TransactionAuditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: WalletTransactionItem | null;
}

interface AuditEvent {
  id: string;
  actorId?: string | null;
  branchId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export function TransactionAuditDrawer({
  open,
  onOpenChange,
  transaction,
}: TransactionAuditDrawerProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !transaction?.id) return;
    let cancelled = false;
    setLoading(true);

    getTransactionAuditTrail(transaction.id)
      .then((res) => {
        if (!cancelled && res.data) {
          setEvents(res.data as AuditEvent[]);
        }
      })
      .catch((err) => console.warn("Failed to load transaction audit trail", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, transaction?.id]);

  if (!transaction) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <SheetTitle className="text-base font-semibold">
              Transaction Audit Trail
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Immutable system logs and reviewer audit history for TXN:{" "}
            <span className="font-mono font-medium text-foreground">
              {transaction.id}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Snapshot Card */}
          <div className="p-3.5 rounded-lg border bg-muted/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Building className="h-3.5 w-3.5" /> Branch
              </span>
              <span className="font-semibold text-foreground">{transaction.branch}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Recharge Amount</span>
              <span className="font-mono font-bold text-foreground text-sm">
                ₹{transaction.amount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Reference (UTR)</span>
              <span className="font-mono font-medium text-foreground">
                {transaction.reference}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t">
              <span className="text-muted-foreground font-medium">Current Status</span>
              <Badge
                variant="outline"
                className={`text-[11px] uppercase font-semibold ${
                  transaction.status === "COMPLETED"
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                    : transaction.status === "PENDING"
                    ? "border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/20"
                    : "border-rose-500/30 text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                }`}
              >
                {transaction.status}
              </Badge>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Lifecycle Events
            </h4>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Loading audit logs...
              </div>
            ) : events.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                {events.map((ev) => {
                  const at = new Date(ev.createdAt);
                  const isSubmit = ev.action === "RECHARGE_SUBMITTED";
                  const isApproved = ev.action === "RECHARGE_APPROVED";
                  const isRejected = ev.action === "RECHARGE_REJECTED";

                  return (
                    <div key={ev.id} className="relative group text-xs space-y-1.5">
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-[29px] top-0.5 rounded-full p-1 border bg-background ${
                          isApproved
                            ? "text-emerald-600 border-emerald-300"
                            : isRejected
                            ? "text-rose-600 border-rose-300"
                            : "text-primary border-primary/30"
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : isRejected ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <FileCheck2 className="h-3.5 w-3.5" />
                        )}
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {isSubmit
                            ? "Recharge Request Submitted"
                            : isApproved
                            ? "Recharge Approved & Credited"
                            : isRejected
                            ? "Recharge Rejected"
                            : ev.action}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {at.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Calendar className="h-3 w-3" />
                        <span>{at.toLocaleDateString("en-IN")}</span>
                        {ev.actorId && (
                          <>
                            <span>·</span>
                            <User className="h-3 w-3" />
                            <span>Actor: {ev.actorId.slice(0, 8)}</span>
                          </>
                        )}
                      </div>

                      {/* Event Details Card */}
                      <div className="mt-2 p-2.5 rounded bg-muted/40 border text-[11px] space-y-1 font-mono">
                        {isSubmit && (
                          <>
                            <div>Submitted By: {ev.after?.submittedBy || "Staff"}</div>
                            <div>Payment Method: {ev.after?.paymentMethod || "UPI"}</div>
                            <div>Reference: {ev.after?.reference || "—"}</div>
                          </>
                        )}
                        {isApproved && (
                          <>
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Approved By: {ev.after?.reviewedBy || "Administrator"}
                            </div>
                            <div>Previous Balance: ₹{(ev.after?.balanceBefore ?? 0).toLocaleString()}</div>
                            <div>Credited Amount: +₹{(ev.after?.amount ?? 0).toLocaleString()}</div>
                            <div className="font-semibold">
                              New Balance: ₹{(ev.after?.balanceAfter ?? 0).toLocaleString()}
                            </div>
                          </>
                        )}
                        {isRejected && (
                          <>
                            <div className="text-rose-600 dark:text-rose-400 font-medium">
                              Reviewed By: {ev.after?.reviewedBy || "Administrator"}
                            </div>
                            <div className="text-destructive">
                              Reason: {ev.after?.rejectionReason || "Not specified"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback synthesized timeline if no audit_events rows yet */
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border text-xs">
                {/* Step 1: Created */}
                <div className="relative group space-y-1">
                  <div className="absolute -left-[29px] top-0.5 rounded-full p-1 border bg-background text-primary border-primary/30">
                    <FileCheck2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Recharge Request Submitted
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {transaction.formattedDateTime}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-muted/30 border text-[11px] font-mono space-y-0.5">
                    <div>Submitted By: {transaction.submittedBy}</div>
                    <div>Payment Method: {transaction.paymentMethod}</div>
                    <div>Reference: {transaction.reference}</div>
                  </div>
                </div>

                {/* Step 2: Review (if completed or failed) */}
                {transaction.status !== "PENDING" && (
                  <div className="relative group space-y-1">
                    <div
                      className={`absolute -left-[29px] top-0.5 rounded-full p-1 border bg-background ${
                        transaction.status === "COMPLETED"
                          ? "text-emerald-600 border-emerald-300"
                          : "text-rose-600 border-rose-300"
                      }`}
                    >
                      {transaction.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {transaction.status === "COMPLETED"
                          ? "Approved & Credited"
                          : "Rejected"}
                      </span>
                      {transaction.reviewedAt && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(transaction.reviewedAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="p-2 rounded bg-muted/30 border text-[11px] font-mono space-y-0.5">
                      <div>Reviewer: {transaction.reviewedBy || "Administrator"}</div>
                      {transaction.status === "COMPLETED" ? (
                        <div className="text-emerald-600 dark:text-emerald-400">
                          Wallet Credited: +₹{transaction.amount.toLocaleString("en-IN")}
                        </div>
                      ) : (
                        <div className="text-destructive">
                          Reason: {transaction.rejectionReason || "Rejected by administrator"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
