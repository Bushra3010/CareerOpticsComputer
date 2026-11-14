import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getRechargeUpi, submitRechargeRequest, uploadRechargeProof } from "@/lib/supabase/data";

/**
 * A centre tops up its wallet in three steps: the amount, paying it by
 * scanning the QR, then the UTR and a screenshot of the payment. The
 * request goes to the head office (Franchise -> Wallet Requests), and the
 * balance moves once they approve it.
 *
 * The QR pays the company's own UPI ID for the exact amount when the head
 * office has set one (Wallet Requests -> Payment account); until then it is
 * the company's Scan & Pay poster, where the centre types the amount.
 */

const ACCOUNT = {
  holder: "CAREER OPTICS EDUCATION SERVICE PVT LTD",
  number: "50200121129272",
  ifsc: "HDFC0001942",
  bank: "HDFC Bank, Arrah",
};
const SCAN_AND_PAY = "/image/gallery/scan-and-pay.webp";
const QUICK = [500, 1000, 2000, 5000];
const MAX_PROOF = 5 * 1024 * 1024;

export function SimpleRechargeDialog({
  open,
  onOpenChange,
  branchId,
  branchName,
  initialAmount,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string | null;
  branchName?: string;
  initialAmount?: string;
  onSubmitted?: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState<{ upiId: string; merchantName: string } | null>(null);
  const [qr, setQr] = useState("");
  const [utr, setUtr] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setAmount(initialAmount && Number(initialAmount) > 0 ? String(Number(initialAmount)) : "");
    setUtr("");
    setProof(null);
    setPreview("");
    getRechargeUpi(user?.organizationId ?? null)
      .then((r) => setUpi(r.data))
      .catch(() => setUpi(null));
  }, [open, initialAmount, user?.organizationId]);

  const value = Number(amount);

  useEffect(() => {
    if (step !== 2 || !upi?.upiId) return setQr("");
    const uri = `upi://pay?pa=${encodeURIComponent(upi.upiId)}&pn=${encodeURIComponent(upi.merchantName)}&am=${value}&cu=INR&tn=${encodeURIComponent(`Wallet ${branchName || ""}`.trim())}`;
    QRCode.toDataURL(uri, { width: 260, margin: 1, color: { dark: "#0b2350", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [step, upi, value, branchName]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const next = () => {
    if (!(value > 0) || !Number.isFinite(value)) return toast({ title: "Enter the amount", description: "Type how much you want to add, e.g. 2000.", variant: "destructive" });
    if (!Number.isInteger(value)) return toast({ title: "Enter a whole rupee amount", variant: "destructive" });
    setStep(2);
  };

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return toast({ title: "Upload a JPG, PNG or WebP screenshot", variant: "destructive" });
    if (f.size > MAX_PROOF) return toast({ title: "Screenshot is too large", description: "Keep it under 5 MB.", variant: "destructive" });
    if (preview) URL.revokeObjectURL(preview);
    setProof(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!branchId) return toast({ title: "Choose a branch first", variant: "destructive" });
    const ref = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9]{6,30}$/.test(ref)) return toast({ title: "Enter the UTR / transaction ID", description: "It is in your UPI app's payment details — usually a 12-digit number.", variant: "destructive" });
    if (!proof) return toast({ title: "Upload the payment screenshot", variant: "destructive" });
    setBusy(true);
    try {
      const uploaded = await uploadRechargeProof(branchId, proof);
      const res = await submitRechargeRequest({
        branchId,
        amount: value,
        paymentMethod: "UPI",
        reference: ref,
        proofUrl: uploaded.data,
        submittedBy: { id: user?.id, name: user?.name, email: user?.email },
        organizationId: user?.organizationId,
      });
      if (!res.success) throw new Error(res.error || "Could not send the request.");
      setStep(3);
      onSubmitted?.();
    } catch (e) {
      toast({ title: "Could not send the request", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const dot = (n: number) => (
    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${step >= n ? "bg-[#38c3be] text-white" : "bg-slate-200 text-slate-500"}`}>{n}</span>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recharge Wallet</DialogTitle>
          <DialogDescription>{branchName ? `${branchName} · ` : ""}Pay by QR, then send the UTR and screenshot for approval.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 text-[11.5px] font-semibold text-slate-500">
          {dot(1)}<span>Amount</span><span className="h-px w-5 bg-slate-300" />
          {dot(2)}<span>Pay &amp; upload</span><span className="h-px w-5 bg-slate-300" />
          {dot(3)}<span>Done</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-[13px] font-semibold text-slate-700">
              Amount to add (₹)
              <input
                autoFocus
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                onKeyDown={(e) => e.key === "Enter" && next()}
                placeholder="e.g. 2000"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-3 text-center text-2xl font-bold text-slate-800 outline-none focus:border-[#38c3be]"
              />
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => setAmount(String(q))} className={`rounded-md border py-2 text-[13px] font-semibold ${value === q ? "border-[#38c3be] bg-[#38c3be]/10 text-[#1f8f8b]" : "border-slate-300 text-slate-700 hover:border-[#38c3be]"}`}>
                  {inr(q)}
                </button>
              ))}
            </div>
            <button type="button" onClick={next} className="w-full rounded-md bg-[#2fb878] py-3 text-[15px] font-bold text-white shadow-sm hover:brightness-95">
              Add Payment{value > 0 ? ` · ${inr(value)}` : ""}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-3 text-center">
              <p className="text-[13px] font-semibold text-slate-700">Scan &amp; pay <span className="text-[#e45454]">{inr(value)}</span> with any UPI app</p>
              {qr ? (
                <img src={qr} alt={`UPI QR for ${inr(value)}`} className="mx-auto mt-2 h-52 w-52 rounded border bg-white p-1" />
              ) : (
                <img src={SCAN_AND_PAY} alt="Career Optics Scan & Pay QR" className="mx-auto mt-2 max-h-72 rounded border bg-white" />
              )}
              <p className="mt-2 text-[11.5px] text-slate-500">
                {qr ? "The amount is filled in for you." : `Enter ${inr(value)} yourself in the UPI app after scanning.`}
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
                Pays <b>{ACCOUNT.holder}</b> · {ACCOUNT.bank}<br />A/c {ACCOUNT.number} · IFSC {ACCOUNT.ifsc}
              </p>
            </div>

            <label className="block text-[13px] font-semibold text-slate-700">
              UTR / Transaction ID <span className="text-[#e45454]">*</span>
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value.toUpperCase())}
                placeholder="12-digit UTR from your UPI app"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 font-mono text-[14px] outline-none focus:border-[#38c3be]"
              />
            </label>

            <div>
              <p className="text-[13px] font-semibold text-slate-700">Payment screenshot <span className="text-[#e45454]">*</span></p>
              <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
              {preview ? (
                <div className="relative mt-1.5 inline-block">
                  <img src={preview} alt="Payment screenshot" className="max-h-44 rounded border" />
                  <button type="button" aria-label="Remove screenshot" onClick={() => { setProof(null); setPreview(""); }} className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => file.current?.click()} className="mt-1.5 flex w-full flex-col items-center gap-1 rounded-md border-2 border-dashed border-slate-300 py-5 text-[13px] text-slate-500 hover:border-[#38c3be]">
                  <ImagePlus className="h-6 w-6" /> Upload screenshot
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} disabled={busy} className="rounded-md border border-slate-300 px-4 py-3 text-[14px] font-semibold text-slate-700">Back</button>
              <button type="button" onClick={() => void submit()} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#2fb878] py-3 text-[15px] font-bold text-white shadow-sm hover:brightness-95 disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit for verification
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 py-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#2fb878]" />
            <p className="text-[17px] font-bold text-slate-800">{inr(value)} sent for verification</p>
            <p className="text-[13px] text-slate-600">The head office will check your payment. Your balance updates as soon as they approve it — you can see the request as PENDING in your wallet history.</p>
            <button type="button" onClick={() => onOpenChange(false)} className="mt-2 w-full rounded-md bg-[#38c3be] py-3 text-[15px] font-bold text-white">Done</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
