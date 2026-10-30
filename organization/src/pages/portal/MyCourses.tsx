import { useEffect, useState } from "react";
import { safeLinks } from "@/lib/syllabus";
import { Link } from "react-router-dom";
import { Award, BookOpen, CalendarClock, ChevronDown, FileText, GraduationCap, PlayCircle, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentPortalCourses, type PortalCourse } from "@/lib/supabase/data";
import { rupees } from "@/lib/fees";

const dayName = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();
const shortDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/**
 * Everything the student is enrolled on: each course, the batch they sit in,
 * the subjects they are taught and by whom, when, and the syllabus.
 */
export default function MyCourses() {
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const [courses, setCourses] = useState<PortalCourse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId || !branchId) {
      setCourses([]);
      return;
    }
    getStudentPortalCourses(userId, branchId)
      .then((result) => { if (!cancelled) setCourses(result.data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your courses."); });
    return () => { cancelled = true; };
  }, [userId, branchId]);

  return (
    <AppLayout>
      <PageHeader
        title="My courses"
        description="Your courses, batch, subjects, teachers, timetable and syllabus."
        breadcrumbs={[{ label: "My courses" }]}
      />

      {error && <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>}
      {!error && courses === null && <p className="py-10 text-center text-sm text-muted-foreground">Loading your courses…</p>}
      {!error && courses?.length === 0 && (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No course is on your record yet. Ask your branch office to enrol you.</CardContent></Card>
      )}

      <div className="space-y-5">
        {courses?.map((course) => (
          <Card key={course.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[course.code, course.category, course.duration].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {course.fee > 0 && <Badge variant="secondary">Course fee {rupees(course.fee)}</Badge>}
              </div>
              {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />Batch</p>
                  <p className="mt-1 text-sm font-semibold">{course.batch?.name ?? "Not placed in a batch yet"}</p>
                  {course.batch && (course.batch.startDate || course.batch.endDate) && (
                    <p className="text-xs text-muted-foreground">{[shortDate(course.batch.startDate), shortDate(course.batch.endDate)].filter(Boolean).join(" – ")}</p>
                  )}
                </div>
                <div className="rounded-xl border p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><GraduationCap className="h-3.5 w-3.5" />Teachers</p>
                  <p className="mt-1 text-sm font-semibold">{course.batch?.teachers.length ? course.batch.teachers.join(", ") : "Not assigned yet"}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Award className="h-3.5 w-3.5" />Eligibility · Certificate</p>
                  <p className="mt-1 text-sm font-semibold">{[course.eligibility, course.certification].filter(Boolean).join(" · ") || "—"}</p>
                </div>
              </div>

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><BookOpen className="h-4 w-4 text-primary" />Subjects</h3>
                {course.subjects.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {course.subjects.map((subject) => (
                      <div key={subject.name} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold">{subject.name}</p>
                          {subject.teachers.length > 0 && <Badge variant="outline">{subject.teachers.join(", ")}</Badge>}
                        </div>
                        {subject.slots.length ? (
                          <ul className="mt-2 space-y-1">
                            {subject.slots.map((slot, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {dayName(slot.day)} {[slot.startTime, slot.endTime].filter(Boolean).join(" – ")}
                                {slot.room && ` · ${slot.room}`}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">Class times not set yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {course.batch ? "No subjects have been assigned to your batch yet." : "Subjects appear once you are placed in a batch."}
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" />Syllabus</h3>
                {course.syllabus.modules.length ? (
                  <div className="space-y-2">
                    {[...course.syllabus.modules]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((module, index) => {
                        const chapters = course.syllabus.chapters
                          .filter((c) => c.moduleId === module.id)
                          .sort((a, b) => a.sortOrder - b.sortOrder);
                        return (
                          <Collapsible key={module.id} defaultOpen={index === 0} className="rounded-xl border">
                            <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-3 text-left">
                              <span>
                                <span className="font-medium">{module.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">{chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}</span>
                              </span>
                              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="border-t px-3 py-2">
                              {module.description && <p className="mb-2 text-xs text-muted-foreground">{module.description}</p>}
                              <ol className="space-y-2">
                                {chapters.map((chapter, i) => (
                                  <li key={chapter.id} className="text-sm">
                                    <p className="font-medium">{i + 1}. {chapter.name}</p>
                                    {chapter.description && <p className="text-xs text-muted-foreground">{chapter.description}</p>}
                                    {chapter.practical && <p className="text-xs text-muted-foreground">Practical: {chapter.practical}</p>}
                                    {(safeLinks(chapter.pdfUrl).length > 0 || safeLinks(chapter.videoUrl).length > 0) && (
                                      <div className="mt-1 flex flex-wrap gap-2">
                                        {safeLinks(chapter.pdfUrl).map((url, n, all) => (
                                          <Button key={`pdf-${n}`} size="sm" variant="outline" asChild><a href={url} target="_blank" rel="noopener noreferrer"><FileText className="mr-1 h-3.5 w-3.5" />Notes{all.length > 1 ? ` ${n + 1}` : ""}</a></Button>
                                        ))}
                                        {safeLinks(chapter.videoUrl).map((url, n, all) => (
                                          <Button key={`video-${n}`} size="sm" variant="outline" asChild><a href={url} target="_blank" rel="noopener noreferrer"><PlayCircle className="mr-1 h-3.5 w-3.5" />Video{all.length > 1 ? ` ${n + 1}` : ""}</a></Button>
                                        ))}
                                      </div>
                                    )}
                                  </li>
                                ))}
                                {!chapters.length && <li className="text-xs text-muted-foreground">No chapters added yet.</li>}
                              </ol>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">The syllabus for this course has not been added yet.</p>
                )}
              </section>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild><Link to="/me/classes">Live classes</Link></Button>
                <Button size="sm" variant="outline" asChild><Link to="/me/results">Results</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
