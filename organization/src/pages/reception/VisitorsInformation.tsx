import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, UserPlus, Clock, LogOut, Eye, Download, Printer, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getEnquiries, deleteEnquiry, updateEnquiry } from "@/lib/supabase/data";

type DbVisitor = {
  id: string;
  branchId: string;
  visitorName: string;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  idType: string;
  idNumber: string | null;
  company: string | null;
  address: string | null;
  visitDate: string;
  visitTime: string;
  purpose: string;
  personToMeet: string;
  department: string;
  noOfPersons: number;
  enquiryReason: string | null;
  location: string | null;
  source: string | null;
  remarks: string | null;
  followUpDate: string | null;
  followUpTime: string | null;
  followUpNotes: string | null;
  status: string;
  createdAt: string;
  registrationDate: string | null;
  // visit_enquiries is mixed case: most columns are camelCase, these three are
  // not. Declaring them the camelCase way is what let the reads go unnoticed.
  call_type: string | null;
  check_in: string | null;
  check_out: string | null;
};

type Visitor = {
  id: string;
  name: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  purpose: string;
  personToMeet: string;
  department: string;
  checkIn: string;
  checkOut: string | null;
  status: "active" | "completed" | "pending";
  idType: string;
  idNumber: string;
  enquiryReason: string;
  location: string;
  source: string;
  remarks: string;
  callType: string;
  followUpDate: string | null;
  followUpTime: string | null;
  followUpNotes: string | null;
  registrationDate: string | null;
};

const PURPOSE_DISPLAY: Record<string, string> = {
  ADMISSION: "Admission Enquiry",
  FEE: "Fee Related",
  MEETING: "Meeting",
  COMPLAINT: "Complaint",
  DELIVERY: "Delivery",
  INTERVIEW: "Interview",
  OTHER: "Other",
};

const mapDbToVisitor = (db: DbVisitor): Visitor => ({
  id: db.id,
  name: db.visitorName,
  phone: db.phone,
  whatsappNumber: db.whatsappNumber || "",
  email: db.email || "",
  purpose: PURPOSE_DISPLAY[db.purpose] || db.purpose,
  personToMeet: db.personToMeet,
  department: db.department,
  checkIn: `${db.visitDate.split("T")[0]} ${db.visitTime}`,
  // `check_out` and `call_type` are snake_case on visit_enquiries; reading the
  // camelCase spelling silently returned undefined for every visitor.
  checkOut: db.check_out ? new Date(db.check_out).toISOString() : null,
  status: db.status === "CLOSED" || db.status === "CONVERTED" ? "completed" : "active",
  idType: db.idType,
  idNumber: db.idNumber || "",
  enquiryReason: db.enquiryReason || "",
  location: db.location || "",
  source: db.source || "",
  remarks: db.remarks || "",
  callType: db.call_type || "",
  followUpDate: db.followUpDate ? db.followUpDate.split("T")[0] : null,
  followUpTime: db.followUpTime || null,
  followUpNotes: db.followUpNotes || null,
  registrationDate: db.registrationDate ? db.registrationDate.split("T")[0] : null,
});

export default function VisitorsInformation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, branchId, loading: authLoading } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const loadVisitors = async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await getEnquiries(branchId, 1, 100);
      const mapped = (res.data || []).map(mapDbToVisitor);
      setVisitors(mapped);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load visitors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && branchId) {
      loadVisitors();
    }
  }, [authLoading, branchId]);

  const handleCheckout = async () => {
    if (!selectedVisitor || !branchId) return;
    setIsCheckingOut(true);
    try {
      await updateEnquiry(selectedVisitor.id, branchId, {
        status: "CLOSED",
        check_out: new Date().toISOString(),
      });
      toast({ title: "Checked Out", description: "Visitor has been checked out." });
      setIsCheckoutDialogOpen(false);
      loadVisitors();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Checkout failed",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleDelete = async (visitor: Visitor) => {
    if (!confirm(`Delete visitor record for ${visitor.name}?`)) return;
    if (!branchId) return;
    setIsDeleting(true);
    try {
      await deleteEnquiry(visitor.id, branchId);
      toast({ title: "Deleted", description: "Visitor record deleted." });
      loadVisitors();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Delete failed",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActions = (visitor: Visitor) => [
    { label: "View Details", onClick: () => { setSelectedVisitor(visitor); setIsViewDialogOpen(true); } },
    ...(visitor.status === "active"
      ? [{ label: "Check Out", onClick: () => { setSelectedVisitor(visitor); setIsCheckoutDialogOpen(true); } }]
      : []),
    { label: "Print Pass", onClick: () => console.log("Print", visitor.id) },
    { label: "Edit", onClick: () => navigate(`/reception/enquiry?edit=${visitor.id}`) },
    { label: "Delete", onClick: () => handleDelete(visitor), destructive: true },
  ];

  const activeVisitors = visitors.filter((v) => v.status === "active").length;
  const completedToday = visitors.filter((v) => v.status === "completed").length;
  const totalToday = visitors.length;

  const columns: Column<Visitor>[] = [
    {
      key: "name",
      header: "Visitor",
      sortable: true,
      cell: (visitor) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {visitor.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{visitor.name}</p>
            <p className="text-xs text-muted-foreground">{visitor.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Mob. Number",
      cell: (visitor) => <span className="text-sm">{visitor.phone}</span>,
    },
    {
      key: "whatsappNumber",
      header: "WhatsApp",
      cell: (visitor) => <span className="text-sm">{visitor.whatsappNumber || "—"}</span>,
    },
    {
      key: "purpose",
      header: "Purpose",
      sortable: true,
      cell: (visitor) => <Badge variant="secondary">{visitor.purpose}</Badge>,
    },
    {
      key: "personToMeet",
      header: "Person to Meet",
      sortable: true,
    },
    {
      key: "checkIn",
      header: "Check-in",
      sortable: true,
      cell: (visitor) => (
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">
            {new Date(visitor.checkIn).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "checkOut",
      header: "Check-out",
      cell: (visitor) => (
        visitor.checkOut ? (
          <div className="flex items-center gap-2">
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">
              {new Date(visitor.checkOut).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        )
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (visitor) => <StatusBadge status={visitor.status} />,
    },
    {
      key: "source",
      header: "Source",
      cell: (visitor) => <span className="text-sm">{visitor.source || "—"}</span>,
    },
    {
      key: "followUpDate",
      header: "Follow-up",
      sortable: true,
      cell: (visitor) => (
        visitor.followUpDate ? (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm">
              {new Date(visitor.followUpDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        )
      ),
    },
  ];

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Visitors Information"
        description="View and manage all visitor records"
        breadcrumbs={[
          { label: "Reception", href: "/reception/visitors" },
          { label: "Visitors Information" },
        ]}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
            <Button onClick={() => navigate("/reception/enquiry")} className="gap-2">
              <UserPlus className="h-4 w-4" />
              New Visitor
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Visitors Today"
          value={totalToday}
          subtitle="All registered visits"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Currently Inside"
          value={activeVisitors}
          subtitle="Active visitors"
          icon={UserPlus}
          variant="info"
        />
        <StatsCard
          title="Checked Out"
          value={completedToday}
          subtitle="Completed visits"
          icon={LogOut}
          variant="success"
        />
        <StatsCard
          title="Avg. Visit Duration"
          value="45 min"
          subtitle="Today's average"
          icon={Clock}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading visitors...</p>
          ) : (
            <DataTable
              data={visitors}
              columns={columns}
              selectable
              searchPlaceholder="Search visitors by name, phone, or purpose..."
              actions={handleActions}
            />
          )}
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Visitor Check-out</DialogTitle>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedVisitor.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedVisitor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVisitor.id} • {selectedVisitor.purpose}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Check-in Time</p>
                  <p className="font-medium">
                    {new Date(selectedVisitor.checkIn).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-out Time</p>
                  <p className="font-medium">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? "Checking out..." : "Confirm Check-out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedVisitor.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium">{selectedVisitor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVisitor.phone}</p>
                  <p className="text-sm text-muted-foreground">{selectedVisitor.email}</p>
                </div>
                <StatusBadge status={selectedVisitor.status} className="ml-auto" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Visitor ID</p>
                  <p className="font-medium">{selectedVisitor.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Purpose</p>
                  <p className="font-medium">{selectedVisitor.purpose}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Enquiry Reason</p>
                  <p className="font-medium">{selectedVisitor.enquiryReason}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">WhatsApp</p>
                  <p className="font-medium">{selectedVisitor.whatsappNumber || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Source</p>
                  <p className="font-medium">{selectedVisitor.source || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Registration Date</p>
                  <p className="font-medium">
                    {selectedVisitor.registrationDate ? new Date(selectedVisitor.registrationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Call Type</p>
                  <p className="font-medium">{selectedVisitor.callType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Person to Meet</p>
                  <p className="font-medium">{selectedVisitor.personToMeet}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Department</p>
                  <p className="font-medium">{selectedVisitor.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">ID Type</p>
                  <p className="font-medium">{selectedVisitor.idType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">ID Number</p>
                  <p className="font-medium">{selectedVisitor.idNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Check-in</p>
                  <p className="font-medium">
                    {new Date(selectedVisitor.checkIn).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Check-out</p>
                  <p className="font-medium">
                    {selectedVisitor.checkOut
                      ? new Date(selectedVisitor.checkOut).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not checked out"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up Date</p>
                  <p className="font-medium flex items-center gap-1.5">
                    {selectedVisitor.followUpDate ? (
                      <>
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {new Date(selectedVisitor.followUpDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up Time</p>
                  <p className="font-medium">{selectedVisitor.followUpTime || "—"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up Notes</p>
                  <p className="font-medium">{selectedVisitor.followUpNotes || "—"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Remarks</p>
                  <p className="font-medium">{selectedVisitor.remarks || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
