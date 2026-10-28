import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Wallet,
  CreditCard,
  Building2,
  UploadCloud,
  Check,
  Copy,
  X,
  Loader2,
  ArrowRight,
  Info,
  QrCode,
} from "lucide-react";
import QRCode from "qrcode";
import {
  getRechargeUpi,
  submitRechargeRequest,
  uploadRechargeProof,
  type WalletTransactionItem,
} from "@/lib/supabase/data";

interface Institute {
  id: string;
  name: string;
  directorName: string;
  balance: number;
}

interface RechargeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutes: Institute[];
  onSuccess: (newTx: WalletTransactionItem) => void;
  user: any;
  /**
   * The branch a top-up must be filed against, for a login that has one.
   * Passing it replaces the search box with that branch, fixed.
   *
   * A branch account may only write rows for its own branch -- the policy on
   * branch_transactions checks `branchId = jwt_branch_id()` -- so offering it a
   * list of every branch in the organisation was offering choices the database
   * refuses. Picking any branch but its own failed on submit with "new row
   * violates row-level security policy for table branch_transactions", after
   * the whole form had been filled in.
   *
   * Left null for an administrator, who really can top up any branch.
   */
  fixedInstituteId?: string | null;
}

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Wallet },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
];

/**
 * Where a branch is told to pay. The UPI half is the organisation's own, set
 * under Wallet Recharge -> Payment account and read from `organizations`; these
 * are only what is shown until an administrator has set it.
 */
const ORG_BANK_DETAILS = {
  bankName: "ICICI Bank",
  accountNo: "109283746512",
  ifsc: "ICIC0001092",
  beneficiary: "Career Optics Computer Centre",
  upiVpa: "careeroptics@icici",
  upiName: "Career Optics ERP",
};

export function RechargeDrawer({
  open,
  onOpenChange,
  institutes,
  onSuccess,
  user,
  fixedInstituteId = null,
}: RechargeDrawerProps) {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  // The file itself is what gets uploaded; the data URL is only a local
  // thumbnail. Storing the data URL in the row is what left proofs unreadable.
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  /** The organisation's own UPI account, once it has been set. */
  const [upi, setUpi] = useState({
    upiId: ORG_BANK_DETAILS.upiVpa,
    merchantName: ORG_BANK_DETAILS.upiName,
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Filter institutes based on query
  const filteredInstitutes = searchQuery
    ? institutes.filter(
        (inst) =>
          inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.directorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // A branch login files against its own branch and no other, so the rest of
  // the form reads `institute` rather than the picker's state. It is null only
  // while an administrator has yet to choose, or when a branch's own row is
  // missing from the list -- both cases the form has to refuse to submit.
  const fixedInstitute = fixedInstituteId
    ? institutes.find((inst) => inst.id === fixedInstituteId) ?? null
    : null;
  const institute = fixedInstituteId ? fixedInstitute : selectedInstitute;

  // Whose account the branch is paying into. Read when the drawer opens, so an
  // administrator changing it does not need everyone to reload the page.
  useEffect(() => {
    if (!open) return;
    let live = true;
    getRechargeUpi(user?.organizationId ?? null)
      .then((result) => {
        if (live && result.data) setUpi(result.data);
      })
      .catch(() => {
        /* Leave the fallback showing rather than an empty payment panel. */
      });
    return () => {
      live = false;
    };
  }, [open, user?.organizationId]);

  // Generate dynamic QR code for UPI
  useEffect(() => {
    if (method === "upi") {
      const numericAmount = Number(amount) || 0;
      const upiUrl =
        `upi://pay?pa=${encodeURIComponent(upi.upiId)}` +
        `&pn=${encodeURIComponent(upi.merchantName)}&am=${numericAmount}&cu=INR`;
      QRCode.toDataURL(upiUrl, {
        width: 140,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(""));
    }
  }, [method, amount, upi]);

  const copyToClipboard = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Payment proof must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setProofFileName(file.name);
    setProofFile(file);

    // A PDF has nothing to show in an <img>, so only images get a thumbnail.
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const resetForm = () => {
    setSelectedInstitute(null);
    setSearchQuery("");
    setAmount("");
    setMethod("upi");
    setReference("");
    setRemarks("");
    setProofFile(null);
    setProofPreview(null);
    setProofFileName(null);
  };

  const handleSubmit = async () => {
    if (!institute) {
      toast({
        title: fixedInstituteId ? "Your branch could not be found" : "Select an Institute / Branch",
        description: fixedInstituteId
          ? "Reload the page, and tell the organisation office if it keeps happening."
          : "Please choose which branch wallet to top up.",
        variant: "destructive",
      });
      return;
    }

    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Enter a recharge amount greater than ₹0.",
        variant: "destructive",
      });
      return;
    }

    const trimmedRef = reference.trim();
    if (!trimmedRef) {
      toast({
        title: "UTR / Reference Required",
        description: "Please enter the transaction reference or UTR number.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const pmEnum =
        method === "upi"
          ? "UPI"
          : method === "card"
          ? "CARD"
          : "NET_BANKING";

      // Upload first: the row should carry the object path, and a failed upload
      // should stop the request rather than file one whose proof cannot be read.
      let proofPath: string | null = null;
      if (proofFile) {
        try {
          const upload = await uploadRechargeProof(institute.id, proofFile);
          proofPath = upload.data;
        } catch (uploadErr) {
          toast({
            title: "Payment proof could not be uploaded",
            description:
              uploadErr instanceof Error ? uploadErr.message : "Storage rejected the file.",
            variant: "destructive",
          });
          return;
        }
      }

      const res = await submitRechargeRequest({
        branchId: institute.id,
        amount: val,
        paymentMethod: pmEnum,
        reference: trimmedRef,
        proofUrl: proofPath,
        remarks: remarks || undefined,
        submittedBy: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        },
        organizationId: user?.organizationId,
      });

      if (res.success && res.data) {
        toast({
          title: "Recharge Request Submitted",
          description: `₹${val.toLocaleString("en-IN")} submitted for ${institute.name}. Awaiting approval.`,
        });
        onSuccess(res.data);
        resetForm();
        onOpenChange(false);
      } else {
        toast({
          title: "Submission Failed",
          description: res.error || "Could not submit recharge request.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!submitting) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
    >
      <SheetContent side="right" className="sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="h-5 w-5" />
            <SheetTitle className="text-base font-semibold">
              New Wallet Recharge Request
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Initiate a top-up request with UTR verification and payment proof.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Step 1: Branch Search */}
          <div className="space-y-2">
            <Label htmlFor="branchSearch" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1. Institute / Branch <span className="text-destructive">*</span>
            </Label>
            {/* An administrator picks; a branch is told, since it may only file
                against its own. */}
            {!fixedInstituteId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="branchSearch"
                  placeholder="Type branch name or code..."
                  className="pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={submitting}
                />
              </div>
            )}

            {fixedInstituteId && !fixedInstitute && (
              <p className="text-xs text-destructive">
                Your branch is not in the list of active branches, so a top-up cannot be filed.
                Reload the page, and tell the organisation office if it keeps happening.
              </p>
            )}

            {/* Dropdown search results */}
            {!fixedInstituteId && searchQuery && filteredInstitutes.length > 0 && !selectedInstitute && (
              <div className="border rounded-md max-h-48 overflow-auto bg-background shadow-md divide-y">
                {filteredInstitutes.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-2.5 hover:bg-muted/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    onClick={() => {
                      setSelectedInstitute(inst);
                      setSearchQuery(inst.name);
                    }}
                  >
                    <div>
                      <span className="font-semibold text-foreground">{inst.name}</span>
                      <span className="text-muted-foreground block text-[11px]">
                        Code: {inst.directorName}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                      ₹{inst.balance.toLocaleString("en-IN")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Branch Snapshot */}
            {institute && (
              <div className="p-3 rounded-lg border bg-muted/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {institute.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Code: {institute.directorName}
                    {fixedInstituteId && " · your branch"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                    Current Balance
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{institute.balance.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Recharge Amount */}
          <div className="space-y-2">
            <Label htmlFor="rechargeAmount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              2. Recharge Amount (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="rechargeAmount"
                type="number"
                placeholder="Enter amount (e.g. 25000)"
                className="pl-8 font-mono text-base font-semibold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                    Number(amount) === val
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-background hover:bg-muted text-muted-foreground border-border"
                  }`}
                >
                  ₹{val.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Method Segmented Selector */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3. Payment Method <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-lg border">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id as any)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                    method === id
                      ? "bg-background text-foreground shadow-sm font-semibold border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Conditional Method Details */}
            {method === "upi" && (
              <div className="p-3.5 rounded-lg border bg-muted/20 space-y-3">
                <div className="flex items-center gap-3">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="UPI QR Code"
                      className="w-24 h-24 rounded border bg-white p-1 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded border bg-white flex items-center justify-center text-muted-foreground">
                      <QrCode className="h-8 w-8" />
                    </div>
                  )}
                  <div className="space-y-1.5 flex-1 text-xs">
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Pay via UPI App (GPay, PhonePe, Paytm)
                    </span>
                    <div className="flex items-center justify-between p-2 rounded bg-background border">
                      <span className="font-mono text-xs font-semibold text-foreground select-all">
                        {upi.upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("vpa", upi.upiId)}
                        className="text-xs text-primary hover:underline flex items-center gap-1 ml-2"
                      >
                        {copiedField === "vpa" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Scan QR or transfer, then enter the 12-digit UTR below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {method === "netbanking" && (
              <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2 text-xs">
                <span className="font-semibold text-foreground block">
                  Institutional Bank Account
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-background border">
                    <span className="text-muted-foreground block text-[10px]">Bank</span>
                    <span className="font-medium text-foreground">{ORG_BANK_DETAILS.bankName}</span>
                  </div>
                  <div className="p-2 rounded bg-background border">
                    <span className="text-muted-foreground block text-[10px]">Beneficiary</span>
                    <span className="font-medium text-foreground truncate block">
                      {ORG_BANK_DETAILS.beneficiary}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-background border flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Account No</span>
                      <span className="font-mono font-medium">{ORG_BANK_DETAILS.accountNo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("acc", ORG_BANK_DETAILS.accountNo)}
                      className="text-primary hover:underline"
                    >
                      {copiedField === "acc" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <div className="p-2 rounded bg-background border flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">IFSC Code</span>
                      <span className="font-mono font-medium">{ORG_BANK_DETAILS.ifsc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("ifsc", ORG_BANK_DETAILS.ifsc)}
                      className="text-primary hover:underline"
                    >
                      {copiedField === "ifsc" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {method === "card" && (
              <div className="p-3 rounded-lg border bg-muted/20 text-xs flex items-start gap-2 text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>
                  For card / POS swipe transactions, please enter the terminal Authorization Code or Transaction Reference in the field below.
                </span>
              </div>
            )}
          </div>

          {/* Step 4: Reference / UTR Number */}
          <div className="space-y-2">
            <Label htmlFor="txnReference" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              4. UTR / Transaction Reference No. <span className="text-destructive">*</span>
            </Label>
            <Input
              id="txnReference"
              placeholder="e.g. 329104829102 or TXN-REF"
              className="font-mono text-sm tracking-wider"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={submitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Duplicate reference detection is active. Every recharge must carry a unique UTR.
            </p>
          </div>

          {/* Step 5: Payment Proof Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              5. Payment Proof / Receipt (Optional)
            </Label>

            {proofFile ? (
              <div className="relative rounded-lg border p-2 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  {proofPreview ? (
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      className="w-12 h-12 object-cover rounded border bg-background"
                    />
                  ) : (
                    <span className="grid w-12 h-12 shrink-0 place-items-center rounded border bg-background text-muted-foreground">
                      <UploadCloud className="h-5 w-5" />
                    </span>
                  )}
                  <div className="overflow-hidden">
                    <span className="text-xs font-medium text-foreground block truncate max-w-[200px]">
                      {proofFileName || "Payment receipt image"}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      ✓ Ready to attach
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setProofFile(null);
                    setProofPreview(null);
                    setProofFileName(null);
                  }}
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/40 transition-colors border-border/70">
                <UploadCloud className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs font-medium text-foreground">
                  Upload screenshot or PDF receipt
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  PNG, JPG or PDF up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
              </label>
            )}
          </div>

          {/* Step 6: Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              6. Remarks / Note (Optional)
            </Label>
            <Input
              id="remarks"
              placeholder="e.g. Monthly top-up for exam fee settlement"
              className="text-xs"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !institute ||
              !amount ||
              Number(amount) <= 0 ||
              !reference.trim()
            }
            className="gap-2 bg-primary font-medium"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating & Submitting...
              </>
            ) : (
              <>
                <span>Submit Recharge</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
