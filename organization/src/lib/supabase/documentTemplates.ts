import { supabase } from "@/lib/supabase/client";
import { newId } from "@/lib/id";
import { starterDesign, type DocumentDesign, type DocumentKind } from "@/lib/documentDesigner";

/**
 * The institute's template library, and which template each branch prints from.
 *
 * The designer used to keep its work in `localStorage` -- one browser, invisible
 * to every branch and to the pages that actually print. Templates live on the
 * organisation now, and a branch is assigned one per kind.
 *
 * Everything here degrades to nothing rather than throwing: a database without
 * document-templates.sql has no library, and every screen then falls back to
 * the starter layouts exactly as it did before.
 */

export interface DocumentTemplate {
  id: string;
  organizationId: string | null;
  kind: DocumentKind;
  name: string;
  design: DocumentDesign;
  isDefault: boolean;
}

/** branchId -> kind -> templateId. */
export type TemplateAssignments = Record<string, Record<string, string>>;

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  error?.code === "42P01" ||
  error?.code === "PGRST205" ||
  /document_templates|branch_document_templates/i.test(error?.message || "");

const mapTemplate = (row: Record<string, unknown>): DocumentTemplate => ({
  id: String(row.id || ""),
  organizationId: (row.organizationId as string) ?? null,
  kind: String(row.kind || "certificate") as DocumentKind,
  name: String(row.name || "Untitled"),
  // A row with no design at all is not a template anyone can print; the
  // starter for its kind is the honest stand-in.
  design: (row.design as DocumentDesign) ?? starterDesign(String(row.kind || "certificate") as DocumentKind),
  isDefault: Boolean(row.isDefault),
});

/** Every template the organisation has designed. */
export async function getTemplates(organizationId: string | null) {
  if (!organizationId) return { success: true as const, data: [] as DocumentTemplate[] };
  const { data, error } = await supabase
    .from("document_templates")
    .select("*")
    .eq("organizationId", organizationId)
    .order("kind")
    .order("name");
  if (error) {
    if (isMissingTable(error)) return { success: true as const, data: [] as DocumentTemplate[] };
    throw new Error(error.message);
  }
  return {
    success: true as const,
    data: (data || []).map((row) => mapTemplate(row as Record<string, unknown>)),
  };
}

export async function saveTemplate(input: {
  id?: string;
  organizationId: string;
  kind: DocumentKind;
  name: string;
  design: DocumentDesign;
  isDefault?: boolean;
}) {
  const body = {
    organizationId: input.organizationId,
    kind: input.kind,
    name: input.name.trim() || "Untitled",
    design: input.design,
    isDefault: input.isDefault ?? false,
    updatedAt: new Date().toISOString(),
  };

  // Only one default per kind, and the index enforces it -- so the old one is
  // stood down before the new one is written, not after.
  if (body.isDefault) {
    await supabase
      .from("document_templates")
      .update({ isDefault: false })
      .eq("organizationId", input.organizationId)
      .eq("kind", input.kind)
      .neq("id", input.id ?? "none");
  }

  const query = input.id
    ? supabase.from("document_templates").update(body).eq("id", input.id).select("*").single()
    : supabase
        .from("document_templates")
        .insert({ id: newId("tpl"), ...body })
        .select("*")
        .single();

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true as const, data: mapTemplate(data as Record<string, unknown>) };
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from("document_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true as const };
}

/** Which template every branch prints from, as branchId -> kind -> templateId. */
export async function getTemplateAssignments(organizationId: string | null) {
  if (!organizationId) return { success: true as const, data: {} as TemplateAssignments };
  const { data, error } = await supabase
    .from("branch_document_templates")
    .select('"branchId", kind, "templateId"');
  if (error) {
    if (isMissingTable(error)) return { success: true as const, data: {} as TemplateAssignments };
    throw new Error(error.message);
  }
  const assignments: TemplateAssignments = {};
  for (const row of data || []) {
    const entry = row as { branchId: string; kind: string; templateId: string };
    (assignments[entry.branchId] ||= {})[entry.kind] = entry.templateId;
  }
  return { success: true as const, data: assignments };
}

/** Gives a branch a template to print from, or takes the assignment away. */
export async function assignTemplate(branchId: string, kind: DocumentKind, templateId: string | null) {
  if (!templateId) {
    const { error } = await supabase
      .from("branch_document_templates")
      .delete()
      .eq("branchId", branchId)
      .eq("kind", kind);
    if (error) throw new Error(error.message);
    return { success: true as const };
  }

  // Not an upsert: the unique index is on (branchId, kind), and PostgREST's
  // upsert would write a fresh `id` over the existing row's primary key.
  const { data: existing } = await supabase
    .from("branch_document_templates")
    .select("id")
    .eq("branchId", branchId)
    .eq("kind", kind)
    .maybeSingle();

  const { error } = existing?.id
    ? await supabase
        .from("branch_document_templates")
        .update({ templateId, updatedAt: new Date().toISOString() })
        .eq("id", existing.id)
    : await supabase
        .from("branch_document_templates")
        .insert({ id: newId("bdt"), branchId, kind, templateId });
  if (error) throw new Error(error.message);
  return { success: true as const };
}

/**
 * The design a branch prints for one kind of document.
 *
 * In order: what the branch was assigned, the organisation's default for that
 * kind, the only template there is, and finally the app's starter layout -- so
 * a branch can always print something, whatever the office has set up.
 */
export function designFor(
  kind: DocumentKind,
  templates: DocumentTemplate[],
  assignments: TemplateAssignments,
  branchId: string | null,
): { design: DocumentDesign; template: DocumentTemplate | null } {
  const ofKind = templates.filter((template) => template.kind === kind);
  const assignedId = branchId ? assignments[branchId]?.[kind] : undefined;
  const template =
    ofKind.find((item) => item.id === assignedId) ??
    ofKind.find((item) => item.isDefault) ??
    (ofKind.length === 1 ? ofKind[0] : null);
  return { design: template?.design ?? starterDesign(kind), template };
}

/** The same, fetched. For the screens that print one student at a time. */
export async function loadDesignFor(
  kind: DocumentKind,
  organizationId: string | null,
  branchId: string | null,
) {
  const [templates, assignments] = await Promise.all([
    getTemplates(organizationId).catch(() => ({ data: [] as DocumentTemplate[] })),
    getTemplateAssignments(organizationId).catch(() => ({ data: {} as TemplateAssignments })),
  ]);
  return designFor(kind, templates.data, assignments.data, branchId);
}
