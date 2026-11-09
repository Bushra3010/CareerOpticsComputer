import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { BranchInfoSection } from "@/components/branch/BranchInfoSection";
import { AddressSection } from "@/components/branch/AddressSection";
import { ContactSection } from "@/components/branch/ContactSection";
import { DirectorInfoSection } from "@/components/branch/DirectorInfoSection";
import { BranchSpaceSection } from "@/components/branch/BranchSpaceSection";
import { BranchDocumentsSection } from "@/components/branch/BranchDocumentsSection";
import { BranchAdminSection } from "@/components/branch/BranchAdminSection";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  createBranchWithDetails,
  createBranchLogin,
  getBranches,
  getFranchiseLead,
  logFranchiseActivity,
  updateFranchiseLead,
  type FranchiseLead,
} from "@/lib/supabase/data";
import { canonicalState } from "@/data/indianStates";
import { storedChoice } from "@/lib/choices";

interface Branch {
  id: string;
  code: string;
}

/** Fields the register cannot do without, in the order they appear on the page. */
const REQUIRED: Array<[string, string]> = [
  ["branchName", "Branch Name"],
  ["branchCode", "Branch Code"],
  ["instituteType", "Institute Type"],
  ["academicYear", "Academic Year"],
  ["address", "Street Address"],
  ["state", "State"],
  ["district", "District"],
  ["city", "City"],
  ["pincode", "Pincode"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["directorName", "Director Name"],
  ["directorGender", "Gender"],
  ["directorDOB", "Date of Birth"],
  ["adminName", "Admin Name"],
  ["adminUsername", "Admin Username"],
  ["adminPassword", "Admin Password"],
];

/** The enum members these two fields have; anything else was typed in. */
const INSTITUTE_TYPES = ["computer", "typing", "paramedical", "other"];
const GENDERS = ["male", "female", "other"];

/** Legacy free-text entries may still be slugged or lowercase. */
const titleCase = (value: string) =>
  value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CreateBranch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [saving, setSaving] = useState(false);

  // Converting a franchise lead: Franchise Leads opens this page as /branch/create?lead=<id>,
  // and the lead's answers fill the form. Saving the branch marks the lead Converted.
  const [params] = useSearchParams();
  const leadId = params.get("lead");
  const [lead, setLead] = useState<FranchiseLead | null>(null);
  const [leadLoading, setLeadLoading] = useState(Boolean(leadId));
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!leadId) return;
    getFranchiseLead(leadId)
      .then((r) => {
        if (!r.data) {
          toast({ title: "Lead not found", description: "Filling the form by hand.", variant: "destructive" });
          return;
        }
        if (r.data.branchId) {
          toast({ title: "This lead is already a franchise", description: "A branch was created from it before. Check All Franchises first." });
        }
        setLead(r.data);
      })
      .catch((error) => toast({ title: "Could not load the lead", description: error instanceof Error ? error.message : undefined, variant: "destructive" }))
      .finally(() => setLeadLoading(false));
  }, [leadId, toast]);

  // The plain inputs are uncontrolled, so the lead's answers are written into them once the form is up.
  useEffect(() => {
    const form = formRef.current;
    if (!lead || !form) return;
    const fill: Record<string, string> = {
      phone: lead.phone,
      whatsappNumber: lead.whatsapp,
      email: lead.email,
      directorName: lead.directorName,
      adminName: lead.directorName,
      adminPhone: lead.phone,
      adminEmail: lead.email,
      numComputers: lead.computers != null ? String(lead.computers) : "",
    };
    for (const [name, v] of Object.entries(fill)) {
      const input = form.elements.namedItem(name);
      if (v && input instanceof HTMLInputElement && !input.value) input.value = v;
    }
  }, [lead]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const result = await getBranches(user?.organizationId || null);
        setBranches((result.data ?? []) as Branch[]);
      } catch (error) {
        // An empty dropdown is indistinguishable from a failed load, so say which.
        toast({
          title: "Could not load existing branches",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      }
    };
    fetchBranches();
  }, [user?.organizationId]);

  // The sections are uncontrolled, so the form itself is the source of truth -
  // `FormData` reads every named input, textarea, Select and Switch in one go.
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    const missing = REQUIRED.filter(([key]) => !value(key)).map(([, label]) => label);
    if (missing.length) {
      toast({
        title: "Fill the required fields",
        description: missing.join(", "),
        variant: "destructive",
      });
      return;
    }

    const code = value("branchCode").toUpperCase();
    if (branches.some((branch) => branch.code.toUpperCase() === code)) {
      toast({
        title: "Branch code already used",
        description: `${code} belongs to an existing branch. Pick another code.`,
        variant: "destructive",
      });
      return;
    }
    if (!/^\d{6}$/.test(value("pincode"))) {
      toast({ title: "Pincode must be 6 digits", variant: "destructive" });
      return;
    }
    // A browser can fill the admin's own saved login into this form; a branch
    // must never be given the signed-in account's login.
    const loginId = value("adminUsername").toLowerCase();
    if (user?.email && (loginId === user.email.toLowerCase() || loginId === user.email.split("@")[0].toLowerCase())) {
      toast({
        title: "That is your own login",
        description: "Give the branch a login ID of its own, e.g. its branch code.",
        variant: "destructive",
      });
      return;
    }
    if (value("adminPassword").length < 6) {
      toast({
        title: "Admin password is too short",
        description: "Use at least 6 characters - this is the branch's login password.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.organizationId) {
      toast({ title: "No organization assigned", variant: "destructive" });
      setSaving(false);
      return;
    }
    setSaving(true);
    // An upload tile hands over its file as JSON beside its name; a slot left
    // empty is left out, so the column stays null.
    const fileOf = (key: string): Record<string, unknown> => {
      try {
        const file = JSON.parse(value(`${key}File`) || "null");
        return file?.dataUrl ? file : {};
      } catch {
        return {};
      }
    };
    const files = (pairs: Array<[string, string]>) =>
      Object.fromEntries(pairs.map(([column, key]) => [column, fileOf(key)]).filter(([, file]) => Object.keys(file as object).length));
    // Branch details live across three tables: the branch itself, its address
    // and its director. Enum columns take the uppercase form of the select value.
    createBranchWithDetails(user.organizationId, {
      branch: {
        name: value("branchName"),
        code,
        branchType: (value("branchType") || "sub").toUpperCase(),
        // A known type goes in as the enum member; one that was typed goes in
        // as it was written, rather than shouted as "COACHING CENTRE".
        instituteType: storedChoice(value("instituteType"), INSTITUTE_TYPES),
        academicYear: value("academicYear"),
        establishedYear: Number(value("establishedYear")) || null,
        website: value("website") || null,
        description: value("description") || null,
        phone: value("phone"),
        altPhone: value("altPhone") || null,
        whatsappNumber: value("whatsappNumber") || null,
        email: value("email"),
        numComputers: Number(value("numComputers")) || 0,
        numFaculty: Number(value("numFaculty")) || 0,
        numRooms: Number(value("numRooms")) || 0,
        isActive: Boolean(data.get("activeStatus")),
        onlineEnrollment: Boolean(data.get("onlineEnrollment")),
        smsNotifications: Boolean(data.get("smsNotifications")),
        emailNotifications: Boolean(data.get("emailNotifications")),
        onlineFeePayment: Boolean(data.get("onlineFeePayment")),
        studentPortal: Boolean(data.get("studentPortal")),
        parentPortal: Boolean(data.get("parentPortal")),
        ...files([
          ["branchMohar", "mohar"],
          ["branchPhoto", "branchPhoto"],
          ["labPhoto", "labPhoto"],
          ["statusDocument", "statusDocument"],
          ["branchLogo", "branchLogo"],
        ]),
      },
      address: {
        streetAddress: value("address"),
        state: canonicalState(value("state")),
        district: value("district"),
        block: value("block") || null,
        city: value("city"),
        pincode: value("pincode"),
        mapLink: value("mapLink") || null,
        latitude: value("latitude") ? Number(value("latitude")) : null,
        longitude: value("longitude") ? Number(value("longitude")) : null,
        country: titleCase(value("country")) || "India",
      },
      director: {
        name: value("directorName"),
        gender: storedChoice(value("directorGender"), GENDERS),
        dob: new Date(value("directorDOB")).toISOString(),
        bloodGroup: value("directorBloodGroup") || null,
        ...files([
          ["photo", "directorPhoto"],
          ["signature", "directorSignature"],
          ["aadharFront", "aadharFront"],
          ["aadharBack", "aadharBack"],
        ]),
      },
      // Without a registration date, the first of the expiry month stands in.
      license: value("expiryDate")
        ? {
            registrationDate: new Date(value("registrationDate") || `${value("expiryDate").slice(0, 7)}-01`).toISOString(),
            validDate: value("validDate") ? new Date(value("validDate")).toISOString() : null,
            expiryDate: new Date(value("expiryDate")).toISOString(),
            referralCode: value("referralCode") || null,
          }
        : undefined,
    }).then(async (created) => {
      // The branch exists now; its login is a separate step, so a failure here
      // is reported on its own rather than losing the branch.
      try {
        const login = await createBranchLogin({
          branchId: created.data.id as string,
          username: value("adminUsername"),
          password: value("adminPassword"),
          name: value("adminName"),
          email: value("adminEmail"),
          phone: value("adminPhone"),
        });
        toast({
          title: "Branch created",
          description: `${value("branchName")} (${code}) is on the register. Login ID: ${login.data.username}`,
        });
      } catch (error) {
        toast({
          title: "Branch created, login was not",
          description: error instanceof Error ? error.message : "Could not create the branch login.",
          variant: "destructive",
        });
      }
      // The lead this branch came from is now a franchise: link it and close it as Converted.
      if (lead) {
        try {
          await updateFranchiseLead(lead.id, { status: "Converted", branchId: created.data.id });
          await logFranchiseActivity({
            leadId: lead.id,
            kind: "Converted to franchise",
            status: "Converted",
            note: `${value("branchName")} (${code}) created`,
            actorId: user?.id ?? null,
          }).catch(() => undefined);
        } catch (error) {
          toast({
            title: "Branch created, lead not updated",
            description: `Mark ${lead.leadNo} as Converted in Franchise Leads. ${error instanceof Error ? error.message : ""}`,
            variant: "destructive",
          });
        }
      }
      navigate("/branch/view");
    }).catch((error: unknown) => {
      toast({
        title: "Failed to create branch",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
      setSaving(false);
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Create Branch"
        description={lead ? `Converting franchise lead ${lead.leadNo} — ${lead.directorName}` : "Add a new branch to your institution"}
        breadcrumbs={[
          { label: "Branch Management", href: "/branch/view" },
          { label: "Create Branch" },
        ]}
      />

      {lead && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <p className="font-semibold">Filled from franchise lead {lead.leadNo}</p>
          <p className="mt-1 text-muted-foreground">
            Director, contact and address came from the lead. Add the <b>Branch Name</b> and <b>Branch Code</b>, check the rest,
            set the branch login password, then Create Branch — the lead is marked Converted and linked to the new branch.
          </p>
        </div>
      )}

      {leadLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading the lead…</p>
      ) : (
      <form ref={formRef} onSubmit={submit} key={lead?.id ?? "blank"}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BranchInfoSection />
            <AddressSection
              initial={
                lead
                  ? { address: [lead.address, lead.landmark].filter(Boolean).join(", "), state: lead.state, district: lead.district, city: lead.city, pincode: lead.pincode }
                  : undefined
              }
            />
            <ContactSection />
            <DirectorInfoSection />
            <BranchSpaceSection />
            <BranchDocumentsSection />
          </div>

          <BranchAdminSection />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/branch/view")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Branch"}
          </Button>
        </div>
      </form>
      )}
    </AppLayout>
  );
}
