import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { DocumentViewer } from "@/components/student/StudentDocuments";
import { fileKind, studentFiles, type StudentFile } from "@/lib/studentDocuments";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, FileText, Save, Upload, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EditableSelect } from "@/components/ui/EditableSelect";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { pickImage } from "@/lib/export";
import {
  getCourses,
  getBranchCourseIds,
  getBatches,
  createStudent,
  getStudent,
  updateStudent,
  updateAdmissionLead,
  getBranches,
  getSessionYears,
  sessionYearsForDate,
  admissionDateProblem,
  type SessionYear,
} from "@/lib/supabase/data";
import { INDIAN_STATES, districtsFor } from "@/data/indianStates";
import { blocksFor, citiesFor } from "@/data/indianCities";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Every key here is a real column on `students`, so the whole draft can be
 * handed to `createStudent` after the numeric and date fields are converted.
 */
type Draft = {
  // Personal
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  /** Single / Married — asked because a married woman is named "W/o", not "D/o". */
  maritalStatus: string;
  bloodGroup: string;
  category: string;
  religion: string;
  nationality: string;
  aadharNumber: string;
  apaarNumber: string;
  // Contact
  phone: string;
  altPhone: string;
  whatsappNumber: string;
  email: string;
  streetAddress: string;
  city: string;
  district: string;
  block: string;
  state: string;
  pincode: string;
  country: string;
  // Enrolment
  branchId: string;
  academicYear: string;
  admissionDate: string;
  /** The primary course, which every invoice, certificate and report reads. */
  courseId: string;
  /** Every course this student is enrolled on, the primary one included. */
  courseIds: string[];
  batchId: string;
  section: string;
  /** The roll number the branch assigns. Not `tenthRollNo`, which is the board's. */
  rollNo: string;
  // Previous education
  tenthSchoolName: string;
  tenthBoard: string;
  tenthYearOfPassing: string;
  tenthPercentage: string;
  tenthRollNo: string;
  tenthSubjects: string;
  twelfthSchoolName: string;
  twelfthBoard: string;
  twelfthYearOfPassing: string;
  twelfthPercentage: string;
  twelfthStream: string;
  twelfthSubjects: string;
  // Family
  /** "Son of" / "Daughter of" / "Wife of" — how the student is named on their
   *  own paperwork, against the person named below. */
  parentage: string;
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  fatherEmail: string;
  fatherAnnualIncome: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  localGuardianName: string;
  localGuardianRelation: string;
  localGuardianPhone: string;
  localGuardianAddress: string;
  // Who brought this admission in.
  referralName: string;
  referralCode: string;
  referralPosition: string;
};

const blank: Draft = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  category: "",
  religion: "",
  nationality: "Indian",
  aadharNumber: "",
  apaarNumber: "",
  phone: "",
  altPhone: "",
  whatsappNumber: "",
  email: "",
  streetAddress: "",
  city: "",
  district: "",
  block: "",
  state: "",
  pincode: "",
  country: "India",
  branchId: "",
  academicYear: "",
  admissionDate: "",
  courseId: "",
  courseIds: [],
  batchId: "",
  section: "",
  rollNo: "",
  tenthSchoolName: "",
  tenthBoard: "",
  tenthYearOfPassing: "",
  tenthPercentage: "",
  tenthRollNo: "",
  tenthSubjects: "",
  twelfthSchoolName: "",
  twelfthBoard: "",
  twelfthYearOfPassing: "",
  twelfthPercentage: "",
  twelfthStream: "",
  twelfthSubjects: "",
  parentage: "",
  fatherName: "",
  fatherOccupation: "",
  fatherPhone: "",
  fatherEmail: "",
  fatherAnnualIncome: "",
  motherName: "",
  motherOccupation: "",
  motherPhone: "",
  localGuardianName: "",
  localGuardianRelation: "",
  localGuardianPhone: "",
  localGuardianAddress: "",
  referralName: "",
  referralCode: "",
  referralPosition: "",
};

/** NOT NULL on `students` - the insert fails with an opaque error without them. */
const REQUIRED: Array<[keyof Draft, string]> = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["dateOfBirth", "Date of birth"],
  ["gender", "Gender"],
  ["phone", "Mobile"],
  ["streetAddress", "Street address"],
  ["city", "City"],
  ["state", "State"],
  ["pincode", "Pincode"],
  ["fatherName", "Father's name"],
  ["motherName", "Mother's name"],
];

/** Integer columns - a blank string is rejected, so they are dropped instead. */
const NUMERIC: Array<keyof Draft> = ["tenthYearOfPassing", "twelfthYearOfPassing"];

const steps = ["Personal", "Academic", "Guardian", "Documents", "Referral", "Review"];

/**
 * The paperwork an admission collects. `required` is what the office is meant
 * to hold on file, and the form says so plainly -- it does not block the
 * admission, because a walk-in without their transfer certificate is still a
 * student to be admitted, and a scan that is not to hand today is chased
 * tomorrow rather than turning someone away at the counter.
 */
const ADMISSION_DOCUMENTS: Array<{ id: string; label: string; required: boolean }> = [
  { id: "tenthMarksheet", label: "10th Marksheet", required: true },
  { id: "twelfthMarksheet", label: "12th Marksheet", required: true },
  { id: "transferCertificate", label: "Transfer Certificate", required: true },
  { id: "aadharCardFront", label: "Aadhar Card (Front)", required: true },
  { id: "aadharCardBack", label: "Aadhar Card (Back)", required: true },
  { id: "passportPhoto", label: "Passport Photo", required: true },
  { id: "admissionForm", label: "Admission Form", required: true },
];

/** What is kept for each upload. The file rides in `dataUrl`, as the student
 *  photo already does -- this app has no storage bucket wired up. */
interface AdmissionDocument {
  name: string;
  dataUrl: string;
  uploadedAt: string;
}

const DOCUMENT_ACCEPT = "application/pdf,image/png,image/jpeg";
/** Base64 inflates a file by about a third, and several of these share one row. */
const DOCUMENT_MAX_BYTES = 2 * 1024 * 1024;
const DOCUMENTS_KEY = "admission-draft-documents";

/** Columns the form does not edit, so an edit never tries to write them back. */
const READ_ONLY_COLUMNS = [
  "id",
  "branchId",
  "organizationId",
  "userId",
  "applicationNo",
  "enrollmentNo",
  "createdAt",
  "updatedAt",
  "deletedAt",
];

/** Date columns are timestamps; every date input on the form wants yyyy-mm-dd. */
const asDateInput = (value: unknown) => {
  const text = String(value ?? "");
  if (!text) return "";
  // A stored day comes back as "2003-01-20T00:00:00" with no zone. Parsing it
  // reads local midnight, and toISOString then gives the previous day east of
  // UTC -- so every save moved the date back one day. Keep the day as written.
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text.slice(0, 10) : date.toISOString().slice(0, 10);
};

/**
 * A `students` row as this form's draft. Every key of `blank` is read back, so
 * a column the form knows about is never silently left at its placeholder.
 */
function draftFromRecord(row: Record<string, unknown>): Draft {
  const out = { ...blank };
  for (const key of Object.keys(blank) as Array<keyof Draft>) {
    if (key === "courseIds") continue;
    const value = row[key];
    if (value === null || value === undefined) continue;
    (out[key] as string) = String(value);
  }
  out.dateOfBirth = asDateInput(row.dateOfBirth);
  out.admissionDate = asDateInput(row.admissionDate);
  // `courseIds` only exists once add-multi-course-and-dropdowns.sql has run;
  // before that the single `courseId` is the whole enrolment.
  const saved = Array.isArray(row.courseIds) ? (row.courseIds as string[]) : [];
  out.courseIds = [...new Set([...saved, String(row.courseId ?? "")].filter(Boolean))];
  out.branchId = String(row.branchId ?? "");
  return out;
}

export default function AdmissionsWorkspace() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  /**
   * `?id=` turns this into the edit screen. "View students" used to open a
   * five-box dialog that saved nowhere; it now sends people here, where every
   * column on the record is on the page.
   */
  const editingId = params.get("id");
  // Opened from an admission lead: the lead is closed against the new student.
  const leadId = editingId ? null : params.get("lead");
  const organizationId = user?.organizationId;
  const branchId = user?.branchId;
  const [step, setStep] = useState(0);
  const [loadingRecord, setLoadingRecord] = useState(!!editingId);
  const [draft, setDraft] = useState<Draft>(() => {
    if (editingId) return blank;
    try {
      return {
        ...blank,
        ...JSON.parse(localStorage.getItem("admission-draft") || "{}"),
      };
    } catch {
      return blank;
    }
  });
  const [courses, setCourses] = useState<
    Array<{ id: string; name: string; isActive?: boolean }>
  >([]);
  const [batches, setBatches] = useState<
    Array<{ id: string; name: string; courseId: string }>
  >([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  /**
   * The ids of the courses the admitting branch has been assigned; null until
   * a branch is known (an administrator who has not picked one yet).
   */
  const [offeredIds, setOfferedIds] = useState<Set<string> | null>(null);
  /**
   * The courses this admission may be filed under: the active ones the
   * admitting branch has been assigned, plus any the student is already on.
   *
   * The whole catalogue is loaded and narrowed here rather than asking
   * `getCourses` for the branch's list, because that list drops courses that
   * were switched off or taken back from the branch -- and dropping one while
   * editing a student who is on it would quietly take their course away the
   * next time the form was saved.
   */
  const courseOptions = courses
    .filter(
      (c) =>
        draft.courseIds.includes(c.id) ||
        (c.isActive !== false && (!offeredIds || offeredIds.has(c.id))),
    )
    .map((c) => ({
      value: c.id,
      label:
        c.isActive === false
          ? `${c.name} (inactive)`
          : offeredIds && !offeredIds.has(c.id)
            ? `${c.name} (not assigned to this branch)`
            : c.name,
    }));
  /**
   * The academic sessions the institute has defined. Empty on a database where
   * `session-years.sql` has not been run, and the academic year then falls back
   * to the free-text box this field used to be.
   */
  const [sessions, setSessions] = useState<SessionYear[]>([]);
  const [documents, setDocuments] = useState<Record<string, AdmissionDocument>>(() => {
    try {
      const held = JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || "{}");
      // Only the slots the form still asks for. A draft autosaved before the
      // list changed holds keys with no card left to show them, and they would
      // otherwise ride into the `documents` column unseen.
      return Object.fromEntries(
        ADMISSION_DOCUMENTS.filter((doc) => held[doc.id]).map((doc) => [doc.id, held[doc.id]]),
      );
    } catch {
      return {};
    }
  });
  const [saving, setSaving] = useState(false);
  /** The uploaded document open full size, if any. */
  const [viewing, setViewing] = useState<StudentFile | null>(null);
  /** Set once the record exists, so the issued number has somewhere to be read. */
  const [issued, setIssued] = useState<{ applicationNo: string; name: string } | null>(
    null,
  );
  // Branch-scoped accounts admit into their own branch and never see the picker.
  const targetBranchId = branchId || draft.branchId;
  const set = (k: keyof Draft, v: string) =>
    setDraft((p) => ({ ...p, [k]: v }));
  // Both writes are guarded: uploads are base64 and the two of them now share
  // one 5MB quota. An unguarded `setItem` throwing QuotaExceededError inside an
  // effect takes the whole form down, and losing autosave is not worth that.
  useEffect(() => {
    // An edit is someone else's record, not a half-finished new admission - it
    // must never overwrite the autosaved draft or be restored as one.
    if (editingId) return;
    try {
      localStorage.setItem("admission-draft", JSON.stringify(draft));
    } catch {
      /* the form still holds the draft in memory */
    }
  }, [draft, editingId]);
  useEffect(() => {
    if (editingId) return;
    try {
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    } catch {
      /* too large to autosave; the uploads survive until the page is reloaded */
    }
  }, [documents, editingId]);

  // Load the record being edited into the same draft the create flow fills in.
  useEffect(() => {
    if (!editingId) return;
    let cancelled = false;
    setLoadingRecord(true);
    getStudent(editingId, branchId ?? null)
      .then(({ data }) => {
        if (cancelled) return;
        setDraft(draftFromRecord(data as Record<string, unknown>));
        // The files already on the record, so they can be seen and kept: the
        // documents column is written whole, and an edit that attached one new
        // scan used to save that scan alone and lose the rest. Every file is
        // kept, not only this form's slots: the centre panel's "Document of
        // Student" is stored under its own key and was dropped on each edit.
        setDocuments(
          Object.fromEntries(
            studentFiles(data as Record<string, unknown>)
              .map((file) => [file.key, { name: file.name || file.label, dataUrl: file.url, uploadedAt: file.uploadedAt || "" }]),
          ),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        toast({
          title: "Could not open that student",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
        navigate("/student/view");
      })
      .finally(() => {
        if (!cancelled) setLoadingRecord(false);
      });
    return () => {
      cancelled = true;
    };
    // Keyed on the record alone. `toast` and `navigate` are only used inside the
    // failure path, and listing them would refetch - wiping out everything typed
    // since - the moment either identity changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, branchId]);
  // `getCourses`/`getBatches` resolve to `{ success, data }`. Assigning the
  // envelope straight into state left `courses.map` undefined and blanked the
  // whole page as soon as the academic step rendered - unwrap `data`, and never
  // let a rejected query escape as an unhandled promise.
  useEffect(() => {
    getCourses(organizationId)
      .then((r) => setCourses(r.data as Array<{ id: string; name: string; isActive?: boolean }>))
      .catch(() => setCourses([]));
    if (!branchId) {
      getBranches(organizationId)
        .then((r) => setBranches(r.data as Array<{ id: string; name: string }>))
        .catch(() => setBranches([]));
    }
    getSessionYears(organizationId)
      .then((r) => setSessions(r.data))
      .catch(() => setSessions([]));
  }, [organizationId, branchId]);

  useEffect(() => {
    if (!targetBranchId) {
      setOfferedIds(null);
      return;
    }
    let cancelled = false;
    getBranchCourseIds(targetBranchId)
      .then((ids) => !cancelled && setOfferedIds(ids))
      // Unreadable is treated as nothing assigned: better an empty picker than
      // one offering courses the branch does not run.
      .catch(() => !cancelled && setOfferedIds(new Set()));
    return () => {
      cancelled = true;
    };
  }, [targetBranchId]);

  /**
   * A new admission starts in the session the office is working in.
   *
   * Only when the box is empty, so a restored autosaved draft and a record
   * being edited both keep the session they already name.
   */
  useEffect(() => {
    if (editingId || !sessions.length) return;
    setDraft((previous) => {
      if (previous.academicYear) return previous;
      const current = sessions.find((session) => session.isCurrent);
      if (!current) return previous;
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...previous,
        academicYear: current.name,
        // Today, unless today is outside the session — filing into last year's
        // session should land on a date that session will accept.
        admissionDate:
          previous.admissionDate ||
          (today >= current.startDate && today <= current.endDate ? today : current.startDate),
      };
    });
  }, [sessions, editingId]);

  // Batches belong to a branch, so they reload whenever the target branch moves.
  useEffect(() => {
    if (!targetBranchId) {
      setBatches([]);
      return;
    }
    getBatches(targetBranchId)
      .then((r) => setBatches(r.data as Array<{ id: string; name: string; courseId: string }>))
      .catch(() => setBatches([]));
  }, [targetBranchId]);
  const uploadDocument = async (id: string, label: string) => {
    const picked = await pickImage(DOCUMENT_ACCEPT, DOCUMENT_MAX_BYTES);
    if (picked === "too-large") {
      toast({
        title: "File too large",
        description: `${label} must be 2MB or smaller. Scan it at a lower quality and try again.`,
        variant: "destructive",
      });
      return;
    }
    if (!picked) return;
    setDocuments((d) => ({
      ...d,
      [id]: { name: picked.name, dataUrl: picked.dataUrl, uploadedAt: new Date().toISOString() },
    }));
    toast({ title: `${label} attached`, description: picked.name });
  };

  const removeDocument = (id: string) =>
    setDocuments((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });

  /**
   * The academic year and the admission date describe the same fact, so they
   * are kept in step instead of being two boxes that can contradict each other.
   *
   * `students.academicYear` is a text column and holds the session's name, which
   * is what every other screen already reads. A record admitted before sessions
   * existed holds whatever was typed into the free-text box, and that value is
   * still offered so editing such a student does not quietly relabel them.
   */
  const selectedSession = sessions.find((s) => s.name === draft.academicYear) ?? null;
  const sessionsForDate = sessionYearsForDate(sessions, draft.admissionDate);
  const sessionOptions: Array<[string, string]> = (() => {
    // Once there is an admission date, only the session that date falls inside
    // is offered — the rest cannot accept this admission. With no date yet,
    // every session still open is offered so the session can be picked first.
    const offered =
      draft.admissionDate && sessionsForDate.length
        ? sessionsForDate
        : sessions.filter((s) => s.status !== "CLOSED" || s.name === draft.academicYear);
    const options = offered.map(
      (s) => [s.name, `${s.name} (${s.startDate} to ${s.endDate})`] as [string, string],
    );
    if (draft.academicYear && !offered.some((s) => s.name === draft.academicYear)) {
      options.unshift([draft.academicYear, draft.academicYear]);
    }
    return options;
  })();
  /** The rule: an admission cannot be dated before its academic year began. */
  const dateProblem = admissionDateProblem(selectedSession, draft.admissionDate);

  const changeAdmissionDate = (value: string) =>
    setDraft((p) => {
      const matches = sessionYearsForDate(sessions, value);
      // The date leads: whichever session contains it is the session this
      // admission is in. A pick that still fits is left alone, which is what
      // matters when an institute deliberately overlaps two sessions.
      const fits = matches.some((s) => s.name === p.academicYear);
      return {
        ...p,
        admissionDate: value,
        academicYear: fits || !matches.length ? p.academicYear : matches[0].name,
      };
    });

  const changeSession = (name: string) =>
    setDraft((p) => {
      const picked = sessions.find((s) => s.name === name);
      if (!picked) return { ...p, academicYear: name };
      const today = new Date().toISOString().slice(0, 10);
      const insideAlready =
        p.admissionDate >= picked.startDate && p.admissionDate <= picked.endDate;
      return {
        ...p,
        academicYear: name,
        // Moving the session to one that would refuse the date on screen moves
        // the date with it, rather than leaving the form in a state it will
        // not save. Today when the new session is open, its first day if not.
        admissionDate: insideAlready
          ? p.admissionDate
          : today >= picked.startDate && today <= picked.endDate
            ? today
            : picked.startDate,
      };
    });

  const requiredDocuments = ADMISSION_DOCUMENTS.filter((doc) => doc.required);
  const missingDocuments = requiredDocuments.filter((doc) => !documents[doc.id]);

  // Measured against what an admission actually needs. Counting all ~50 optional
  // boxes would leave a complete application sitting at a third of the bar.
  const progress = Math.round(
    (REQUIRED.filter(([key]) => draft[key]).length / REQUIRED.length) * 100,
  );
  const submit = async () => {
    const missing = REQUIRED.filter(([key]) => !draft[key]).map(([, label]) => label);
    if (missing.length) {
      toast({
        title: "Admission is incomplete",
        description: `Still needed: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    if (!targetBranchId) {
      toast({
        title: "Choose a branch",
        description: "An admission has to be filed against a branch.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }
    // The admission date has to sit inside the academic year it claims. Checked
    // here as well as on the box itself, because `min`/`max` on a date input is
    // advisory — a typed date gets past it in several browsers.
    if (dateProblem) {
      toast({ title: "Check the admission date", description: dateProblem, variant: "destructive" });
      setStep(1);
      return;
    }
    // Only once the institute has sessions on file. Before that the box is free
    // text and there is nothing to be consistent with.
    if (sessions.length && !draft.academicYear) {
      toast({
        title: "Choose the academic session",
        description: "An admission is filed against a session year.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      // Empty boxes are written as null, never "": the integer columns reject an
      // empty string, and on an edit a box the user cleared has to actually
      // clear the column rather than leave the old value behind. A new admission
      // leaves them out entirely, which comes to the same thing.
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(draft)) {
        if (READ_ONLY_COLUMNS.includes(key) || key === "courseIds") continue;
        if (value === "") {
          if (editingId) payload[key] = null;
          continue;
        }
        payload[key] = NUMERIC.includes(key as keyof Draft) ? Number(value) : value;
      }
      // The first pick is the primary course every other screen reads; the array
      // carries the whole enrolment. An edit that clears the list clears both.
      payload.courseId = draft.courseIds[0] || null;
      payload.courseIds = draft.courseIds;
      const body = {
        ...payload,
        // `students.documents` is jsonb. Left out entirely when nothing was
        // attached, so the column reads as null rather than an empty object --
        // and `createStudent` drops it on a database that has not been migrated.
        ...(Object.keys(documents).length ? { documents } : {}),
        // The columns are timestamps; a bare `yyyy-mm-dd` is rejected.
        dateOfBirth: new Date(draft.dateOfBirth).toISOString(),
        admissionDate: new Date(draft.admissionDate || Date.now()).toISOString(),
      };

      if (editingId) {
        await updateStudent(editingId, targetBranchId, body);
        toast({
          title: "Student updated",
          description: "The record now matches what is on this form.",
        });
        navigate("/student/view");
        return;
      }

      const { data } = await createStudent(targetBranchId, {
        ...body,
        admissionStatus: "APPROVED",
      });
      const applicationNo =
        (data as { applicationNo?: string } | null)?.applicationNo || "";
      const studentId = (data as { id?: string } | null)?.id;
      if (leadId && studentId) {
        await updateAdmissionLead(leadId, { status: "Admission", studentId }).catch(() => {
          /* the admission stands; the lead can be moved by hand */
        });
      }
      setIssued({
        applicationNo,
        name: [draft.firstName, draft.middleName, draft.lastName]
          .filter(Boolean)
          .join(" "),
      });
      toast({
        title: "Admission completed",
        description: applicationNo
          ? `Application number ${applicationNo} was issued.`
          : "Student profile was created.",
      });
      setDraft(blank);
      setDocuments({});
      setStep(0);
      localStorage.removeItem("admission-draft");
      localStorage.removeItem(DOCUMENTS_KEY);
    } catch (e) {
      toast({
        title: editingId ? "Could not save the student" : "Admission could not be completed",
        description: e instanceof Error ? e.message : "Please review fields",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Editing renders the same form, so showing it before the record arrives would
  // flash an empty admission over the student's own details.
  if (loadingRecord) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading student…
        </div>
      </AppLayout>
    );
  }

  if (issued) {
    return (
      <AppLayout>
        <Card className="mx-auto mt-10 max-w-xl text-center">
          <CardContent className="p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-[-.03em]">
              Admission completed
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {issued.name} has been admitted.
            </p>
            <div className="mt-6 rounded-2xl border bg-muted/30 p-6">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                Application number
              </p>
              <p className="mt-2 select-all text-3xl font-semibold tracking-tight">
                {issued.applicationNo || "Not issued"}
              </p>
            </div>
            <Button className="mt-6 w-full" onClick={() => setIssued(null)}>
              Start another admission
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
          Student management
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">
          {editingId ? "Edit student" : "New admission"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {editingId
            ? "Every field on the record is editable here, across all four steps. Clearing a box clears the column."
            : "A guided application that creates a real student record. The application number is issued once the form is completed."}
        </p>
      </div>
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/25 p-5">
          <div className="mb-3 flex justify-between text-sm">
            <span>{editingId ? "Record completeness" : "Admission progress · autosaved"}</span>
            <strong>{progress}%</strong>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {steps.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`min-w-36 rounded-xl border px-3 py-2 text-xs ${i === step ? "bg-foreground text-background" : "bg-card"}`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="p-6">
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            {step === 0 && (
              <>
                <Section title="Personal details" />
                <Field l="First name" required>
                  <Input
                    value={draft.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                </Field>
                <Field l="Middle name">
                  <Input
                    value={draft.middleName}
                    onChange={(e) => set("middleName", e.target.value)}
                  />
                </Field>
                <Field l="Last name" required>
                  <Input
                    value={draft.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                </Field>
                <Field l="Date of birth" required>
                  <DatePicker value={draft.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
                </Field>
                <Field l="Gender" required>
                  <EditableSelect
                    optionKey="gender"
                    value={draft.gender}
                    onChange={(v) => set("gender", v)}
                  />
                </Field>
                <Field l="Marital status">
                  <EditableSelect
                    optionKey="maritalStatus"
                    value={draft.maritalStatus}
                    onChange={(v) => set("maritalStatus", v)}
                  />
                </Field>
                <Field l="Blood group">
                  <EditableSelect
                    optionKey="bloodGroup"
                    value={draft.bloodGroup}
                    onChange={(v) => set("bloodGroup", v)}
                  />
                </Field>
                <Field l="Category">
                  <EditableSelect
                    optionKey="studentCategory"
                    value={draft.category}
                    onChange={(v) => set("category", v)}
                  />
                </Field>
                <Field l="Religion">
                  <EditableSelect
                    optionKey="religion"
                    value={draft.religion}
                    onChange={(v) => set("religion", v)}
                  />
                </Field>
                <Field l="Nationality">
                  <Input
                    value={draft.nationality}
                    onChange={(e) => set("nationality", e.target.value)}
                  />
                </Field>
                <Field l="Aadhaar number">
                  <Input
                    inputMode="numeric"
                    maxLength={12}
                    value={draft.aadharNumber}
                    onChange={(e) =>
                      set("aadharNumber", e.target.value.replace(/\D/g, ""))
                    }
                  />
                </Field>
                <Field l="APAAR / ABC ID">
                  <Input
                    value={draft.apaarNumber}
                    onChange={(e) => set("apaarNumber", e.target.value)}
                  />
                </Field>

                <Section title="Contact" />
                <Field l="Mobile" required>
                  <Input
                    value={draft.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <Field l="Alternate mobile">
                  <Input
                    value={draft.altPhone}
                    onChange={(e) => set("altPhone", e.target.value)}
                  />
                </Field>
                <Field l="WhatsApp number">
                  <Input
                    value={draft.whatsappNumber}
                    onChange={(e) => set("whatsappNumber", e.target.value)}
                  />
                </Field>
                <Field l="Email">
                  <Input
                    type="email"
                    value={draft.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
                <Field l="Street address" required wide>
                  <Input
                    value={draft.streetAddress}
                    onChange={(e) => set("streetAddress", e.target.value)}
                  />
                </Field>
                {/* State, then its districts, then the district's blocks and
                    towns -- an address is written from the outside in, and
                    picking the state first is what narrows the next lists. A
                    place the tables do not carry is typed in instead. */}
                <Field l="State" required>
                  <Picker
                    value={draft.state}
                    onChange={(v) => {
                      // The old district, block and city belong to the old state.
                      setDraft((p) => ({ ...p, state: v, district: "", block: "", city: "" }));
                    }}
                    options={INDIAN_STATES.map((s) => [s, s])}
                    placeholder="Select state"
                  />
                </Field>
                <Field l="District">
                  <SelectWithCustom
                    value={draft.district}
                    onValueChange={(v) => setDraft((p) => ({ ...p, district: v, block: "", city: "" }))}
                    options={districtsFor(draft.state)}
                    placeholder={draft.state ? "Select district" : "Select a state first"}
                    customPlaceholder="Type the district"
                    disabled={!draft.state}
                  />
                </Field>
                <Field l="Block">
                  <SelectWithCustom
                    value={draft.block}
                    onValueChange={(v) => set("block", v)}
                    options={blocksFor(draft.district, draft.state)}
                    placeholder={draft.district ? "Select block" : "Select a district first"}
                    customPlaceholder="Type the block"
                    disabled={!draft.district}
                  />
                </Field>
                <Field l="City" required>
                  <SelectWithCustom
                    value={draft.city}
                    onValueChange={(v) => set("city", v)}
                    options={citiesFor(draft.district)}
                    placeholder={draft.district ? "Select city" : "Select a district first"}
                    customPlaceholder="Type the city"
                    disabled={!draft.district}
                  />
                </Field>
                <Field l="Pincode" required>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    value={draft.pincode}
                    onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                  />
                </Field>
                <Field l="Country">
                  <Input
                    value={draft.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </Field>
              </>
            )}
            {step === 1 && (
              <>
                <Section title="Enrolment" />
                {!branchId && (
                  <Field l="Branch">
                    <Picker
                      value={draft.branchId}
                      onChange={(v) => {
                        set("branchId", v);
                        set("batchId", "");
                      }}
                      options={branches.map((b) => [b.id, b.name])}
                      placeholder="Choose branch"
                      searchable
                    />
                  </Field>
                )}
                <Field l="Academic session">
                  {sessions.length ? (
                    <>
                      <Picker
                        value={draft.academicYear}
                        onChange={changeSession}
                        options={sessionOptions}
                        placeholder="Choose session"
                      />
                      <p className="text-xs text-muted-foreground">
                        {draft.admissionDate && sessionsForDate.length
                          ? "The session this admission date falls in."
                          : "Pick the session; the admission date is kept inside it."}
                      </p>
                    </>
                  ) : (
                    <>
                      <Input
                        placeholder="2026-27"
                        value={draft.academicYear}
                        onChange={(e) => set("academicYear", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        No session years are set up yet. Add them under Session Year to have this
                        checked against the admission date.
                      </p>
                    </>
                  )}
                </Field>
                <Field l="Admission date">
                  {/* Deliberately not bounded by the session: picking a date
                      in another year is how the session follows the date, which
                      is the direction the office actually works in. A date
                      outside the year it claims is flagged here and refused at
                      save, which is the guard that matters. */}
                  <DatePicker
                    value={draft.admissionDate}
                    onChange={changeAdmissionDate}
                    invalid={!!dateProblem}
                  />
                  {dateProblem ? (
                    <p className="text-xs text-destructive">{dateProblem}</p>
                  ) : (
                    selectedSession && (
                      <p className="text-xs text-muted-foreground">
                        {selectedSession.name} runs {selectedSession.startDate} to{" "}
                        {selectedSession.endDate}.
                      </p>
                    )
                  )}
                </Field>
                <Field l="Courses" wide>
                  <MultiSelect
                    options={courseOptions}
                    value={draft.courseIds}
                    onChange={(next) =>
                      setDraft((p) => ({
                        ...p,
                        courseIds: next,
                        // A batch belongs to one course; dropping that course
                        // would otherwise leave a batch from nowhere selected.
                        batchId: next.includes(
                          batches.find((b) => b.id === p.batchId)?.courseId ?? "",
                        )
                          ? p.batchId
                          : "",
                      }))
                    }
                    label="Courses"
                    placeholder={courseOptions.length ? "Choose courses" : "No courses yet"}
                    hint={
                      courseOptions.length || !offeredIds
                        ? "Pick as many as the student is enrolled on. The first one is the primary course shown on certificates and invoices."
                        : "No course is assigned to this branch yet. The head office assigns courses to a branch; once it does, they show here."
                    }
                  />
                </Field>
                <Field l="Batch">
                  <Picker
                    value={draft.batchId}
                    onChange={(v) => set("batchId", v)}
                    disabled={!targetBranchId}
                    options={batches
                      .filter(
                        (b) => draft.courseIds.length === 0 || draft.courseIds.includes(b.courseId),
                      )
                      .map((b) => [b.id, b.name])}
                    placeholder={targetBranchId ? "Choose batch" : "Choose a branch first"}
                  />
                </Field>
                <Field l="Section">
                  <Input
                    placeholder="e.g. A"
                    value={draft.section}
                    onChange={(e) => set("section", e.target.value)}
                  />
                </Field>
                <Field l="Roll no">
                  <Input
                    placeholder="e.g. 24"
                    value={draft.rollNo}
                    onChange={(e) => set("rollNo", e.target.value)}
                  />
                </Field>

                <Section title="Class 10" />
                <Field l="School name" wide>
                  <Input
                    value={draft.tenthSchoolName}
                    onChange={(e) => set("tenthSchoolName", e.target.value)}
                  />
                </Field>
                <Field l="Board">
                  <EditableSelect
                    optionKey="board"
                    value={draft.tenthBoard}
                    onChange={(v) => set("tenthBoard", v)}
                  />
                </Field>
                <Field l="Year of passing">
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    value={draft.tenthYearOfPassing}
                    onChange={(e) =>
                      set("tenthYearOfPassing", e.target.value.replace(/\D/g, ""))
                    }
                  />
                </Field>
                <Field l="Percentage / CGPA">
                  <Input
                    value={draft.tenthPercentage}
                    onChange={(e) => set("tenthPercentage", e.target.value)}
                  />
                </Field>
                <Field l="Roll number">
                  <Input
                    value={draft.tenthRollNo}
                    onChange={(e) => set("tenthRollNo", e.target.value)}
                  />
                </Field>
                <Field l="Subjects" wide>
                  <Input
                    placeholder="Comma separated"
                    value={draft.tenthSubjects}
                    onChange={(e) => set("tenthSubjects", e.target.value)}
                  />
                </Field>

                <Section
                  title="Class 12"
                  hint="Leave blank if the applicant has not taken class 12."
                />
                <Field l="School name" wide>
                  <Input
                    value={draft.twelfthSchoolName}
                    onChange={(e) => set("twelfthSchoolName", e.target.value)}
                  />
                </Field>
                <Field l="Board">
                  <EditableSelect
                    optionKey="board"
                    value={draft.twelfthBoard}
                    onChange={(v) => set("twelfthBoard", v)}
                  />
                </Field>
                <Field l="Year of passing">
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    value={draft.twelfthYearOfPassing}
                    onChange={(e) =>
                      set("twelfthYearOfPassing", e.target.value.replace(/\D/g, ""))
                    }
                  />
                </Field>
                <Field l="Percentage / CGPA">
                  <Input
                    value={draft.twelfthPercentage}
                    onChange={(e) => set("twelfthPercentage", e.target.value)}
                  />
                </Field>
                <Field l="Stream">
                  <EditableSelect
                    optionKey="stream"
                    value={draft.twelfthStream}
                    onChange={(v) => set("twelfthStream", v)}
                  />
                </Field>
                <Field l="Subjects" wide>
                  <Input
                    placeholder="Comma separated"
                    value={draft.twelfthSubjects}
                    onChange={(e) => set("twelfthSubjects", e.target.value)}
                  />
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Section
                  title="Father / Guardian"
                  hint="Parentage is how the student is named on their certificates — S/o, D/o or W/o the person below."
                />
                <Field l="Parentage">
                  <EditableSelect
                    optionKey="parentage"
                    value={draft.parentage}
                    onChange={(v) => set("parentage", v)}
                  />
                </Field>
                <Field l="Full name" required>
                  <Input
                    value={draft.fatherName}
                    onChange={(e) => set("fatherName", e.target.value)}
                  />
                </Field>
                <Field l="Occupation">
                  <Input
                    value={draft.fatherOccupation}
                    onChange={(e) => set("fatherOccupation", e.target.value)}
                  />
                </Field>
                <Field l="Mobile">
                  <Input
                    value={draft.fatherPhone}
                    onChange={(e) => set("fatherPhone", e.target.value)}
                  />
                </Field>
                <Field l="Email">
                  <Input
                    type="email"
                    value={draft.fatherEmail}
                    onChange={(e) => set("fatherEmail", e.target.value)}
                  />
                </Field>
                <Field l="Annual income" wide>
                  <Input
                    placeholder="e.g. 6,00,000"
                    value={draft.fatherAnnualIncome}
                    onChange={(e) => set("fatherAnnualIncome", e.target.value)}
                  />
                </Field>

                <Section title="Mother" />
                <Field l="Full name" required>
                  <Input
                    value={draft.motherName}
                    onChange={(e) => set("motherName", e.target.value)}
                  />
                </Field>
                <Field l="Occupation">
                  <Input
                    value={draft.motherOccupation}
                    onChange={(e) => set("motherOccupation", e.target.value)}
                  />
                </Field>
                <Field l="Mobile" wide>
                  <Input
                    value={draft.motherPhone}
                    onChange={(e) => set("motherPhone", e.target.value)}
                  />
                </Field>

                <Section
                  title="Local guardian"
                  hint="Only needed when the student does not live with a parent."
                />
                <Field l="Full name">
                  <Input
                    value={draft.localGuardianName}
                    onChange={(e) => set("localGuardianName", e.target.value)}
                  />
                </Field>
                <Field l="Relationship">
                  <EditableSelect
                    optionKey="guardianRelation"
                    value={draft.localGuardianRelation}
                    onChange={(v) => set("localGuardianRelation", v)}
                  />
                </Field>
                <Field l="Mobile">
                  <Input
                    value={draft.localGuardianPhone}
                    onChange={(e) => set("localGuardianPhone", e.target.value)}
                  />
                </Field>
                <Field l="Address">
                  <Input
                    value={draft.localGuardianAddress}
                    onChange={(e) => set("localGuardianAddress", e.target.value)}
                  />
                </Field>
              </>
            )}
            {step === 3 && (
              <div className="sm:col-span-2 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[.12em] text-muted-foreground">
                      Document upload
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, PNG or JPG, up to 2MB each.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {requiredDocuments.length - missingDocuments.length} of {requiredDocuments.length}{" "}
                    required documents attached
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {ADMISSION_DOCUMENTS.map((doc) => {
                    const held = documents[doc.id];
                    return (
                      <div
                        key={doc.id}
                        className={`flex items-center gap-3 rounded-xl border p-4 ${held ? "border-success/40 bg-success/5" : ""}`}
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${held ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                        >
                          {held ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{doc.label}</p>
                          {/* The attached file's own name, so the office can see
                              at a glance that the right scan went in the right slot. */}
                          <p className="truncate text-xs text-muted-foreground">
                            {held ? held.name : doc.required ? "Required" : "Optional"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {held && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              aria-label={`View ${doc.label}`}
                              onClick={() =>
                                setViewing({
                                  key: doc.id,
                                  label: doc.label,
                                  name: held.name,
                                  url: held.dataUrl,
                                  uploadedAt: held.uploadedAt,
                                  kind: fileKind(held.dataUrl, held.name),
                                })
                              }
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                          )}
                          <Button
                            variant={held ? "outline" : "default"}
                            size="sm"
                            className="gap-1.5"
                            onClick={() => uploadDocument(doc.id, doc.label)}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {held ? "Replace" : "Upload"}
                          </Button>
                          {held && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              aria-label={`Remove ${doc.label}`}
                              onClick={() => removeDocument(doc.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {missingDocuments.length > 0 && (
                  <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Still to collect:</strong>{" "}
                    {missingDocuments.map((doc) => doc.label).join(", ")}. The admission can be
                    completed without them — they stay outstanding against the student.
                  </div>
                )}
              </div>
            )}
            {step === 4 && (
              <>
                <Section title="Referral information" />
                <p className="sm:col-span-2 -mt-2 text-xs text-muted-foreground">
                  Who brought this admission in. Leave it blank for a walk-in.
                </p>
                <Field l="Referral name">
                  <Input
                    value={draft.referralName}
                    onChange={(e) => set("referralName", e.target.value)}
                    placeholder="Person or institute who referred"
                  />
                </Field>
                <Field l="Referral code">
                  <Input
                    value={draft.referralCode}
                    onChange={(e) => set("referralCode", e.target.value.toUpperCase())}
                    placeholder="e.g. REF-2026-014"
                  />
                </Field>
                <Field l="Referral position">
                  <Input
                    value={draft.referralPosition}
                    onChange={(e) => set("referralPosition", e.target.value)}
                    placeholder="Partner, staff, student, agent…"
                  />
                </Field>
              </>
            )}
            {step === 5 && (
              <div className="sm:col-span-2 space-y-4">
                <div className="rounded-2xl border bg-muted/30 p-5">
                  <p className="text-xl font-semibold">
                    {[draft.firstName, draft.middleName, draft.lastName]
                      .filter(Boolean)
                      .join(" ") || "Unnamed"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {draft.phone || "No phone"} ·{" "}
                    {draft.courseIds
                      .map((id) => courses.find((c) => c.id === id)?.name)
                      .filter(Boolean)
                      .join(", ") || "Course not assigned"}
                  </p>
                  <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <Row k="Date of birth" v={draft.dateOfBirth} />
                    <Row k="Gender" v={draft.gender} />
                    <Row
                      k="Address"
                      v={[draft.streetAddress, draft.city, draft.block, draft.district, draft.state, draft.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <Row
                      k="Section · Roll no"
                      v={[draft.section, draft.rollNo].filter(Boolean).join(" · ")}
                    />
                    <Row k="Marital status" v={draft.maritalStatus} />
                    <Row
                      k="Father"
                      v={[draft.parentage, draft.fatherName].filter(Boolean).join(" ")}
                    />
                    <Row k="Mother" v={draft.motherName} />
                    <Row
                      k="Class 10"
                      v={[draft.tenthBoard, draft.tenthPercentage].filter(Boolean).join(" · ")}
                    />
                    <Row
                      k="Class 12"
                      v={[draft.twelfthBoard, draft.twelfthPercentage]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                    {/* Only when there is one: a walk-in should not be reviewed
                        against an empty referral line. */}
                    {(draft.referralName || draft.referralCode) && (
                      <Row
                        k="Referred by"
                        v={[draft.referralName, draft.referralPosition, draft.referralCode]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                    )}
                  </dl>
                </div>
                {(() => {
                  const missing = REQUIRED.filter(([k]) => !draft[k]).map(([, l]) => l);
                  return missing.length ? (
                    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
                      <strong>Still needed:</strong> {missing.join(", ")}
                    </div>
                  ) : (
                    <div className="rounded-2xl border p-4 text-sm">
                      {editingId
                        ? "Saving writes every field on this form back to the student record."
                        : "Completing the admission creates an approved student record and issues the application number."}
                    </div>
                  );
                })()}
                {/* Separate from the block above: a missing field stops the
                    insert, a missing document does not. Saying so in one list
                    would make the two read as the same kind of problem. */}
                {missingDocuments.length > 0 && (
                  <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4 text-sm">
                    <strong>Documents outstanding:</strong>{" "}
                    {missingDocuments.map((doc) => doc.label).join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <div className="flex flex-col-reverse gap-2 border-t p-3 sm:flex-row sm:justify-between sm:p-4">
          {/* Nothing is autosaved on an edit, so "Save draft" would be a lie there. */}
          <Button className="w-full sm:w-auto"
            variant="ghost"
            onClick={() =>
              editingId
                ? navigate("/student/view")
                : toast({
                    title: "Draft saved",
                    description: `${progress}% complete`,
                  })
            }
          >
            {editingId ? <ArrowLeft /> : <Save />}
            {editingId ? "Back to students" : "Save draft"}
          </Button>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft />
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Continue
                <ArrowRight />
              </Button>
            ) : (
              <Button onClick={submit} disabled={saving}>
                <Check />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Complete admission"}
              </Button>
            )}
          </div>
        </div>
      </Card>
      <DocumentViewer file={viewing} studentName={[draft.firstName, draft.lastName].filter(Boolean).join(" ") || "student"} onClose={() => setViewing(null)} />
    </AppLayout>
  );
}

function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="sm:col-span-2 border-b pb-2 pt-2 first:pt-0">
      <h2 className="text-sm font-semibold uppercase tracking-[.12em] text-muted-foreground">
        {title}
      </h2>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Field({
  l,
  required,
  wide,
  children,
}: {
  l: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}>
      <Label>
        {l}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

/** Radix rejects "" as an item value, so an empty list renders no items at all. */
function Picker({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled,
  searchable,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
  placeholder?: string;
  disabled?: boolean;
  /** A search box over the options; long lists get one anyway. */
  searchable?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent searchable={searchable} searchPlaceholder={searchable ? "Search centre…" : undefined}>
        {options
          .filter(([v]) => v)
          .map(([v, label]) => (
            <SelectItem key={v} value={v}>
              {label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed py-1">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v || "—"}</dd>
    </div>
  );
}
