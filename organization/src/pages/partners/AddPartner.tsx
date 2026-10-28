import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, Edit, Trash2, UserPlus, Building2, User } from "lucide-react";

interface Partner {
  id: string;
  partnerName: string;
  partnerType: string;
  email: string;
  phone: string;
  city: string;
  commissionRate: string;
  status: "active" | "inactive";
  joinedDate: string;
  contactPerson?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

const samplePartners: Partner[] = [
  {
    id: "1",
    partnerName: "John Education Services",
    partnerType: "organization",
    email: "john@edu.com",
    phone: "+91 9876543210",
    city: "Mumbai",
    commissionRate: "10",
    status: "active",
    joinedDate: "2024-01-15",
    contactPerson: "John Doe",
  },
];

const AddPartner = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>(samplePartners);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Partner>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPartner: Partner = {
      ...(formData as Partner),
      id: Math.random().toString(36).substr(2, 9),
      joinedDate: new Date().toISOString().split("T")[0],
      status: "active",
    };
    setPartners(prev => [...prev, newPartner]);
    setIsCreateModalOpen(false);
    setFormData({});
    toast({
      title: "Success",
      description: "Partner added successfully!",
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPartners(prev =>
      prev.map(p => (p.id === formData.id ? { ...p, ...formData } as Partner : p))
    );
    setIsEditModalOpen(false);
    toast({
      title: "Success",
      description: "Partner updated successfully!",
    });
  };

  const columns = [
    { key: "partnerName", header: "Partner Name", sortable: true },
    { key: "partnerType", header: "Type", 
      cell: (item: Partner) => (
        <Badge variant="outline" className="capitalize">
          {item.partnerType === "organization" ? <Building2 className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
          {item.partnerType}
        </Badge>
      )
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "commissionRate", header: "Comm.", cell: (item: Partner) => `${item.commissionRate}%` },
    { key: "status", header: "Status", cell: (item: Partner) => (
      <Badge variant={item.status === "active" ? "default" : "secondary"}>
        {item.status}
      </Badge>
    )}
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="Add & Manage Partners"
          description="Register and configure partner profiles"
          breadcrumbs={[
            { label: "Partners", href: "/partners/all" },
            { label: "Partner Management" },
          ]}
          actions={
            <Button onClick={() => { setFormData({ partnerType: "individual" }); setIsCreateModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Register New Partner
            </Button>
          }
        />

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={partners}
            searchPlaceholder="Search partners..."
            actions={(item) => [
               { label: "Edit Partner", onClick: () => { setFormData(item); setIsEditModalOpen(true); } },
               { label: "Delete", onClick: () => { setPartners(prev => prev.filter(p => p.id !== item.id)); toast({ title: "Removed", description: "Partner deleted" }); }, destructive: true }
            ]}
          />
        </div>
      </div>

      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => { if(!open) { setIsCreateModalOpen(false); setIsEditModalOpen(false); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isCreateModalOpen ? "Register Partner" : "Update Partner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Partner Name *</Label>
              <Input value={formData.partnerName || ""} onChange={e => setFormData({...formData, partnerName: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.partnerType} onValueChange={val => setFormData({...formData, partnerType: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input type="number" value={formData.commissionRate || ""} onChange={e => setFormData({...formData, commissionRate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setIsCreateModalOpen(false); }}>Cancel</Button>
              <Button type="submit"><UserPlus className="mr-2 h-4 w-4" /> {isCreateModalOpen ? "Create" : "Update"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AddPartner;

