import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Globe, LogOut, Menu, Search, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { classicLocate, classicMenu, type ClassicEntry } from "@/lib/classicMenu";
import { canAccessWithRole } from "@/lib/navigation";
import { VIEWS } from "@/lib/roles";
import { WALLET_CHANGED, getCentreSummary } from "@/lib/supabase/data";
import { cn } from "@/lib/utils";
import { CentreSwitcher } from "./CentreSwitcher";

/**
 * The classic franchise-panel frame: a teal top bar (menu toggle, a red
 * "Add New", the wallet balance, search and the account), a dark sidebar whose
 * headings unfold into their pages, and a white strip naming the page with its
 * breadcrumb. AppLayout puts every signed-in page inside it.
 */

const TEAL = "#38c3be";
const SIDEBAR = "#2b3036";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const isExternal = (url?: string) => !!url && /^https?:/.test(url);

function initials(name?: string) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "CO";
}

/** A menu link is "here" on its exact address, or on its path when it has no query of its own. */
const isHere = (url: string | undefined, pathname: string, search: string) =>
  !!url && (url === pathname + search || (!url.includes("?") && url === pathname));

function SidebarEntry({
  entry,
  pathname,
  search,
  collapsed,
  onNavigate,
}: {
  entry: ClassicEntry;
  pathname: string;
  search: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const inside = !!entry.items?.some((i) => isHere(i.url, pathname, search) || i.url.split("?")[0] === pathname);
  const [open, setOpen] = useState(inside);
  useEffect(() => { if (inside) setOpen(true); }, [inside]);

  const row = "flex w-full items-center gap-3 px-5 py-[11px] text-[13.5px] transition-colors";
  const idle = "text-white/75 hover:bg-white/[.06] hover:text-white";
  const Icon = entry.icon;

  if (!entry.items) {
    const active = isHere(entry.url, pathname, search);
    const body = (
      <>
        <Icon className="h-[17px] w-[17px] shrink-0" />
        {!collapsed && <span className="truncate">{entry.title}</span>}
      </>
    );
    return isExternal(entry.url) ? (
      <a href={entry.url} target="_blank" rel="noreferrer" className={cn(row, idle)} title={entry.title}>{body}</a>
    ) : (
      <Link
        to={entry.url!}
        onClick={onNavigate}
        className={cn(row, active ? "font-semibold text-white" : idle)}
        style={active ? { background: TEAL } : undefined}
        title={entry.title}
      >
        {body}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(row, inside ? "text-white" : idle)}
        aria-expanded={open}
        title={entry.title}
      >
        <Icon className="h-[17px] w-[17px] shrink-0" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left">{entry.title}</span>
            {open ? <ChevronDown className="h-4 w-4 opacity-70" /> : <ChevronRight className="h-4 w-4 opacity-70" />}
          </>
        )}
      </button>
      {open && !collapsed && (
        <div className="bg-black/20 py-1">
          {entry.items.map((item) => {
            const active = isHere(item.url, pathname, search);
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 py-2 pl-12 pr-4 text-[13px] transition-colors",
                  active ? "font-semibold" : "text-white/65 hover:text-white",
                )}
                style={active ? { color: TEAL } : undefined}
              >
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "" : "bg-white/30")} style={active ? { background: TEAL } : undefined} />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ClassicShell({ children, banner }: { children: React.ReactNode; banner?: React.ReactNode }) {
  const { user, view, allowedPaths, branchId, logout } = useAuth();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const entries = useMemo(() => classicMenu(view, allowedPaths), [view, allowedPaths]);
  const here = classicLocate(entries, pathname, search);

  // Desktop: the sidebar narrows to its icons. Phone: it slides in over the page.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = () => (window.matchMedia("(min-width: 1024px)").matches ? setCollapsed((c) => !c) : setMobileOpen((o) => !o));

  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    if (view !== "franchise" || !branchId) return setBalance(null);
    let cancelled = false;
    const load = () =>
      getCentreSummary(branchId)
        .then((c) => { if (!cancelled) setBalance(c?.balance ?? 0); })
        .catch(() => { if (!cancelled) setBalance(null); });
    void load();
    window.addEventListener(WALLET_CHANGED, load);
    return () => { cancelled = true; window.removeEventListener(WALLET_CHANGED, load); };
  }, [view, branchId]);

  const [query, setQuery] = useState("");
  const pages = useMemo(
    () => entries.flatMap((e) => (e.items ? e.items.map((i) => ({ ...i, group: e.title })) : e.url && !isExternal(e.url) ? [{ title: e.title, url: e.url, group: "" }] : [])),
    [entries],
  );
  const matches = query.trim() ? pages.filter((p) => `${p.title} ${p.group}`.toLowerCase().includes(query.toLowerCase())).slice(0, 7) : [];

  const [accountOpen, setAccountOpen] = useState(false);
  // "Add New" opens the centre panel's registration form where the role has it.
  const addUrl = canAccessWithRole(view, "/centre/student-add", allowedPaths) ? "/centre/student-add" : "/student/admission-form";
  const canAdd = view !== "student" && canAccessWithRole(view, addUrl, allowedPaths);
  const profileUrl = view === "admin" ? "/settings/general" : view === "franchise" ? "/centre/profile" : "/me/profile";
  // Pages opened from a list are not in the menu; name them rather than say "Dashboard".
  const opened: Record<string, string> = {
    "/centre/exam-create": "Create Exam",
    "/centre/student-payments": "Student Payments",
    "/centre/batch-students": "Batch Students",
    "/student/add": "Admission",
  };
  const title = here.page?.title || here.entry?.title || opened[pathname] || (pathname === "/" ? "Dashboard" : "");

  const sidebar = (
    <aside
      className={cn("flex h-full flex-col overflow-y-auto text-white [scrollbar-width:thin]", collapsed ? "w-[70px]" : "w-[250px]")}
      style={{ background: SIDEBAR }}
    >
      <div className={cn("flex items-center gap-3 border-b border-white/[.06] py-4", collapsed ? "justify-center px-2" : "px-5")}>
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
          <img src={`${import.meta.env.BASE_URL}career-optics-logo.webp`} alt="" className="h-full w-full object-contain" />
        </span>
        {!collapsed && <span className="truncate text-[14px] font-medium">{user?.name || "Centre"}</span>}
      </div>
      <nav className="flex-1 py-2" aria-label="Main">
        {entries.map((entry) => (
          <SidebarEntry key={entry.title} entry={entry} pathname={pathname} search={search} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        ))}
        <a href="/" className="flex items-center gap-3 px-5 py-[11px] text-[13.5px] text-white/75 hover:bg-white/[.06] hover:text-white" title="Back to Website">
          <Globe className="h-[17px] w-[17px] shrink-0" />
          {!collapsed && <span>Back to Website</span>}
        </a>
        <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-3 px-5 py-[11px] text-[13.5px] text-white/75 hover:bg-white/[.06] hover:text-white" title="Log out">
          <LogOut className="h-[17px] w-[17px] shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </nav>
      <div className="p-3"><CentreSwitcher collapsed={collapsed} /></div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#eef1f5] font-[Poppins,system-ui,sans-serif]">
      {banner}
      <header className="sticky top-0 z-40 flex h-[56px] items-center text-white shadow-sm" style={{ background: TEAL }}>
        <Link
          to={VIEWS[view].home}
          className={cn("hidden h-full shrink-0 items-center gap-2 px-4 text-[17px] font-extrabold tracking-wide lg:flex", collapsed ? "w-[70px] justify-center" : "w-[250px]")}
          style={{ background: "rgba(0,0,0,.08)" }}
        >
          {collapsed ? "CO" : "CAREER OPTICS"}
        </Link>
        <button type="button" onClick={toggle} className="grid h-full w-12 place-items-center hover:bg-black/10" aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </button>
        {canAdd && (
          <Link to={addUrl} className="flex h-full items-center bg-[#f05a5a] px-4 text-[13px] font-semibold hover:bg-[#e04646]">
            Add New
          </Link>
        )}
        {balance !== null && (
          <Link to="/centre/wallet" className="ml-3 hidden whitespace-nowrap text-[13px] font-semibold sm:block">
            Wallet Balance: {inr(balance)}
          </Link>
        )}
        <div className="relative ml-auto mr-2 hidden md:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches[0]) { navigate(matches[0].url); setQuery(""); }
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Search..."
            aria-label="Search pages"
            className="h-8 w-56 rounded-full border-0 bg-white pl-4 pr-9 text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          {matches.length > 0 && (
            <div className="absolute right-0 top-10 z-50 w-72 overflow-hidden rounded-md bg-white py-1 text-slate-700 shadow-xl">
              {matches.map((m) => (
                <Link key={m.url} to={m.url} onClick={() => setQuery("")} className="block px-4 py-2 text-[13px] hover:bg-slate-100">
                  <span className="font-medium">{m.title}</span>
                  {m.group && <span className="ml-1.5 text-xs text-slate-400">· {m.group}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="relative mr-3 md:ml-0 ml-auto">
          <button type="button" onClick={() => setAccountOpen((o) => !o)} className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-black/10" aria-haspopup="menu" aria-expanded={accountOpen}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[12px] font-bold text-[#1f6f6c]">{initials(user?.name)}</span>
            <span className="hidden max-w-[10rem] truncate text-[13.5px] font-medium sm:block">{user?.name}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {accountOpen && (
            <>
              <button type="button" aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setAccountOpen(false)} />
              <div role="menu" className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-md bg-white py-1 text-[13.5px] text-slate-700 shadow-xl">
                <Link to={profileUrl} onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100"><User className="h-4 w-4" />View Profile</Link>
                <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-slate-100"><LogOut className="h-4 w-4" />Logout</button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="sticky top-[56px] hidden h-[calc(100vh-56px)] shrink-0 lg:block">{sidebar}</div>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full w-[250px] shadow-2xl">
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute -right-11 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700"><X className="h-5 w-5" /></button>
              {sidebar}
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6">
            <h1 className="truncate text-[14px] font-bold uppercase tracking-wide text-slate-800">{title}</h1>
            <p className="hidden shrink-0 text-[13px] text-slate-500 sm:block">
              {here.entry && here.page ? <>{here.entry.title} <span className="mx-1">/</span> <span style={{ color: TEAL }}>{here.page.title}</span></> : <><span>Dashboard</span> <span className="mx-1">/</span> <span style={{ color: TEAL }}>{title}</span></>}
            </p>
          </div>
          <main className="classic-ui min-w-0 flex-1 overflow-x-hidden px-3 pb-24 pt-4 sm:px-6 sm:pt-5 md:pb-10">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
          <footer className="border-t bg-white px-6 py-3 text-[12.5px] text-slate-500">CAREER OPTICS COMPUTER ACADEMY © {new Date().getFullYear()}</footer>
        </div>
      </div>
    </div>
  );
}
