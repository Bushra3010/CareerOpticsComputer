import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Image, Share2, Upload, Save, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { pickImage } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getBranchSettings, updateBranchSettings } from "@/lib/supabase/data";

/**
 * Every field the form edits, not just the seven that used to be here - the rest
 * started life as `undefined`, which makes their inputs uncontrolled on first
 * render and made `set` untypeable against this object.
 *
 * Only the first block exists on `branch_settings` today; the rest need
 * supabase/schema/add-website-settings-fields.sql. `updateBranchSettings` drops
 * whatever the table does not have yet rather than failing the save.
 */
const DEFAULTS = {
  siteName: "",
  tagline: "",
  seoDescription: "",
  seoKeywords: "",
  primaryDomain: "",
  subdomain: "",
  enableSsl: true,

  logo: "",
  favicon: "",
  banner: "",
  bannerTitle: "",
  bannerSubtitle: "",
  wwwRedirect: true,
  email: "",
  phone: "",
  address: "",
  onlineAdmissions: true,
  onlineFees: true,
  studentPortal: true,
  parentPortal: false,
  registrationDate: "",
  expiryDate: "",
  renewalDate: "",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  whatsapp: "",
};

const STORAGE_KEY = "erp-website-settings";

export default function BranchWebsiteSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<Record<string, any>>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    async function loadSettings() {
      try {
        const result = await getBranchSettings(user?.branchId || "");
        if (!cancelled && result.data) {
          setForm({ ...DEFAULTS, ...result.data });
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Failed to load settings",
            description: error instanceof Error ? error.message : undefined,
            variant: "destructive",
          });
        }
      }
    }
    loadSettings();
    return () => { cancelled = true; };
  }, [toast, user?.branchId]);

  const persist = (next: Record<string, any>) => {
    setForm(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* quota */ }
  };

  const set = <K extends keyof typeof DEFAULTS>(key: K, value: (typeof DEFAULTS)[K]) =>
    persist({ ...form, [key]: value });

  const upload = async (field: "logo" | "favicon" | "banner", accept: string) => {
    const picked = await pickImage(accept);
    if (picked === "too-large") {
      toast({ title: "File too large", description: "Images must be 5MB or smaller.", variant: "destructive" });
      return;
    }
    if (!picked) return;
    set(field, picked.dataUrl);
    toast({ title: "Image uploaded", description: picked.name });
  };

  const save = async () => {
    if (!form.siteName.trim()) {
      toast({ title: "Website name required", description: "Give the site a name before saving.", variant: "destructive" });
      return;
    }
    try {
      // Send the whole form. This used to send only seven fields, so contact
      // details, social links, banner copy, the portal toggles and the domain
      // dates were edited and then silently discarded on every save.
      const payload = Object.fromEntries(
        Object.keys(DEFAULTS).map((key) => [key, form[key] ?? (DEFAULTS as Record<string, unknown>)[key]]),
      );
      const result = await updateBranchSettings(user?.branchId || "", payload);
      if (result.droppedColumns?.length) {
        toast({
          title: "Some fields could not be saved",
          description: `${result.droppedColumns.join(", ")} - run supabase/schema/add-website-settings-fields.sql.`,
          variant: "destructive",
        });
      }
      toast({ title: "Website settings saved", description: `${form.siteName} updated.` });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  /** Uploaded preview, or the dashed drop zone when nothing is set yet. */
  const Dropzone = ({ field, hint, accept }: { field: "logo" | "favicon" | "banner"; hint: string; accept: string }) => (
    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
      {form[field] ? (
        <img src={form[field]} alt={`${field} preview`} className="mx-auto mb-2 max-h-24 object-contain" />
      ) : (
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      )}
      <p className="text-sm text-muted-foreground mb-2">{hint}</p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => upload(field, accept)}>
          {form[field] ? "Replace File" : "Choose File"}
        </Button>
        {form[field] && (
          <Button variant="ghost" size="sm" onClick={() => set(field, "")}>Remove</Button>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Website Settings"
        description="Configure your branch website appearance and content"
        breadcrumbs={[
          { label: "Branch Management", href: "/branch/view" },
          { label: "Website Settings" },
        ]}
        actions={
          <Button className="gap-2" onClick={save}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>

          <TabsTrigger value="media" className="gap-2">
            <Image className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure your website's basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Website Name</Label>
                  <Input id="siteName" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Meta Description</Label>
                  <Textarea id="description" rows={3} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Meta Keywords</Label>
                  <Input id="keywords" value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain & URL Settings</CardTitle>
                <CardDescription>Configure your website URL settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryDomain">Primary Domain</Label>
                  <Input id="primaryDomain" value={form.primaryDomain} onChange={(e) => set("primaryDomain", e.target.value)} />
                  {form.primaryDomain ? (
                    <a
                      href={`https://${form.primaryDomain.replace(/^https?:\/\//, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline break-all"
                    >
                      https://{form.primaryDomain.replace(/^https?:\/\//, "")}
                    </a>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Branch Subdomain</Label>
                  <div className="flex gap-2">
                    <Input id="subdomain" value={form.subdomain} onChange={(e) => set("subdomain", e.target.value)} />
                    <span className="flex items-center text-muted-foreground">.abcschool.edu</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SSL Certificate</Label>
                    <p className="text-xs text-muted-foreground">Enable HTTPS for your website</p>
                  </div>
                  <Switch checked={form.enableSsl} onCheckedChange={(v) => set("enableSsl", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>WWW Redirect</Label>
                    <p className="text-xs text-muted-foreground">Redirect www to non-www</p>
                  </div>
                  <Switch checked={form.wwwRedirect} onCheckedChange={(v) => set("wwwRedirect", v)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Display contact details on your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Website Features</CardTitle>
                <CardDescription>Enable or disable website features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Online Admissions</Label>
                    <p className="text-xs text-muted-foreground">Allow online admission applications</p>
                  </div>
                  <Switch checked={form.onlineAdmissions} onCheckedChange={(v) => set("onlineAdmissions", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Online Fee Payment</Label>
                    <p className="text-xs text-muted-foreground">Enable online fee collection</p>
                  </div>
                  <Switch checked={form.onlineFees} onCheckedChange={(v) => set("onlineFees", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Student Portal</Label>
                    <p className="text-xs text-muted-foreground">Access to student dashboard</p>
                  </div>
                  <Switch checked={form.studentPortal} onCheckedChange={(v) => set("studentPortal", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parent Portal</Label>
                    <p className="text-xs text-muted-foreground">Access to parent dashboard</p>
                  </div>
                  <Switch checked={form.parentPortal} onCheckedChange={(v) => set("parentPortal", v)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>View your registration and validity information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="registrationDate">Registration Date</Label>
                    <div className="relative">
                      <DatePicker value={form.registrationDate} onChange={(v) => set("registrationDate", v)} id="registrationDate" />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <div className="relative">
                      <DatePicker value={form.expiryDate} onChange={(v) => set("expiryDate", v)} id="expiryDate" />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renewalDate">Renewal Date</Label>
                    <div className="relative">
                      <DatePicker value={form.renewalDate} onChange={(v) => set("renewalDate", v)} id="renewalDate" />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="media">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Favicon</CardTitle>
                <CardDescription>Upload your brand assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Website Logo</Label>
                  <Dropzone field="logo" hint="Upload logo (PNG, SVG)" accept="image/png,image/svg+xml" />
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <Dropzone field="favicon" hint="Upload favicon (ICO, PNG)" accept="image/png,image/x-icon" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Banner</CardTitle>
                <CardDescription>Configure homepage hero section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  <Dropzone field="banner" hint="Upload banner (1920x600)" accept="image/*" />
                </div>
                <div className="space-y-2">
                  <Label>Banner Title</Label>
                  <Input value={form.bannerTitle} onChange={(e) => set("bannerTitle", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Banner Subtitle</Label>
                  <Input value={form.bannerSubtitle} onChange={(e) => set("bannerSubtitle", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input placeholder="https://facebook.com/yourpage" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input placeholder="https://twitter.com/yourhandle" value={form.twitter} onChange={(e) => set("twitter", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input placeholder="https://instagram.com/yourprofile" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input placeholder="https://linkedin.com/company/yourcompany" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>YouTube</Label>
                  <Input placeholder="https://youtube.com/yourchannel" value={form.youtube} onChange={(e) => set("youtube", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input placeholder="+91 98765 43210" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
