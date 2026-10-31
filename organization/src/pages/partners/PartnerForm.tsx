import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMPTY_PARTNER_FORM,
  PARTNER_TYPES,
  type PartnerErrors,
  type PartnerFormValues,
  type PartnerInput,
  validatePartner,
} from "@/lib/supabase/partners";

interface PartnerFormProps {
  initial?: PartnerFormValues;
  submitLabel: string;
  /** Resolves once saved; a rejection keeps the form as typed so nothing is lost. */
  onSubmit: (value: PartnerInput) => Promise<void>;
  onCancel?: () => void;
  /** Cleared after a successful save, for the Add page that stays put. */
  resetOnSave?: boolean;
}

/** Shared by Add Partner and the edit dialog on All Partners, so both apply the same rules. */
export function PartnerForm({ initial = EMPTY_PARTNER_FORM, submitLabel, onSubmit, onCancel, resetOnSave }: PartnerFormProps) {
  const [form, setForm] = useState<PartnerFormValues>(initial);
  const [errors, setErrors] = useState<PartnerErrors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof PartnerFormValues>(key: K, value: PartnerFormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { errors: found, value } = validatePartner(form);
    setErrors(found);
    if (!value) return;
    setSaving(true);
    try {
      await onSubmit(value);
      if (resetOnSave) setForm(EMPTY_PARTNER_FORM);
    } catch {
      /* the caller reports it; keep what was typed */
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof PartnerFormValues, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-2">
      <Label htmlFor={`partner-${key}`}>{label}</Label>
      <Input
        id={`partner-${key}`}
        value={form[key]}
        onChange={(e) => set(key, e.target.value as never)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `partner-${key}-error` : undefined}
        {...props}
      />
      {errors[key] && (
        <p id={`partner-${key}-error`} className="text-sm text-destructive">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {field("name", "Partner Name *")}
        <div className="space-y-2">
          <Label htmlFor="partner-partnerType">Type</Label>
          <Select value={form.partnerType} onValueChange={(v) => set("partnerType", v as PartnerFormValues["partnerType"])}>
            <SelectTrigger id="partner-partnerType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PARTNER_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {field("contactPerson", "Contact Person")}
        {field("phone", "Phone *", { inputMode: "numeric", placeholder: "10-digit mobile" })}
        {field("email", "Email", { type: "email" })}
        {field("commissionPercent", "Commission Rate (%)", { inputMode: "decimal", placeholder: "0" })}
        {field("city", "City")}
        {field("state", "State")}
      </div>
      {field("address", "Address")}
      <div className="space-y-2">
        <Label htmlFor="partner-notes">Notes</Label>
        <Textarea id="partner-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
