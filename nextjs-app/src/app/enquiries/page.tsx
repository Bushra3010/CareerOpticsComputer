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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  course_interest?: string;
  source: string;
  status: string;
  created_at: string;
}

const columns: Column<Enquiry>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "phone", header: "Phone", cell: (e) => <a href={`tel:${e.phone}`} className="text-primary hover:underline">{e.phone}</a> },
  { key: "email", header: "Email", cell: (e) => e.email || "—" },
  { key: "course_interest", header: "Interested In" },
  { key: "source", header: "Source" },
  { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status === "NEW" ? "pending" : e.status === "CONTACTED" ? "active" : e.status === "CONVERTED" ? "active" : "inactive"} /> },
  { key: "created_at", header: "Date", cell: (e) => new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
];

export default function EnquiriesPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Enquiry | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
      if (data) setEnquiries(data as Enquiry[]);
    } catch {
      toast({ title: "Could not load enquiries", variant: "destructive" });
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
        const result = await supabase.from("enquiries").update({
          name: editing.name,
          phone: editing.phone,
          email: editing.email,
          course_interest: editing.course_interest,
          source: editing.source,
          status: editing.status,
        }).eq("id", editing.id);
        error = result.error;
      } else {
        const result = await (supabase.from("enquiries") as any).insert({
          name: editing.name,
          phone: editing.phone,
          email: editing.email,
          course_interest: editing.course_interest,
          source: editing.source,
          status: editing.status,
        });
        error = result.error;
      }
      if (error) throw error;
      toast({ title: editing.id ? "Enquiry updated" : "Enquiry created" });
      setEditing(null);
      void load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Reception Enquiries"
        description="Manage student enquiries and follow-ups"
        breadcrumbs={[
          { label: "Reception", href: "/enquiries" },
          { label: "All Enquiries" },
        ]}
        actions={
          <Button className="gap-2" onClick={() => setEditing({ id: "", name: "", phone: "", source: "WALK_IN", status: "NEW", created_at: "" })}>
            <Plus className="h-4 w-4" />Add Enquiry
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <DataTable data={enquiries} columns={columns} selectable searchPlaceholder="Search enquiries..." actions={(enquiry) => [
          { label: "Edit", onClick: () => setEditing({ ...enquiry }) },
        ]} />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Enquiry" : "New Enquiry"}</DialogTitle>
            <DialogDescription>Record a new enquiry.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="enquiry-name">Full Name</Label>
                <Input id="enquiry-name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enquiry-phone">Phone</Label>
                <Input id="enquiry-phone" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enquiry-email">Email</Label>
                <Input id="enquiry-email" value={editing.email || ""} onChange={e => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="enquiry-interest">Course Interest</Label>
                <Input id="enquiry-interest" value={editing.course_interest || ""} onChange={e => setEditing({ ...editing, course_interest: e.target.value })} />
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
