import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Copy, Eye, GripVertical, Image as ImageIcon, Plus, QrCode, Save, Trash2, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { printHtml } from "@/lib/export";
import { idCardsPdf } from "@/lib/id-card-pdf";
import {
  ACCENT_OPTIONS,
  ID_CARD_FIELDS,
  IdCardTemplate as Template,
  type IdCardStudent,
  blankIdCardTemplate,
  fieldValue,
  idCardHtml,
} from "@/data/id-card-templates";

interface IdCardTemplateRow {
  id: string;
  name: string;
  orientation: "portrait" | "landscape";
  accent: string;
  instituteName: string;
  instituteAddress: string;
  fields: string[];
  showPhoto: boolean;
  showQr: boolean;
  showSignature: boolean;
  validUntil: string;
  status: "active" | "draft";
}

/** The switches own these three, so they are not toggled from the element list. */
const SWITCHED: Record<string, "showPhoto" | "showQr" | "showSignature"> = {
  "Student Photo": "showPhoto",
  "QR Code": "showQr",
  "Signature Line": "showSignature",
};

const elementList = [
  ...ID_CARD_FIELDS.map((label) => ({ label, icon: Type })),
  { label: "Student Photo", icon: ImageIcon },
  { label: "QR Code", icon: QrCode },
  { label: "Signature Line", icon: Type },
];

/** Blank placeholder for the canvas when no real student data is chosen. */
const SAMPLE_STUDENT: IdCardStudent = {
  id: "",
  name: "",
  class: "",
  section: "",
  rollNo: "",
  photo: false,
  dob: "",
  bloodGroup: "",
  parentContact: "",
  address: "",
};

export default function IDCardTemplate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<IdCardTemplateRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<IdCardTemplateRow, "id">>(blankIdCardTemplate());
  const [deleting, setDeleting] = useState<IdCardTemplateRow | null>(null);

  const set = <K extends keyof Omit<IdCardTemplateRow, "id">>(key: K, value: Omit<IdCardTemplateRow, "id">[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem("erp-id-card-templates");
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch {
      // start with empty list
    }
    return () => { cancelled = true; };
  }, []);

  const persistItems = (list: IdCardTemplateRow[]) => {
    setItems(list);
    try {
      localStorage.setItem("erp-id-card-templates", JSON.stringify(list));
    } catch { /* quota */ }
  };

  const isPlaced = (label: string) => {
    const flag = SWITCHED[label];
    return flag ? draft[flag] : draft.fields.includes(label);
  };

  const togglePlaced = (label: string) => {
    const flag = SWITCHED[label];
    if (flag) return set(flag, !draft[flag]);
    set(
      "fields",
      draft.fields.includes(label)
        ? draft.fields.filter((field) => field !== label)
        : [...draft.fields, label],
    );
  };

  const load = (template: IdCardTemplateRow) => {
    const { id, ...rest } = template;
    setEditingId(id);
    setDraft(rest);
  };

  const startNew = () => {
    setEditingId(null);
    setDraft(blankIdCardTemplate());
    toast({ title: "New template", description: "The canvas is reset - name it and save." });
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast({ title: "Name required", description: "Give the template a name before saving.", variant: "destructive" });
      return;
    }
    if (!draft.fields.length) {
      toast({ title: "Add at least one field", description: "An ID card with no fields prints blank.", variant: "destructive" });
      return;
    }
    if (editingId) {
      const updated = items.map((item) => (item.id === editingId ? { ...item, ...draft } : item));
      persistItems(updated);
      toast({ title: "Template updated", description: `${draft.name} was saved.` });
      return;
    }
    const newId = `idtpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTemplate: IdCardTemplateRow = { ...draft, id: newId };
    persistItems([newTemplate, ...items]);
    setEditingId(newId);
    toast({ title: "Template saved", description: `${draft.name} is now available in Generate ID Cards.` });
  };

  const duplicate = (template: IdCardTemplateRow) => {
    const { id: _id, ...rest } = template;
    const newTemplate: IdCardTemplateRow = { ...rest, name: `${template.name} (Copy)`, status: "draft", id: `idtpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    persistItems([newTemplate, ...items]);
    toast({ title: "Template duplicated", description: `A draft copy of ${template.name} was created.` });
  };

  const current: IdCardTemplateRow = { ...draft, id: editingId ?? "preview" };

  const preview = () =>
    printHtml(
      draft.name || "ID Card",
      `<p style="font-size:12px;color:#6b7280">Sample record - ${SAMPLE_STUDENT.name}</p>${idCardHtml(current, SAMPLE_STUDENT)}`,
    );

  const downloadSample = () => {
    idCardsPdf(current, [SAMPLE_STUDENT], `${draft.name || "id-card"}-sample.pdf`);
    toast({ title: "Sample PDF generated", description: "A single-card proof is in your Downloads." });
  };

  return (
    <AppLayout>
      <PageHeader
        title="ID Card Template"
        description="Design and customize student ID card templates"
        breadcrumbs={[
          { label: "Certificate & Marksheet", href: "/documents/designer" },
          { label: "ID Card Template" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadSample}>
              Sample PDF
            </Button>
            <Button variant="outline" onClick={preview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={save}>
              <Save className="h-4 w-4 mr-2" />
              {editingId ? "Update Template" : "Save Template"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {elementList.map((element) => (
              <button
                key={element.label}
                type="button"
                onClick={() => togglePlaced(element.label)}
                className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors hover:bg-muted/50 ${
                  isPlaced(element.label) ? "border-primary bg-primary/5" : ""
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <element.icon className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1">{element.label}</span>
                {isPlaced(element.label) && <Badge variant="secondary" className="text-[10px]">on</Badge>}
              </button>
            ))}
            <p className="text-xs text-muted-foreground pt-2">
              Click an element to place it on - or remove it from - the card
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Card Canvas</CardTitle>
              <Select
                value={draft.orientation}
                onValueChange={(value) => set("orientation", value as "portrait" | "landscape")}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-6 min-h-[480px] flex items-start justify-center bg-background">
              <div
                className="rounded-lg border bg-card shadow-sm overflow-hidden"
                style={{
                  width: draft.orientation === "portrait" ? 240 : 380,
                  height: draft.orientation === "portrait" ? 380 : 240,
                }}
              >
                <div className="px-4 py-3 text-white" style={{ background: draft.accent }}>
                  <p className="text-sm font-bold leading-tight">{draft.instituteName || "Institute Name"}</p>
                  <p className="text-[10px] opacity-85">{draft.instituteAddress}</p>
                </div>
                <div className="flex gap-3 p-4">
                  {draft.showPhoto && (
                    <div className="h-20 w-16 shrink-0 rounded border bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {draft.fields.includes("Student Name") && (
                      <p className="mb-2 truncate text-sm font-bold">{SAMPLE_STUDENT.name}</p>
                    )}
                    <dl className="space-y-1">
                      {draft.fields
                        .filter((label) => label !== "Student Name")
                        .map((label) => (
                          <div key={label} className="flex justify-between gap-2 text-[10px]">
                            <dt className="text-muted-foreground shrink-0">{label}</dt>
                            <dd className="truncate font-medium">
                              {fieldValue(label, SAMPLE_STUDENT, draft)}
                            </dd>
                          </div>
                        ))}
                    </dl>
                    {!draft.fields.length && (
                      <p className="text-[10px] text-muted-foreground">No fields placed yet.</p>
                    )}
                  </div>
                </div>
                <div className="flex items-end justify-between px-4">
                  {draft.showQr ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded border">
                      <QrCode className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ) : (
                    <span />
                  )}
                  {draft.showSignature && (
                    <div className="text-center">
                      <div className="mb-1 w-20 border-t border-foreground" />
                      <span className="text-[10px]">Principal</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="Enter template name"
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Institute Name</Label>
                <Input value={draft.instituteName} onChange={(e) => set("instituteName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Institute Address</Label>
                <Input value={draft.instituteAddress} onChange={(e) => set("instituteAddress", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Accent Colour</Label>
                <Select value={draft.accent} onValueChange={(value) => set("accent", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: option.value }} />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input value={draft.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Photo</Label>
                <Switch checked={draft.showPhoto} onCheckedChange={(value) => set("showPhoto", value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show QR Code</Label>
                <Switch checked={draft.showQr} onCheckedChange={(value) => set("showQr", value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Signature</Label>
                <Switch checked={draft.showSignature} onCheckedChange={(value) => set("showSignature", value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Publish as Active</Label>
                <Switch
                  checked={draft.status === "active"}
                  onCheckedChange={(value) => set("status", value ? "active" : "draft")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Saved Templates</CardTitle>
                <Button size="sm" variant="ghost" onClick={startNew}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">No templates saved yet.</p>
              )}
              {items.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 ${
                    editingId === template.id ? "border-primary" : ""
                  }`}
                >
                  <button type="button" className="text-left flex-1" onClick={() => load(template)}>
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {template.orientation} - {template.fields.length} fields
                    </p>
                  </button>
                  <div className="flex items-center gap-1">
                    <Badge variant={template.status === "active" ? "default" : "secondary"}>
                      {template.status}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicate(template)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleting(template)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will no longer be selectable in Generate ID Cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleting) return;
                persistItems(items.filter((item) => item.id !== deleting.id));
                if (editingId === deleting.id) {
                  setEditingId(null);
                  setDraft(blankIdCardTemplate());
                }
                toast({ title: "Template deleted", description: `${deleting.name} was removed.` });
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}