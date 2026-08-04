import "server-only";

import QRCode from "qrcode";

/**
 * QR as an inline SVG string, generated on the server.
 *
 * Inline rather than an <img src>: a printed certificate must render its own
 * QR with no network fetch, and an inline SVG stays sharp at any print DPI
 * where a raster would not. Keeping the library server-side also keeps it out
 * of the client bundle entirely.
 *
 * Error correction is deliberately 'M' rather than the default: a certificate
 * gets folded, stamped and photocopied, and M tolerates ~15% damage while
 * staying small enough to scan from a phone at arm's length.
 */
export async function qrSvg(text: string, size = 128): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    width: size,
  });
}

/** The public verification URL a certificate's QR should resolve to. */
export function verificationUrl(documentNumber: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/verify/c/${encodeURIComponent(documentNumber)}`;
}
