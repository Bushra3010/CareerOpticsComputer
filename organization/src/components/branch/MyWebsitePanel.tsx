import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Globe, ImagePlus, Loader2, MessageCircle, Save, Send, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DNS_A_RECORD,
  DNS_CNAME_TARGET,
  DOMAIN_STATUS_LABEL,
  hostnameError,
  normaliseHost,
  siteLink,
  slugError,
  type DomainStatus,
} from "@/lib/branchSite";
import { isSlugAvailable, requestDomain, saveSiteContent } from "@/lib/supabase/branchSites";
import { uploadGalleryImage } from "@/lib/supabase/gallery";

/** The fields of the Website Settings form this panel reads and edits. */
export type SiteForm = Record<string, unknown>;

const STATUS_STYLE: Record<DomainStatus, string> = {
  NONE: "border-border bg-muted text-muted-foreground",
  PENDING: "border-warning/25 bg-warning/12 text-warning",
  LIVE: "border-success/25 bg-success/12 text-success",
  ERROR: "border-destructive/25 bg-destructive/12 text-destructive",
};

type Availability = "idle" | "checking" | "free" | "taken" | "unknown";

/**
 * A centre's own website, at the top of Website Settings: its free link, the
 * link's name, the words and pictures on it, and the way to bring its own
 * domain. It edits the page's form state (so the page's Save sends the same
 * values) and saves its own part with its own button.
 */
export function MyWebsitePanel({
  branchId,
  form,
  set,
}: {
  branchId: string;
  form: SiteForm;
  set: (key: string, value: unknown) => void;
}) {
  const { toast } = useToast();
  const text = (key: string) => (form[key] == null ? "" : String(form[key]));
  /** The link as saved -- what the free link shows -- not what is being typed. */
  const [savedSlug, setSavedSlug] = useState<string>(text("slug"));
  const [availability, setAvailability] = useState<Availability>("idle");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"" | "logo" | "banner">("");
  const [domain, setDomain] = useState<string>(text("customDomain"));
  const [requesting, setRequesting] = useState(false);
  const [copied, setCopied] = useState(false);

  // The row arrives after the first render; what it holds is the saved link.
  useEffect(() => {
    if (!savedSlug && text("slug")) setSavedSlug(text("slug"));
  }, [text("slug"), savedSlug]);
  useEffect(() => {
    setDomain(text("customDomain"));
  }, [text("customDomain")]);

  const slug: string = text("slug");
  const slugProblem = slug ? slugError(slug) : null;
  const link = savedSlug ? siteLink(savedSlug) : "";
  const status: DomainStatus = (["PENDING", "LIVE", "ERROR"].includes(text("domainStatus")) ? text("domainStatus") : "NONE") as DomainStatus;
  const domainProblem = domain ? hostnameError(domain) : null;

  // Asked as the centre types, once it pauses; a link that is already its own needs no asking.
  useEffect(() => {
    if (!slug || slugProblem || slug === savedSlug) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    let cancelled = false;
    const timer = setTimeout(() => {
      isSlugAvailable(slug, branchId)
        .then((free) => !cancelled && setAvailability(free ? "free" : "taken"))
        .catch(() => !cancelled && setAvailability("unknown"));
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, slugProblem, branchId, savedSlug]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Could not copy", description: link });
    }
  };

  const shareText = `Visit our centre's website: ${link}`;

  const save = async () => {
    if (slugProblem) {
      toast({ title: "Check the website link", description: slugProblem, variant: "destructive" });
      return;
    }
    if (availability === "taken") {
      toast({ title: "That link is taken", description: "Please choose another link name.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const result = await saveSiteContent(branchId, {
        ...(slug ? { slug } : {}),
        bannerTitle: text("bannerTitle"),
        bannerSubtitle: text("bannerSubtitle"),
        aboutText: text("aboutText"),
        highlights: text("highlights"),
        logo: text("logo"),
        banner: text("banner"),
      });
      const saved = (result.data as SiteForm | null)?.slug as string | undefined;
      if (saved) {
        setSavedSlug(saved);
        set("slug", saved);
      }
      setAvailability("idle");
      if (result.droppedColumns?.length) {
        toast({
          title: "Some fields could not be saved",
          description: `${result.droppedColumns.join(", ")} - run supabase/schema/branch-sites.sql.`,
          variant: "destructive",
        });
      } else {
        toast({ title: "Website saved", description: "Your changes are live on your website." });
      }
    } catch (error) {
      toast({ title: "Could not save", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const pick = (field: "logo" | "banner") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(field);
      try {
        set(field, await uploadGalleryImage(file, branchId));
        toast({ title: field === "logo" ? "Logo uploaded" : "Banner uploaded", description: "Press Save website to publish it." });
      } catch (error) {
        toast({ title: "Upload failed", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
      } finally {
        setUploading("");
      }
    };
    input.click();
  };

  const request = async (withdraw = false) => {
    if (!withdraw && domainProblem) {
      toast({ title: "Check the domain", description: domainProblem, variant: "destructive" });
      return;
    }
    setRequesting(true);
    try {
      const result = await requestDomain(branchId, withdraw ? null : normaliseHost(domain));
      set("customDomain", result.customDomain || "");
      set("domainStatus", result.domainStatus);
      toast(
        withdraw
          ? { title: "Domain request withdrawn" }
          : { title: "Request sent", description: "The head office will connect your domain once your DNS points to us." },
      );
    } catch (error) {
      toast({ title: "Could not send the request", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setRequesting(false);
    }
  };

  const ImageField = ({ field, label, hint }: { field: "logo" | "banner"; label: string; hint: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
        {text(field) ? (
          <img src={text(field)} alt={`${label} preview`} className={field === "logo" ? "h-14 w-14 rounded object-contain" : "h-14 w-28 rounded object-cover"} />
        ) : (
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
        )}
        <div className="flex-1 text-xs text-muted-foreground">{hint}</div>
        <Button type="button" variant="outline" size="sm" onClick={() => pick(field)} disabled={!!uploading}>
          {uploading === field ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {text(field) ? "Replace" : "Upload"}
        </Button>
        {text(field) ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => set(field, "")} aria-label={`Remove ${label}`}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <Card className="mb-6 border-brand/30">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> My Website
          </CardTitle>
          <CardDescription>Your centre's own website, free. Share the link with students and on social media.</CardDescription>
        </div>
        <Button className="gap-2" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save website
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {form.siteEnabled === false && (
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            Your website is switched off by the head office. Contact them through Help &amp; Support.
          </p>
        )}

        <div className="rounded-xl border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your free website link</p>
          {link ? (
            <>
              <a href={link} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-lg font-semibold text-brand-ink hover:underline" data-testid="site-link">
                {link}
              </a>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={copy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open
                  </a>
                </Button>
                <Button type="button" size="sm" className="gap-2 bg-[#25D366] text-white hover:bg-[#1ebe5b]" asChild>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Your link appears here once it is saved.</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteSlug">Link name</Label>
              <div className="flex items-center gap-2">
                <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">…/c/</span>
                <Input
                  id="siteSlug"
                  value={slug}
                  maxLength={40}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  aria-invalid={!!slugProblem || availability === "taken"}
                  aria-describedby="siteSlugHelp"
                />
              </div>
              <p id="siteSlugHelp" className="text-xs" aria-live="polite">
                {slugProblem ? (
                  <span className="text-destructive">{slugProblem}</span>
                ) : availability === "checking" ? (
                  <span className="text-muted-foreground">Checking…</span>
                ) : availability === "free" ? (
                  <span className="text-success">Available</span>
                ) : availability === "taken" ? (
                  <span className="text-destructive">Already taken by another centre</span>
                ) : (
                  <span className="text-muted-foreground">Lowercase letters, numbers and hyphens, 3–40 characters. Changing it changes your link.</span>
                )}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Headline</Label>
              <Input id="heroTitle" value={text("bannerTitle")} maxLength={120} placeholder="e.g. Learn computers with confidence" onChange={(e) => set("bannerTitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Sub-headline</Label>
              <Input id="heroSubtitle" value={text("bannerSubtitle")} maxLength={200} placeholder="e.g. ADCA, DCA, Tally and more — admissions open" onChange={(e) => set("bannerSubtitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutText">About your centre</Label>
              <Textarea id="aboutText" rows={4} value={text("aboutText")} maxLength={2000} onChange={(e) => set("aboutText", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highlights">Highlights (one per line)</Label>
              <Textarea id="highlights" rows={4} value={text("highlights")} maxLength={1200} placeholder={"Air-conditioned computer lab\nMorning and evening batches\nSpecial classes for girls"} onChange={(e) => set("highlights", e.target.value)} />
            </div>
            <ImageField field="logo" label="Logo" hint="Square, PNG or JPG. Shown in the header and on shared links." />
            <ImageField field="banner" label="Banner photo" hint="A wide photo of your centre, about 1600×600." />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Use your own domain</h3>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`} data-testid="domain-status">
                  {DOMAIN_STATUS_LABEL[status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Already own a domain like <b>mycentre.com</b>? Point it to us and your website opens there too.
              </p>
              <div className="mt-3 space-y-2">
                <Label htmlFor="customDomain">Your domain</Label>
                <Input
                  id="customDomain"
                  value={domain}
                  placeholder="mycentre.com"
                  onChange={(e) => setDomain(e.target.value)}
                  aria-invalid={!!domainProblem}
                />
                {domainProblem ? <p className="text-xs text-destructive">{domainProblem}</p> : null}
                {text("domainMessage") && status !== "NONE" ? <p className="text-xs text-muted-foreground">{text("domainMessage")}</p> : null}
              </div>

              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
                <li>Sign in where you bought the domain (GoDaddy, Hostinger, BigRock …) and open its DNS settings.</li>
                <li>
                  Add these two records (delete any old <b>A</b> record on <b>@</b> first):
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[320px] text-left text-xs" aria-label="DNS records">
                      <thead className="text-muted-foreground">
                        <tr><th className="py-1 pr-3">Type</th><th className="py-1 pr-3">Name / Host</th><th className="py-1">Value / Points to</th></tr>
                      </thead>
                      <tbody className="font-mono">
                        <tr className="border-t"><td className="py-1.5 pr-3">A</td><td className="py-1.5 pr-3">@</td><td className="py-1.5">{DNS_A_RECORD}</td></tr>
                        <tr className="border-t"><td className="py-1.5 pr-3">CNAME</td><td className="py-1.5 pr-3">www</td><td className="py-1.5">{DNS_CNAME_TARGET}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </li>
                <li>Press <b>Request connection</b>. The head office connects it; DNS changes can take a few hours.</li>
              </ol>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" className="gap-2" onClick={() => request(false)} disabled={requesting || !domain || !!domainProblem}>
                  {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Request connection
                </Button>
                {text("customDomain") ? (
                  <Button type="button" variant="outline" onClick={() => request(true)} disabled={requesting}>
                    Withdraw
                  </Button>
                ) : null}
              </div>
              {status === "LIVE" && text("customDomain") ? (
                <a href={`https://${text("customDomain")}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
                  <ExternalLink className="h-4 w-4" /> https://{text("customDomain")}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
