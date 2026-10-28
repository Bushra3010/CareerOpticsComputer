import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";

interface RejectReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  isProcessing?: boolean;
  count?: number;
  transactionReference?: string;
}

const COMMON_REASONS = [
  "Invalid UTR / Reference number",
  "Payment not credited to bank account",
  "Amount mismatch with bank receipt",
  "Duplicate recharge request",
  "Unreadable or blurred payment proof",
  "Bank transaction reversed / failed",
];

export function RejectReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing = false,
  count = 1,
  transactionReference,
}: RejectReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide or select a reason for rejection.");
      return;
    }
    setError(null);
    try {
      await onConfirm(trimmed);
      setReason("");
      onOpenChange(false);
    } catch {
      // Error handled by caller toast
    }
  };

  const handlePresetClick = (preset: string) => {
    setReason(preset);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isProcessing) {
          setError(null);
          setReason("");
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {count > 1 ? `Reject ${count} Recharge Requests` : "Reject Recharge Request"}
          </DialogTitle>
          <DialogDescription>
            {count > 1
              ? `Provide a reason to record in the audit log for rejecting ${count} selected recharges.`
              : transactionReference
              ? `Provide a rejection reason for transaction reference "${transactionReference}".`
              : "State the reason for rejecting this recharge request."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Quick Presets</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors text-left ${
                    reason === preset
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : "bg-muted/50 hover:bg-muted text-foreground border-border"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Explain why this recharge request cannot be approved..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              className="resize-none text-sm"
              disabled={isProcessing}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isProcessing || !reason.trim()}
            className="gap-2"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
