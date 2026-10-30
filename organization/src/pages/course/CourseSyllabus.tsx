import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Video,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { canManageCourses } from "@/lib/roles";
import {
  buildSyllabus,
  filterSyllabus,
  badLink,
  joinLinks,
  nextOrder,
  safeLinks,
  splitLinks,
  studyLinkCount,
  syllabusProblem,
} from "@/lib/syllabus";
import {
  getCourses,
  getCourseSyllabus,
  createSyllabusModule,
  updateSyllabusModule,
  deleteSyllabusModule,
  createSyllabusChapter,
  updateSyllabusChapter,
  deleteSyllabusChapter,
  type SyllabusChapter,
  type SyllabusModule,
} from "@/lib/supabase/data";

interface Course {
  id: string;
  name: string;
  code: string;
  category?: string;
  durationMonths?: number;
  baseFee?: number;
  isActive?: boolean;
}

type SyllabusStatus = "Active" | "Inactive";

interface ModuleDraft {
  name: string;
  description: string;
  sortOrder: number;
  status: SyllabusStatus;
}

interface ChapterDraft {
  moduleId: string;
  name: string;
  description: string;
  practical: string;
  /** One box per link; the column keeps them one per line. */
  pdfUrls: string[];
  videoUrls: string[];
  sortOrder: number;
  status: SyllabusStatus;
}

const blankModule: ModuleDraft = { name: "", description: "", sortOrder: 1, status: "Active" };
const blankChapter: ChapterDraft = {
  moduleId: "",
  name: "",
  description: "",
  practical: "",
  pdfUrls: [""],
  videoUrls: [""],
  sortOrder: 1,
  status: "Active",
};

export default function CourseSyllabus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const mayEdit = canManageCourses(user?.role);

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [searchParams] = useSearchParams();
  const askedCourse = searchParams.get("course");
  const [modules, setModules] = useState<SyllabusModule[]>([]);
  const [chapters, setChapters] = useState<SyllabusChapter[]>([]);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | SyllabusStatus>("All");
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const [moduleDraft, setModuleDraft] = useState<ModuleDraft>({ ...blankModule });
  const [editingModule, setEditingModule] = useState<SyllabusModule | null>(null);
  const [moduleOpen, setModuleOpen] = useState(false);

  const [chapterDraft, setChapterDraft] = useState<ChapterDraft>({ ...blankChapter });
  const [editingChapter, setEditingChapter] = useState<SyllabusChapter | null>(null);
  const [chapterOpen, setChapterOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<
    { kind: "module" | "chapter"; id: string; name: string; chapterCount?: number } | null
  >(null);

  useEffect(() => {
    getCourses(user?.organizationId || null, user?.branchId || null)
      .then((result) => {
        const list = result.data as Course[];
        setCourses(list);
        // Course Subjects' "Update syllabus" opens on its course.
        setCourseId((current) => current || (askedCourse && list.some((c) => c.id === askedCourse) ? askedCourse : "") || list[0]?.id || "");
      })
      .catch((error) =>
        toast({
          title: "Could not load courses",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        }),
      );
  }, [user?.organizationId, user?.branchId, toast, askedCourse]);

  const load = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCourseSyllabus(courseId);
      setModules(data.modules);
      setChapters(data.chapters);
      setReady(data.ready);
    } catch (error) {
      toast({
        title: "Could not load the syllabus",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const course = courses.find((c) => c.id === courseId);
  const sections = useMemo(() => buildSyllabus(modules, chapters), [modules, chapters]);
  const shown = useMemo(() => filterSyllabus(sections, { search, status }), [sections, search, status]);

  const chapterCountFor = (moduleId: string) => chapters.filter((c) => c.moduleId === moduleId).length;

  /* ---------- modules ---------- */

  const openModule = (module?: SyllabusModule) => {
    setEditingModule(module ?? null);
    setModuleDraft(
      module
        ? { name: module.name, description: module.description, sortOrder: module.sortOrder, status: module.status }
        : { ...blankModule, sortOrder: nextOrder(modules) },
    );
    setModuleOpen(true);
  };

  const saveModule = async () => {
    const problem = syllabusProblem(moduleDraft);
    if (problem) {
      toast({ title: "Check the module", description: problem, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = {
        courseId,
        name: moduleDraft.name.trim(),
        description: moduleDraft.description.trim(),
        sortOrder: moduleDraft.sortOrder,
        status: moduleDraft.status,
      };
      if (editingModule) await updateSyllabusModule(editingModule.id, body);
      else await createSyllabusModule(body);
      toast({ title: editingModule ? "Module updated" : "Module added", description: body.name });
      setModuleOpen(false);
      await load();
    } catch (error) {
      toast({
        title: "Could not save the module",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- chapters ---------- */

  const openChapter = (moduleId: string, chapter?: SyllabusChapter) => {
    setEditingChapter(chapter ?? null);
    setChapterDraft(
      chapter
        ? {
            ...chapter,
            pdfUrls: splitLinks(chapter.pdfUrl).length ? splitLinks(chapter.pdfUrl) : [""],
            videoUrls: splitLinks(chapter.videoUrl).length ? splitLinks(chapter.videoUrl) : [""],
          }
        : {
            ...blankChapter,
            moduleId,
            sortOrder: nextOrder(chapters.filter((c) => c.moduleId === moduleId)),
          },
    );
    setChapterOpen(true);
  };

  const saveChapter = async () => {
    const problem = syllabusProblem(chapterDraft);
    if (problem) {
      toast({ title: "Check the chapter", description: problem, variant: "destructive" });
      return;
    }
    if (!chapterDraft.moduleId) {
      toast({ title: "Pick a module", description: "A chapter sits inside one.", variant: "destructive" });
      return;
    }
    for (const [label, links] of [["PDF notes link", chapterDraft.pdfUrls], ["Video link", chapterDraft.videoUrls]] as const) {
      const bad = badLink([...links]);
      if (bad !== null) {
        toast({
          title: "Check the links",
          description: `${label} ${links.length > 1 ? bad + 1 + " " : ""}is not a web address. It should start with https://`,
          variant: "destructive",
        });
        return;
      }
    }
    setSaving(true);
    try {
      const body = {
        courseId,
        moduleId: chapterDraft.moduleId,
        name: chapterDraft.name.trim(),
        description: chapterDraft.description.trim(),
        practical: chapterDraft.practical.trim(),
        pdfUrl: joinLinks(chapterDraft.pdfUrls),
        videoUrl: joinLinks(chapterDraft.videoUrls),
        sortOrder: chapterDraft.sortOrder,
        status: chapterDraft.status,
      };
      if (editingChapter) await updateSyllabusChapter(editingChapter.id, body);
      else await createSyllabusChapter(body);
      toast({ title: editingChapter ? "Chapter updated" : "Chapter added", description: body.name });
      setChapterOpen(false);
      await load();
    } catch (error) {
      toast({
        title: "Could not save the chapter",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /** A box per link, with a way to add another and to take one away. */
  const linkList = (key: "pdfUrls" | "videoUrls", label: string, placeholder: string, addLabel: string) => {
    const links = chapterDraft[key];
    const setLinks = (next: string[]) => setChapterDraft((d) => ({ ...d, [key]: next.length ? next : [""] }));
    return (
      <div className="space-y-2">
        <Label>{label}{links.length > 1 ? `s (${links.length})` : ""}</Label>
        {links.map((link, n) => (
          <div key={n} className="flex items-center gap-2">
            <Input
              type="url"
              placeholder={placeholder}
              aria-label={`${label} ${n + 1}`}
              value={link}
              onChange={(e) => setLinks(links.map((l, i) => (i === n ? e.target.value : l)))}
            />
            {links.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${label.toLowerCase()} ${n + 1}`}
                onClick={() => setLinks(links.filter((_, i) => i !== n))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setLinks([...links, ""])}>
          <Plus className="h-3.5 w-3.5" />{addLabel}
        </Button>
      </div>
    );
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      if (target.kind === "module") await deleteSyllabusModule(target.id);
      else await deleteSyllabusChapter(target.id);
      toast({ title: `${target.kind === "module" ? "Module" : "Chapter"} deleted`, description: target.name });
      await load();
    } catch (error) {
      toast({
        title: "Could not delete",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const toggle = (moduleId: string) =>
    setCollapsed((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    );

  return (
    <AppLayout>
      <PageHeader
        title="Course Syllabus"
        description="Manage course modules and chapter details"
        breadcrumbs={[{ label: "Courses & Batches", href: "/course/view" }, { label: "Course Syllabus" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.print()} disabled={!sections.length}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            {mayEdit && (
              <Button className="gap-2" onClick={() => openModule()} disabled={!courseId}>
                <Plus className="h-4 w-4" />
                Add module
              </Button>
            )}
          </div>
        }
      />

      {!ready && (
        <Card className="mb-6 border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm">
            <strong>The syllabus tables are not in the database yet.</strong> Run{" "}
            <code>supabase/schema/course-syllabus.sql</code> in the Supabase SQL editor — until then
            this page can show a course but cannot store its modules or chapters.
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Courses" value={courses.length} subtitle="In the catalogue" icon={BookOpen} variant="primary" />
        <StatsCard title="Modules" value={modules.length} subtitle={course ? `In ${course.name}` : "Pick a course"} icon={Layers} variant="info" />
        <StatsCard title="Chapters" value={chapters.length} subtitle="Across every module" icon={FileText} variant="success" />
        <StatsCard title="Study links" value={studyLinkCount(chapters)} subtitle="Chapters with notes or video" icon={Video} variant="warning" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Course selection</CardTitle>
          <p className="text-xs text-muted-foreground">
            Pick a course to manage its syllabus. To print its modules on the marksheet, add them under{" "}
            <Link to="/course/subjects" className="font-medium text-primary underline">Course Subjects</Link>.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code ? `${c.code} — ${c.name}` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Search chapter</Label>
            <Input
              placeholder="Module or chapter…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {course && (
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand/12 text-lg font-bold text-brand-ink">
                {(course.code || course.name).slice(0, 3).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{course.code}</Badge>
                  <Badge variant={course.isActive === false ? "outline" : "default"}>
                    {course.isActive === false ? "Inactive" : "Active"}
                  </Badge>
                </div>
                <h2 className="mt-2 text-xl font-semibold">{course.name}</h2>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {course.durationMonths ? <span>{course.durationMonths} months</span> : null}
                  {course.baseFee ? <span>₹{course.baseFee.toLocaleString("en-IN")}</span> : null}
                  {course.category ? <span>{course.category}</span> : null}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:w-[360px]">
              {[
                ["Modules", modules.length],
                ["Chapters", chapters.length],
                ["Study links", studyLinkCount(chapters)],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-muted/40 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Course wise syllabus</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Module, chapter, practical work and study material.
            </p>
          </div>
          <Badge variant="secondary">{shown.length} of {sections.length} modules</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="py-10 text-center text-sm text-muted-foreground">Loading the syllabus…</p>}

          {!loading && sections.length === 0 && (
            <div className="rounded-xl border border-dashed py-12 text-center">
              <p className="font-semibold">No modules on this course yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {!courseId
                  ? "Pick a course above."
                  : mayEdit
                    ? "Add a module to start building the syllabus."
                    : "The organisation sets the syllabus for a course."}
              </p>
            </div>
          )}

          {!loading && sections.length > 0 && shown.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing matches this search.
            </p>
          )}

          {shown.map(({ module, chapters: moduleChapters }) => {
            const open = !collapsed.includes(module.id);
            return (
              <section key={module.id} className="overflow-hidden rounded-xl border">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-4">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => toggle(module.id)}
                    aria-expanded={open}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
                      {module.sortOrder}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-semibold">{module.name}</span>
                        {module.status === "Inactive" && <Badge variant="outline">Inactive</Badge>}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {chapterCountFor(module.id)} {chapterCountFor(module.id) === 1 ? "chapter" : "chapters"}
                        {module.description ? ` · ${module.description}` : ""}
                      </span>
                    </span>
                    {open ? (
                      <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {mayEdit && (
                    <div className="flex shrink-0 gap-1.5">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openChapter(module.id)}>
                        <Plus className="h-3.5 w-3.5" />
                        Chapter
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`Edit ${module.name}`} onClick={() => openModule(module)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${module.name}`}
                        onClick={() =>
                          setPendingDelete({
                            kind: "module",
                            id: module.id,
                            name: module.name,
                            chapterCount: chapterCountFor(module.id),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {open && (
                  <div className="space-y-4 p-4">
                    {moduleChapters.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No chapter in this module yet.
                      </p>
                    )}
                    {moduleChapters.map((chapter) => {
                      const pdfs = safeLinks(chapter.pdfUrl);
                      const videos = safeLinks(chapter.videoUrl);
                      return (
                        <article key={chapter.id} className="rounded-lg border-l-4 border-l-brand/40 bg-muted/20 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">Chapter {chapter.sortOrder}</Badge>
                                {chapter.status === "Inactive" && <Badge variant="outline">Inactive</Badge>}
                              </div>
                              <h3 className="mt-2 font-semibold">{chapter.name}</h3>
                            </div>
                            {mayEdit && (
                              <div className="flex shrink-0 gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${chapter.name}`} onClick={() => openChapter(chapter.moduleId, chapter)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  aria-label={`Delete ${chapter.name}`}
                                  onClick={() => setPendingDelete({ kind: "chapter", id: chapter.id, name: chapter.name })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {chapter.description && (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Chapter details
                              </p>
                              <p className="mt-1 whitespace-pre-line text-sm leading-6">{chapter.description}</p>
                            </div>
                          )}

                          {chapter.practical && (
                            <div className="mt-3 rounded-lg bg-success/10 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-success">
                                Practical work
                              </p>
                              <p className="mt-1 whitespace-pre-line text-sm">{chapter.practical}</p>
                            </div>
                          )}

                          {(pdfs.length > 0 || videos.length > 0) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {pdfs.map((pdf, n) => (
                                <a
                                  key={`pdf-${n}`}
                                  href={pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-success/12 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  PDF notes{pdfs.length > 1 ? ` ${n + 1}` : ""}
                                </a>
                              ))}
                              {videos.map((video, n) => (
                                <a
                                  key={`video-${n}`}
                                  href={video}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-info/12 px-3 py-1.5 text-xs font-semibold text-info hover:bg-info/20"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  Video lecture{videos.length > 1 ? ` ${n + 1}` : ""}
                                </a>
                              ))}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={moduleOpen} onOpenChange={setModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit module" : "Add module"}</DialogTitle>
            <DialogDescription>A module is a section of the course.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Module name *</Label>
              <Input
                placeholder="e.g. Computer Fundamentals"
                value={moduleDraft.name}
                onChange={(e) => setModuleDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="moduleOrder">Order *</Label>
                <Input
                  id="moduleOrder"
                  type="number"
                  min={1}
                  value={moduleDraft.sortOrder}
                  onChange={(e) => setModuleDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={moduleDraft.status}
                  onValueChange={(v) => setModuleDraft((d) => ({ ...d, status: v as SyllabusStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={moduleDraft.description}
                onChange={(e) => setModuleDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleOpen(false)}>Cancel</Button>
            <Button onClick={saveModule} disabled={saving}>{saving ? "Saving…" : "Save module"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={chapterOpen} onOpenChange={setChapterOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChapter ? "Edit chapter" : "Add chapter"}</DialogTitle>
            <DialogDescription>What is taught, and what the student is asked to do.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Module *</Label>
              <Select
                value={chapterDraft.moduleId}
                onValueChange={(v) => setChapterDraft((d) => ({ ...d, moduleId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  {sections.map(({ module }) => (
                    <SelectItem key={module.id} value={module.id}>{module.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterOrder">Order *</Label>
              <Input
                id="chapterOrder"
                type="number"
                min={1}
                value={chapterDraft.sortOrder}
                onChange={(e) => setChapterDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Chapter name *</Label>
              <Input
                placeholder="e.g. Introduction to Computer"
                value={chapterDraft.name}
                onChange={(e) => setChapterDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Chapter details</Label>
              <Textarea
                rows={4}
                value={chapterDraft.description}
                onChange={(e) => setChapterDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Practical work</Label>
              <Textarea
                rows={3}
                placeholder="What the student has to do…"
                value={chapterDraft.practical}
                onChange={(e) => setChapterDraft((d) => ({ ...d, practical: e.target.value }))}
              />
            </div>
            {linkList("pdfUrls", "PDF notes link", "https://…/notes.pdf", "Add another PDF")}
            {linkList("videoUrls", "Video link", "https://…", "Add another video")}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={chapterDraft.status}
                onValueChange={(v) => setChapterDraft((d) => ({ ...d, status: v as SyllabusStatus }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChapterOpen(false)}>Cancel</Button>
            <Button onClick={saveChapter} disabled={saving}>{saving ? "Saving…" : "Save chapter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "module"
                ? `The module goes, and so do its ${pendingDelete.chapterCount ?? 0} ${
                    pendingDelete.chapterCount === 1 ? "chapter" : "chapters"
                  }. Students and batches on this course are untouched.`
                : "The chapter is removed from the syllabus for good."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
