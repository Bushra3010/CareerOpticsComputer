import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { QrCode, Download, Printer, School, Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { qrDataUrl, upiUri } from "@/lib/upi";
import { dataUrlToBytes, downloadZip, printHtml } from "@/lib/export";

type Batch = {
  id: number;
  name: string;
  students: number;
  course: string;
  courseKey: string;
  qrGenerated: boolean;
};

const ALL_KEY = "erp-batch-qr";
const CFG_KEY = "erp-batch-qr-config";

const FEE_TYPES: Record<string, string> = {
  tuition: "Tuition Fee",
  exam: "Exam Fee",
  transport: "Transport Fee",
  library: "Library Fee",
};

/** Batch name -> the `{batch_id}` slug used in the UPI template. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "");

const BatchPaymentQR = () => {
  const { toast } = useToast();
  const [all, setAll] = useState<Batch[]>([]);
  const [config, setConfig] = useState({ course: "all", feeType: "tuition", upiTemplate: "school_{batch_id}@upi", includeBatchName: true, autoGenerate: false });
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ALL_KEY);
      if (raw) setAll(JSON.parse(raw));
      const cfg = localStorage.getItem(CFG_KEY);
      if (cfg) setConfig(JSON.parse(cfg));
    } catch { /* use empty defaults */ }
  }, []);

  const persistAll = (list: Batch[]) => { setAll(list); try { localStorage.setItem(ALL_KEY, JSON.stringify(list)); } catch { } };
  const persistConfig = (next: typeof config) => { setConfig(next); try { localStorage.setItem(CFG_KEY, JSON.stringify(next)); } catch { } };

  const setCfg = <K extends keyof typeof config>(key: K, value: (typeof config)[K]) =>
    persistConfig({ ...config, [key]: value });

  const batches = config.course === "all" ? all : all.filter((b) => b.courseKey === config.course);
  const allSelected = batches.length > 0 && batches.every((b) => selected.includes(b.id));

  const toggle = (id: number) =>
    setSelected((list) => (list.includes(id) ? list.filter((i) => i !== id) : [...list, id]));

  const toggleAll = () =>
    setSelected(allSelected ? [] : batches.map((b) => b.id));

  const upiFor = (batch: Batch) => config.upiTemplate.replace("{batch_id}", slug(batch.name));

  const imageFor = (batch: Batch) =>
    qrDataUrl(
      upiUri({
        upiId: upiFor(batch),
        merchantName: config.includeBatchName ? batch.name : "Fee Collection",
        note: `${FEE_TYPES[config.feeType] ?? config.feeType}${config.includeBatchName ? ` - ${batch.name}` : ""}`,
      }),
    );

  const generateSelected = () => {
    if (!selected.length) {
      toast({ title: "Nothing selected", description: "Tick at least one batch first.", variant: "destructive" });
      return;
    }
    setAll((list) => list.map((b) => (selected.includes(b.id) ? { ...b, qrGenerated: true } : b)));
    toast({ title: "QR codes generated", description: `${selected.length} batch QR code(s) are ready.` });
    setSelected([]);
  };

  const printAll = async () => {
    const ready = batches.filter((b) => b.qrGenerated);
    if (!ready.length) {
      toast({ title: "No QR codes yet", description: "Generate them before printing.", variant: "destructive" });
      return;
    }
    const cards = await Promise.all(
      ready.map(async (b) =>
        `<div class="card" style="text-align:center;page-break-inside:avoid"><img src="${await imageFor(b)}" width="240" height="240" /><p><strong>${b.name}</strong><br/>${upiFor(b)}</p></div>`,
      ),
    );
    printHtml(`${FEE_TYPES[config.feeType] ?? "Fee"} QR Codes`, cards.join(""));
  };

  const downloadOne = async (batch: Batch) => {
    const link = document.createElement("a");
    link.href = await imageFor(batch);
    link.download = `${slug(batch.name)}-qr.png`;
    link.click();
  };

  const downloadAllZip = async () => {
    const ready = all.filter((b) => b.qrGenerated);
    if (!ready.length) {
      toast({ title: "No QR codes yet", description: "Generate them before downloading.", variant: "destructive" });
      return;
    }
    const files = await Promise.all(
      ready.map(async (b) => ({ name: `${slug(b.name)}-qr.png`, data: dataUrlToBytes(await imageFor(b)) })),
    );
    downloadZip("batch-payment-qr-codes.zip", files);
    toast({ title: "Download started", description: `${files.length} QR code(s) bundled.` });
  };

  const printLabels = () =>
    printHtml(
      "Batch Labels",
      `<table><tr><th>Batch</th><th>Course</th><th>Students</th><th>UPI ID</th></tr>${all
        .map((b) => `<tr><td>${b.name}</td><td>${b.course}</td><td>${b.students}</td><td>${upiFor(b)}</td></tr>`)
        .join("")}</table>`,
    );

  const resetAll = () => {
    setAll((list) => list.map((b) => ({ ...b, qrGenerated: false })));
    setSelected([]);
    toast({ title: "QR codes reset", description: "Every batch is back to pending." });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Batch Payment QR"
          description="Generate batch-specific payment QR codes for fee collection"
          breadcrumbs={[
            { label: "Settings", href: "/settings/general" },
            { label: "Batch Payment QR" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Batch QR Configuration
              </CardTitle>
              <CardDescription>
                Configure QR codes for specific batches or generate in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  <Select value={config.course} onValueChange={(v) => setCfg("course", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="cbse">CBSE</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fee Type</Label>
                  <Select value={config.feeType} onValueChange={(v) => setCfg("feeType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition Fee</SelectItem>
                      <SelectItem value="exam">Exam Fee</SelectItem>
                      <SelectItem value="transport">Transport Fee</SelectItem>
                      <SelectItem value="library">Library Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>UPI ID Template</Label>
                <Input placeholder="school_{batch_id}@upi" value={config.upiTemplate} onChange={(e) => setCfg("upiTemplate", e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Use {"{batch_id}"} as placeholder for batch identifier
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Include Batch Name in QR</p>
                  <p className="text-sm text-muted-foreground">Add batch name as payment reference</p>
                </div>
                <Switch checked={config.includeBatchName} onCheckedChange={(v) => setCfg("includeBatchName", v)} />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Auto-generate for New Batches</p>
                  <p className="text-sm text-muted-foreground">Automatically create QR when new batch is added</p>
                </div>
                <Switch checked={config.autoGenerate} onCheckedChange={(v) => setCfg("autoGenerate", v)} />
              </div>

              {/* Batch Selection Table */}
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="select-all" checked={allSelected} onCheckedChange={toggleAll} />
                      <Label htmlFor="select-all" className="font-medium">Select All Batches</Label>
                    </div>
                    <Badge variant="secondary">
                      {batches.length} Batches
                    </Badge>
                  </div>
                </div>
                <div className="divide-y">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox id={`batch-${batch.id}`} checked={selected.includes(batch.id)} onCheckedChange={() => toggle(batch.id)} />
                        <div>
                          <p className="font-medium">{batch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.course} • {batch.students} students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {batch.qrGenerated ? (
                          <>
                            <Badge variant="default" className="gap-1">
                              <QrCode className="h-3 w-3" />
                              Generated
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => downloadOne(batch)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateSelected}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Selected{selected.length > 0 && ` (${selected.length})`}
                </Button>
                <Button variant="outline" onClick={printAll}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print All QR Codes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Batches</span>
                  <span className="font-semibold">{batches.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">QR Generated</span>
                  <span className="font-semibold text-primary">
                    {batches.filter(b => b.qrGenerated).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold text-orange-600">
                    {batches.filter(b => !b.qrGenerated).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Students</span>
                  <span className="font-semibold">
                    {batches.reduce((sum, b) => sum + b.students, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={downloadAllZip}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All as ZIP
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={printLabels}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Batch Labels
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive" onClick={resetAll}>
                  Reset All QR Codes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BatchPaymentQR;
