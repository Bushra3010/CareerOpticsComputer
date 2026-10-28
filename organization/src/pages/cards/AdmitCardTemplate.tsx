import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Save,
  Eye,
  Trash2,
  Copy,
  Type,
  Image,
  QrCode,
  Table,
  GripVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { printHtml } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ADMIT_CARD_ELEMENTS,
  ADMIT_CARD_TEMPLATE_SEED,
  AdmitCardTemplate as Template,
  EXAMS,
  INSTITUTE,
  INSTRUCTIONS,
  PAGE_SIZES,
  SAMPLE_STUDENT,
  admitCardHtml,
  blankAdmitCardTemplate,
  fieldValue,
  findExam,
} from "@/data/admit-card-templates";

const ELEMENT_ICONS = { text: Type, image: Image, qr: QrCode, table: Table, textarea: Type };

/** The three toggles that have their own switches, keyed by element label. */
const SWITCHED: Record<string, "showPhoto" | "showQr" | "showSchedule"> = {
  "Student Photo": "showPhoto",
  "QR Code": "showQr",
  "Exam Schedule": "showSchedule",
};

interface AdmitCardTemplateRow {
  id: string;
  name: string;
  exam: string;
  status: "active" | "draft";
  size: "a4" | "a5" | "letter";
  showQr: boolean;
  showPhoto: boolean;
  showSchedule: boolean;
  elements: string[];
}

export default function AdmitCardTemplate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<AdmitCardTemplateRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<AdmitCardTemplateRow, "id">>(blankAdmitCardTemplate());

  const set = <K extends keyof Omit<AdmitCardTemplateRow, "id">>(key: K, value: Omit<AdmitCardTemplateRow, "id">[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem("erp-admit-card-templates");
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems(ADMIT_CARD_TEMPLATE_SEED);
      }
    } catch {
      setItems(ADMIT_CARD_TEMPLATE_SEED);
    }
    return () => { cancelled = true; };
  }, []);

  const persistItems = (list: AdmitCardTemplateRow[]) => {
    setItems(list);
    try {
      localStorage.setItem("erp-admit-card-templates", JSON.stringify(list));
    } catch { /* quota */ }
  };

  const exam = findExam(draft.exam);
  const examLabel = exam?.label ?? "Examination";

  const isPlaced = (label: string) => {
    const flag = SWITCHED[label];
    return flag ? draft[flag] : draft.elements.includes(label);
  };

  const togglePlaced = (label: string) => {
    const flag = SWITCHED[label];
    if (flag) return set(flag, !draft[flag]);
    set(
      "elements",
      draft.elements.includes(label)
        ? draft.elements.filter((e) => e !== label)
        : [...draft.elements, label],
    );
  };

  const load = (template: AdmitCardTemplateRow) => {
    const { id, ...rest } = template;
    setEditingId(id);
    setDraft(rest);
  };

  const startNew = () => {
    setEditingId(null);
    setDraft(blankAdmitCardTemplate());
    toast({ title: "New template", description: "The canvas is reset - name it and save." });
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast({ title: "Name required", description: "Give the template a name before saving.", variant: "destructive" });
      return;
    }
    if (editingId) {
      const updated = items.map((item) => (item.id === editingId ? { ...item, ...draft } : item));
      persistItems(updated);
      toast({ title: "Template updated", description: `${draft.name} was saved.` });
      return;
    }
    const newTemplate: AdmitCardTemplateRow = { ...draft, id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    persistItems([newTemplate, ...items]);
    setEditingId(newTemplate.id);
    toast({ title: "Template saved", description: `${draft.name} was added to your templates.` });
  };

  const duplicate = (template: AdmitCardTemplateRow) => {
    const { id: _id, ...rest } = template;
    const newTemplate: AdmitCardTemplateRow = { ...rest, name: `${template.name} (Copy)`, status: "draft", id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    persistItems([newTemplate, ...items]);
    toast({ title: "Template duplicated", description: `A draft copy of ${template.name} was created.` });
  };

  const destroy = (template: AdmitCardTemplateRow) => {
    persistItems(items.filter((item) => item.id !== template.id));
    if (editingId === template.id) {
      setEditingId(null);
      setDraft(blankAdmitCardTemplate());
    }
    toast({ title: "Template deleted", description: `${template.name} was removed.` });
  };

  /** Print the sample card exactly as the generator would render it. */
  const preview = () => {
    // `AdmitCardTemplate` here is this file's own component, not the row type -
    // the shape lives in @/data/admit-card-templates, imported above as `Template`.
    const effective: Template = { ...draft, id: editingId ?? "preview" };
    printHtml(
      draft.name || "Admit Card",
      admitCardHtml(effective, SAMPLE_STUDENT),
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Admit Card Template"
        description="Design admit card templates for examinations"
        breadcrumbs={[
          { label: "Certificate & Marksheet", href: "/documents/designer" },
          { label: "Admit Card Template" },
        ]}
        actions={
          <div className="flex gap-2">
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
        {/* Left Panel - Elements */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ADMIT_CARD_ELEMENTS.map((element) => {
              const Icon = ELEMENT_ICONS[element.type];
              return (
                <button
                  key={element.label}
                  type="button"
                  onClick={() => togglePlaced(element.label)}
                  className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors hover:bg-muted/50 ${
                    isPlaced(element.label) ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1">{element.label}</span>
                  {isPlaced(element.label) && <Badge variant="secondary" className="text-[10px]">on</Badge>}
                </button>
              );
            })}
            <p className="text-xs text-muted-foreground pt-2">
              Click an element to place it on - or remove it from - the canvas
            </p>
          </CardContent>
        </Card>

        {/* Center - Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Template Canvas</CardTitle>
              <Select value={draft.size} onValueChange={(v) => set("size", v as "a4" | "a5" | "letter")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-4 min-h-[600px] bg-background">
              {/* Admit Card Preview */}
              <div className="border rounded-lg p-6 bg-card shadow-sm max-w-md mx-auto">
                <div className="text-center border-b pb-4 mb-4">
                  {draft.elements.includes("School Logo") && (
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <h2 className="font-bold text-lg">{INSTITUTE.name}</h2>
                  <p className="text-xs text-muted-foreground">{INSTITUTE.address}</p>
                </div>

                <div className="text-center mb-4">
                  <Badge variant="outline" className="text-sm">ADMIT CARD</Badge>
                  <h3 className="font-semibold mt-2">{draft.name || examLabel}</h3>
                </div>

                <div className="flex gap-4 mb-4">
                  {draft.showPhoto && (
                    <div className="w-24 h-28 bg-muted rounded border flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2 text-sm">
                    {draft.elements
                      .map((label) => [label, fieldValue(label, SAMPLE_STUDENT, exam)] as const)
                      .filter(([, value]) => value !== null)
                      .map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3">
                          <span className="text-muted-foreground">{label}:</span>
                          <span className="font-medium text-right">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {draft.showSchedule && (
                  <div className="border rounded p-3 mb-4">
                    <h4 className="text-xs font-semibold mb-2">EXAM SCHEDULE</h4>
                    <div className="text-xs space-y-1">
                      {(exam?.schedule ?? []).map((slot) => (
                        <div key={slot.subject} className="flex justify-between gap-3">
                          <span>{slot.subject}</span>
                          <span>{slot.when}</span>
                        </div>
                      ))}
                      {!exam && (
                        <p className="text-muted-foreground">Pick an exam type to show its schedule.</p>
                      )}
                    </div>
                  </div>
                )}

                {draft.elements.includes("Instructions") && (
                  <p className="text-xs text-muted-foreground mb-4">{INSTRUCTIONS}</p>
                )}

                <div className="flex justify-between items-end pt-4 border-t">
                  {draft.showQr ? (
                    <div className="w-16 h-16 border rounded flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <span />
                  )}
                  <div className="text-center">
                    <div className="w-24 border-t border-foreground mb-1"></div>
                    <span className="text-xs">Principal's Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Properties & Saved Templates */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input placeholder="Enter template name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select value={draft.exam} onValueChange={(v) => set("exam", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Show QR Code</Label>
                <Switch checked={draft.showQr} onCheckedChange={(v) => set("showQr", v)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Photo</Label>
                <Switch checked={draft.showPhoto} onCheckedChange={(v) => set("showPhoto", v)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Schedule</Label>
                <Switch checked={draft.showSchedule} onCheckedChange={(v) => set("showSchedule", v)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Publish as Active</Label>
                <Switch
                  checked={draft.status === "active"}
                  onCheckedChange={(v) => set("status", v ? "active" : "draft")}
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
                    <p className="text-xs text-muted-foreground">
                      {findExam(template.exam)?.label ?? template.exam}
                    </p>
                  </button>
                  <div className="flex items-center gap-1">
                    <Badge variant={template.status === "active" ? "default" : "secondary"}>
                      {template.status}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicate(template)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this template?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {template.name} will be removed. Cards already generated are unaffected.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => destroy(template)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}