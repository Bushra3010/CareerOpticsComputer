import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceButton,
  DceDivider,
  DceField,
  DceGrid,
  DceInput,
  DceLinkButton,
  DcePanel,
  DceSelect,
  DceTextarea,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { createStudent, getBatches, getBranches, getCourses } from "@/lib/supabase/data";
import { createInvoiceRow } from "@/lib/supabase/studentFee";
import { readDocument } from "@/lib/supabase/onlineAdmission";
import { INDIAN_STATES, districtsFor } from "@/data/indianStates";

const EDUCATION_OPTIONS = ["Matriculation", "Intermediate", "Graduate", "Post Graduate", "Other"];
const CATEGORY_OPTIONS = ["SC", "ST", "OBC", "General"];
/** The `Gender` enum's members; the label is what the form shows. */
const GENDER_OPTIONS: Array<[string, string]> = [["MALE", "Male"], ["FEMALE", "Female"], ["OTHER", "Other"]];

const PHOTO_MAX_PX = 300;

// Rows as PostgREST returns them, embeds included; the columns vary by deployment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

export interface StudentForm {
  branchId: string;
  name: string;
  fatherName: string;
  motherName: string;
  gender: string;
  dateOfBirth: string;
  courseId: string;
  batchId: string;
  fees: string;
  admissionDate: string;
  email: string;
  phone: string;
  guardianPhone: string;
  aadharNumber: string;
  education: string;
  category: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const blankForm = (): StudentForm => ({
  branchId: "",
  name: "",
  fatherName: "",
  motherName: "",
  gender: "",
  dateOfBirth: "",
  courseId: "",
  batchId: "",
  fees: "",
  admissionDate: today(),
  email: "",
  phone: "",
  guardianPhone: "",
  aadharNumber: "",
  education: "",
  category: "",
  address: "",
  state: "Bihar",
  district: "",
  pincode: "",
});

/**
 * Every problem on the form at once, keyed by field, so each box can say what
 * is wrong with it rather than one toast naming the first failure.
 */
function validateStudentForm(form: StudentForm, opts: { needsBranch: boolean; hasPhoto: boolean }) {
  const errors: Partial<Record<keyof StudentForm | "photo", string>> = {};
  const required: Array<[keyof StudentForm, string]> = [
    ["name", "Applicant name"],
    ["fatherName", "Father name"],
    ["motherName", "Mother name"],
    ["gender", "Gender"],
    ["dateOfBirth", "Date of birth"],
    ["courseId", "Course"],
    ["fees", "Fees"],
    ["admissionDate", "Date of admission"],
    ["email", "Email"],
    ["phone", "Mobile"],
    ["guardianPhone", "Guardian mobile"],
    ["aadharNumber", "Aadhaar number"],
    ["education", "Education"],
    ["category", "Category"],
    ["address", "Address"],
    ["state", "State"],
    ["district", "District"],
    ["pincode", "Pin code"],
  ];
  if (opts.needsBranch) required.unshift(["branchId", "Branch"]);
  for (const [key, label] of required) {
    if (!String(form[key] ?? "").trim()) errors[key] = `${label} is required`;
  }
  if (!opts.hasPhoto) errors.photo = "Photo is required";

  const mobile = /^[6-9]\d{9}$/;
  if (form.phone && !mobile.test(form.phone.trim())) errors.phone = "Enter a valid 10-digit mobile number";
  if (form.guardianPhone && !mobile.test(form.guardianPhone.trim())) errors.guardianPhone = "Enter a valid 10-digit mobile number";
  if (form.aadharNumber && !/^\d{12}$/.test(form.aadharNumber.trim())) errors.aadharNumber = "Aadhaar must be 12 digits";
  if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "Pin code must be 6 digits";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email";
  if (form.fees && !(Number(form.fees) >= 0)) errors.fees = "Enter the fee in rupees";
  if (form.dateOfBirth && form.dateOfBirth >= today()) errors.dateOfBirth = "Date of birth must be in the past";
  return errors;
}

/** Scaled down on a canvas so a phone camera's 4 MB photo does not ride in the students row. */
async function resizePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("The photo must be an image.");
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the photo."));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = raw;
  });
  if (!img) return raw;
  const scale = Math.min(1, PHOTO_MAX_PX / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

const durationLabel = (course: Raw) => {
  const value = Number(course.durationValue) || 0;
  if (!value) return "";
  const unit = String(course.durationUnit || "MONTHS").toLowerCase().replace(/s$/, "");
  return ` (${value} ${unit}${value === 1 ? "" : "s"})`;
};

/** Columns this form writes that a database may not have yet (see centre-student-education.sql / add-student-fee-fields.sql). */
const OPTIONAL_COLUMNS = ["education", "documents"];

export default function CentreAddStudent() {
  const { branchId: ownBranch, organizationId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const needsBranch = !ownBranch;

  const [form, setForm] = useState<StudentForm>(blankForm);
  const [photo, setPhoto] = useState("");
  const [studentDoc, setStudentDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [errors, setErrors] = useState<ReturnType<typeof validateStudentForm>>({});
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Raw[]>([]);
  const [courses, setCourses] = useState<Raw[]>([]);
  const [batches, setBatches] = useState<Raw[]>([]);
  const [branchFees, setBranchFees] = useState<Map<string, number>>(new Map());

  const branchId = ownBranch || form.branchId || "";

  useEffect(() => {
    if (!needsBranch) return;
    getBranches(organizationId)
      .then((r) => setBranches(r.data || []))
      .catch(() => setBranches([]));
  }, [needsBranch, organizationId]);

  useEffect(() => {
    if (!branchId) {
      setCourses([]);
      setBatches([]);
      return;
    }
    let cancelled = false;
    Promise.all([
      getCourses(organizationId, branchId).then((r) => r.data as Raw[]).catch(() => [] as Raw[]),
      getBatches(branchId).then((r) => r.data as Raw[]).catch(() => [] as Raw[]),
      // A branch may charge its own price for a course; that overrides the catalogue's.
      Promise.resolve(
        supabase.from("branch_courses").select("courseId, branchFee").eq("branchId", branchId),
      ).then(({ data }) => (data || []) as Raw[]).catch(() => [] as Raw[]),
    ]).then(([c, b, fees]) => {
      if (cancelled) return;
      setCourses(c);
      setBatches(b);
      setBranchFees(new Map(fees.filter((f) => f.branchFee != null).map((f) => [String(f.courseId), Number(f.branchFee)])));
    });
    return () => {
      cancelled = true;
    };
  }, [branchId, organizationId]);

  const courseBatches = useMemo(
    () => batches.filter((b) => String(b.courseId) === form.courseId && b.isActive !== false),
    [batches, form.courseId],
  );
  const districts = useMemo(() => districtsFor(form.state) || [], [form.state]);

  const set = <K extends keyof StudentForm>(key: K, value: StudentForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const pickCourse = (courseId: string) => {
    const course = courses.find((c) => String(c.id) === courseId);
    // The student pays the course fee. branch_courses.branchFee is the franchise
    // price -- what the centre pays the head office -- and only stands in when
    // the course has no fee of its own.
    const fee = (course ? Number(course.baseFee) || 0 : 0) || branchFees.get(courseId) || 0;
    setForm((prev) => ({ ...prev, courseId, batchId: "", fees: courseId ? String(fee || "") : prev.fees }));
    setErrors((prev) => ({ ...prev, courseId: undefined, fees: undefined }));
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await resizePhoto(file));
      setErrors((prev) => ({ ...prev, photo: undefined }));
    } catch (e) {
      toast({ title: "Photo not accepted", description: e instanceof Error ? e.message : "Try another photo", variant: "destructive" });
    }
  };

  const onDocument = async (file?: File) => {
    if (!file) return setStudentDoc(null);
    try {
      setStudentDoc(await readDocument(file));
    } catch (e) {
      toast({ title: "Document not accepted", description: e instanceof Error ? e.message : "Try another file", variant: "destructive" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateStudentForm(form, { needsBranch, hasPhoto: Boolean(photo) });
    setErrors(found);
    const problems = Object.values(found).filter(Boolean);
    if (problems.length) {
      toast({ title: "Please correct the form", description: problems.slice(0, 3).join(" · "), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(/\s+/);
      const course = courses.find((c) => String(c.id) === form.courseId);
      const body: Raw = {
        firstName,
        lastName: rest.join(" "),
        fatherName: form.fatherName.trim(),
        motherName: form.motherName.trim(),
        gender: form.gender,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
        photo,
        courseId: form.courseId,
        batchId: form.batchId || undefined,
        admissionDate: new Date(form.admissionDate).toISOString(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsappNumber: form.phone.trim(),
        fatherPhone: form.guardianPhone.trim(),
        aadharNumber: form.aadharNumber.trim(),
        category: form.category,
        education: form.education,
        streetAddress: form.address.trim(),
        // `city` is NOT NULL and the classic form never asked for one; the district is the nearest truth.
        city: form.district.trim(),
        district: form.district.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        admissionStatus: "APPROVED",
        ...(studentDoc ? { documents: { studentDocument: { ...studentDoc, uploadedAt: new Date().toISOString() } } } : {}),
      };
      for (const key of Object.keys(body)) if (body[key] === undefined) delete body[key];

      let created: Raw | null = null;
      try {
        created = (await createStudent(branchId, body)).data as Raw;
      } catch (err) {
        // createStudent only knows its own optional columns; Education and the
        // document are worth losing before the admission is.
        const message = err instanceof Error ? err.message : "";
        if (!OPTIONAL_COLUMNS.some((c) => message.includes(c)) && !/schema cache|PGRST204/.test(message)) throw err;
        const trimmed = { ...body };
        for (const c of OPTIONAL_COLUMNS) delete trimmed[c];
        created = (await createStudent(branchId, trimmed)).data as Raw;
      }

      const fees = Number(form.fees) || 0;
      if (created?.id && fees > 0) {
        try {
          await createInvoiceRow(branchId, {
            studentId: String(created.id),
            description: `${course?.name || "Course"} fee`,
            totalAmount: fees,
            dueDate: new Date(form.admissionDate).toISOString(),
          });
        } catch (err) {
          // The student exists; a missing invoice can be raised from the Payments page.
          toast({
            title: "Student saved, fee not invoiced",
            description: err instanceof Error ? err.message : "Raise the fee from the student's Payments page.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Student registered",
        description: created?.applicationNo ? `Application number ${created.applicationNo}` : `${form.name} was added.`,
      });
      navigate("/centre/students?type=all");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again";
      toast({ title: "Could not register the student", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const err = (key: keyof typeof errors) =>
    errors[key] ? <span role="alert" className="mt-1 block text-[11.5px] text-[#f26b6b]">{errors[key]}</span> : null;

  return (
    <AppLayout>
      <DcePanel
        title="New Student Registration"
        actions={<DceLinkButton tone="red" size="sm" to="/centre/students?type=all">All Students</DceLinkButton>}
      >
        <form onSubmit={submit} noValidate>
          {needsBranch && (
            <>
              <DceGrid>
                <DceField label="Branch" required>
                  <DceSelect
                    aria-label="Branch"
                    value={form.branchId}
                    onChange={(e) => setForm((p) => ({ ...p, branchId: e.target.value, courseId: "", batchId: "", fees: "" }))}
                  >
                    <option value="">Select branch</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </DceSelect>
                  {err("branchId")}
                </DceField>
              </DceGrid>
              <DceDivider />
            </>
          )}

          <DceGrid>
            <DceField label="Applicant Name" required>
              <DceInput aria-label="Applicant Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              {err("name")}
            </DceField>
            <DceField label="Father Name" required>
              <DceInput aria-label="Father Name" value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} />
              {err("fatherName")}
            </DceField>
            <DceField label="Mother Name" required>
              <DceInput aria-label="Mother Name" value={form.motherName} onChange={(e) => set("motherName", e.target.value)} />
              {err("motherName")}
            </DceField>
            <DceField label="Gender" required>
              <DceSelect aria-label="Gender" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </DceSelect>
              {err("gender")}
            </DceField>
            <DceField label="Date of Birth" required>
              <DceInput aria-label="Date of Birth" type="date" max={today()} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
              {err("dateOfBirth")}
            </DceField>
            <DceField label="Photo (square 250x250)" required>
              <DceInput aria-label="Photo" type="file" accept="image/*" onChange={(e) => void onPhoto(e.target.files?.[0])} />
              {photo && <img src={photo} alt="Student photo preview" className="mt-2 h-16 w-16 rounded border object-cover" />}
              {err("photo")}
            </DceField>
          </DceGrid>

          <DceDivider />

          <DceGrid>
            <DceField label="Select Course" required>
              <DceSelect aria-label="Select Course" value={form.courseId} onChange={(e) => pickCourse(e.target.value)} disabled={!branchId}>
                <option value="">{branchId ? (courses.length ? "Select course" : "No courses offered") : "Select branch first"}</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}{durationLabel(c)}</option>)}
              </DceSelect>
              {err("courseId")}
            </DceField>
            <DceField label="Select Batch">
              <DceSelect aria-label="Select Batch" value={form.batchId} onChange={(e) => set("batchId", e.target.value)} disabled={!form.courseId}>
                <option value="">{courseBatches.length ? "Select batch (optional)" : "No batch"}</option>
                {courseBatches.map((b) => <option key={b.id} value={b.id}>{b.name}{b.code ? ` (${b.code})` : ""}</option>)}
              </DceSelect>
            </DceField>
            <DceField label="Fees" required>
              <DceInput aria-label="Fees" type="number" min={0} inputMode="numeric" value={form.fees} onChange={(e) => set("fees", e.target.value)} />
              {err("fees")}
            </DceField>
            <DceField label="Date of Admission" required>
              <DceInput aria-label="Date of Admission" type="date" value={form.admissionDate} onChange={(e) => set("admissionDate", e.target.value)} />
              {err("admissionDate")}
            </DceField>
          </DceGrid>

          <DceDivider />

          <DceGrid>
            <DceField label="Email" required>
              <DceInput aria-label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              {err("email")}
            </DceField>
            <DceField label="Mobile" required>
              <DceInput aria-label="Mobile" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} />
              {err("phone")}
            </DceField>
            <DceField label="Mobile Guardian" required>
              <DceInput aria-label="Mobile Guardian" inputMode="numeric" maxLength={10} value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value.replace(/\D/g, ""))} />
              {err("guardianPhone")}
            </DceField>
            <DceField label="Aadhaar Number" required>
              <DceInput aria-label="Aadhaar Number" inputMode="numeric" maxLength={12} value={form.aadharNumber} onChange={(e) => set("aadharNumber", e.target.value.replace(/\D/g, ""))} />
              {err("aadharNumber")}
            </DceField>
            <DceField label="Education" required>
              <DceSelect aria-label="Education" value={form.education} onChange={(e) => set("education", e.target.value)}>
                <option value="">Select education</option>
                {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </DceSelect>
              {err("education")}
            </DceField>
            <DceField label="Document of Student" hint="Optional · photo or PDF">
              <DceInput aria-label="Document of Student" type="file" accept="image/*,application/pdf" onChange={(e) => void onDocument(e.target.files?.[0])} />
            </DceField>
            <DceField label="Category" required>
              <DceSelect aria-label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </DceSelect>
              {err("category")}
            </DceField>
            <DceField label="Address" required span={4}>
              <DceTextarea aria-label="Address" className="min-h-[60px]" value={form.address} onChange={(e) => set("address", e.target.value)} />
              {err("address")}
            </DceField>
            <DceField label="State" required>
              <DceSelect aria-label="State" value={form.state} onChange={(e) => { set("state", e.target.value); set("district", ""); }}>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </DceSelect>
              {err("state")}
            </DceField>
            <DceField label="District" required>
              <DceInput aria-label="District" list="centre-add-districts" value={form.district} onChange={(e) => set("district", e.target.value)} />
              <datalist id="centre-add-districts">
                {districts.map((d) => <option key={d} value={d} />)}
              </datalist>
              {err("district")}
            </DceField>
            <DceField label="Pin Code" required>
              <DceInput aria-label="Pin Code" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
              {err("pincode")}
            </DceField>
          </DceGrid>

          <div className="mt-6">
            <DceButton type="submit" tone="blue" disabled={saving}>{saving ? "Submitting…" : "Submit Form"}</DceButton>
          </div>
        </form>
      </DcePanel>
    </AppLayout>
  );
}
