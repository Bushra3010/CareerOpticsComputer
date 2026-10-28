"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Phone, Mail, User, Users as UsersIcon, Calendar,
  FileText, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

type VisitorIdType = "AADHAR" | "PAN" | "DRIVING" | "VOTER";
type EnquiryStatus = "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED";
type VisitPurpose = "ADMISSION" | "FEE" | "MEETING" | "COMPLAINT" | "DELIVERY" | "INTERVIEW" | "OTHER";
type DepartmentType = "ADMINISTRATION" | "ACADEMICS" | "ACCOUNTS" | "HR" | "IT" | "LIBRARY" | "SPORTS" | "LAB";

interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  email?: string;
  candidateName?: string;
  whatsappNumber?: string;
  noOfPersons: number;
  checkInTime?: string;
  checkOutTime?: string;
  registrationDate?: string;
  followUpDate?: string;
  followUpTime?: string;
  followUpNotes?: string;
  source?: string;
  referralName?: string;
  section?: string;
  idType: VisitorIdType;
  idNumber?: string;
  company?: string;
  address?: string;
  visitDate: string;
  visitTime: string;
  purpose: VisitPurpose;
  personToMeet: string;
  department: DepartmentType;
  enquiryReason?: string;
  location?: string;
  remarks?: string;
  status: EnquiryStatus;
  closeNote?: string;
  createdAt: string;
  updatedAt?: string;
}

const columns: Column<Visitor>[] = [
  { key: "visitorName", header: "Visitor Name", sortable: true },
  {
    key: "phone",
    header: "Mobile No.",
    cell: (v) => (
      <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-primary hover:underline">
        <Phone className="h-3.5 w-3.5" />{v.phone}
      </a>
    ),
  },
  {
    key: "candidateName",
    header: "Candidate Name",
    cell: (v) => v.candidateName || "—",
  },
  {
    key: "source",
    header: "Source",
    cell: (v) => <Badge variant="outline" className="text-xs">{v.source || "WALK_IN"}</Badge>,
  },
  {
    key: "noOfPersons",
    header: "Persons",
    cell: (v) => (
      <span className="flex items-center gap-1">
        <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />{v.noOfPersons}
      </span>
    ),
  },
  {
    key: "visitDate",
    header: "Visit Date",
    cell: (v) => new Date(v.visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  },
  {
    key: "status",
    header: "Status",
    cell: (v) => <StatusBadge status={v.status === "NEW" ? "pending" : v.status === "CONTACTED" ? "active" : v.status === "CONVERTED" ? "completed" : "inactive"} />,
  },
  {
    key: "purpose",
    header: "Purpose",
    cell: (v) => {
      const labels: Record<string, string> = { ADMISSION: "Admission", FEE: "Fee", MEETING: "Meeting", COMPLAINT: "Complaint", DELIVERY: "Delivery", INTERVIEW: "Interview", OTHER: "Other" };
      return labels[v.purpose] || v.purpose;
    },
  },
  {
    key: "department",
    header: "Department",
  },
];

const emptyVisitor: Omit<Visitor, "id" | "createdAt" | "updatedAt"> = {
  visitorName: "",
  phone: "",
  email: "",
  candidateName: "",
  whatsappNumber: "",
  noOfPersons: 1,
  checkInTime: "",
  checkOutTime: "",
  registrationDate: "",
  followUpDate: "",
  followUpTime: "",
  followUpNotes: "",
  source: "WALK_IN",
  referralName: "",
  section: "",
  idType: "AADHAR",
  idNumber: "",
  company: "",
  address: "",
  visitDate: new Date().toISOString().split("T")[0],
  visitTime: new Date().toTimeString().split(" ")[0].slice(0, 5),
  purpose: "OTHER",
  personToMeet: "",
  department: "ADMINISTRATION",
  enquiryReason: "",
  location: "",
  remarks: "",
  status: "NEW",
  closeNote: "",
};

const sourceOptions = [
  "WALK_IN", "WEBSITE", "SOCIAL_MEDIA", "REFERRAL", "ADVERTISEMENT", "COLD_CALL", "EXHIBITION", "OTHER",
];

const sectionOptions = [
  "General", "Admission", "Fee Inquiry", "Academic", "Hostel", "Placement", "Exam Cell", "Transport", "Other",
];

export default function ReceptionEnquiryPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Visitor | null>(null);
  const [form, setForm] = useState<typeof emptyVisitor>(emptyVisitor);
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("visitor");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("visit_enquiries").select("*").order("visitDate", { ascending: false });
      if (data) {
        setVisitors(data.map((r: any) => ({
          ...r,
          visitDate: r.visitDate || r.visit_date,
          checkInTime: r.checkInTime || r.check_in_time,
          checkOutTime: r.checkOutTime || r.check_out_time,
          followUpDate: r.followUpDate || r.follow_up_date,
          followUpTime: r.followUpTime || r.follow_up_time,
          noOfPersons: r.noOfPersons || r.no_of_persons || 1,
        })));
      }
    } catch {
      toast({ title: "Could not load visitors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleEdit = (visitor: Visitor) => {
    setEditing(visitor);
    setForm({
      visitorName: visitor.visitorName,
      phone: visitor.phone,
      email: visitor.email || "",
      candidateName: visitor.candidateName || "",
      whatsappNumber: visitor.whatsappNumber || "",
      noOfPersons: visitor.noOfPersons,
      checkInTime: visitor.checkInTime || "",
      checkOutTime: visitor.checkOutTime || "",
      registrationDate: visitor.registrationDate ? visitor.registrationDate.split("T")[0] : "",
      followUpDate: visitor.followUpDate ? visitor.followUpDate.split("T")[0] : "",
      followUpTime: visitor.followUpTime || "",
      followUpNotes: visitor.followUpNotes || "",
      source: visitor.source || "WALK_IN",
      referralName: visitor.referralName || "",
      section: visitor.section || "",
      idType: visitor.idType,
      idNumber: visitor.idNumber || "",
      company: visitor.company || "",
      address: visitor.address || "",
      visitDate: visitor.visitDate ? visitor.visitDate.split("T")[0] : "",
      visitTime: visitor.visitTime || "",
      purpose: visitor.purpose,
      personToMeet: visitor.personToMeet,
      department: visitor.department,
      enquiryReason: visitor.enquiryReason || "",
      location: visitor.location || "",
      remarks: visitor.remarks || "",
      status: visitor.status,
      closeNote: visitor.closeNote || "",
    });
    setActiveTab("visitor");
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ ...emptyVisitor });
    setActiveTab("visitor");
  };

  const handleSave = async () => {
    if (!form.visitorName.trim() || !form.phone.trim()) {
      toast({ title: "Visitor name and mobile number are required", variant: "destructive" });
      return;
    }

    const payload = {
      visitorName: form.visitorName,
      phone: form.phone,
      email: form.email || null,
      candidateName: form.candidateName || null,
      whatsappNumber: form.whatsappNumber || null,
      noOfPersons: form.noOfPersons,
      checkInTime: form.checkInTime || null,
      checkOutTime: form.checkOutTime || null,
      followUpDate: form.followUpDate || null,
      followUpTime: form.followUpTime || null,
      followUpNotes: form.followUpNotes || null,
      source: form.source,
      referralName: form.referralName || null,
      section: form.section || null,
      idType: form.idType,
      idNumber: form.idNumber || null,
      company: form.company || null,
      address: form.address || null,
      visitDate: form.visitDate,
      visitTime: form.visitTime,
      purpose: form.purpose,
      personToMeet: form.personToMeet,
      department: form.department,
      enquiryReason: form.enquiryReason || null,
      location: form.location || null,
      remarks: form.remarks || null,
      status: form.status,
      closeNote: form.closeNote || null,
    };

    try {
      let error;
      if (editing?.id) {
        const result = await (supabase.from("visit_enquiries") as any).update(payload).eq("id", editing.id).select().single();
        error = result.error;
      } else {
        const result = await (supabase.from("visit_enquiries") as any).insert(payload).select().single();
        error = result.error;
      }
      if (error) throw error;
      toast({ title: editing?.id ? "Visitor updated" : "Visitor registered" });
      setShowDialog(false);
      setEditing(null);
      void load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("visit_enquiries").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Visitor record deleted" });
      void load();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppLayout>
      <PageHeader
        title="Visitor Enquiry"
        description="Manage visitor details, check-in/out, follow-ups and enquiries"
        breadcrumbs={[
          { label: "Reception", href: "/enquiries" },
          { label: "Visitors & Enquiries" },
        ]}
        actions={
          <Button className="gap-2" onClick={() => { handleNew(); setShowDialog(true); }}>
            <Plus className="h-4 w-4" /> New Visitor
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <DataTable
          data={visitors}
          columns={columns}
          selectable
          searchPlaceholder="Search visitors..."
          actions={(visitor) => [
            { label: "View Details", onClick: () => { handleEdit(visitor); setShowDialog(true); } },
            { label: "Edit", onClick: () => { handleEdit(visitor); setShowDialog(true); } },
            { label: "Delete", onClick: () => handleDelete(visitor.id), destructive: true },
          ]}
        />
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) { setShowDialog(false); setEditing(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Visitor" : "New Visitor Entry"}</DialogTitle>
            <DialogDescription>
              Fill in visitor details across the sections below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visitor" className="gap-1.5"><User className="h-3.5 w-3.5" />Visitor Info</TabsTrigger>
              <TabsTrigger value="idproof" className="gap-1.5"><FileText className="h-3.5 w-3.5" />ID Proof</TabsTrigger>
              <TabsTrigger value="visit" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />Visit Details</TabsTrigger>
              <TabsTrigger value="extra" className="gap-1.5"><Star className="h-3.5 w-3.5" />Extra Info</TabsTrigger>
            </TabsList>

            <TabsContent value="visitor" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="visitorName">Visitor Name *</Label>
                  <Input id="visitorName" value={form.visitorName} onChange={e => updateField("visitorName", e.target.value)} placeholder="Full name of the visitor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input id="phone" value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="10-digit mobile number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input id="whatsappNumber" value={form.whatsappNumber} onChange={e => updateField("whatsappNumber", e.target.value)} placeholder="WhatsApp number (if different)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input id="candidateName" value={form.candidateName} onChange={e => updateField("candidateName", e.target.value)} placeholder="Student/candidate name (if applicable)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="Email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={form.source} onValueChange={(val) => updateField("source", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select value={form.section} onValueChange={(val) => updateField("section", val)}>
                    <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                    <SelectContent>
                      {sectionOptions.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralName">Referral Name</Label>
                  <Input id="referralName" value={form.referralName} onChange={e => updateField("referralName", e.target.value)} placeholder="Who referred this visitor?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationDate">Registration Date</Label>
                  <Input id="registrationDate" type="date" value={form.registrationDate} onChange={e => updateField("registrationDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noOfPersons">Number of Persons</Label>
                  <Input id="noOfPersons" type="number" min={1} value={form.noOfPersons} onChange={e => updateField("noOfPersons", parseInt(e.target.value) || 1)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input id="checkInTime" type="time" value={form.checkInTime} onChange={e => updateField("checkInTime", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input id="checkOutTime" type="time" value={form.checkOutTime} onChange={e => updateField("checkOutTime", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="idproof" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type *</Label>
                  <Select value={form.idType} onValueChange={(val: VisitorIdType) => updateField("idType", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AADHAR">Aadhar Card</SelectItem>
                      <SelectItem value="PAN">PAN Card</SelectItem>
                      <SelectItem value="DRIVING">Driving License</SelectItem>
                      <SelectItem value="VOTER">Voter ID Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input id="idNumber" value={form.idNumber} onChange={e => updateField("idNumber", e.target.value)} placeholder="Enter ID number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Organisation / Company</Label>
                  <Input id="company" value={form.company} onChange={e => updateField("company", e.target.value)} placeholder="Organisation or company name" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Visitor Address</Label>
                  <Textarea id="address" value={form.address} onChange={e => updateField("address", e.target.value)} placeholder="Full address of the visitor" rows={2} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visit" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Visit Date *</Label>
                  <Input id="visitDate" type="date" value={form.visitDate} onChange={e => updateField("visitDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitTime">Visit Time *</Label>
                  <Input id="visitTime" type="time" value={form.visitTime} onChange={e => updateField("visitTime", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit *</Label>
                  <Select value={form.purpose} onValueChange={(val: VisitPurpose) => updateField("purpose", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMISSION">Admission</SelectItem>
                      <SelectItem value="FEE">Fee</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="COMPLAINT">Complaint</SelectItem>
                      <SelectItem value="DELIVERY">Delivery</SelectItem>
                      <SelectItem value="INTERVIEW">Interview</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Select Department *</Label>
                  <Select value={form.department} onValueChange={(val: DepartmentType) => updateField("department", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMINISTRATION">Administration</SelectItem>
                      <SelectItem value="ACADEMICS">Academics</SelectItem>
                      <SelectItem value="ACCOUNTS">Accounts</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="LIBRARY">Library</SelectItem>
                      <SelectItem value="SPORTS">Sports</SelectItem>
                      <SelectItem value="LAB">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personToMeet">Person to Meet *</Label>
                  <Input id="personToMeet" value={form.personToMeet} onChange={e => updateField("personToMeet", e.target.value)} placeholder="Name of the person to meet" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enquiryReason">Inquiry Reason</Label>
                  <Input id="enquiryReason" value={form.enquiryReason} onChange={e => updateField("enquiryReason", e.target.value)} placeholder="Reason for enquiry" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={e => updateField("location", e.target.value)} placeholder="Meeting location or desk number" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extra" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input id="followUpDate" type="date" value={form.followUpDate} onChange={e => updateField("followUpDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpTime">Follow-up Time</Label>
                  <Input id="followUpTime" type="time" value={form.followUpTime} onChange={e => updateField("followUpTime", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                  <Textarea id="followUpNotes" value={form.followUpNotes} onChange={e => updateField("followUpNotes", e.target.value)} placeholder="Notes for follow-up" rows={2} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" value={form.remarks} onChange={e => updateField("remarks", e.target.value)} placeholder="Any additional remarks" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(val: EnquiryStatus) => updateField("status", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="CONVERTED">Converted</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeNote">Close Note</Label>
                  <Input id="closeNote" value={form.closeNote} onChange={e => updateField("closeNote", e.target.value)} placeholder="Note when closing" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Save"} Visitor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
