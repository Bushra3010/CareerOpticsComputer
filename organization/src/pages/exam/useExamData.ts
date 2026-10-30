import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getBranches, getCourses, getSessionYears, getStudentPicklist } from "@/lib/supabase/data";
import { getExamCentres, type ExamCentre } from "@/lib/supabase/examWorkflow";

export type ExamCourse = {
  id: string;
  name: string;
  code?: string;
  durationMonths?: number;
  durationValue?: number;
  durationUnit?: string;
  termType?: string | null;
  termCount?: number | null;
};

export type ExamStudent = {
  id: string;
  branchId: string;
  courseId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  enrollmentNo?: string;
  applicationNo?: string;
  rollNo?: string;
  fatherName?: string;
  academicYear?: string;
  dateOfBirth?: string;
  phone?: string;
};

export const studentName = (s: Pick<ExamStudent, "firstName" | "middleName" | "lastName"> | null | undefined) =>
  s ? [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") : "";

/**
 * What every exam page picks from: centres (all of them for the head office,
 * its own for a centre login), courses, sessions, exam centres and students.
 */
export function useExamData() {
  // `view`, not the role: an organisation admin working as a centre ("Login as
  // center") sees that centre's records only, as the centre itself would.
  const { user, view } = useAuth();
  const { toast } = useToast();
  const isAdmin = view === "admin";
  const ownBranch = isAdmin ? null : user?.branchId || null;
  const [branches, setBranches] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [courses, setCourses] = useState<ExamCourse[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [examCentres, setExamCentres] = useState<ExamCentre[]>([]);
  const [students, setStudents] = useState<ExamStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getBranches(user?.organizationId ?? null),
      getCourses(user?.organizationId ?? null),
      getSessionYears(user?.organizationId ?? null).catch(() => ({ data: [] })),
      getExamCentres(),
      getStudentPicklist(ownBranch),
    ])
      .then(([b, c, s, e, st]) => {
        if (cancelled) return;
        const allBranches = (b.data as Array<{ id: string; name: string; code?: string }>) || [];
        setBranches(ownBranch ? allBranches.filter((x) => x.id === ownBranch) : allBranches);
        setCourses(c.data as ExamCourse[]);
        const names = ((s.data || []) as Array<{ name?: string }>).map((x) => String(x.name || "")).filter(Boolean);
        setSessions(names);
        setExamCentres(e);
        setStudents(st.data as unknown as ExamStudent[]);
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Could not load exam data", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.organizationId, ownBranch, toast, version]);

  const courseOf = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const branchOf = useMemo(() => new Map(branches.map((b) => [b.id, b])), [branches]);
  const studentOf = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const centreOf = useMemo(() => new Map(examCentres.map((c) => [c.id, c])), [examCentres]);

  return {
    user,
    isAdmin,
    ownBranch,
    branches,
    courses,
    sessions,
    examCentres,
    students,
    loading,
    courseOf,
    branchOf,
    studentOf,
    centreOf,
    reload: () => setVersion((v) => v + 1),
  };
}
