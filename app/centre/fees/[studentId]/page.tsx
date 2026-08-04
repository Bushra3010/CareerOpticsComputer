import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/db/server";
import { formatPaise } from "@/lib/money";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getStudentFeeDetail } from "@/features/fees/queries";
import { FeePlanForm } from "@/features/fees/components/fee-plan-form";
import { CollectPaymentForm } from "@/features/fees/components/collect-payment-form";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentFeesPage({ params }: PageProps) {
  const { studentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) {
    redirect("/centre");
  }

  const detail = await getStudentFeeDetail(context.centreId, studentId);
  if (!detail) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/centre/fees"
        className="text-body font-semibold text-blue-700"
      >
        ← All fees
      </Link>

      <h1 className="text-page-title text-navy-900 mt-4">
        {detail.studentName}
      </h1>
      <p className="text-body text-text-secondary mt-1">
        {detail.registrationNumber}
      </p>

      {detail.feePlanId ? (
        <>
          <div className="mt-6 flex flex-wrap gap-8">
            <div>
              <p className="text-meta text-text-secondary uppercase">Total</p>
              <p className="text-card-title text-navy-900 mt-1 tabular-nums">
                {formatPaise(detail.totalPaise)}
              </p>
            </div>
            <div>
              <p className="text-meta text-text-secondary uppercase">Paid</p>
              <p className="text-card-title text-navy-900 mt-1 tabular-nums">
                {formatPaise(detail.paidPaise)}
              </p>
            </div>
            <div>
              <p className="text-meta text-text-secondary uppercase">Due</p>
              <p className="text-card-title text-navy-900 mt-1 tabular-nums">
                {formatPaise(detail.duePaise)}
              </p>
            </div>
          </div>

          <h2 className="text-section text-navy-900 mt-8">Instalments</h2>
          <div className="border-border mt-3 overflow-x-auto rounded-[var(--radius-card)] border">
            <table className="w-full text-left">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="text-label px-4 py-3">#</th>
                  <th className="text-label px-4 py-3">Due date</th>
                  <th className="text-label px-4 py-3 text-right">Amount</th>
                  <th className="text-label px-4 py-3 text-right">Paid</th>
                  <th className="text-label px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.instalments.map((instalment) => (
                  <tr key={instalment.id} className="border-border border-t">
                    <td className="text-body px-4 py-3">
                      {instalment.sequence}
                    </td>
                    <td className="text-body px-4 py-3">
                      {instalment.dueDate}
                    </td>
                    <td className="text-body px-4 py-3 text-right tabular-nums">
                      {formatPaise(instalment.amountPaise)}
                    </td>
                    <td className="text-body px-4 py-3 text-right tabular-nums">
                      {formatPaise(instalment.allocatedPaise)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={instalment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-section text-navy-900 mt-8">Collect a payment</h2>
          <div className="mt-3 max-w-3xl">
            <CollectPaymentForm
              feePlanId={detail.feePlanId}
              studentId={detail.studentId}
            />
          </div>

          <h2 className="text-section text-navy-900 mt-8">Receipts</h2>
          {detail.payments.length === 0 ? (
            <p className="text-body text-text-secondary mt-2">
              No payments posted yet.
            </p>
          ) : (
            <div className="border-border mt-3 overflow-x-auto rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th className="text-label px-4 py-3">Receipt no.</th>
                    <th className="text-label px-4 py-3">Method</th>
                    <th className="text-label px-4 py-3"></th>
                    <th className="text-label px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.payments.map((payment) => (
                    <tr key={payment.id} className="border-border border-t">
                      <td className="text-body px-4 py-3 font-semibold">
                        {payment.receiptNumber}
                      </td>
                      <td className="text-body px-4 py-3">{payment.method}</td>
                      <td className="text-body px-4 py-3 text-right tabular-nums">
                        {formatPaise(payment.amountPaise)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/centre/fees/receipt/${payment.id}`}
                          className="text-meta font-semibold text-blue-700"
                        >
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : detail.enrolmentId ? (
        <>
          <h2 className="text-section text-navy-900 mt-8">Create a fee plan</h2>
          <p className="text-body text-text-secondary mt-1">
            This student has no fee plan yet.
          </p>
          <div className="mt-4 max-w-3xl">
            <FeePlanForm
              enrolmentId={detail.enrolmentId}
              studentId={detail.studentId}
            />
          </div>
        </>
      ) : (
        <p className="text-body text-text-secondary mt-6">
          This student has no active enrolment, so a fee plan cannot be created
          yet.
        </p>
      )}
    </div>
  );
}
