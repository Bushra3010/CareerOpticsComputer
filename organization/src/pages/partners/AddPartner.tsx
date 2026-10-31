import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createPartner, type PartnerInput } from "@/lib/supabase/partners";
import { PartnerForm } from "./PartnerForm";

const AddPartner = () => {
  const { toast } = useToast();
  const { organizationId } = useAuth();

  const save = async (value: PartnerInput) => {
    if (!organizationId) throw new Error("No organisation");
    try {
      await createPartner(organizationId, value);
      toast({ title: "Partner added", description: `${value.name} has been registered.` });
    } catch (err) {
      toast({
        title: "Partner not saved",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Add Partner"
        description="Register a referral partner and the commission they earn"
        breadcrumbs={[
          { label: "Partners", href: "/partners/all" },
          { label: "Add Partner" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link to="/partners/all">All Partners</Link>
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Partner Details</CardTitle>
        </CardHeader>
        <CardContent>
          {organizationId ? (
            <PartnerForm submitLabel="Save Partner" onSubmit={save} resetOnSave />
          ) : (
            <p className="text-sm text-muted-foreground">
              This account is not linked to an organisation, so partners cannot be added here.
            </p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default AddPartner;
