"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Calendar, FileText, Mail, Phone, User, CreditCard,
  BookOpen, ClipboardList, Wallet, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  father_name?: string;
  mother_name?: string;
  enrollment_no?: string;
  application_no?: string;
  admission_date?: string;
  admission_status: string;
  is_active: boolean;
  course?: { name: string };
  batch?: { name: string };
  branch?: { name: string };
  fee_invoices?: any[];
  attendance_records?: any[];
};

type Props = {
  id: string;
};

export default function StudentDetailClient({ id }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*, course:courses(name), batch:batches(name), branch:branches(name), fee_invoices(*, payments(*)), attendance_records(*)")
          .eq("id", id)
          .single();
        if (error || !data) {
          router.push("/students");
          return;
        }
        setStudent(data as Student);
      } catch {
        router.push("/students");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, supabase, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">Student not found.</div>
      </AppLayout>
    );
  }

  const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");
  const statusColor = student.admission_status === "APPROVED" ? "bg-green-100 text-green-800" : student.admission_status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";

  return (
    <AppLayout>
      <div className="mb-5">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/students"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to Students</Link>
        </Button>
      </div>

      <section className="mb-5 grid gap-5 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
                {student.first_name[0]}{student.last_name?.[0] ?? ""}
              </div>
              <h1 className="mt-4 text-xl font-semibold">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{student.enrollment_no || "No enrollment yet"}</p>
              <Badge className={`mt-2 ${statusColor}`}>{student.admission_status}</Badge>
            </div>

            <Separator className="my-5" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{student.course?.name || "Not assigned"}</span>
              </div>
              {student.batch && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{student.batch.name}</span>
                </div>
              )}
              {student.branch && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{student.branch.name}</span>
                </div>
              )}
              {student.admission_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Admitted: {new Date(student.admission_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Full Name</p>
                    <p className="mt-1 text-sm">{fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="mt-1 text-sm">{student.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm">{student.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Gender</p>
                    <p className="mt-1 text-sm">{student.gender || "—"}</p>
                  </div>
                  {student.date_of_birth && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Date of Birth</p>
                      <p className="mt-1 text-sm">{new Date(student.date_of_birth).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Enrollment No.</p>
                    <p className="mt-1 text-sm">{student.enrollment_no || "—"}</p>
                  </div>
                  {student.address && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Address</p>
                      <p className="mt-1 text-sm">{student.address}{student.city ? `, ${student.city}` : ""}{student.state ? `, ${student.state}` : ""} {student.pincode || ""}</p>
                    </div>
                  )}
                  {student.father_name && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Father's Name</p>
                      <p className="mt-1 text-sm">{student.father_name}</p>
                    </div>
                  )}
                  {student.mother_name && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Mother's Name</p>
                      <p className="mt-1 text-sm">{student.mother_name}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button asChild><Link href={`/student/edit/${student.id}`}>Edit Student</Link></Button>
                  <Button variant="outline" asChild><Link href={`/fee/collection?student=${student.id}`}><Wallet className="mr-1.5 h-4 w-4" />Collect Fee</Link></Button>
                </div>
              </TabsContent>

              <TabsContent value="fees" className="mt-5">
                {student.fee_invoices?.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No fee invoices found.</p>
                ) : (
                  <div className="space-y-3">
                    {student.fee_invoices?.map((invoice: any) => {
                      const paid = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
                      const balance = Number(invoice.amount) - paid;
                      return (
                        <div key={invoice.id} className="flex items-center justify-between rounded-xl border p-3">
                          <div>
                            <p className="text-sm font-medium">{invoice.description || invoice.invoice_no}</p>
                            <p className="text-xs text-muted-foreground">{invoice.invoice_no} · Due: {invoice.due_date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">₹{Number(invoice.amount).toLocaleString()}</p>
                            <p className={`text-xs ${balance > 0 ? "text-destructive" : "text-green-600"}`}>{balance > 0 ? `₹${balance.toLocaleString()} due` : "Paid"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attendance" className="mt-5">
                {student.attendance_records?.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No attendance records.</p>
                ) : (
                  <div className="space-y-2">
                    {student.attendance_records?.slice(0, 10).map((record: any) => (
                      <div key={`${record.student_id}-${record.date}`} className="flex items-center justify-between rounded-xl border p-3">
                        <span className="text-sm">{record.date}</span>
                        <Badge variant={record.status === "PRESENT" || record.status === "LATE" ? "default" : "destructive"}>{record.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
