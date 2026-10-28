import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Building2,
  Calendar,
  User,
  Hash,
  CreditCard,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Download,
} from "lucide-react";
import { resolveRechargeProofUrl, type WalletTransactionItem } from "@/lib/supabase/data";

interface PaymentProofModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: WalletTransactionItem | null;
  onApprove?: (tx: WalletTransactionItem) => Promise<void>;
  onReject?: (tx: WalletTransactionItem) => void;
  isProcessing?: boolean;
}

/** A stored proof is either an image or a PDF; the two render differently. */
function isPdf(source: string, storedValue: string) {
  return /\.pdf(\?|$)/i.test(storedValue) || /application\/pdf/i.test(source);
}

export function PaymentProofModal({
  open,
  onOpenChange,
  transaction,
  onApprove,
  onReject,
  isProcessing = false,
}: PaymentProofModalProps) {
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [proofSrc, setProofSrc] = useState<string | null>(null);
  const [proofState, setProofState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [proofError, setProofError] = useState<string | null>(null);

  const storedProof = transaction?.proofUrl || "";

  // The column holds an object path in a private bucket, which an <img> cannot
  // load on its own -- it has to be exchanged for a signed URL first. Rows
  // written before that change still carry an inline data URL, and those pass
  // through untouched.
  const loadProof = useCallback(async () => {
    if (!storedProof) {
      setProofSrc(null);
      setProofState("idle");
      return;
    }
    setProofState("loading");
    setProofError(null);
    try {
      const res = await resolveRechargeProofUrl(storedProof);
      setProofSrc(res.data);
      setProofState(res.data ? "ready" : "idle");
    } catch (err) {
      setProofSrc(null);
      setProofState("error");
      setProofError(err instanceof Error ? err.message : "Could not load the payment proof.");
    }
  }, [storedProof]);

  useEffect(() => {
    if (!open) return;
    loadProof();
  }, [open, loadProof]);

  if (!transaction) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const isPending = transaction.status === "PENDING";
  const isApproved = transaction.status === "COMPLETED";
  const showPdf = proofSrc ? isPdf(proofSrc, storedProof) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        {/* Header — fixed, never scrolls away */}
        <DialogHeader className="shrink-0 space-y-0 border-b bg-muted/20 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pr-10">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                Payment Proof Verification
              </DialogTitle>
              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                {transaction.id}
              </p>
            </div>
            <Badge
              variant={isApproved ? "default" : isPending ? "secondary" : "destructive"}
              className={`shrink-0 px-2.5 py-0.5 text-xs ${
                isApproved
                  ? "bg-emerald-600 text-white hover:bg-emerald-600"
                  : isPending
                  ? "border-amber-300 bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                  : "bg-rose-600 text-white hover:bg-rose-600"
              }`}
            >
              {isApproved ? "Approved" : isPending ? "Pending Approval" : "Rejected"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Body — the only scrolling region */}
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-12">
          {/* Proof viewer */}
          <div className="flex min-w-0 flex-col gap-3 lg:col-span-7">
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-lg border bg-muted/30 sm:min-h-[320px]">
              {proofState === "loading" && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-xs">Fetching payment proof…</p>
                </div>
              )}

              {proofState === "error" && (
                <div className="space-y-3 p-6 text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
                  <p className="text-sm font-medium text-foreground">Payment proof could not be loaded</p>
                  <p className="mx-auto max-w-[280px] break-words text-xs text-muted-foreground">
                    {proofError}
                  </p>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={loadProof}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                </div>
              )}

              {proofState === "idle" && (
                <div className="space-y-2 p-8 text-center text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">No document file attached</p>
                  <p className="mx-auto max-w-[260px] text-xs">
                    This transaction was submitted with reference UTR{" "}
                    <span className="font-mono font-medium">{transaction.reference}</span> without an
                    image attachment.
                  </p>
                </div>
              )}

              {proofState === "ready" && proofSrc && (
                showPdf ? (
                  <object data={proofSrc} type="application/pdf" className="h-[380px] w-full">
                    <div className="space-y-2 p-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        This browser cannot display the PDF inline.
                      </p>
                    </div>
                  </object>
                ) : (
                  <img
                    src={proofSrc}
                    alt={`Payment receipt for ${transaction.reference}`}
                    className="max-h-[420px] w-full object-contain"
                    onError={() => {
                      setProofState("error");
                      setProofError(
                        "The stored file could not be displayed. It may have been removed from storage.",
                      );
                    }}
                  />
                )
              )}
            </div>

            {/* Viewer actions sit below the frame rather than on hover, so they
                are reachable on touch and never overlap the document. */}
            {proofState === "ready" && proofSrc && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => window.open(proofSrc, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open full size
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href={proofSrc} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              </div>
            )}

            {transaction.remarks && (
              <div className="rounded border bg-muted/10 p-3 text-xs">
                <span className="font-medium text-muted-foreground">Submitter remarks:</span>{" "}
                <span className="text-foreground">{transaction.remarks}</span>
              </div>
            )}
          </div>

          {/* Transaction metadata */}
          <div className="min-w-0 space-y-4 lg:col-span-5">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recharge Amount
              </span>
              <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                ₹{transaction.amount.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="space-y-1 rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" /> UTR / Reference
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transaction.reference)}
                  className="flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
                >
                  {copiedUtr ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="break-all font-mono text-sm font-semibold tracking-wide text-foreground">
                {transaction.reference}
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-3 border-b py-1.5">
                <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" /> Branch / Institute
                </span>
                <div className="min-w-0 text-right">
                  <span className="block truncate font-medium text-foreground">
                    {transaction.branch}
                  </span>
                  {transaction.branchCode && (
                    <span className="block font-mono text-[11px] text-muted-foreground">
                      {transaction.branchCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-b py-1.5">
                <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" /> Payment Method
                </span>
                <Badge variant="outline" className="text-[11px] font-medium uppercase">
                  {transaction.paymentMethod}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3 border-b py-1.5">
                <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> Submitted By
                </span>
                <span className="truncate font-medium text-foreground">{transaction.submittedBy}</span>
              </div>

              <div className="flex items-center justify-between gap-3 border-b py-1.5">
                <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Submission Date
                </span>
                <span className="truncate font-medium text-foreground">
                  {transaction.formattedDateTime}
                </span>
              </div>

              {transaction.reviewedBy && (
                <div className="flex items-center justify-between gap-3 border-b py-1.5">
                  <span className="shrink-0 text-muted-foreground">Reviewed By</span>
                  <span className="truncate font-medium text-foreground">{transaction.reviewedBy}</span>
                </div>
              )}

              {transaction.rejectionReason && (
                <div className="rounded border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                  <span className="mb-0.5 block font-semibold">Rejection Reason:</span>
                  {transaction.rejectionReason}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer — full width, so the actions have room to sit side by side */}
        <div className="shrink-0 border-t bg-muted/20 px-5 py-3">
          {isPending && onApprove && onReject ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Approving credits ₹{transaction.amount.toLocaleString("en-IN")} to{" "}
                <span className="font-medium text-foreground">{transaction.branch}</span> immediately.
              </p>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-white sm:flex-none"
                  disabled={isProcessing}
                  onClick={() => onReject(transaction)}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1 whitespace-nowrap bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-none"
                  disabled={isProcessing}
                  onClick={() => onApprove(transaction)}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  )}
                  Approve &amp; Credit
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close proof viewer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
