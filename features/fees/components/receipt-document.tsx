import { LogoLockup } from "@/components/brand/logo";
import { PrintButton } from "@/features/certificates/components/print-button";
import type { PrintableReceipt } from "@/features/fees/queries";
import { formatPaise } from "@/lib/money";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  card: "Card",
  wallet: "Wallet",
};

/**
 * The printed fee receipt, shared by the centre and student routes.
 */
export function ReceiptDocument({ receipt }: { receipt: PrintableReceipt }) {
  return (
    <div className="mx-auto max-w-[210mm] py-8">
      <div data-print="hide" className="mb-6 flex flex-wrap items-center gap-3">
        <PrintButton label="Print receipt" />
        <p className="text-meta text-text-secondary">
          Prints to A4. A payment is never edited — a correction is a separate
          entry.
        </p>
      </div>

      <article
        data-print="sheet"
        className="border-border bg-surface border px-10 py-8"
      >
        <div className="border-border flex items-start justify-between gap-6 border-b pb-6">
          <LogoLockup size="sm" surface="light" />
          <div className="text-right">
            <p className="text-meta text-text-secondary uppercase">Receipt</p>
            <p className="text-card-title text-navy-900">
              {receipt.receiptNumber}
            </p>
            <p className="text-meta text-text-secondary mt-1">
              {receipt.postedOn}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-meta text-text-secondary uppercase">
              Received from
            </dt>
            <dd className="text-body text-text mt-1">{receipt.studentName}</dd>
            <dd className="text-meta text-text-secondary">
              {receipt.registrationNumber}
            </dd>
          </div>
          <div>
            <dt className="text-meta text-text-secondary uppercase">Centre</dt>
            <dd className="text-body text-text mt-1">{receipt.centreName}</dd>
            {receipt.courseName ? (
              <dd className="text-meta text-text-secondary">
                {receipt.courseName}
              </dd>
            ) : null}
          </div>
        </dl>

        <table className="mt-8 w-full text-left">
          <caption className="sr-only">Payment received and balance</caption>
          <tbody>
            <tr className="border-border border-t">
              <th
                scope="row"
                className="text-body text-text px-0 py-3 font-normal"
              >
                Amount received
                <span className="text-meta text-text-secondary block">
                  {METHOD_LABELS[receipt.method] ?? receipt.method}
                  {receipt.reference ? ` · ${receipt.reference}` : ""}
                </span>
              </th>
              <td className="text-card-title text-navy-900 px-0 py-3 text-right tabular-nums">
                {formatPaise(receipt.amountPaise)}
              </td>
            </tr>
            <tr className="border-border border-t">
              <th
                scope="row"
                className="text-body text-text-secondary px-0 py-2 font-normal"
              >
                Course fee
              </th>
              <td className="text-body text-text px-0 py-2 text-right tabular-nums">
                {formatPaise(receipt.totalPaise)}
              </td>
            </tr>
            <tr>
              <th
                scope="row"
                className="text-body text-text-secondary px-0 py-2 font-normal"
              >
                Paid to date
              </th>
              <td className="text-body text-text px-0 py-2 text-right tabular-nums">
                {formatPaise(receipt.paidPaise)}
              </td>
            </tr>
            <tr className="border-border border-t">
              <th
                scope="row"
                className="text-body text-navy-900 px-0 py-3 font-semibold"
              >
                Balance due
              </th>
              <td className="text-card-title text-navy-900 px-0 py-3 text-right tabular-nums">
                {formatPaise(receipt.duePaise)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-meta text-text-secondary mt-8">
          This is a computer-generated receipt and is valid without a signature.
        </p>
      </article>
    </div>
  );
}
