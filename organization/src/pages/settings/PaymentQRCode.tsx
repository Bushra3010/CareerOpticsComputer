import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Upload, Download, Eye, Trash2 } from "lucide-react";
import { qrDataUrl, upiUri } from "@/lib/upi";
import { pickImage, printHtml } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

type SavedQr = {
  id: string;
  name: string;
  upiId: string;
  merchantName: string;
  paymentType: string;
  amount: string;
  description: string;
  isActive: boolean;
  isPrimary: boolean;
  uploadedImage?: string;
};

const SEED: SavedQr[] = [
  { id: "qr-main", name: "Main Account UPI", upiId: "school@upi", merchantName: "ABC International School", paymentType: "dynamic", amount: "", description: "General collection", isActive: true, isPrimary: true },
  { id: "qr-fee", name: "Fee Collection", upiId: "schoolfee@paytm", merchantName: "ABC International School", paymentType: "dynamic", amount: "", description: "Tuition fees", isActive: true, isPrimary: false },
  { id: "qr-hostel", name: "Hostel Fees", upiId: "hostel@upi", merchantName: "ABC International School", paymentType: "static", amount: "25000", description: "Hostel charges", isActive: false, isPrimary: false },
];

const STORAGE_KEY = "erp-payment-qr";

const BLANK = {
  name: "",
  upiId: "",
  merchantName: "",
  paymentType: "dynamic" as "dynamic" | "static",
  amount: "",
  description: "",
  isPrimary: false,
};

const newQrId = () => `qr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const PaymentQRCode = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<SavedQr[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* fall through */ }
    return SEED;
  });
  const [form, setForm] = useState<typeof BLANK>(BLANK);
  const [upload, setUpload] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ image: string; label: string } | null>(null);

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (upload) {
      setPreview({ image: upload, label: form.name || "Uploaded QR" });
      return;
    }
    if (!form.upiId) {
      setPreview(null);
      return;
    }
    let live = true;
    qrDataUrl(upiUri({ upiId: form.upiId, merchantName: form.merchantName || form.name || "Merchant", amount: form.amount, note: form.description }))
      .then((image) => live && setPreview({ image, label: form.name || form.upiId }))
      .catch(() => live && setPreview(null));
    return () => { live = false; };
  }, [upload, form.upiId, form.merchantName, form.name, form.amount, form.description]);

  const chooseImage = async () => {
    const picked = await pickImage("image/png,image/jpeg");
    if (picked === "too-large") {
      toast({ title: "File too large", description: "QR images must be 5MB or smaller.", variant: "destructive" });
      return;
    }
    if (picked) setUpload(picked.dataUrl);
  };

  const generate = () => {
    if (!form.name.trim() || (!form.upiId.trim() && !upload)) {
      toast({ title: "Missing details", description: "A name and either a UPI ID or an uploaded image are required.", variant: "destructive" });
      return;
    }
    const record: SavedQr = { ...form, id: newQrId(), isActive: true, uploadedImage: upload ?? undefined };
    setItems((list) => [record, ...(record.isPrimary ? list.map((q) => ({ ...q, isPrimary: false })) : list)]);
    setForm(BLANK);
    setUpload(null);
    toast({ title: "QR code created", description: `${record.name} is ready to collect payments.` });
  };

  const imageFor = async (qr: SavedQr) =>
    qr.uploadedImage ??
    (await qrDataUrl(upiUri({ upiId: qr.upiId, merchantName: qr.merchantName || qr.name, amount: qr.amount, note: qr.description })));

  const download = async (name: string, image: string) => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `${name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.click();
  };

  const print = (name: string, subtitle: string, image: string) =>
    printHtml(name, `<div class="card" style="text-align:center"><img src="${image}" width="320" height="320" /><p>${subtitle}</p></div>`);

  const setPrimary = (id: string) =>
    setItems((list) => list.map((q) => ({ ...q, isPrimary: q.id === id })));

  const remove = (id: string) => {
    setItems((list) => list.filter((q) => q.id !== id));
    toast({ title: "QR code deleted" });
  };

  const update = (id: string, changes: Partial<SavedQr>) => {
    setItems((list) => list.map((q) => (q.id === id ? { ...q, ...changes } : q)));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Payment QR Code"
          description="Configure UPI QR codes for payment collection"
          breadcrumbs={[
            { label: "Settings", href: "/settings/general" },
            { label: "Payment QR Code" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Create QR Code
              </CardTitle>
              <CardDescription>
                Generate a new payment QR code for fee collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-name">QR Code Name</Label>
                <Input id="qr-name" placeholder="e.g., Main Fee Collection" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input id="upi-id" placeholder="e.g., school@upi" value={form.upiId} onChange={(e) => set("upiId", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchant-name">Merchant Name</Label>
                <Input id="merchant-name" placeholder="School Name" value={form.merchantName} onChange={(e) => set("merchantName", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-type">Payment Type</Label>
                <Select value={form.paymentType} onValueChange={(v) => set("paymentType", v as "dynamic" | "static")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static QR (Fixed Amount)</SelectItem>
                    <SelectItem value="dynamic">Dynamic QR (Variable Amount)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Default Amount (Optional)</Label>
                <Input id="amount" type="number" placeholder="0.00" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Payment Description</Label>
                <Textarea id="description" placeholder="Fee payment for..." value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Set as Primary</p>
                  <p className="text-sm text-muted-foreground">Use as default payment QR</p>
                </div>
                <Switch checked={form.isPrimary} onCheckedChange={(v) => set("isPrimary", v)} />
              </div>

              <div className="space-y-2">
                <Label>Or Upload Existing QR</Label>
                <button
                  type="button"
                  onClick={chooseImage}
                  className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {upload ? "Image attached - click to replace" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </button>
                {upload && (
                  <Button variant="ghost" size="sm" onClick={() => setUpload(null)}>
                    Remove uploaded image
                  </Button>
                )}
              </div>

              <Button className="w-full" onClick={generate}>Generate QR Code</Button>
            </CardContent>
          </Card>

          {/* QR Preview */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Preview</CardTitle>
              <CardDescription>
                Preview of the generated QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                {preview ? (
                  <img src={preview.image} alt="Payment QR code" className="h-full w-full object-contain bg-white" />
                ) : (
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {preview ? preview.label : "Enter a UPI ID to see the QR code"}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={!preview} onClick={() => preview && download(preview.label, preview.image)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" disabled={!preview} onClick={() => preview && print(preview.label, form.upiId, preview.image)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Existing QR Codes</CardTitle>
            <CardDescription>Manage your payment QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">No QR codes yet. Create one above.</p>
              )}
              {items.map((qr) => (
                <div key={qr.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <button type="button" className="flex items-center gap-4 text-left" onClick={() => setPrimary(qr.id)}>
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {qr.name}
                        {qr.isPrimary && <span className="ml-2 text-xs text-primary">Primary</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{qr.upiId}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-4">
                    <Switch checked={qr.isActive} onCheckedChange={(v) => update(qr.id, { isActive: v })} />
                    <Button variant="ghost" size="icon" onClick={async () => download(qr.name, await imageFor(qr))}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={async () => print(qr.name, qr.upiId, await imageFor(qr))}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => remove(qr.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PaymentQRCode;
