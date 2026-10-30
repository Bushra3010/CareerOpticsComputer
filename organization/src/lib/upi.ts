import QRCode from "qrcode";

export type UpiParams = {
  /** UPI ID / VPA, e.g. school@upi */
  upiId: string;
  merchantName: string;
  /** Omit or 0 for a dynamic QR the payer types an amount into. */
  amount?: number | string;
  note?: string;
};

/** Build a BHIM-UPI deep link; this is what the QR image actually encodes. */
export function upiUri({ upiId, merchantName, amount, note }: UpiParams) {
  const params = new URLSearchParams({ pa: upiId, pn: merchantName, cu: "INR" });
  const value = Number(amount ?? 0);
  if (value > 0) params.set("am", value.toFixed(2));
  if (note) params.set("tn", note);
  return `upi://pay?${params.toString()}`;
}

/** PNG data URL for the payload, safe to drop straight into an <img src>. */
export function qrDataUrl(payload: string, width = 320) {
  return QRCode.toDataURL(payload, { width, margin: 1, errorCorrectionLevel: "M" });
}
