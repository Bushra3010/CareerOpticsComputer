import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, Search, User, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { canAccessWithRole, menuFor } from "@/lib/navigation";
import { VIEWS } from "@/lib/roles";
import { useAuth } from "@/contexts/AuthContext";
import { getNotices } from "@/lib/supabase/data";
import { CentreBar } from "./CentreBar";

export function AppHeader() {
  const { user, view, allowedPaths, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onDashboard = pathname === VIEWS[view].home;
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notices, setNotices] = useState<Array<{ id: string; title: string; publishDate?: string }>>([]);
  // Search only ever offers pages this authorisation can actually open.
  const destinations = useMemo(() => menuFor(view, allowedPaths).flatMap(group => group.items.map(item => ({ ...item, group: group.title }))), [view, allowedPaths]);
  const current = destinations.find(item => item.url === pathname);
  const results = query.trim() ? destinations.filter(item => `${item.title} ${item.group}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : destinations.slice(0, 6);

  // The bell used to be inert with a permanent unread dot; it now opens the
  // notices this user can actually see.
  useEffect(() => {
    let cancelled = false;
    getNotices(user?.branchId || null)
      .then((r) => { if (!cancelled) setNotices((r.data || []).slice(0, 6)); })
      .catch(() => { if (!cancelled) setNotices([]); });
    return () => { cancelled = true; };
  }, [user?.branchId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    // The DriveWay top bar: on the canvas itself, no rule under it; the bell is
    // a white tile and the account a gold avatar with its name beside it.
    <header className="sticky top-0 z-40 flex h-[64px] items-center justify-between bg-background/85 px-4 backdrop-blur-xl sm:h-[72px] sm:px-6 lg:px-8">
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        <SidebarTrigger className="hidden h-10 w-10 rounded-xl bg-card shadow-card md:inline-flex" />
        {/* On a phone an inner page gets the app's back arrow and its own title. */}
        {!onDashboard && (
          <div className="flex min-w-0 items-center gap-3 md:hidden">
            <button
              type="button"
              aria-label="Back"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(VIEWS[view].home))}
              className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card shadow-card"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-semibold leading-tight">{current?.title ?? "Back"}</h2>
              {current && <p className="truncate text-xs text-muted-foreground">{current.group.replace(" Management", "")}</p>}
            </div>
          </div>
        )}
        <Link to={VIEWS[view].home} className={onDashboard ? "flex items-center gap-2 md:hidden" : "hidden"} aria-label="Home">
          <img src={`${import.meta.env.BASE_URL}career-optics-logo.webp`} alt="" className="h-9 w-9 rounded-xl bg-white object-contain p-0.5 shadow-card" />
          <span className="leading-[1.05]"><span className="block text-[16px] font-extrabold tracking-[-0.01em]">Career <span className="bg-[linear-gradient(90deg,#1d4ed8_0%,#f97316_100%)] bg-clip-text text-transparent">Optics</span></span><span className="block text-[8.5px] font-semibold uppercase tracking-[.14em] text-muted-foreground">{VIEWS[view].short} panel</span></span>
        </Link>
        <div className="hidden whitespace-nowrap lg:block"><p className="text-[12.5px] text-muted-foreground">{today}</p><p className="text-sm font-semibold">Academic year 2026–27</p></div>
      </div>
      <div className="relative mx-4 hidden w-full max-w-xl md:block">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <button onClick={() => setSearchOpen(true)} className="flex h-11 w-full items-center rounded-xl bg-card pl-10 pr-3 text-left text-sm text-muted-foreground shadow-card transition hover:shadow-md">
          Find anything… <kbd className="ml-auto rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘ K</kbd>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <CentreBar />
        {/* A persistent shortcut everywhere except the dashboard, which already
            offers it as its own primary action — outline so that when a page
            does have a filled button, there is still only one focal point. */}
        {!onDashboard && view !== "student" && canAccessWithRole(view, "/student/admission-form", allowedPaths) && <Button asChild size="sm" variant="outline" className="hidden sm:flex"><Link to="/student/admission-form"><Plus />New admission</Link></Button>}
        <Button variant="ghost" size="icon" className={`h-10 w-10 rounded-xl bg-card text-muted-foreground shadow-card md:hidden ${onDashboard ? "" : "hidden"}`} aria-label="Search" onClick={()=>setSearchOpen(true)}><Search/></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl bg-card text-muted-foreground shadow-card sm:h-[42px] sm:w-[42px]" aria-label={notices.length ? `Notifications, ${notices.length} unread` : "Notifications"}>
              <Bell />
              {notices.length > 0 && <span className="absolute right-[9px] top-2 h-2 w-2 rounded-full bg-destructive" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notices</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notices.length === 0 && <DropdownMenuItem disabled>No notices right now</DropdownMenuItem>}
            {notices.map(n => (
              <DropdownMenuItem key={n.id} asChild>
                <Link to="/branch/notice-board" className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">{n.title}</span>
                  {n.publishDate && <span className="text-xs text-muted-foreground">{new Date(n.publishDate).toLocaleDateString()}</span>}
                </Link>
              </DropdownMenuItem>
            ))}
            {notices.length > 0 && <><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/branch/notice-board">View all notices</Link></DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className={`h-auto gap-2.5 rounded-full p-0.5 hover:bg-transparent lg:pr-1 ${onDashboard ? "" : "hidden md:inline-flex"}`}><Avatar className="h-10 w-10"><AvatarFallback className="bg-[linear-gradient(135deg,hsl(var(--gold)),#dd8f0d)] text-[13px] font-bold text-white">{user?.name.split(" ").map(p=>p[0]).join("").slice(0,2)||"ID"}</AvatarFallback></Avatar><span className="hidden text-left lg:block"><span className="block max-w-[10rem] truncate text-[13.5px] font-semibold">{user?.name}</span><span className="block text-[11.5px] font-normal capitalize text-muted-foreground">{user?.role.replaceAll("_"," ").toLowerCase()}</span></span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel><span className="block">{user?.name}</span><span className="text-xs font-normal text-muted-foreground">{user?.role.replaceAll("_"," ")}</span></DropdownMenuLabel><DropdownMenuSeparator/>{view==="student"&&<DropdownMenuItem asChild><Link to="/me/profile"><User className="mr-2 h-4 w-4"/>My profile</Link></DropdownMenuItem>}{view==="admin"&&<DropdownMenuItem asChild><Link to="/settings/general"><User className="mr-2 h-4 w-4"/>Organisation settings</Link></DropdownMenuItem>}{view==="franchise"&&<DropdownMenuItem asChild><Link to="/branch/website-settings"><User className="mr-2 h-4 w-4"/>Branch settings</Link></DropdownMenuItem>}<DropdownMenuSeparator/><DropdownMenuItem className="text-destructive" onClick={()=>void logout()}>Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>

      {searchOpen && <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-3 pt-[7vh] backdrop-blur-sm sm:px-4 sm:pt-[12vh]" onMouseDown={() => setSearchOpen(false)}>
        <div className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border bg-card shadow-2xl" onMouseDown={e => e.stopPropagation()}>
          <div className="flex items-center border-b px-4"><Search className="h-5 w-5 text-muted-foreground"/><Input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search students, fees, courses or any page…" className="h-14 border-0 bg-transparent shadow-none focus-visible:ring-0"/><Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}><X/></Button></div>
          <div className="max-h-[55vh] overflow-auto p-2"><p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{query ? "Best matches" : "Popular destinations"}</p>{results.map(item => <Link key={item.url} to={item.url} onClick={() => {setSearchOpen(false);setQuery("");}} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted"><span className="grid h-9 w-9 place-items-center rounded-xl bg-muted"><item.icon className="h-4 w-4"/></span><span><span className="block text-sm font-medium">{item.title}</span><span className="text-xs text-muted-foreground">{item.group}</span></span></Link>)}</div>
          <div className="hidden items-center gap-5 border-t bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground sm:flex"><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></div>
        </div>
      </div>}
    </header>
  );
}
