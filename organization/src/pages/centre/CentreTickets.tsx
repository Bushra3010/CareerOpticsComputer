import { useCallback, useEffect, useRef, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceBadge,
  DceButton,
  DceField,
  DceGrid,
  DceInput,
  DceLinkButton,
  DcePanel,
  DceSelect,
  DceTable,
  DceTextarea,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  HELPLINE,
  TICKET_STATUSES,
  TICKET_TOPICS,
  createSupportTicket,
  listSupportTickets,
  resizeImage,
  updateSupportTicket,
  useBranchOptions,
  type SupportTicket,
  type TicketStatus,
} from "@/lib/supabase/centrePanel";

const TOPICS = Object.keys(TICKET_TOPICS);
const blank = () => ({ category: TOPICS[0], subcategory: TICKET_TOPICS[TOPICS[0]][0], subject: "", content: "", branchId: "" });

/** One ticket opened: what the centre wrote and what the head office answered. */
function TicketThread({ ticket, isAdmin, onSaved }: { ticket: SupportTicket; isAdmin: boolean; onSaved: (t: SupportTicket) => void }) {
  const { toast } = useToast();
  const [reply, setReply] = useState(ticket.reply || "");
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [saving, setSaving] = useState(false);

  const save = async (patch: { reply?: string | null; status?: TicketStatus }) => {
    setSaving(true);
    try {
      const saved = await updateSupportTicket(ticket.id, patch);
      onSaved({ ...ticket, ...saved });
      toast({ title: "Ticket updated" });
    } catch (error) {
      toast({ title: "Could not update the ticket", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded border border-slate-200 bg-slate-50 p-4 text-[13px]">
      <div>
        <p className="font-bold text-slate-800">{ticket.subject}</p>
        <p className="text-slate-500">
          {ticket.category}
          {ticket.subcategory ? ` › ${ticket.subcategory}` : ""} · {shortDate(ticket.createdAt)}
        </p>
      </div>
      {ticket.content && <p className="whitespace-pre-wrap text-slate-700">{ticket.content}</p>}
      {ticket.image && (
        <a href={ticket.image} target="_blank" rel="noreferrer">
          <img src={ticket.image} alt="Attached" className="max-h-64 rounded border bg-white" />
        </a>
      )}
      <div className="rounded border-l-4 border-[#38c3be] bg-white p-3">
        <p className="mb-1 text-[12px] font-bold uppercase text-slate-500">Head office reply</p>
        {isAdmin ? (
          <div className="space-y-2">
            <DceTextarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" aria-label="Reply" />
            <div className="flex flex-wrap items-center gap-2">
              <DceSelect value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)} className="w-44" aria-label="Status">
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </DceSelect>
              <DceButton tone="teal" disabled={saving} onClick={() => void save({ reply: reply.trim() || null, status })}>
                {saving ? "Saving…" : "Save Reply"}
              </DceButton>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-slate-700">{ticket.reply || "No reply yet. The head office will answer here."}</p>
        )}
      </div>
      {!isAdmin && ticket.status !== "CLOSED" && (
        <DceButton tone="slate" size="sm" disabled={saving} onClick={() => void save({ status: "CLOSED" })}>
          Close Ticket
        </DceButton>
      )}
    </div>
  );
}

/** Help & support: a centre raises a ticket with the head office and follows the reply here. */
export default function CentreTickets() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);

  const [rows, setRows] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listSupportTickets(branchId));
    } catch (error) {
      toast({ title: "Could not load tickets", description: (error as Error).message, variant: "destructive" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const pick = async (file: File | undefined) => {
    if (!file) return setImage(null);
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      toast({ title: "Attach a PNG or JPG image", variant: "destructive" });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    try {
      setImage(await resizeImage(file));
    } catch (error) {
      toast({ title: "Could not use that image", description: (error as Error).message, variant: "destructive" });
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const target = branchId || form.branchId;
    if (!form.subject.trim()) return toast({ title: "Subject is required", variant: "destructive" });
    if (!target) return toast({ title: "Choose a branch", variant: "destructive" });
    setSaving(true);
    try {
      const created = await createSupportTicket({
        branchId: target,
        category: form.category,
        subcategory: form.subcategory,
        subject: form.subject.trim(),
        content: form.content.trim(),
        image,
      });
      toast({ title: "Ticket raised", description: created?.code ? `Your ticket code is ${created.code}.` : undefined });
      setForm(blank());
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowForm(false);
      await load();
    } catch (error) {
      toast({ title: "Could not raise the ticket", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const needle = search.trim().toUpperCase();
  const shown = needle ? rows.filter((r) => r.code.toUpperCase().includes(needle)) : rows;

  const columns: DceColumn<SupportTicket>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    { key: "code", label: "Code", render: (r) => <span className="font-mono font-semibold">{r.code}</span> },
    ...(isAdmin ? [{ key: "branch", label: "Branch", render: (r: SupportTicket) => r.branch?.name || "—" }] : []),
    { key: "category", label: "Category", render: (r) => r.category },
    { key: "status", label: "Status", render: (r) => <DceBadge status={r.status} /> },
    {
      key: "incident",
      label: "Incidents",
      render: (r) => (
        <div>
          <p className="font-medium text-slate-800">{r.subject}</p>
          <p className="text-[12px] text-slate-500">{shortDate(r.createdAt)}</p>
          {open === r.id && (
            <div className="mt-3">
              <TicketThread ticket={r} isAdmin={isAdmin} onSaved={(t) => setRows((all) => all.map((x) => (x.id === t.id ? { ...x, ...t } : x)))} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <DceButton tone="blue" size="sm" onClick={() => setOpen(open === r.id ? null : r.id)}>
          {open === r.id ? "Hide" : "View"}
        </DceButton>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel
          title="Tickets"
          actions={
            <>
              <DceLinkButton to={`tel:${HELPLINE}`} tone="teal">📞 {HELPLINE}</DceLinkButton>
              <DceLinkButton to={`https://wa.me/91${HELPLINE}`} tone="green">WhatsApp</DceLinkButton>
              <DceButton tone="red" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "Close" : "New Ticket"}
              </DceButton>
            </>
          }
        >
          <div className="mb-4 max-w-xs">
            <DceInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ticket code (TKT-…)" aria-label="Search ticket code" />
          </div>
          <DceTable columns={columns} rows={shown} rowKey={(r) => r.id} loading={loading} empty={needle ? "No ticket with that code." : "No tickets yet."} />
        </DcePanel>

        {showForm && (
          <DcePanel title="New Ticket">
            <form onSubmit={submit} noValidate>
              <DceGrid>
                {isAdmin && (
                  <DceField label="Branch" required>
                    <DceSelect value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} aria-label="Branch">
                      <option value="">Select branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </DceSelect>
                  </DceField>
                )}
                <DceField label="Main Topic" required>
                  <DceSelect
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: TICKET_TOPICS[e.target.value][0] })}
                    aria-label="Main Topic"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </DceSelect>
                </DceField>
                <DceField label="Sub Topic" required>
                  <DceSelect value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} aria-label="Sub Topic">
                    {TICKET_TOPICS[form.category].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </DceSelect>
                </DceField>
                <DceField label="Subject" required span={2}>
                  <DceInput value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Short summary of the issue" aria-label="Subject" />
                </DceField>
                <DceField label="Description" span={4}>
                  <DceTextarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Optional details" aria-label="Description" />
                </DceField>
                <DceField label="Image" hint="PNG or JPG">
                  <DceInput ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={(e) => void pick(e.target.files?.[0])} aria-label="Image" />
                </DceField>
              </DceGrid>
              {image && <img src={image} alt="Selected" className="mt-3 h-24 rounded border object-cover" />}
              <div className="mt-5">
                <DceButton type="submit" disabled={saving}>
                  {saving ? "Submitting…" : "Submit Ticket"}
                </DceButton>
              </div>
            </form>
          </DcePanel>
        )}
      </div>
    </AppLayout>
  );
}
