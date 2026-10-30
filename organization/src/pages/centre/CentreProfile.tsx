import { useEffect, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DceButton, DceField, DceGrid, DceInput, DcePanel, DceSelect } from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { instituteLogo, loadInstituteLogo } from "@/lib/instituteLogo";
import { useBranchOptions } from "@/lib/supabase/centrePanel";
import { supabase } from "@/lib/supabase/client";

const EMPTY = { name: "", code: "", director: "", email: "", phone: "" };

/** "Profile page": the centre's contact details and the login's password. */
export default function CentreProfile() {
  const { user, branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);
  const [picked, setPicked] = useState("");
  const target = branchId || picked || null;

  const [logo, setLogo] = useState<string | null>(instituteLogo());
  const [form, setForm] = useState(EMPTY);
  const [hasDirector, setHasDirector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    let live = true;
    loadInstituteLogo(branchId).then((l) => live && setLogo(l));
    return () => {
      live = false;
    };
  }, [branchId]);

  useEffect(() => {
    if (!target) {
      setForm(EMPTY);
      return;
    }
    let live = true;
    setLoading(true);
    Promise.all([
      supabase.from("branches").select("name, code, email, phone").eq("id", target).maybeSingle(),
      supabase.from("branch_directors").select("name").eq("branchId", target).maybeSingle(),
    ])
      .then(([branch, director]) => {
        if (!live) return;
        if (branch.error) throw new Error(branch.error.message);
        const b = (branch.data || {}) as Record<string, unknown>;
        setHasDirector(Boolean(director.data));
        setForm({
          name: String(b.name || ""),
          code: String(b.code || ""),
          director: String((director.data as { name?: string } | null)?.name || ""),
          email: String(b.email || ""),
          phone: String(b.phone || ""),
        });
      })
      .catch((error) => live && toast({ title: "Could not load the centre", description: (error as Error).message, variant: "destructive" }))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [target, toast]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!target) return;
    if (!form.name.trim()) return toast({ title: "Center name is required", variant: "destructive" });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return toast({ title: "Enter a valid email", variant: "destructive" });
    if (form.phone && !/^\+?\d[\d\s-]{6,}$/.test(form.phone.trim())) return toast({ title: "Enter a valid phone number", variant: "destructive" });
    setSaving(true);
    try {
      // `.select` so a write that RLS silently filtered out reads as a failure, not a success.
      const { data, error } = await supabase
        .from("branches")
        .update({ name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, updatedAt: new Date().toISOString() })
        .eq("id", target)
        .select("id");
      if (error) throw new Error(/duplicate key/.test(error.message) ? "That email or phone is already used by another centre." : error.message);
      if (!data?.length) throw new Error("Your login is not allowed to change the centre record. Ask the head office to update it.");
      if (form.director.trim()) {
        const director = hasDirector
          ? await supabase.from("branch_directors").update({ name: form.director.trim() }).eq("branchId", target).select("id")
          : null;
        if (director?.error) throw new Error(director.error.message);
        if (!hasDirector) toast({ title: "Director not on record", description: "The head office adds the director when registering the centre." });
      }
      toast({ title: "Profile updated" });
    } catch (error) {
      toast({ title: "Could not update the profile", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return toast({ title: "Password must be at least 6 characters", variant: "destructive" });
    if (password !== confirm) return toast({ title: "Passwords do not match", variant: "destructive" });
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setPassword("");
      setConfirm("");
      toast({ title: "Password updated" });
    } catch (error) {
      toast({ title: "Could not update the password", description: (error as Error).message, variant: "destructive" });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="h-fit rounded-sm bg-white p-6 text-center shadow-sm">
          {logo ? (
            <img src={logo} alt="Institute logo" className="mx-auto h-24 w-24 rounded-full border object-contain p-1" />
          ) : (
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-100 text-2xl font-bold text-slate-500">
              {(user?.name || "C").slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="mt-3 text-[15px] font-bold text-slate-800">{user?.name || "—"}</p>
          <p className="break-all text-[13px] text-slate-500">{user?.email || "—"}</p>
          {form.code && <p className="mt-2 text-[12px] font-semibold text-slate-600">Centre Code: {form.code}</p>}
        </div>

        <div className="space-y-5">
          <DcePanel title="Profile page">
            {isAdmin && (
              <div className="mb-4 max-w-xs">
                <DceSelect value={picked} onChange={(e) => setPicked(e.target.value)} aria-label="Branch">
                  <option value="">Choose a branch to edit</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </DceSelect>
              </div>
            )}
            {!target ? (
              <p className="text-[13px] text-slate-500">Choose a branch to edit its profile.</p>
            ) : (
              <form onSubmit={saveProfile}>
                <DceGrid className="lg:grid-cols-2">
                  <DceField label="Center Name" required>
                    <DceInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={loading} aria-label="Center Name" />
                  </DceField>
                  <DceField label="Center Code">
                    <DceInput value={form.code} readOnly disabled aria-label="Center Code" />
                  </DceField>
                  <DceField label="Director Full Name">
                    <DceInput value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} disabled={loading} aria-label="Director Full Name" />
                  </DceField>
                  <DceField label="Email">
                    <DceInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={loading} aria-label="Email" />
                  </DceField>
                  <DceField label="Phone No">
                    <DceInput type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={loading} aria-label="Phone No" />
                  </DceField>
                </DceGrid>
                <div className="mt-5">
                  <DceButton type="submit" disabled={saving || loading}>{saving ? "Updating…" : "Update Profile"}</DceButton>
                </div>
              </form>
            )}
          </DcePanel>

          <DcePanel title="Update Password">
            <form onSubmit={savePassword}>
              <DceGrid className="lg:grid-cols-2">
                <DceField label="New Password" required>
                  <DceInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-label="New Password" />
                </DceField>
                <DceField label="Confirm Password" required>
                  <DceInput type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" aria-label="Confirm Password" />
                </DceField>
              </DceGrid>
              <div className="mt-5">
                <DceButton type="submit" tone="red" disabled={pwSaving}>{pwSaving ? "Updating…" : "Update Password"}</DceButton>
              </div>
            </form>
          </DcePanel>
        </div>
      </div>
    </AppLayout>
  );
}
