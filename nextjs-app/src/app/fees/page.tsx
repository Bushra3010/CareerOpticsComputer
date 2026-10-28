"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface FeeInvoice {
  id: string;
  invoice_no: string;
  description: string;
  amount: number;
  due_date: string;
  status: "DUE" | "PAID" | "OVERDUE";
  student: { id: string; first_name: string; last_name: string; enrollment_no: string };
  payments: { amount: number; paid_at: string }[];
}

const columns: Column<FeeInvoice>[] = [
  { key: "invoice_no", header: "Invoice", cell: (f) => <span className="font-mono text-xs">{f.invoice_no}</span> },
  { key: "description", header: "Description" },
  { key: "student", header: "Student", cell: (f) => `${f.student.first_name} ${f.student.last_name}` },
  { key: "amount", header: "Amount", cell: (f) => `₹${f.amount.toLocaleString()}` },
  { key: "due_date", header: "Due Date", cell: (f) => new Date(f.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
  { key: "status", header: "Status", cell: (f) => <StatusBadge status={f.status === "PAID" ? "active" : f.status === "OVERDUE" ? "inactive" : "pending"} /> },
];

export default function FeesPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FeeInvoice | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("fee_invoices").select("*, student:profiles(first_name, last_name, enrollment_no), payments(*)").order("created_at", { ascending: false });
      if (data) setInvoices(data as FeeInvoice[]);
    } catch {
      toast({ title: "Could not load invoices", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [supabase]);

  const save = async () => {
    if (!editing) return;
    try {
      let error;
      if (editing.id) {
        const result = await supabase.from("fee_invoices").update({
          description: editing.description,
          amount: editing.amount,
          due_date: editing.due_date,
          student_id: editing.student.id,
        }).eq("id", editing.id);
        error = result.error;
      } else {
        const result = await (supabase.from("fee_invoices") as any).insert({
          description: editing.description,
          amount: editing.amount,
          due_date: editing.due_date,
          student_id: editing.student.id,
          invoice_no: `INV-${Date.now()}`,
          status: "DUE",
        });
        error = result.error;
      }
      if (error) throw error;
      toast({ title: editing.id ? "Invoice updated" : "Invoice created" });
      setEditing(null);
      void load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const exportCsv = () => {
    const csv = ["Invoice No,Description,Student,Amount,Due Date,Status", ...invoices.map(i => [i.invoice_no, i.description, `${i.student.first_name} ${i.student.last_name}`, i.amount, i.due_date, i.status].map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "careeroptics-fee-invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Fee Management"
        description="Track payments and outstanding balances"
        breadcrumbs={[
          { label: "Fees", href: "/fees" },
          { label: "Fee Management" },
        ]}
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={exportCsv}><Download className="h-4 w-4" />Export</Button>
            <Button className="gap-2" onClick={() => setEditing({ id: "", invoice_no: "", description: "", amount: 0, due_date: "", status: "DUE", student: { id: "", first_name: "", last_name: "", enrollment_no: "" }, payments: [] })}>
              <Plus className="h-4 w-4" />New Invoice
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <DataTable data={invoices} columns={columns} selectable searchPlaceholder="Search invoices..." actions={(invoice) => [
          { label: "Record Payment", onClick: () => alert(`Payment page for ${invoice.invoice_no}`) },
        ]} />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
            <DialogDescription>Create a new fee invoice.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-desc">Description</Label>
                <Input id="invoice-desc" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-amount">Amount (₹)</Label>
                  <Input id="invoice-amount" type="number" value={editing.amount} onChange={e => setEditing({ ...editing, amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-due">Due Date</Label>
                  <Input id="invoice-due" type="date" value={editing.due_date} onChange={e => setEditing({ ...editing, due_date: e.target.value })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
