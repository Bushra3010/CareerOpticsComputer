import { useEffect, useState } from "react";
import { QrCode, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getRechargeUpi, setRechargeUpi } from "@/lib/supabase/data";
import { qrDataUrl, upiUri } from "@/lib/upi";

/**
 * The account every branch is told to pay into when it tops its wallet up.
 *
 * It used to be a constant in the recharge drawer -- one institute's UPI ID,
 * written into the code -- so a branch on any other installation was shown an
 * address that was not theirs. It lives on the organisation row now, and this
 * is where an administrator sets it.
 */

/** `name@bank`: the handle is letters, the address is what the bank issued. */
const VPA = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z][a-zA-Z0-9.\-_]{1,63}$/;

export function RechargeUpiDialog({
  open,
  onOpenChange,
  organizationId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | null;
  onSaved?: (upi: { upiId: string; merchantName: string }) => void;
}) {
  const { toast } = useToast();
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setLoading(true);
    getRechargeUpi(organizationId)
      .then((result) => {
        if (!live) return;
        setUpiId(result.data?.upiId ?? "");
        setMerchantName(result.data?.merchantName ?? "");
      })
      .catch((error: unknown) => {
        toast({
          title: "Could not read the payment account",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [open, organizationId, toast]);

  // The QR is what a branch actually scans, so it is shown while it is typed --
  // a wrong handle is far easier to catch here than after the first payment.
  useEffect(() => {
    if (!VPA.test(upiId.trim())) {
      setPreview("");
      return;
    }
    let live = true;
    qrDataUrl(
      upiUri({ upiId: upiId.trim(), merchantName: merchantName.trim() || "Recharge" }),
      200,
    )
      .then((image) => live && setPreview(image))
      .catch(() => live && setPreview(""));
    return () => {
      live = false;
    };
  }, [upiId, merchantName]);

  const save = async () => {
    const id = upiId.trim();
    if (!VPA.test(id)) {
      toast({
        title: "Check the UPI ID",
        description: "It reads like name@bank — for example careeroptics@icici.",
        variant: "destructive",
      });
      return;
    }
    if (!organizationId) {
      toast({ title: "No organisation assigned", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await setRechargeUpi(organizationId, id, merchantName.trim());
      onSaved?.({ upiId: id, merchantName: merchantName.trim() });
      toast({
        title: "Payment account saved",
        description: `Branches will be shown ${id} on every recharge from now on.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Could not save the payment account",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Recharge payment account
          </DialogTitle>
          <DialogDescription>
            The UPI account branches pay into when they top up their wallet. One per
            organisation — the QR and the ID on the recharge form are built from it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recharge-upi-id">UPI ID *</Label>
            <Input
              id="recharge-upi-id"
              className="font-mono"
              placeholder="careeroptics@icici"
              value={upiId}
              disabled={loading}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recharge-upi-name">Account name</Label>
            <Input
              id="recharge-upi-name"
              placeholder="Career Optics Computer Academy"
              value={merchantName}
              disabled={loading}
              onChange={(e) => setMerchantName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown in the payer's UPI app as who they are paying.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
            {preview ? (
              <img
                src={preview}
                alt="Recharge UPI QR code"
                className="h-24 w-24 rounded border bg-white p-1"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded border bg-background text-muted-foreground">
                <QrCode className="h-7 w-7" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {preview
                ? "This is the QR a branch scans. Check it in your own UPI app before saving."
                : "Enter a valid UPI ID to see the QR branches will scan."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gap-2" onClick={save} disabled={saving || loading}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
