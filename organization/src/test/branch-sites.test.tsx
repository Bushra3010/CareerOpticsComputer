import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  DNS_A_RECORD,
  DNS_CNAME_TARGET,
  hostnameError,
  isHeadOfficeHost,
  normaliseHost,
  resolveSite,
  siteLink,
  slugError,
  slugify,
} from "@/lib/branchSite";

/* ---------- the rules ---------- */

describe("slugError", () => {
  it("accepts lowercase letters, numbers and inner hyphens, 3 to 40 long", () => {
    expect(slugError("ara-main")).toBeNull();
    expect(slugError("brptn")).toBeNull();
    expect(slugError("a1b")).toBeNull();
    expect(slugError("x".repeat(40))).toBeNull();
  });

  it("refuses what the database would refuse", () => {
    expect(slugError("")).toMatch(/enter/i);
    expect(slugError("ab")).toMatch(/at least 3/);
    expect(slugError("x".repeat(41))).toMatch(/at most 40/);
    expect(slugError("Ara")).toMatch(/lowercase/);
    expect(slugError("ara main")).toMatch(/only letters/);
    expect(slugError("ara_main")).toMatch(/only letters/);
    expect(slugError("-ara")).toMatch(/hyphen/);
    expect(slugError("ara-")).toMatch(/hyphen/);
  });

  it("turns a centre's name into a usable slug", () => {
    expect(slugify("Career Optics — Ara (Main)")).toBe("career-optics-ara-main");
    expect(slugError(slugify("  Patna   Centre  "))).toBeNull();
    expect(slugify("a".repeat(39) + " b").length).toBeLessThanOrEqual(40);
    expect(slugify("a".repeat(39) + " b")).not.toMatch(/-$/);
  });
});

describe("hostnameError", () => {
  it("accepts a domain however it is pasted, and stores it bare", () => {
    expect(hostnameError("mycentre.com")).toBeNull();
    expect(hostnameError("https://www.MyCentre.co.in/about")).toBeNull();
    expect(normaliseHost("https://www.MyCentre.co.in/about")).toBe("mycentre.co.in");
    expect(normaliseHost("mycentre.com:443.")).toBe("mycentre.com");
    expect(hostnameError("xn--h2brj9c.xn--h2brj9c")).toBeNull();
  });

  it("refuses what is not a domain", () => {
    expect(hostnameError("")).toMatch(/enter your domain/i);
    expect(hostnameError("mycentre")).toMatch(/full domain/i);
    expect(hostnameError("my centre.com")).toMatch(/not a valid domain/);
    expect(hostnameError("-bad.com")).toMatch(/not a valid domain/);
    expect(hostnameError("mycentre.c0m")).toMatch(/domain ending/);
  });

  it("refuses the head office's and Vercel's own hosts", () => {
    expect(hostnameError("career-optics-computer.vercel.app")).toMatch(/you own/);
    expect(hostnameError("something.vercel.app")).toMatch(/you own/);
  });
});

describe("resolveSite", () => {
  it("reads the slug from /c/<slug> on any host", () => {
    expect(resolveSite("/c/ara-main", "career-optics-computer.vercel.app")).toEqual({ slug: "ara-main" });
    expect(resolveSite("/c/Ara-Main/", "localhost")).toEqual({ slug: "ara-main" });
    expect(resolveSite("/c/ara-main", "mycentre.com")).toEqual({ slug: "ara-main" });
  });

  it("uses a centre's own host when there is no slug", () => {
    expect(resolveSite("/", "www.mycentre.com")).toEqual({ host: "mycentre.com" });
    expect(resolveSite("/about.html", "MyCentre.in")).toEqual({ host: "mycentre.in" });
  });

  it("is nothing on the head office's hosts, so the head-office site stays as it is", () => {
    for (const host of ["careeropticscomputer.in", "www.careeropticscomputer.in", "WWW.CareerOpticsComputer.in:443", "career-optics-computer.vercel.app", "localhost", "127.0.0.1", "[::1]", "preview-abc.vercel.app", "app.localhost"]) {
      expect(isHeadOfficeHost(host)).toBe(true);
      expect(resolveSite("/", host)).toBeNull();
      expect(resolveSite("/about.html", host)).toBeNull();
    }
    expect(resolveSite("/c/", "localhost")).toBeNull();
    expect(resolveSite("/c/a/b", "localhost")).toBeNull();
  });

  it("is mirrored in the page's own script", async () => {
    // site.js runs without a bundler, so it carries a copy; both must agree.
    const source = fs.readFileSync(path.join(process.cwd(), "website/behaviour/site.js"), "utf8");
    document.body.innerHTML = '<div id="sPage"></div><div id="sMissing" hidden><h1></h1><p></p><div class="s-cta"></div></div>';
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => null });
    vi.stubGlobal("fetch", fetchMock);
    new Function(source)();
    const mirror = (window as unknown as { __site: { resolveSite: typeof resolveSite } }).__site;
    const cases: Array<[string, string]> = [
      ["/c/ara-main", "career-optics-computer.vercel.app"],
      ["/c/Ara-Main/", "localhost"],
      ["/", "www.mycentre.com"],
      ["/about.html", "mycentre.in:8080"],
      ["/", "career-optics-computer.vercel.app"],
      ["/", "preview-abc.vercel.app"],
      ["/c/a/b", "localhost"],
    ];
    for (const [p, h] of cases) expect(mirror.resolveSite(p, h)).toEqual(resolveSite(p, h));
    vi.unstubAllGlobals();
  });
});

/* ---------- the screens ---------- */

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/PageHeader", () => ({
  PageHeader: ({ title, actions }: { title?: string; actions?: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}));

const auth = { current: { user: { id: "u1", role: "BRANCH_ADMIN", organizationId: "org1", branchId: "b1" } as Record<string, unknown> } };
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth.current }));

const SETTINGS: Record<string, unknown> = {
  branchId: "b1",
  siteName: "Ara Centre",
  slug: "ara-main",
  customDomain: "",
  domainStatus: "NONE",
  siteEnabled: true,
};
const BRANCHES = [{ id: "b1", name: "Ara Centre", code: "ARA", branchType: "MAIN", phone: "9876543210", whatsappNumber: "", website: "" }];
const ADMIN_SETTINGS = [{ branchId: "b1", siteName: "Ara", slug: "ara-main", customDomain: "aracentre.com", domainStatus: "PENDING", siteEnabled: true }];

const invoke = vi.fn();
const rpc = vi.fn();
vi.mock("@/lib/supabase/client", () => {
  const builder = (table: string) => {
    const rows = table === "branches" ? BRANCHES : ADMIN_SETTINGS;
    const chain: Record<string, unknown> = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      is: () => chain,
      order: () => chain,
      limit: () => chain,
      maybeSingle: async () => ({ data: SETTINGS, error: null }),
      then: (resolve: (v: unknown) => unknown) => resolve({ data: rows, error: null }),
    };
    return chain;
  };
  return {
    supabase: { from: builder, rpc: (...args: unknown[]) => rpc(...args), functions: { invoke: (...args: unknown[]) => invoke(...args) } },
    supabaseUrl: "https://project.supabase.co",
  };
});

const BranchWebsiteSettings = (await import("@/pages/branch/BranchWebsiteSettings")).default;
const WebsiteView = (await import("@/pages/branch/WebsiteView")).default;

beforeEach(() => {
  toast.mockClear();
  invoke.mockReset();
  rpc.mockReset();
});

describe("My Website (centre)", () => {
  beforeEach(() => {
    auth.current = { user: { id: "u1", role: "BRANCH_ADMIN", organizationId: "org1", branchId: "b1" } };
  });

  it("shows the centre's free link with copy, open and share", async () => {
    render(<BranchWebsiteSettings />);
    const link = await screen.findByTestId("site-link");
    expect(link).toHaveTextContent(siteLink("ara-main"));
    expect(link).toHaveAttribute("href", "https://www.careeropticscomputer.in/c/ara-main");
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^open$/i })).toHaveAttribute("href", siteLink("ara-main"));
    expect(screen.getByRole("link", { name: /share on whatsapp/i }).getAttribute("href")).toContain(encodeURIComponent(siteLink("ara-main")));
  });

  it("gives the DNS records for the centre's own domain", async () => {
    render(<BranchWebsiteSettings />);
    await screen.findByTestId("site-link");
    const table = screen.getByRole("table", { name: /dns records/i });
    const rows = within(table).getAllByRole("row").slice(1).map((r) => r.textContent);
    expect(rows).toEqual([`A@${DNS_A_RECORD}`, `CNAMEwww${DNS_CNAME_TARGET}`]);
    expect(DNS_A_RECORD).toBe("76.76.21.21");
    expect(DNS_CNAME_TARGET).toBe("cname.vercel-dns.com");
    expect(screen.getByTestId("domain-status")).toHaveTextContent("Not connected");
  });

  it("flags a bad link name before asking the database", async () => {
    render(<BranchWebsiteSettings />);
    await screen.findByTestId("site-link");
    fireEvent.change(screen.getByLabelText("Link name"), { target: { value: "-x" } });
    expect(await screen.findByText(/at least 3/)).toBeInTheDocument();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("says whether a new link name is free", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    render(<BranchWebsiteSettings />);
    await screen.findByTestId("site-link");
    fireEvent.change(screen.getByLabelText("Link name"), { target: { value: "patna" } });
    expect(await screen.findByText(/already taken/i, undefined, { timeout: 2000 })).toBeInTheDocument();
    expect(rpc).toHaveBeenCalledWith("branch_slug_available", { p_slug: "patna", p_branch_id: "b1" });
  });

  it("asks the head office to connect a domain", async () => {
    rpc.mockResolvedValue({ data: { customDomain: "aracentre.com", domainStatus: "PENDING" }, error: null });
    render(<BranchWebsiteSettings />);
    await screen.findByTestId("site-link");
    fireEvent.change(screen.getByLabelText("Your domain"), { target: { value: "https://www.AraCentre.com" } });
    fireEvent.click(screen.getByRole("button", { name: /request connection/i }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("request_branch_domain", { p_branch_id: "b1", p_domain: "aracentre.com" }));
    await waitFor(() => expect(screen.getByTestId("domain-status")).toHaveTextContent("Pending"));
  });
});

describe("Franchise Websites (head office)", () => {
  beforeEach(() => {
    auth.current = { user: { id: "a1", role: "ORGANIZATION_ADMIN", organizationId: "org1", branchId: null } };
  });

  it("lists each centre's link, domain and status", async () => {
    render(<WebsiteView />);
    const table = await screen.findByRole("table");
    await waitFor(() => expect(within(table).getByText("Ara Centre")).toBeInTheDocument());
    expect(within(table).getByRole("link", { name: "/c/ara-main" })).toHaveAttribute("href", siteLink("ara-main"));
    expect(within(table).getByText("aracentre.com")).toBeInTheDocument();
    expect(within(table).getByText("Pending")).toBeInTheDocument();
  });

  it.each([
    ["Connect domain", "add"],
    ["Check status", "check"],
  ])("%s calls the manage-domain function with action %s", async (label, action) => {
    invoke.mockResolvedValue({ data: { domain: "aracentre.com", domainStatus: "LIVE", message: "Connected.", records: [] }, error: null });
    render(<WebsiteView />);
    const table = await screen.findByRole("table");
    await waitFor(() => expect(within(table).getByText("Ara Centre")).toBeInTheDocument());
    fireEvent.click(within(table).getByRole("button", { name: label }));
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("manage-domain", { body: { action, branchId: "b1" } }));
    expect(await within(table).findByText("Live")).toBeInTheDocument();
  });

  it("asks before removing a domain, then calls remove", async () => {
    invoke.mockResolvedValue({ data: { domain: "aracentre.com", domainStatus: "NONE", message: "Removed from Vercel.", records: [] }, error: null });
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<WebsiteView />);
    const table = await screen.findByRole("table");
    await waitFor(() => expect(within(table).getByText("Ara Centre")).toBeInTheDocument());
    fireEvent.click(within(table).getByRole("button", { name: "Remove" }));
    expect(invoke).not.toHaveBeenCalled();
    fireEvent.click(within(table).getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("manage-domain", { body: { action: "remove", branchId: "b1" } }));
    expect(confirm).toHaveBeenCalledTimes(2);
    confirm.mockRestore();
  });

  it("shows the function's own error, such as Vercel not being configured", async () => {
    invoke.mockResolvedValue({ data: { error: "Domain connection is not configured." }, error: null });
    render(<WebsiteView />);
    const table = await screen.findByRole("table");
    await waitFor(() => expect(within(table).getByText("Ara Centre")).toBeInTheDocument());
    fireEvent.click(within(table).getByRole("button", { name: "Check status" }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Domain connection is not configured.", variant: "destructive" })),
    );
  });
});
