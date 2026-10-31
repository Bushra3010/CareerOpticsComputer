import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * website/public/apply.js: a course page's admission form, or the franchise
 * page's application, goes to the ERP through the public functions in
 * website-applications.sql -- an admission at the centre the applicant picks.
 */
const APPLY = readFileSync(path.resolve(__dirname, "../../website/public/apply.js"), "utf8");
const calls: Array<{ fn: string; body: Record<string, unknown> }> = [];
let failNext = "";

const CENTRES = [
  { id: "b1", name: "PNS COMPUTER ACADEMY", city: null, district: null, state: null },
  { id: "b2", name: "Digiskills computer academy", city: "Patepur", district: "Vaishali", state: "Bihar" },
];

function load(pathname: string, html: string) {
  window.history.replaceState(null, "", pathname);
  document.body.innerHTML = html;
  (window as unknown as { CMS_CONFIG: unknown }).CMS_CONFIG = { url: "https://db.example", key: "anon" };
  (window as unknown as { siteWhatsapp: () => string }).siteWhatsapp = () => "917519884465";
  new Function(APPLY)();
}

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  calls.length = 0;
  failNext = "";
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: { body: string }) => {
    const fn = String(url).split("/rpc/")[1];
    const body = JSON.parse(init.body || "{}");
    calls.push({ fn, body });
    if (fn === "public_centres") return new Response(JSON.stringify(CENTRES), { status: 200 });
    if (failNext) return new Response(JSON.stringify({ message: failNext }), { status: 400 });
    return new Response(JSON.stringify({ id: "lead1", centre: "Digiskills computer academy" }), { status: 200 });
  }));
  vi.stubGlobal("open", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.getElementById("apply-dialog")?.remove();
});

const COURSE_PAGE = `
  <h1>Python Programming | Career Optics Computer Academy</h1>
  <form id="admissionForm">
    <input type="text" id="studentName" required placeholder="Enter your name" value="Rahul Kumar">
    <input type="tel" id="mobile" required placeholder="Enter mobile number" value="9876543210">
    <input type="email" id="email" placeholder="Enter email" value="rahul@x.com">
    <select id="qualification"><option value="12th" selected>12th</option></select>
    <input type="text" id="batch" placeholder="Preferred batch" value="Evening">
    <button type="submit">Apply</button>
  </form>`;

describe("website applications", () => {
  it("sends a course page's admission to the centre the student picks", async () => {
    let pageHandler = 0;
    load("/python.html", COURSE_PAGE);
    // The page's own WhatsApp handler no longer runs.
    document.getElementById("admissionForm")!.addEventListener("submit", () => { pageHandler += 1; });
    document.getElementById("admissionForm")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(pageHandler).toBe(0);

    const dialog = document.getElementById("apply-dialog")!;
    expect(dialog.textContent).toContain("Rahul Kumar · 9876543210");
    await flush();
    await flush();
    const select = dialog.querySelector("select") as HTMLSelectElement;
    expect([...select.options].map((o) => o.textContent)).toEqual([
      "Select your centre",
      "PNS COMPUTER ACADEMY",
      "Digiskills computer academy — Patepur, Vaishali, Bihar",
    ]);
    expect((dialog.querySelector("#apply-course") as HTMLInputElement).value).toBe("Python Programming");

    // A centre has to be chosen.
    (dialog.querySelector(".go") as HTMLButtonElement).click();
    expect(dialog.querySelector(".err")!.textContent).toBe("Please choose your centre.");

    const search = dialog.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = "vaishali";
    search.dispatchEvent(new Event("input"));
    expect(select.options).toHaveLength(2);
    select.value = "b2";
    (dialog.querySelector(".go") as HTMLButtonElement).click();
    await flush();
    await flush();

    const sent = calls.find((c) => c.fn === "submit_admission_application")!;
    expect(sent.body).toEqual({
      p_branch_id: "b2",
      p_student_name: "Rahul Kumar",
      p_phone: "9876543210",
      p_email: "rahul@x.com",
      p_course: "Python Programming",
      p_qualification: "12th",
      p_city: null,
      p_parent_name: null,
      p_message: "Preferred batch: Evening",
      p_page: "python.html",
    });
    expect(dialog.textContent).toContain("sent to Digiskills computer academy");
    // The way on to the full admission, with documents, at the chosen centre.
    const link = dialog.querySelector('a[href^="/computercentre/apply?"]') as HTMLAnchorElement;
    expect(link.textContent).toBe("Apply online with documents");
    expect(link.getAttribute("href")).toBe("/computercentre/apply?centre=b2&course=Python%20Programming&name=Rahul%20Kumar&phone=9876543210");
  });

  it("shows the database's own complaint, and falls back to WhatsApp when it cannot be reached", async () => {
    load("/python.html", COURSE_PAGE);
    document.getElementById("admissionForm")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    await flush();
    let dialog = document.getElementById("apply-dialog")!;
    (dialog.querySelector("select") as HTMLSelectElement).value = "b1";
    failNext = "INVALID: Please enter a valid 10-digit mobile number.";
    (dialog.querySelector(".go") as HTMLButtonElement).click();
    await flush();
    await flush();
    expect(dialog.querySelector(".err")!.textContent).toBe("Please enter a valid 10-digit mobile number.");

    failNext = "connection refused";
    (dialog.querySelector(".go") as HTMLButtonElement).click();
    await flush();
    await flush();
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/917519884465?text="), "_blank");
    expect(decodeURIComponent((window.open as unknown as { mock: { calls: string[][] } }).mock.calls[0][0])).toContain("Centre: PNS COMPUTER ACADEMY");
    dialog = document.getElementById("apply-dialog")!;
    expect(dialog).toBeNull();
  });

  it("sends the franchise page's application to the head office", async () => {
    load("/franchise.html", `
      <form id="franchiseForm" action="franchise-register.html" method="POST">
        <input name="full_name" value="Sunil Singh"><input name="email" type="email" value="s@x.com">
        <input name="phone" value="9123456789"><input name="institute_name" value="Sunil Computer Centre">
        <textarea name="address">Main Road</textarea>
        <select name="state"><option selected>Bihar</option></select><select name="district"><option selected>Vaishali</option></select>
        <select name="block"><option selected>Patepur</option></select>
        <input name="city" value="Patepur"><input name="pincode" value="844114"><input name="total_pcs" value="12"><input name="staffs" value="3">
        <input type="file" name="aadhaar_front"><input type="checkbox" name="terms" checked value="on">
      </form>`);
    document.getElementById("franchiseForm")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    await flush();
    const sent = calls.find((c) => c.fn === "submit_franchise_application")!;
    expect(sent.body).toMatchObject({
      p_name: "Sunil Singh",
      p_phone: "9123456789",
      p_email: "s@x.com",
      p_institute: "Sunil Computer Centre",
      p_address: "Main Road",
      p_state: "Bihar",
      p_district: "Vaishali",
      p_block: "Patepur",
      p_city: "Patepur",
      p_pincode: "844114",
      p_computers: "12",
      p_staff: "3",
    });
    expect(document.getElementById("apply-dialog")!.textContent).toContain("reached our head office");
  });

  it("sends the application on WhatsApp while the centre list is not available", async () => {
    load("/python.html", COURSE_PAGE);
    (window as unknown as { __apply: { reset: () => void } }).__apply.reset();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Could not find the function" }), { status: 404 })));
    document.getElementById("admissionForm")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    await flush();
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/917519884465?text="), "_blank");
    expect(document.getElementById("apply-dialog")).toBeNull();
  });

  it("does not let a required upload hold back an application", () => {
    window.history.replaceState(null, "", "/bihar_board.html");
    document.body.innerHTML = `<form id="f"><input type="tel" name="mobile"><input type="file" name="passport_photo" required></form>`;
    (window as unknown as { __apply: { relax: () => void } }).__apply.relax();
    expect((document.querySelector('input[type="file"]') as HTMLInputElement).required).toBe(false);
  });

  it("leaves forms without a mobile number alone", () => {
    load("/verification.html", `<form id="verify"><input name="enrollment" value="E1"><input name="dob" type="date"></form>`);
    const ev = new Event("submit", { bubbles: true, cancelable: true });
    document.getElementById("verify")!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    expect(document.getElementById("apply-dialog")).toBeNull();
  });
});
