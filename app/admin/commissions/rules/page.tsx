import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { CommissionRuleForm } from "@/features/referrals/components/commission-rule-form";
import { listCommissionRules } from "@/features/referrals/queries";

export const metadata: Metadata = {
  title: "Commission rules",
  robots: { index: false },
};

const EVENT_LABELS: Record<string, string> = {
  centre_approval: "Centre approval",
  student_admission: "Student admission",
  fee_payment: "Fee payment",
};

export default async function CommissionRulesPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Commission rules</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const rules = await listCommissionRules();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/commissions"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; Commissions
        </Link>
        <h1 className="text-page-title text-navy-900 mt-2">Commission rules</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New rule</CardTitle>
        </CardHeader>
        <CardContent>
          <CommissionRuleForm />
        </CardContent>
      </Card>

      {rules.length === 0 ? (
        <EmptyState
          title="No commission rules yet"
          description="Create one above."
        />
      ) : (
        <ul className="space-y-2">
          {rules.map((r) => (
            <li
              key={r.id}
              className="border-border bg-surface flex items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3"
            >
              <div>
                <p className="text-body text-text font-semibold">
                  {EVENT_LABELS[r.event] ?? r.event}
                </p>
                <p className="text-meta text-text-secondary">
                  {r.amountLabel} &middot; from {r.effectiveFrom}
                  {r.effectiveTo ? ` to ${r.effectiveTo}` : ""}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
