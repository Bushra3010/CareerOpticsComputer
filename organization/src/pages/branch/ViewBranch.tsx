import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column, type TableFilter } from "@/components/ui/DataTable";
import { ContactActions } from "@/components/ui/ContactActions";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BranchDocuments } from "@/components/branch/BranchDocuments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { storedChoice } from "@/lib/choices";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Users,
  GraduationCap,
  IndianRupee,
  CalendarClock,
  Monitor,
  Plus,
  MapPin,
  Phone,
  UserCheck,
  Shield,
  FileText,
  Info,
  X,
  Wallet,
  Hourglass,
  KeyRound,
  Download,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getBranchesWithStats, updateBranchWithDetails, getBranchDetails, deleteBranch, setBranchLogin } from "@/lib/supabase/data";
import { downloadCsv } from "@/lib/export";
import { instituteName } from "@/lib/instituteName";
import {
  assignedBranchDesign,
  printBranchDocuments,
  type BranchDetails,
} from "@/lib/branchTemplateDocument";
import { getTemplateAssignments, getTemplates } from "@/lib/supabase/documentTemplates";
import { isoOrNull, dateInputValue } from "@/lib/dates";
import { INDIAN_STATES, canonicalState, districtsFor } from "@/data/indianStates";
import { lookupPincode, geocode } from "@/lib/postal";
import { blocksFor, citiesFor } from "@/data/indianCities";

/** What the InstituteType and Gender enums hold; anything else was typed in. */
const INSTITUTE_TYPES = ["COMPUTER", "TYPING", "PARAMEDICAL", "OTHER"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];

/**
 * The register row: the branch columns plus the bits gathered from its
 * address, licence and student/fee counts.
 */
interface Branch {
  id: string;
  name: string;
  code: string;
  branchType: string;
  /** `branches.phone` — the line the office answers. */
  phone: string;
  /** `branches.whatsappNumber`; falls back to the mobile when it was left blank. */
  whatsappNumber: string;
  city: string;
  state: string;
  district: string;
  block: string;
  /** The shared map link, when the branch has one. */
  mapLink: string;
  students: number;
  staff: number;
  revenue: number;
  pendingRevenue: number;
  /** Prepaid wallet money, topped up on Wallet Recharge. Not part of revenue. */
  walletBalance: number;
  expiryDate: string;
  status: "active" | "inactive";
}

/** Wallet money is counted in rupees; revenue is summarised in lakhs. */
const rupees = (value: number) => `₹${(value ?? 0).toLocaleString("en-IN")}`;
const lakhs = (value: number) => `Rs.${((value ?? 0) / 100000).toFixed(1)}L`;

/**
 * The register is read state-wise, then district-wise, then block-wise, which
 * is how a branch is actually located when someone asks after one. Status is
 * here too, so the whole narrowing happens in one bar rather than in a bar and
 * a separate toggle.
 */
const branchFilters: TableFilter<Branch>[] = [
  { label: "State", key: "state" },
  { label: "District", key: "district" },
  { label: "Block", key: "block" },
  { label: "Status", key: "status", options: ["active", "inactive"] },
];

const columns: Column<Branch>[] = [
  {
    key: "name",
    header: "Branch",
    sortable: true,
    cell: (branch) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{branch.name}</p>
          <p className="text-xs text-muted-foreground">{branch.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
     cell: (branch) => (
       <div className="space-y-1">
         <Badge variant="outline">{branch.branchType}</Badge>
       </div>
     ),
  },
  {
    key: "contact",
    header: "Contact",
    // The office's own line, dialable and on WhatsApp, rather than a number to
    // be copied out by hand.
    cell: (branch) => (
      <ContactActions name={branch.name} phone={branch.phone} whatsapp={branch.whatsappNumber} />
    ),
  },
  {
    key: "city",
    header: "Location",
    // The written location, and the pin itself where one was shared: a lane
    // with no name is found by the link and by nothing else. Block and district
    // are named because the register is read that way.
    cell: (branch) => (
      <div className="space-y-0.5">
        <span>{[branch.city, branch.state].filter(Boolean).join(", ") || "—"}</span>
        {(branch.block || branch.district) && (
          <p className="text-xs text-muted-foreground">
            {[branch.block, branch.district].filter(Boolean).join(" · ")}
          </p>
        )}
        {branch.mapLink && (
          <a
            href={branch.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <MapPin className="h-3 w-3" />
            Map
          </a>
        )}
      </div>
    ),
  },
  {
    key: "students",
    header: "Students",
    sortable: true,
    cell: (branch) => <span className="font-medium">{(branch.students ?? 0).toLocaleString()}</span>,
  },
  {
    key: "staff",
    header: "Staff",
    sortable: true,
  },
  {
    key: "walletBalance",
    header: "Wallet",
    sortable: true,
    cell: (branch) => {
      const balance = branch.walletBalance ?? 0;
      return (
        <span className={balance > 0 ? "font-medium text-success" : "font-medium text-muted-foreground"}>
          {rupees(balance)}
        </span>
      );
    },
  },
  {
    key: "revenue",
    header: "Revenue",
    sortable: true,
    cell: (branch) => <span className="font-medium text-success">{lakhs(branch.revenue)}</span>,
  },
  {
    key: "pendingRevenue",
    header: "Pending",
    sortable: true,
    cell: (branch) => {
      const pending = branch.pendingRevenue ?? 0;
      return (
        <span className={pending > 0 ? "font-medium text-destructive" : "font-medium text-muted-foreground"}>
          {lakhs(pending)}
        </span>
      );
    },
  },
  {
     key: "expiryDate",
     header: "Expiry",
     sortable: true,
     cell: (branch) => {
       if (!branch.expiryDate) return <span className="text-muted-foreground">—</span>;
       const expiry = new Date(branch.expiryDate);
       const today = new Date();
       const isExpired = expiry < today;
       const isExpiringSoon = !isExpired && expiry <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
       return (
         <div className="flex items-center gap-1">
           <CalendarClock className={`h-4 w-4 ${isExpired ? 'text-destructive' : isExpiringSoon ? 'text-warning' : 'text-muted-foreground'}`} />
           <span className={isExpired ? 'text-destructive' : isExpiringSoon ? 'text-warning' : ''}>
             {expiry.toLocaleDateString()}
           </span>
         </div>
       );
     },
  },
  {
    key: "status",
    header: "Status",
    cell: (branch) => <StatusBadge status={branch.status} />,
  },
];

interface BranchEdit {
  // branch
  id: string;
  name: string;
  code: string;
  branchType: string;
  instituteType: string;
  academicYear: string;
  establishedYear: number | "";
  website: string;
  description: string;
  phone: string;
  altPhone: string;
  whatsappNumber: string;
  email: string;
  numComputers: number;
  numFaculty: number;
  numRooms: number;
  isActive: boolean;
  onlineEnrollment: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  onlineFeePayment: boolean;
  studentPortal: boolean;
  parentPortal: boolean;
  // address
  streetAddress: string;
  state: string;
  district: string;
  block: string;
  city: string;
  pincode: string;
  latitude: number | "";
  longitude: number | "";
  country: string;
  /** A shared Google Maps link. The written address and the pin are not the
   *  same thing -- a lane with no name is found by the link and nothing else. */
  mapLink: string;
  // director
  directorName: string;
  directorGender: string;
  directorDOB: string;
  directorBloodGroup: string;
  // license
  registrationDate: string;
  validDate: string;
  expiryDate: string;
  referralCode: string;
  // admin
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}

export default function ViewBranch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [branchesData, setBranchesData] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<Branch | null>(null);
  const [editing, setEditing] = useState<BranchEdit | null>(null);
  // The branch's login lives in Supabase Auth, which the browser cannot read,
  // so the current login ID cannot be shown here. Leaving the ID blank keeps it
  // as it is and changes only the password.
  const [loginDraft, setLoginDraft] = useState({ username: "", password: "" });
  const [savingLogin, setSavingLogin] = useState(false);
  const isOrgAdmin = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"].includes(String(user?.role || "").toUpperCase());
  // Last PIN we resolved, so re-renders of `editing` don't re-trigger a lookup.
  const resolvedPin = useRef("");
  const editingPin = String(editing?.pincode ?? "");

  // Whatever district is on the record stays selectable even when the bundled
  // table doesn't carry it — India Post reports renamed and newly carved-out
  // districts that the local list lags behind on.
  const editingState = editing?.state ?? "";
  const editingDistrict = editing?.district ?? "";
  const districtOptions = useMemo(() => {
    const base = districtsFor(editingState);
    const current = editingDistrict.trim();
    if (!current || base.some((d) => d.toLowerCase() === current.toLowerCase())) {
      return base;
    }
    return [...base, current].sort((a, b) => a.localeCompare(b));
  }, [editingState, editingDistrict]);

  // Typing a complete PIN fills state / district / block / city / coordinates,
  // exactly like the Create Branch form. Silent no-op if the lookup fails.
  useEffect(() => {
    if (!/^\d{6}$/.test(editingPin) || resolvedPin.current === editingPin) return;
    resolvedPin.current = editingPin;
    let cancelled = false;
    (async () => {
      const rows = await lookupPincode(editingPin);
      if (cancelled || rows.length === 0) return;
      const [first] = rows;
      const canonical = canonicalState(first.state);
      const state = INDIAN_STATES.includes(canonical) ? canonical : "";
      const reported = first.district.trim();
      const district =
        districtsFor(state).find((d) => d.toLowerCase() === reported.toLowerCase()) ??
        reported;
      const blocks = Array.from(new Set(rows.map((r) => r.block).filter(Boolean)));
      const point = await geocode(
        `${first.pincode}, ${first.district}, ${first.state}, India`
      );
      if (cancelled) return;
      setEditing((prev) => {
        if (!prev || String(prev.pincode) !== editingPin) return prev;
        return {
          ...prev,
          state: state || prev.state,
          district: district || prev.district,
          block: blocks.length === 1 ? blocks[0] : prev.block,
          city: rows.length === 1 ? rows[0].name : prev.city,
          latitude: point ? Number(point.lat) : prev.latitude,
          longitude: point ? Number(point.lon) : prev.longitude,
        };
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [editingPin]);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Branch | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const body = await getBranchesWithStats(user?.organizationId || null);
        setBranchesData(body.data as unknown as Branch[]);
      } catch (error) {
        toast({
          title: "Failed to load branches",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, [toast, user?.organizationId]);

  // Generate a single branch's certificate HTML content
  const getCertificateHtml = (branch: Branch) => `
    <div style="page-break-after:always;border:6px double #1f2937;padding:48px;text-align:center;font-family:Georgia,serif">
      <p style="letter-spacing:.3em;font-size:12px;text-transform:uppercase;color:#6b7280">Career Optics Computer Centre</p>
      <h1 style="margin:16px 0 4px;font-size:30px">Center Certificate</h1>
      <p style="color:#6b7280;font-size:13px">This is to certify that the centre named below is authorised to operate</p>
      <h2 style="margin:28px 0 4px;font-size:24px">${branch.name}</h2>
      <p style="font-size:14px">Centre code <strong>${branch.code}</strong></p>
      <p style="font-size:14px">${branch.city}, ${branch.state}</p>
      <table style="margin:28px auto 0;font-size:13px;border-collapse:collapse">
        <tr><td style="padding:4px 16px;text-align:right;color:#6b7280">Type</td><td style="padding:4px 16px;text-align:left"><strong>${branch.branchType}</strong></td></tr>
        <tr><td style="padding:4px 16px;text-align:right;color:#6b7280">Status</td><td style="padding:4px 16px;text-align:left"><strong>${branch.status === "active" ? "Active" : "Inactive"}</strong></td></tr>
      </table>
      <p style="margin-top:48px;font-size:12px;color:#6b7280">Issued on ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  /**
   * The certificates as the branches' own templates draw them: the full record
   * behind each branch (address, director, licence) fills the template, and a
   * branch the designer assigned nothing to keeps the built-in layout.
   */
  const printFromTemplates = async (branches: Branch[]) => {
    const orgId = user?.organizationId ?? null;
    const details = await Promise.all(
      branches.map((branch) =>
        orgId
          ? getBranchDetails(orgId, branch.id)
              .then((r) => r.data as BranchDetails)
              .catch(() => ({ ...branch }) as BranchDetails)
          : Promise.resolve({ ...branch } as BranchDetails),
      ),
    );
    const byId = new Map(branches.map((branch) => [branch.id, branch]));
    await printBranchDocuments("centre-certificate", details, orgId, instituteName(), (detail) => {
      const branch = byId.get(String(detail.id));
      return branch ? getCertificateHtml(branch) : "";
    });
  };

  // Print certificate for a single branch
  const certificate = (branch: Branch) =>
    printFromTemplates([branch]).catch((error) =>
      toast({
        title: "Could not print the certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      }),
    );

  // Bulk download certificates for selected branches
  const bulkCertificates = async (branches: Branch[]) => {
    if (branches.length === 0) {
      toast({ title: "No branches selected", variant: "destructive" });
      return;
    }
    try {
      // A branch with a designed centre certificate prints from it, so the
      // whole selection goes through the template printer; the built-in PDF
      // below is only for when none of them has one.
      const [templates, assignments] = await Promise.all([
        getTemplates(user?.organizationId ?? null).catch(() => ({ data: [] })),
        getTemplateAssignments(user?.organizationId ?? null).catch(() => ({ data: {} })),
      ]);
      if (
        branches.some((branch) =>
          assignedBranchDesign("centre-certificate", templates.data, assignments.data, branch.id),
        )
      ) {
        await printFromTemplates(branches);
        return;
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      for (let i = 0; i < branches.length; i++) {
        const branch = branches[i];
        if (i > 0) pdf.addPage();

        // Header
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text("Career Optics Computer Centre", pageWidth / 2, margin, { align: "center" });

        pdf.setFontSize(26);
        pdf.setTextColor(31, 41, 55);
        pdf.text("Center Certificate", pageWidth / 2, margin + 12, { align: "center" });

        pdf.setFontSize(11);
        pdf.setTextColor(107, 114, 128);
        pdf.text("This is to certify that the centre named below is authorised to operate", pageWidth / 2, margin + 20, { align: "center" });

        // Branch name
        pdf.setFontSize(20);
        pdf.setTextColor(31, 41, 55);
        pdf.text(branch.name, pageWidth / 2, margin + 35, { align: "center" });

        // Details
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`Centre code ${branch.code}`, pageWidth / 2, margin + 44, { align: "center" });
        pdf.text(`${branch.city}, ${branch.state}`, pageWidth / 2, margin + 51, { align: "center" });

        // Table
        const tableY = margin + 62;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);

        // Type row
        pdf.setTextColor(107, 114, 128);
        pdf.text("Type", pageWidth / 2 - 40, tableY, { align: "right" });
        pdf.setTextColor(31, 41, 55);
        pdf.setFont(undefined, "bold");
        pdf.text(branch.branchType, pageWidth / 2 + 10, tableY, { align: "left" });
        pdf.setFont(undefined, "normal");

        // Status row
        pdf.setTextColor(107, 114, 128);
        pdf.text("Status", pageWidth / 2 - 40, tableY + 8, { align: "right" });
        pdf.setTextColor(31, 41, 55);
        pdf.setFont(undefined, "bold");
        pdf.text(branch.status === "active" ? "Active" : "Inactive", pageWidth / 2 + 10, tableY + 8, { align: "left" });
        pdf.setFont(undefined, "normal");

        // Footer
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Issued on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - margin, { align: "center" });
      }

      pdf.save(`center-certificates-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: `${branches.length} certificate${branches.length > 1 ? "s" : ""} downloaded` });
    } catch (error) {
      toast({
        title: "Failed to generate certificates",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  const handleSelectionChange = (ids: (string | number)[]) => {
    setSelectedBranches(branchesData.filter((b) => ids.includes(b.id)));
  };

  const handleActions = (branch: Branch) => [
    { label: "View Details", onClick: () => setDetails(branch) },
    { label: "Edit Branch", onClick: async () => {
      try {
        const full = await getBranchDetails(user?.organizationId || "", branch.id);
        const d = (full.data as Record<string, unknown>);
        const addr = (d.address || {}) as Record<string, unknown>;
        const dir = (d.director || {}) as Record<string, unknown>;
        const lic = (d.license || {}) as Record<string, unknown>;
        setLoginDraft({ username: "", password: "" });
        setEditing({
          id: d.id as string,
          name: d.name as string,
          code: d.code as string,
          branchType: d.branchType as string,
          instituteType: (d.instituteType as string) || "",
          academicYear: (d.academicYear as string) || "",
          establishedYear: (d.establishedYear as number) ?? "",
          website: (d.website as string) || "",
          description: (d.description as string) || "",
          phone: (d.phone as string) || "",
          altPhone: (d.altPhone as string) || "",
          whatsappNumber: (d.whatsappNumber as string) || "",
          email: (d.email as string) || "",
          numComputers: (d.numComputers as number) || 0,
          numFaculty: (d.numFaculty as number) || 0,
          numRooms: (d.numRooms as number) || 0,
          isActive: (d.isActive as boolean) ?? true,
          onlineEnrollment: (d.onlineEnrollment as boolean) ?? false,
          smsNotifications: (d.smsNotifications as boolean) ?? false,
          emailNotifications: (d.emailNotifications as boolean) ?? true,
          onlineFeePayment: (d.onlineFeePayment as boolean) ?? false,
          studentPortal: (d.studentPortal as boolean) ?? false,
          parentPortal: (d.parentPortal as boolean) ?? false,
          streetAddress: (addr.streetAddress as string) || "",
          state: canonicalState((addr.state as string) || ""),
          district: (addr.district as string) || "",
          block: (addr.block as string) || "",
          city: (addr.city as string) || "",
          pincode: (addr.pincode as string) || "",
          latitude: (addr.latitude as number) ?? "",
          longitude: (addr.longitude as number) ?? "",
          country: (addr.country as string) || "India",
          mapLink: (addr.mapLink as string) || "",
          directorName: (dir.name as string) || "",
          directorGender: (dir.gender as string) || "",
          directorDOB: dateInputValue(dir.dob),
          directorBloodGroup: (dir.bloodGroup as string) || "",
          registrationDate: dateInputValue(lic.registrationDate),
          validDate: dateInputValue(lic.validDate),
          expiryDate: dateInputValue(lic.expiryDate),
          referralCode: (lic.referralCode as string) || "",
          adminName: "",
          adminEmail: "",
          adminPhone: "",
        });
        setDetails(null);
      } catch (error) {
        toast({
          title: "Failed to load branch details",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      }
    } },
    { label: "Center Certificate", onClick: () => certificate(branch) },
    { label: "Manage Staff", onClick: () => navigate("/user/all") },
    { label: "View Reports", onClick: () => navigate("/attendance/report") },
    { label: "Delete", onClick: () => setPendingDelete(branch), destructive: true },
  ];

  /**
   * Sets the branch's login. Separate from Save changes because it goes to an
   * edge function rather than the branch tables, and because an admin resetting
   * a password should not have to save the whole form to do it.
   */
  const saveLogin = async () => {
    if (!editing) return;
    if (loginDraft.password.trim().length < 6) {
      toast({
        title: "Password is too short",
        description: "Use at least 6 characters — this is the branch's login password.",
        variant: "destructive",
      });
      return;
    }
    setSavingLogin(true);
    try {
      const res = await setBranchLogin({
        branchId: editing.id,
        username: loginDraft.username.trim(),
        password: loginDraft.password,
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
      });
      toast({
        title: res.data.created ? "Login created" : "Login updated",
        description: `${editing.name} signs in with ID: ${res.data.username}`,
      });
      setLoginDraft({ username: "", password: "" });
    } catch (error) {
      toast({
        title: "Could not set the login",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSavingLogin(false);
    }
  };

  const saveEdit = async () => {
    if (!editing || !user) return;
    if (!editing.name.trim() || !editing.code.trim()) {
      toast({ title: "Name and code are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const licenseExpiry = isoOrNull(editing.expiryDate);
    try {
      await updateBranchWithDetails(editing.id, user.organizationId, {
        branch: {
          name: editing.name,
          code: editing.code,
          branchType: editing.branchType.toUpperCase(),
          instituteType: storedChoice(editing.instituteType, INSTITUTE_TYPES),
          academicYear: editing.academicYear,
          establishedYear: editing.establishedYear === "" ? null : Number(editing.establishedYear),
          website: editing.website || null,
          description: editing.description || null,
          phone: editing.phone,
          altPhone: editing.altPhone || null,
          whatsappNumber: editing.whatsappNumber || null,
          email: editing.email,
          numComputers: editing.numComputers,
          numFaculty: editing.numFaculty,
          numRooms: editing.numRooms,
          isActive: editing.isActive,
          onlineEnrollment: editing.onlineEnrollment,
          smsNotifications: editing.smsNotifications,
          emailNotifications: editing.emailNotifications,
          onlineFeePayment: editing.onlineFeePayment,
          studentPortal: editing.studentPortal,
          parentPortal: editing.parentPortal,
        },
        address: {
          streetAddress: editing.streetAddress,
          state: editing.state,
          district: editing.district,
          block: editing.block || null,
          city: editing.city,
          pincode: editing.pincode,
          latitude: editing.latitude === "" ? null : Number(editing.latitude),
          longitude: editing.longitude === "" ? null : Number(editing.longitude),
          country: editing.country || "India",
          mapLink: editing.mapLink.trim() || null,
        },
        director: {
          name: editing.directorName,
          gender: storedChoice(editing.directorGender, GENDERS),
          dob: isoOrNull(editing.directorDOB) ?? new Date().toISOString(),
          bloodGroup: editing.directorBloodGroup || null,
        },
        // The registration date is a full `YYYY-MM-DD` from its date input. The
        // `-01` belongs only to the fallback, which is the expiry's `YYYY-MM`;
        // appending it to a full date made "2026-09-16-01" and threw.
        license: licenseExpiry
          ? {
              registrationDate:
                isoOrNull(editing.registrationDate) ??
                isoOrNull(`${editing.expiryDate.slice(0, 7)}-01`),
              validDate: isoOrNull(editing.validDate),
              expiryDate: licenseExpiry,
              referralCode: editing.referralCode || null,
            }
          : undefined,
      });
      setBranchesData((prev) =>
        prev.map((b) =>
          b.id === editing.id
            ? {
                ...b,
                name: editing.name,
                branchType: editing.branchType,
                city: editing.city,
                state: editing.state,
                students: b.students,
                staff: editing.numFaculty,
                expiryDate: licenseExpiry ?? b.expiryDate,
                status: editing.isActive ? "active" : "inactive",
              }
            : b,
        ),
      );
      toast({ title: "Branch updated", description: `${editing.name} was saved.` });
      setEditing(null);
    } catch (error) {
      toast({
        title: "Failed to update branch",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBranch(pendingDelete.id);
      setBranchesData((prev) => prev.filter((b) => b.id !== pendingDelete.id));
      toast({ title: "Branch removed", description: `${pendingDelete.name} is no longer in the register.` });
    } catch (error) {
      toast({
        title: "Failed to delete branch",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
    setPendingDelete(null);
  };

  const totalStudents = branchesData.reduce((sum, b) => sum + (b.students ?? 0), 0);
  const totalStaff = branchesData.reduce((sum, b) => sum + (b.staff ?? 0), 0);
  const totalRevenue = branchesData.reduce((sum, b) => sum + (b.revenue ?? 0), 0);
  const totalPending = branchesData.reduce((sum, b) => sum + (b.pendingRevenue ?? 0), 0);
  const totalWallet = branchesData.reduce((sum, b) => sum + (b.walletBalance ?? 0), 0);

  const exportBranches = () => {
    downloadCsv(
      "branches.csv",
      branchesData.map((b) => ({
        Code: b.code,
        Name: b.name,
        City: (b as unknown as { city?: string }).city ?? "",
        State: (b as unknown as { state?: string }).state ?? "",
        Students: b.students ?? 0,
        Staff: b.staff ?? 0,
        WalletBalance: b.walletBalance ?? 0,
        RevenueReceived: b.revenue ?? 0,
        RevenuePending: b.pendingRevenue ?? 0,
        RevenueTotal: (b.revenue ?? 0) + (b.pendingRevenue ?? 0),
        Status: b.status ?? "",
      })),
    );
    toast({ title: "Branches exported", description: `${branchesData.length} rows written to CSV.` });
  };
  const activeBranches = branchesData.filter(b => b.status === "active").length;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading branches...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="View Branches"
        description="Manage all branches and their details"
        breadcrumbs={[
          { label: "Branch Management", href: "/branch/view" },
          { label: "View Branches" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={exportBranches} disabled={branchesData.length === 0}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => navigate("/branch/create")}>
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Branches"
          value={branchesData.length}
          subtitle={`${activeBranches} active`}
          icon={Building2}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          subtitle="Across all branches"
          icon={GraduationCap}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Staff"
          value={totalStaff}
          subtitle="Teaching & non-teaching"
          icon={Users}
        />
        <StatsCard
          title="Wallet Balance"
          value={rupees(totalWallet)}
          subtitle="Recharged across all branches"
          icon={Wallet}
        />
        <StatsCard
          title="Revenue Received"
          value={lakhs(totalRevenue)}
          subtitle="Fees collected across all branches"
          icon={IndianRupee}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Revenue"
          value={lakhs(totalPending)}
          subtitle="Fees still to be collected"
          icon={Hourglass}
        />
        <StatsCard
          title="Total Revenue"
          value={lakhs(totalRevenue + totalPending)}
          subtitle="Received plus pending"
          icon={IndianRupee}
        />
      </div>

      <DataTable
        data={branchesData}
        columns={columns}
        filters={branchFilters}
        searchPlaceholder="Search branches..."
        actions={handleActions}
        selectable
        onSelectionChange={handleSelectionChange}
      />

      {selectedBranches.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 rounded-full border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-5 py-2.5 shadow-lg">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedBranches.length}</span> selected
            </span>
            <Button size="sm" className="gap-2 rounded-full" onClick={() => bulkCertificates(selectedBranches)}>
              Download Certificates
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={() => setSelectedBranches([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{details?.name}</DialogTitle>
            <DialogDescription>{details?.code}</DialogDescription>
          </DialogHeader>
          {details && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ["Branch type", details.branchType],
                ["Location", [details.city, details.state].filter(Boolean).join(", ") || "—"],
                ["Students", (details.students ?? 0).toLocaleString()],
                ["Staff", String(details.staff ?? 0)],
                ["Wallet balance", rupees(details.walletBalance)],
                ["Revenue received", lakhs(details.revenue)],
                ["Revenue pending", lakhs(details.pendingRevenue)],
                ["Revenue total", lakhs((details.revenue ?? 0) + (details.pendingRevenue ?? 0))],
                ["Status", details.status === "active" ? "Active" : "Inactive"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {details && (
            <section className="space-y-2 border-t pt-3">
              <h3 className="text-sm font-semibold">Registration documents</h3>
              <BranchDocuments branchId={details.id} organizationId={user?.organizationId || ""} branchName={details.name} canUpload />
            </section>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => details && certificate(details)}>Print certificate</Button>
            <Button onClick={async () => {
              if (!details) return;
              try {
                const full = await getBranchDetails(user?.organizationId || "", details.id);
                const d = (full.data as Record<string, unknown>);
                const addr = (d.address || {}) as Record<string, unknown>;
                const dir = (d.director || {}) as Record<string, unknown>;
                const lic = (d.license || {}) as Record<string, unknown>;
                setLoginDraft({ username: "", password: "" });
                setEditing({
                  id: d.id as string,
                  name: d.name as string,
                  code: d.code as string,
                  branchType: d.branchType as string,
                  instituteType: (d.instituteType as string) || "",
                  academicYear: (d.academicYear as string) || "",
                  establishedYear: (d.establishedYear as number) ?? "",
                  website: (d.website as string) || "",
                  description: (d.description as string) || "",
                  phone: (d.phone as string) || "",
                  altPhone: (d.altPhone as string) || "",
                  whatsappNumber: (d.whatsappNumber as string) || "",
                  email: (d.email as string) || "",
                  numComputers: (d.numComputers as number) || 0,
                  numFaculty: (d.numFaculty as number) || 0,
                  numRooms: (d.numRooms as number) || 0,
                  isActive: (d.isActive as boolean) ?? true,
                  onlineEnrollment: (d.onlineEnrollment as boolean) ?? false,
                  smsNotifications: (d.smsNotifications as boolean) ?? false,
                  emailNotifications: (d.emailNotifications as boolean) ?? true,
                  onlineFeePayment: (d.onlineFeePayment as boolean) ?? false,
                  studentPortal: (d.studentPortal as boolean) ?? false,
                  parentPortal: (d.parentPortal as boolean) ?? false,
                  streetAddress: (addr.streetAddress as string) || "",
                  state: canonicalState((addr.state as string) || ""),
                  district: (addr.district as string) || "",
                  block: (addr.block as string) || "",
                  city: (addr.city as string) || "",
                  pincode: (addr.pincode as string) || "",
                  latitude: (addr.latitude as number) ?? "",
                  longitude: (addr.longitude as number) ?? "",
                  country: (addr.country as string) || "India",
                  mapLink: (addr.mapLink as string) || "",
                  directorName: (dir.name as string) || "",
                  directorGender: (dir.gender as string) || "",
                  directorDOB: dateInputValue(dir.dob),
                  directorBloodGroup: (dir.bloodGroup as string) || "",
                  registrationDate: dateInputValue(lic.registrationDate),
                  validDate: dateInputValue(lic.validDate),
                  expiryDate: dateInputValue(lic.expiryDate),
                  referralCode: (lic.referralCode as string) || "",
                  adminName: "",
                  adminEmail: "",
                  adminPhone: "",
                });
                setDetails(null);
              } catch (error) {
                toast({
                  title: "Failed to load branch details",
                  description: error instanceof Error ? error.message : undefined,
                  variant: "destructive",
                });
              }
            }}>Edit branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (open) return;
          setEditing(null);
          // Never leave a typed password sitting in state for the next branch.
          setLoginDraft({ username: "", password: "" });
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit branch</DialogTitle>
            <DialogDescription>Update the register entry for {editing?.code}.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Info className="h-4 w-4" /> Basic Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-name">Branch name *</Label>
                    <Input id="edit-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">Branch Code *</Label>
                    <Input id="edit-code" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-branchType">Branch Type</Label>
                    <Select value={editing.branchType} onValueChange={(value) => setEditing({ ...editing, branchType: value })}>
                      <SelectTrigger id="edit-branchType"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAIN">Main Branch</SelectItem>
                        <SelectItem value="SUB">Sub Branch</SelectItem>
                        <SelectItem value="FRANCHISE">Franchise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-instituteType">Institute Type</Label>
                    {/* The three the InstituteType enum actually has -- School,
                        College and Coaching were offered here but rejected by
                        the column -- and anything else is typed in. */}
                    <SelectWithCustom
                      id="edit-instituteType"
                      value={editing.instituteType}
                      onValueChange={(value) => setEditing({ ...editing, instituteType: value })}
                      options={["COMPUTER", "TYPING", "PARAMEDICAL"]}
                      placeholder="Select institute type"
                      customPlaceholder="Type the institute type"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-academicYear">Academic Year</Label>
                    <Input id="edit-academicYear" value={editing.academicYear} onChange={(e) => setEditing({ ...editing, academicYear: e.target.value })} placeholder="e.g. 2024-25" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-establishedYear">Established Year</Label>
                    <Input id="edit-establishedYear" type="number" value={editing.establishedYear} onChange={(e) => setEditing({ ...editing, establishedYear: e.target.value === "" ? "" : Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-website">Website</Label>
                    <Input id="edit-website" value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea id="edit-description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Contact Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone *</Label>
                    <Input id="edit-phone" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-altPhone">Alternate Phone</Label>
                    <Input id="edit-altPhone" value={editing.altPhone} onChange={(e) => setEditing({ ...editing, altPhone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-whatsappNumber">WhatsApp Number</Label>
                    <Input id="edit-whatsappNumber" value={editing.whatsappNumber} onChange={(e) => setEditing({ ...editing, whatsappNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input id="edit-email" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Address
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-streetAddress">Street Address</Label>
                    <Textarea id="edit-streetAddress" value={editing.streetAddress} onChange={(e) => setEditing({ ...editing, streetAddress: e.target.value })} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-country">Country</Label>
                    <Input id="edit-country" value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">State</Label>
                    <Select
                      value={editing.state}
                      onValueChange={(value) => setEditing({ ...editing, state: value, district: "", block: "", city: "" })}
                    >
                      <SelectTrigger id="edit-state"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-district">District</Label>
                    {/* Each list waits for the one before it; a place the
                        bundled lists do not carry is typed in under "Other". */}
                    <SelectWithCustom
                      id="edit-district"
                      value={editing.district}
                      onValueChange={(value) => setEditing({ ...editing, district: value, block: "", city: "" })}
                      options={districtOptions}
                      placeholder={editing.state ? "Select district" : "Select state first"}
                      customPlaceholder="Type the district"
                      disabled={!editing.state}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-block">Block</Label>
                    <SelectWithCustom
                      id="edit-block"
                      value={editing.block}
                      onValueChange={(value) => setEditing({ ...editing, block: value })}
                      options={blocksFor(editing.district, editing.state)}
                      placeholder={editing.district ? "Select block" : "Select district first"}
                      customPlaceholder="Type the block"
                      disabled={!editing.district}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City</Label>
                    <SelectWithCustom
                      id="edit-city"
                      value={editing.city}
                      onValueChange={(value) => setEditing({ ...editing, city: value })}
                      options={citiesFor(editing.district)}
                      placeholder={editing.district ? "Select city" : "Select district first"}
                      customPlaceholder="Type the city"
                      disabled={!editing.district}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-pincode">Pincode</Label>
                    <Input id="edit-pincode" inputMode="numeric" maxLength={6} placeholder="6-digit PIN" value={editing.pincode} onChange={(e) => setEditing({ ...editing, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-latitude">Latitude</Label>
                    <Input id="edit-latitude" type="number" step="any" value={editing.latitude} onChange={(e) => setEditing({ ...editing, latitude: e.target.value === "" ? "" : Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-longitude">Longitude</Label>
                    <Input id="edit-longitude" type="number" step="any" value={editing.longitude} onChange={(e) => setEditing({ ...editing, longitude: e.target.value === "" ? "" : Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-mapLink">Map link</Label>
                    <Input
                      id="edit-mapLink"
                      type="url"
                      placeholder="https://maps.app.goo.gl/…"
                      value={editing.mapLink}
                      onChange={(e) => setEditing({ ...editing, mapLink: e.target.value })}
                    />
                    {editing.mapLink.trim() && (
                      <a
                        href={editing.mapLink.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <MapPin className="h-3 w-3" />
                        Open this link
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Wallet charges */}
              {isOrgAdmin && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Wallet Charges
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    What this centre pays from its wallet for admissions, admit cards, marksheets and certificates
                    is set for every centre in one place, with this centre's own rate if it differs:{" "}
                    <Link to="/branch/charges" className="font-semibold text-primary underline">Centre Charges</Link>.
                  </p>
                </div>
              )}

              {/* Infrastructure */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="h-4 w-4" /> Infrastructure
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-numComputers">Computers</Label>
                    <Input id="edit-numComputers" type="number" value={editing.numComputers} onChange={(e) => setEditing({ ...editing, numComputers: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-numFaculty">Faculty</Label>
                    <Input id="edit-numFaculty" type="number" value={editing.numFaculty} onChange={(e) => setEditing({ ...editing, numFaculty: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-numRooms">Rooms</Label>
                    <Input id="edit-numRooms" type="number" value={editing.numRooms} onChange={(e) => setEditing({ ...editing, numRooms: Number(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>

              {/* Director */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="h-4 w-4" /> Director Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-directorName">Director Name</Label>
                    <Input id="edit-directorName" value={editing.directorName} onChange={(e) => setEditing({ ...editing, directorName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-directorGender">Gender</Label>
                    <SelectWithCustom
                      id="edit-directorGender"
                      value={editing.directorGender}
                      onValueChange={(value) => setEditing({ ...editing, directorGender: value })}
                      options={["MALE", "FEMALE"]}
                      placeholder="Select gender"
                      customPlaceholder="Type the gender"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-directorDOB">Date of Birth</Label>
                    <DatePicker value={editing.directorDOB} onChange={(v) => setEditing({ ...editing, directorDOB: v })} id="edit-directorDOB" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-directorBloodGroup">Blood Group</Label>
                    <Input id="edit-directorBloodGroup" value={editing.directorBloodGroup} onChange={(e) => setEditing({ ...editing, directorBloodGroup: e.target.value })} placeholder="e.g. A+" />
                  </div>
                </div>
              </div>

              {/* License */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4" /> License / Registration
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-registrationDate">Registration Date</Label>
                    <DatePicker value={editing.registrationDate} onChange={(v) => setEditing({ ...editing, registrationDate: v })} id="edit-registrationDate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-validDate">Valid Date</Label>
                    <DatePicker value={editing.validDate} onChange={(v) => setEditing({ ...editing, validDate: v })} id="edit-validDate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                    <DatePicker value={editing.expiryDate} onChange={(v) => setEditing({ ...editing, expiryDate: v })} id="edit-expiryDate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-referralCode">Referral Code</Label>
                    <Input id="edit-referralCode" value={editing.referralCode} onChange={(e) => setEditing({ ...editing, referralCode: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Settings
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="edit-isActive" className="cursor-pointer">Active Status</Label>
                      <p className="text-xs text-muted-foreground">Enable/disable branch</p>
                    </div>
                    <Switch id="edit-isActive" checked={editing.isActive} onCheckedChange={(checked) => setEditing({ ...editing, isActive: checked })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="edit-onlineEnrollment" className="cursor-pointer">Online Enrollment</Label>
                      <p className="text-xs text-muted-foreground">Accept online admissions</p>
                    </div>
                    <Switch id="edit-onlineEnrollment" checked={editing.onlineEnrollment} onCheckedChange={(checked) => setEditing({ ...editing, onlineEnrollment: checked })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="edit-smsNotifications" className="cursor-pointer">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Send SMS alerts</p>
                    </div>
                    <Switch id="edit-smsNotifications" checked={editing.smsNotifications} onCheckedChange={(checked) => setEditing({ ...editing, smsNotifications: checked })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="edit-emailNotifications" className="cursor-pointer">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Send email updates</p>
                    </div>
                    <Switch id="edit-emailNotifications" checked={editing.emailNotifications} onCheckedChange={(checked) => setEditing({ ...editing, emailNotifications: checked })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="edit-onlineFeePayment" className="cursor-pointer">Online Fee Payment</Label>
                      <p className="text-xs text-muted-foreground">Enable online fee collection</p>
                    </div>
                    <Switch id="edit-onlineFeePayment" checked={editing.onlineFeePayment} onCheckedChange={(checked) => setEditing({ ...editing, onlineFeePayment: checked })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="edit-studentPortal" className="cursor-pointer">Student Portal</Label>
                      <p className="text-xs text-muted-foreground">Access to student dashboard</p>
                    </div>
                    <Switch id="edit-studentPortal" checked={editing.studentPortal} onCheckedChange={(checked) => setEditing({ ...editing, studentPortal: checked })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="edit-parentPortal" className="cursor-pointer">Parent Portal</Label>
                      <p className="text-xs text-muted-foreground">Access to parent dashboard</p>
                    </div>
                    <Switch id="edit-parentPortal" checked={editing.parentPortal} onCheckedChange={(checked) => setEditing({ ...editing, parentPortal: checked })} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="h-4 w-4" /> Login
                </h3>
                <p className="text-xs text-muted-foreground">
                  The ID and password this branch signs in with. Leave the ID blank to keep the
                  current one and change only the password. A branch that has no login yet needs
                  an ID here to get one.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-login-username">Login ID</Label>
                    <Input
                      id="edit-login-username"
                      autoComplete="off"
                      placeholder="Unchanged"
                      value={loginDraft.username}
                      onChange={(e) => setLoginDraft({ ...loginDraft, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-login-password">New password</Label>
                    <Input
                      id="edit-login-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={loginDraft.password}
                      onChange={(e) => setLoginDraft({ ...loginDraft, password: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={saveLogin}
                  disabled={savingLogin || loginDraft.password.trim().length === 0}
                >
                  <KeyRound className="h-4 w-4" />
                  {savingLogin ? "Saving login..." : "Set login"}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.name}?</DialogTitle>
            <DialogDescription>
              This removes the branch from the register along with its {(pendingDelete?.students ?? 0).toLocaleString()} students
              and {pendingDelete?.staff ?? 0} staff from the totals above.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>Keep branch</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
