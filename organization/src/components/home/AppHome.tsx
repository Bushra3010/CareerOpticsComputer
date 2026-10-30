import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { groupEntry, menuFor, shortGroupTitle } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * The DriveWay app's home screen, in the CRM's terms: a greeting, one blue
 * hero card with the figure that matters today, and the modules as a grid of
 * app tiles ("Our Services"). Every dashboard opens with these.
 */

const greeting = (now = new Date()) =>
  now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

export function AppGreeting({ name, title, right }: { name: string; title: string; right?: React.ReactNode }) {
  return (
    <section className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-muted-foreground">{greeting()}, {name} 👋</p>
        <h1 className="text-[21px] font-bold sm:text-2xl">{title}</h1>
      </div>
      {right && <div className="hidden shrink-0 sm:block">{right}</div>}
    </section>
  );
}

export interface HeroAction {
  label: string;
  to: string;
}

/** The blue promo card: badge, a two-line headline with its second line in gold, a strip of figures, two actions. */
export function HeroCard({
  badge,
  headline,
  accent,
  note,
  figures,
  primary,
  secondary,
}: {
  badge: string;
  headline: React.ReactNode;
  accent?: React.ReactNode;
  note?: string;
  figures: Array<{ value: React.ReactNode; label: string; to?: string }>;
  primary?: HeroAction;
  secondary?: HeroAction;
}) {
  return (
    <section className="relative mb-5 overflow-hidden rounded-[24px] bg-[linear-gradient(150deg,hsl(var(--brand-ink))_0%,hsl(var(--brand-ink))_55%,hsl(var(--primary))_100%)] p-5 text-white shadow-[0_10px_28px_rgba(11,92,255,0.28)] sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-[200px] w-[200px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.30),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-[170px] w-[170px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <span className="inline-block rounded-lg bg-gold px-2.5 py-1 text-[10.5px] font-bold uppercase text-gold-foreground">{badge}</span>
          <p className="mt-2.5 text-[22px] font-extrabold leading-[1.2] sm:text-[26px]">
            {headline}
            {accent && <><br /><span className="text-gold">{accent}</span></>}
          </p>
          {note && <p className="mt-1.5 text-[12.5px] text-white/70">{note}</p>}
        </div>
        <div className="flex gap-4 rounded-[14px] border border-white/15 bg-white/[.09] px-3 py-2.5 sm:gap-6 lg:min-w-[22rem]">
          {figures.map((f) => {
            const body = <><p className="text-base font-extrabold text-gold sm:text-lg">{f.value}</p><p className="text-[10.5px] text-white/70">{f.label}</p></>;
            return f.to ? <Link key={f.label} to={f.to} className="min-w-0 flex-1">{body}</Link> : <div key={f.label} className="min-w-0 flex-1">{body}</div>;
          })}
        </div>
      </div>
      {(primary || secondary) && (
        <div className="relative mt-4 flex flex-wrap gap-2.5">
          {primary && (
            <Link to={primary.to} className="press inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,hsl(var(--gold)),#dd8f0d)] px-4 py-2.5 text-[13px] font-bold text-gold-foreground shadow-[0_6px_16px_rgba(245,166,35,0.40)]">
              {primary.label} <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.4} />
            </Link>
          )}
          {secondary && (
            <Link to={secondary.to} className="press inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-[hsl(var(--brand-ink))]">
              {secondary.label} →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

// Each tile's glyph gets its own colour, as the DriveWay service tiles do.
const TINTS = ["#0b5cff", "#f5a623", "#2f9e76", "#7c3aed", "#e07b1f", "#22b8cf", "#e03131", "#0847c7", "#c084fc", "#0d9488"];

/** "Our Services": every module this login can open, as app tiles. Phones only -- the desktop has the sidebar. */
export function ServicesGrid({ className }: { className?: string }) {
  const { view, allowedPaths } = useAuth();
  const groups = view ? menuFor(view, allowedPaths) : [];
  if (!groups.length) return null;
  return (
    <section className={cn("mb-5 md:hidden", className)}>
      <p className="text-[12.5px] font-medium text-muted-foreground">Everything in one place</p>
      <p className="text-[19px] font-bold">Our Services</p>
      <div className="mt-3 grid grid-cols-4 gap-x-1.5 gap-y-3.5">
        {groups.map((group, i) => (
          <Link key={group.title} to={groupEntry(group).url} className="press flex flex-col items-center gap-[7px]">
            <span className="grid aspect-square w-full max-w-[70px] place-items-center rounded-[28%] bg-card shadow-[0_6px_10px_-2px_rgba(15,23,41,0.16),0_2px_4px_rgba(15,23,41,0.06)]">
              <group.icon className="h-7 w-7" style={{ color: TINTS[i % TINTS.length] }} />
            </span>
            <span className="line-clamp-2 text-center text-[12px] font-medium leading-tight">{shortGroupTitle(group.title)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
