import { useCallback, useEffect, useState } from "react";
import { Building2, Check, Loader2, Plus, Save, Search, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENT_KINDS, type DocumentDesign, type DocumentKind } from "@/lib/documentDesigner";
import { getBranches } from "@/lib/supabase/data";
import {
  assignTemplate,
  deleteTemplate,
  getTemplateAssignments,
  getTemplates,
  saveTemplate,
  type DocumentTemplate,
  type TemplateAssignments,
} from "@/lib/supabase/documentTemplates";

/**
 * The institute's template library, beside the canvas.
 *
 * The designer used to save to `localStorage` and tell the user so: "stored on
 * this device". That meant a template drawn at head office existed on exactly
 * one machine -- no branch could print from it, and the pages that actually
 * produce a student's certificate carried their own hardcoded layout instead.
 *
 * Templates belong to the organisation now, and each branch is given one to
 * print from. Designing and assigning are the organisation's: a branch reads
 * the library and prints from what it was given.
 */
export function TemplateLibrary({
  kind,
  design,
  organizationId,
  canManage,
  onOpen,
}: {
  kind: DocumentKind;
  design: DocumentDesign;
  organizationId: string | null;
  canManage: boolean;
  onOpen: (design: DocumentDesign) => void;
}) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [assignments, setAssignments] = useState<TemplateAssignments>({});
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  /** "" while the canvas holds a design that has not been saved as anything. */
  const [openId, setOpenId] = useState("");
  const [name, setName] = useState("");
  const [assigningTo, setAssigningTo] = useState<DocumentTemplate | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [branchQuery, setBranchQuery] = useState("");
  const visibleBranches = branches.filter((b) => b.name.toLowerCase().includes(branchQuery.trim().toLowerCase()));

  const ofKind = templates.filter((template) => template.kind === kind);
  const current = ofKind.find((template) => template.id === openId) ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [library, assigned, branchList] = await Promise.all([
        getTemplates(organizationId),
        getTemplateAssignments(organizationId),
        getBranches(organizationId).catch(() => ({ data: [] })),
      ]);
      setTemplates(library.data);
      setAssignments(assigned.data);
      setBranches((branchList.data ?? []) as Array<{ id: string; name: string }>);
    } catch (error) {
      toast({
        title: "Could not load the template library",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Opening a different kind of document leaves the previous kind's template
  // selected, and it belongs to neither the canvas nor the list.
  useEffect(() => {
    setOpenId("");
    setName("");
  }, [kind]);

  const open = (template: DocumentTemplate) => {
    setOpenId(template.id);
    setName(template.name);
    onOpen(template.design);
    toast({ title: `Opened "${template.name}"`, description: "Edits are saved back onto it." });
  };

  const save = async (asNew: boolean) => {
    if (!organizationId) {
      toast({ title: "No organisation assigned", variant: "destructive" });
      return;
    }
    const title = name.trim() || `${DOCUMENT_KINDS[kind].label} template`;
    setSaving(true);
    try {
      const result = await saveTemplate({
        id: asNew ? undefined : current?.id,
        organizationId,
        kind,
        name: title,
        design,
        // The first template of a kind is what every branch prints until
        // somebody says otherwise, so it becomes the default on its own.
        isDefault: asNew ? ofKind.length === 0 : current?.isDefault ?? ofKind.length === 0,
      });
      setOpenId(result.data.id);
      setName(result.data.name);
      await load();
      toast({
        title: asNew || !current ? "Template saved" : `"${title}" updated`,
        description: "Branches print from the library, so this is live for whoever it is assigned to.",
      });
    } catch (error) {
      toast({
        title: "Could not save the template",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (template: DocumentTemplate) => {
    if (!organizationId) return;
    try {
      await saveTemplate({
        id: template.id,
        organizationId,
        kind: template.kind,
        name: template.name,
        design: template.design,
        isDefault: true,
      });
      await load();
      toast({
        title: `"${template.name}" is the default`,
        description: "Every branch with no template of its own prints this one.",
      });
    } catch (error) {
      toast({
        title: "Could not set the default",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  const remove = async (template: DocumentTemplate) => {
    try {
      await deleteTemplate(template.id);
      if (openId === template.id) setOpenId("");
      await load();
      toast({ title: `"${template.name}" deleted` });
    } catch (error) {
      toast({
        title: "Could not delete the template",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  const openAssign = (template: DocumentTemplate) => {
    setPicked(
      branches
        .filter((branch) => assignments[branch.id]?.[kind] === template.id)
        .map((branch) => branch.id),
    );
    setAssigningTo(template);
    setBranchQuery("");
  };

  const saveAssignments = async () => {
    if (!assigningTo) return;
    const template = assigningTo;
    setAssigningTo(null);
    try {
      await Promise.all(
        branches.map((branch) => {
          const holdsThis = assignments[branch.id]?.[kind] === template.id;
          const wantsThis = picked.includes(branch.id);
          if (holdsThis === wantsThis) return null;
          // Unticking only clears an assignment that pointed at this template;
          // a branch printing somebody else's is left alone.
          return assignTemplate(branch.id, kind, wantsThis ? template.id : null);
        }),
      );
      await load();
      toast({
        title: "Branches updated",
        description: `${picked.length} branch(es) print "${template.name}".`,
      });
    } catch (error) {
      toast({
        title: "Could not assign the template",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  const branchesOn = (template: DocumentTemplate) =>
    branches.filter((branch) => assignments[branch.id]?.[kind] === template.id).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="grid place-items-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {ofKind.length > 0 && (
              <div className="space-y-2">
                <Label>Open a saved one</Label>
                <Select
                  value={openId}
                  onValueChange={(value) => {
                    const template = ofKind.find((item) => item.id === value);
                    if (template) open(template);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unsaved design" />
                  </SelectTrigger>
                  <SelectContent>
                    {ofKind.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        {template.isDefault ? " · default" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {canManage ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template name</Label>
                  <Input
                    id="template-name"
                    placeholder={`${DOCUMENT_KINDS[kind].label} template`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5" onClick={() => save(false)} disabled={saving}>
                    <Save className="h-3.5 w-3.5" />
                    {current ? "Save changes" : "Save template"}
                  </Button>
                  {current && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => save(true)}
                      disabled={saving}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Save as new
                    </Button>
                  )}
                </div>

                {ofKind.length > 0 && (
                  <ul className="space-y-2 rounded-xl border p-2 text-sm">
                    {ofKind.map((template) => (
                      <li key={template.id} className="rounded-lg border p-2">
                        <div className="flex items-start gap-2">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{template.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {template.isDefault ? "Default for this document · " : ""}
                              {branchesOn(template) === 0
                                ? "no branch assigned"
                                : `${branchesOn(template)} branch(es)`}
                            </span>
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive"
                            title="Delete template"
                            aria-label={`Delete ${template.name}`}
                            onClick={() => remove(template)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Named buttons rather than a row of icons: assigning a
                            template to a branch is the point of the library, and
                            it was hiding behind a glyph nobody could read. */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => openAssign(template)}
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            Assign to branches
                          </Button>
                          {!template.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-xs"
                              onClick={() => makeDefault(template)}
                            >
                              <Star className="h-3.5 w-3.5" />
                              Make default
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Templates are designed and assigned by the organisation. Your branch prints the one
                it has been given.
              </p>
            )}

            {ofKind.length === 0 && canManage && (
              <p className="text-xs text-muted-foreground">
                Nothing saved for this document yet. Draw it on the canvas and save it — the first
                one becomes what every branch prints.
              </p>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={assigningTo !== null} onOpenChange={(open) => !open && setAssigningTo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Branches printing "{assigningTo?.name}"</DialogTitle>
            <DialogDescription>
              Every {DOCUMENT_KINDS[kind].label.toLowerCase()} a ticked branch prints uses this
              template. A branch with none printed against it uses the default.
            </DialogDescription>
          </DialogHeader>
          {branches.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={branchQuery}
                onChange={(e) => setBranchQuery(e.target.value)}
                placeholder="Search centre…"
                aria-label="Search centre"
                className="pl-9"
              />
            </div>
          )}
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {branches.length === 0 && (
              <p className="text-sm text-muted-foreground">No branches on this organisation yet.</p>
            )}
            {branches.length > 0 && !visibleBranches.length && (
              <p className="p-2 text-sm text-muted-foreground">No centre matches "{branchQuery}".</p>
            )}
            {/* The search only hides rows: a ticked centre stays ticked while it is out of view. */}
            {visibleBranches.map((branch) => {
              const other = assignments[branch.id]?.[kind];
              const onAnother = other && other !== assigningTo?.id;
              return (
                <label
                  key={branch.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm hover:bg-muted"
                >
                  <Checkbox
                    checked={picked.includes(branch.id)}
                    aria-label={branch.name}
                    onCheckedChange={(value) =>
                      setPicked((list) =>
                        value === true
                          ? [...new Set([...list, branch.id])]
                          : list.filter((id) => id !== branch.id),
                      )
                    }
                  />
                  <span className="flex-1">{branch.name}</span>
                  {/* Ticking here moves the branch off whatever it prints now,
                      which is worth seeing before it happens. */}
                  {onAnother && (
                    <span className="text-xs text-muted-foreground">
                      on {templates.find((t) => t.id === other)?.name ?? "another"}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigningTo(null)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={saveAssignments}>
              <Check className="h-4 w-4" />
              Save branches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
