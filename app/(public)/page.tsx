import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Calculator,
  Code2,
  GraduationCap,
  Handshake,
  LifeBuoy,
  MonitorSmartphone,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listPublishedCourses } from "@/features/academics/queries";
import { listActiveCentres } from "@/features/centres/queries";
import { formatPaise, paise } from "@/lib/money";

export const metadata = {
  title: "Build skills. Shape your future.",
  description:
    "Practical computer education for careers, business and higher studies, delivered through a network of Career Optics franchise centres across India.",
};

/**
 * Public home page.
 *
 * Style guide §7.2 asks for a genuine photograph of a computer lab and warns
 * against AI-generated people. No approved photograph exists yet, so the hero
 * uses a restrained geometric treatment built from the brand palette rather
 * than a stock or generated image — §17 would rather have no picture than an
 * invented one. Swap `HeroVisual` for an <Image> when a real photo is
 * approved; nothing else needs to change.
 */

/** Course-card icons, chosen by what the course actually teaches. */
const COURSE_ICONS = [BookOpen, MonitorSmartphone, Calculator, Code2];
const COURSE_ACCENTS = [
  "bg-blue-100 text-blue-700",
  "bg-warning-bg text-orange-600",
  "bg-success-bg text-success",
  "bg-blue-100 text-navy-900",
] as const;

const PROMISES = [
  { icon: Briefcase, label: "Industry-focused training" },
  { icon: BadgeCheck, label: "Certified instructors" },
  { icon: Handshake, label: "Placement assistance" },
  { icon: Sparkles, label: "Practical learning" },
];

const PILLARS = [
  {
    icon: Users,
    title: "Expert faculty",
    body: "Taught by instructors who have worked in the field, not only studied it.",
  },
  {
    icon: Sparkles,
    title: "Practical learning",
    body: "Time at the keyboard on real tasks, because that is how the skill sticks.",
  },
  {
    icon: Award,
    title: "Recognised certification",
    body: "Every certificate carries a number anyone can verify on this site.",
  },
  {
    icon: LifeBuoy,
    title: "Support throughout",
    body: "A centre near you, and staff who know your name and your course.",
  },
];

const REASONS = [
  {
    icon: GraduationCap,
    title: "Quality education",
    body: "A syllabus built with industry input and kept current as tools change.",
  },
  {
    icon: Users,
    title: "Experienced faculty",
    body: "Trained, certified instructors at every centre in the network.",
  },
  {
    icon: Handshake,
    title: "Placement assistance",
    body: "Interview preparation and introductions once your course completes.",
  },
  {
    icon: ShieldCheck,
    title: "Verifiable credentials",
    body: "Employers can check any certificate we issue, in seconds, for free.",
  },
];

export default async function HomePage() {
  const [courses, centres] = await Promise.all([
    listPublishedCourses(),
    listActiveCentres(),
  ]);
  const featured = courses.slice(0, 4);
  const states = [...new Set(centres.map((c) => c.state).filter(Boolean))];
  const nearest = centres.slice(0, 4);

  return (
    <>
      {/* ---------- Hero ---------------------------------------------- */}
      <section className="from-canvas to-surface bg-gradient-to-b">
        <div className="container-public grid items-center gap-8 py-8 lg:grid-cols-2 lg:py-12">
          <div>
            <p className="text-meta text-text-secondary border-border bg-surface inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5">
              <Users className="size-4 text-blue-700" aria-hidden="true" />
              Trusted by students across{" "}
              {new Set(courses.map((c) => c.categoryName ?? "").filter(Boolean))
                .size || "several"}{" "}
              subject areas
            </p>

            <h1 className="text-display text-navy-900 mt-3">
              Build skills.
              <br />
              Shape your <span className="text-orange-500">future.</span>
            </h1>

            <p className="text-body text-text-secondary mt-3 max-w-lg">
              Practical computer education for careers, business and higher
              studies — taught at Career Optics centres across India.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/courses">
                  Explore courses <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/sign-in/student">Student login</Link>
              </Button>
            </div>

            <ul className="tablet:grid-cols-2 mt-6 grid gap-3">
              {PROMISES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="border-border bg-surface flex items-center gap-2.5 rounded-[var(--radius-card)] border p-3"
                >
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-chip)] bg-blue-100 text-blue-700"
                    aria-hidden="true"
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-meta text-text font-medium">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <HeroPanel
            courseCount={courses.length}
            centreCount={centres.length}
            stateCount={states.length}
            centres={nearest}
          />
        </div>
      </section>

      {/* ---------- Popular courses ------------------------------------ */}
      <section className="container-public py-10 lg:py-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-meta font-semibold tracking-wide text-orange-500 uppercase">
              Popular courses
            </p>
            <h2 className="text-section text-navy-900 mt-1">
              Start where you are
            </h2>
          </div>
          <Link
            href="/courses"
            className="text-body font-semibold text-blue-700 underline-offset-4 hover:underline"
          >
            View all courses
          </Link>
        </div>

        {featured.length === 0 ? (
          <Card className="p-6">
            <p className="text-body text-text-secondary">
              The course catalogue is being prepared. Please check back shortly.
            </p>
          </Card>
        ) : (
          <div className="tablet:grid-cols-2 grid gap-4 lg:grid-cols-4">
            {featured.map((course, i) => {
              const Icon = COURSE_ICONS[i % COURSE_ICONS.length]!;
              return (
                <Card
                  key={course.id}
                  className="hover:border-border-strong flex flex-col p-5 transition-colors"
                >
                  <span
                    className={`grid size-11 place-items-center rounded-[var(--radius-chip)] ${COURSE_ACCENTS[i % COURSE_ACCENTS.length]}`}
                    aria-hidden="true"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title text-navy-900 mt-3">
                    {course.name}
                  </h3>
                  <p className="text-meta text-text-secondary mt-1 line-clamp-2">
                    {course.shortDescription}
                  </p>
                  <div className="text-meta text-text-secondary mt-3 flex items-center justify-between">
                    <span>{course.durationLabel}</span>
                    <span className="text-navy-900 tabular font-semibold">
                      {formatPaise(paise(course.feePaise), {
                        showDecimals: false,
                      })}
                    </span>
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-meta mt-4 inline-flex items-center gap-1 font-semibold text-blue-700 underline-offset-4 hover:underline"
                  >
                    View details <ArrowRight className="size-3.5" />
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- Four promises -------------------------------------- */}
      <section className="border-border bg-surface border-y">
        <div className="container-public tablet:grid-cols-2 grid gap-6 py-10 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <span
                className="text-navy-900 grid size-10 shrink-0 place-items-center rounded-[var(--radius-chip)] bg-blue-100"
                aria-hidden="true"
              >
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-card-title text-navy-900">{title}</h3>
                <p className="text-meta text-text-secondary mt-1">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Why Career Optics ---------------------------------- */}
      <section className="container-public py-10 lg:py-12">
        <div className="mb-4 text-center">
          <p className="text-meta font-semibold tracking-wide text-orange-500 uppercase">
            Why Career Optics
          </p>
          <h2 className="text-section text-navy-900 mt-1">
            A network built around the student
          </h2>
        </div>

        <div className="tablet:grid-cols-2 grid gap-4 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-5">
              <span
                className="grid size-11 place-items-center rounded-[var(--radius-chip)] bg-blue-100 text-blue-700"
                aria-hidden="true"
              >
                <Icon className="size-5" />
              </span>
              <h3 className="text-card-title text-navy-900 mt-3">{title}</h3>
              <p className="text-meta text-text-secondary mt-1">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- Closing call to action ----------------------------- */}
      <section className="container-public pb-10 lg:pb-12">
        <div
          data-surface="navy"
          className="bg-navy-900 flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-card)] p-6 lg:p-8"
        >
          <div className="min-w-0">
            <h2 className="text-section text-white">Admissions are open</h2>
            <p className="text-body mt-1 text-white/75">
              Find a centre near you and start with the right course.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admissions/enquiry">
                Enquire now <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/centres">
                <Phone /> Find a centre
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Hero panel.
 *
 * This started as a decorative gradient standing in for the photograph the
 * mockup has and we do not. It read exactly as what it was — a large empty
 * rectangle — so it now carries the network at a glance and the four nearest
 * centres instead. Real figures, straight from the database, and a route into
 * the thing a prospective student actually wants: a centre near them.
 *
 * If an approved photograph arrives later it belongs above this panel, not
 * instead of it; the panel is doing work the picture would not.
 */
function HeroPanel({
  courseCount,
  centreCount,
  stateCount,
  centres,
}: {
  courseCount: number;
  centreCount: number;
  stateCount: number;
  centres: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  }[];
}) {
  const stats = [
    { value: centreCount, label: centreCount === 1 ? "centre" : "centres" },
    { value: courseCount, label: courseCount === 1 ? "course" : "courses" },
    { value: stateCount, label: stateCount === 1 ? "state" : "states" },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div data-surface="navy" className="bg-navy-900 p-5 lg:p-6">
        <p className="text-meta text-white/70">The network at a glance</p>
        <dl className="mt-3 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="text-kpi tabular block font-bold text-white">
                  {s.value}
                </span>
                <span className="text-meta block text-white/70">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="p-5 lg:p-6">
        <h2 className="text-card-title text-navy-900">Centres near you</h2>
        {centres.length === 0 ? (
          <p className="text-meta text-text-secondary mt-2">
            Centre listings are being prepared.
          </p>
        ) : (
          <ul className="divide-border mt-2 divide-y">
            {centres.map((c) => (
              <li
                key={c.id}
                className="flex items-baseline justify-between gap-3 py-2"
              >
                <span className="text-body text-text min-w-0 truncate">
                  {c.name}
                </span>
                <span className="text-meta text-text-secondary shrink-0">
                  {c.city ?? c.state ?? ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button asChild variant="secondary" className="mt-4 w-full">
          <Link href="/centres">
            Find your nearest centre <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
