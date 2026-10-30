import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * Every exam workflow page opens on its data, and the certificate page issues
 * on a passed final result -- charging through issueCertificate with the
 * dates -- then prints in the institute's own format.
 */
const toast = vi.fn();
let walletBalance = 500;
const issueCertificate = vi.fn((..._args: unknown[]) => Promise.resolve({ charged: true, alreadyIssued: false, amount: 150, certificateNo: "CERT-E001" }));
const printFromTemplate = vi.fn((..._args: unknown[]) => Promise.resolve(true));
const printMarksheetsFromTemplate = vi.fn((..._a: unknown[]) => Promise.resolve(true));
const printManyFromTemplate = vi.fn((..._args: unknown[]) => Promise.resolve(true));
const marksheetPdf = vi.fn((..._args: unknown[]) => Promise.resolve());
let issuedList: unknown[] = [];
// Null: approvals not set up, so pages behave as before.
let approvalsList: unknown[] | null = null;
let view = "admin";
// The head office gets APPROVED straight away, as the database answers it.
const requestCertificateApproval = vi.fn((..._a: unknown[]) => Promise.resolve("APPROVED"));
const reviewPrintApproval = vi.fn((..._a: unknown[]) => Promise.resolve({ status: "APPROVED", issue: { charged: true, amount: 150 } }));
const saveAdmitCard = vi.fn((..._a: unknown[]) => Promise.resolve());
const saveCourseSubject = vi.fn((..._args: unknown[]) => Promise.resolve());

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/PageHeader", () => ({ PageHeader: ({ title }: { title: string }) => <h1>{title}</h1> }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () =>
    view === "admin"
      ? { view, user: { id: "u1", name: "Head Office", role: "SUPER_ADMIN", organizationId: "org1", branchId: null } }
      : { view, user: { id: "u2", name: "Centre Staff", role: "FRANCHISE", organizationId: "org1", branchId: "b1" } },
}));
vi.mock("@/lib/studentTemplateDocument", () => ({
  printFromTemplate: (...a: unknown[]) => printFromTemplate(...a),
  printManyFromTemplate: (...a: unknown[]) => printManyFromTemplate(...a),
  printMarksheetsFromTemplate: (...a: unknown[]) => printMarksheetsFromTemplate(...a),
  photoOf: () => "",
}));
vi.mock("@/lib/documents", () => ({
  certificatePdf: vi.fn(),
  certificatesPdf: vi.fn(),
  marksheetsPdf: vi.fn(),
  marksheetPdf: (...a: unknown[]) => marksheetPdf(...a),
  marksheetSummary: () => ({ result: "Pass" }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Begusarai Centre" }] }),
  getCourses: () => Promise.resolve({ success: true, data: [{ id: "c1", name: "ADCA", durationMonths: 12 }] }),
  getSessionYears: () => Promise.resolve({ success: true, data: [{ name: "2026-2027" }] }),
  getStudentPicklist: () =>
    Promise.resolve({
      success: true,
      data: [{ id: "s1", branchId: "b1", courseId: "c1", firstName: "Ram", lastName: "Kumar", enrollmentNo: "E001", phone: "9999" }],
    }),
  getStudentDocument: () => Promise.resolve({ data: { branchId: "b1", course: { name: "ADCA" }, branch: { name: "Begusarai Centre", organization: { name: "Org" } }, examResults: [] } }),
  getCertificateFees: () => Promise.resolve(new Map([["b1", 150]])),
  getWallet: () => Promise.resolve({ success: true, data: { balance: walletBalance } }),
  issueCertificate: (...a: unknown[]) => issueCertificate(...a),
  // The course's syllabus: "Web Design" is already a subject, the other two are not.
  getCourseSyllabus: () =>
    Promise.resolve({
      success: true,
      data: {
        ready: true,
        chapters: [],
        modules: [
          { id: "m1", courseId: "c1", name: "Web Design", description: "", sortOrder: 1, status: "Active" },
          { id: "m2", courseId: "c1", name: "MS Office", description: "Word, Excel", sortOrder: 2, status: "Active" },
          { id: "m3", courseId: "c1", name: "Tally Prime", description: "", sortOrder: 3, status: "Active" },
        ],
      },
    }),
}));
vi.mock("@/lib/supabase/examWorkflow", () => ({
  getExamCentres: () => Promise.resolve([{ id: "ec1", name: "Main Hall", code: "MH", address: "Begusarai" }]),
  saveExamCentre: vi.fn(),
  deleteExamCentre: vi.fn(),
  getCourseSubjects: () =>
    Promise.resolve([{ id: "x1", courseId: "c1", term: 1, code: "A01", name: "Web Design", subjectType: "BOTH", theoryMax: 100, theoryMin: 35, practicalMax: 50, practicalMin: 20, sortOrder: 1 }]),
  saveCourseSubject: (...a: unknown[]) => saveCourseSubject(...a),
  deleteCourseSubject: vi.fn(),
  reorderCourseSubjects: vi.fn(),
  setCourseTerms: vi.fn(),
  subjectProblem: () => null,
  getExamSchedules: () =>
    Promise.resolve([{ id: "sch1", branchId: "b1", courseId: "c1", term: 1, session: "2026-2027", examCentreId: "ec1", items: [{ subjectId: "x1", date: "2026-11-01", time: "10:00" }], updatedAt: "" }]),
  saveExamSchedule: vi.fn(),
  deleteExamSchedule: vi.fn(),
  getAdmitCards: () =>
    Promise.resolve([{ id: "a1", studentId: "s1", branchId: "b1", courseId: "c1", term: 1, session: "2026-2027", rollNo: "R1001", examCentreId: "ec1", scheduleId: "sch1", isFinal: true, issuedAt: "" }]),
  saveAdmitCard: (...a: unknown[]) => saveAdmitCard(...a),
  deleteAdmitCard: vi.fn(),
  getMarksheets: () =>
    Promise.resolve([{ id: "m1", studentId: "s1", branchId: "b1", courseId: "c1", term: 1, session: "2026-2027", issueDate: "2026-11-20", marks: [], totalObtained: 120, totalMax: 150, percentage: 80, grade: "A", result: "PASS", isFinal: true, marksheetNo: "MS-E001-1", updatedAt: "" }]),
  getIssuedCertificates: () => Promise.resolve(issuedList),
  getPrintApprovals: () => Promise.resolve(approvalsList),
  requestCertificateApproval: (...a: unknown[]) => requestCertificateApproval(...a),
  reviewPrintApproval: (...a: unknown[]) => reviewPrintApproval(...a),
  approvalFor: (list: Array<{ kind: string; studentId: string; marksheetId: string; status: string }> | null, kind: string, key: string) =>
    list === null ? "APPROVED" : list.find((a) => a.kind === kind && (kind === "MARKSHEET" ? a.marksheetId === key : a.studentId === key))?.status ?? null,
}));

const page = async (path: string) => (await import(path)).default;

beforeEach(() => {
  walletBalance = 500;
  issuedList = [];
  approvalsList = null;
  view = "admin";
  requestCertificateApproval.mockClear();
  reviewPrintApproval.mockClear();
  printManyFromTemplate.mockClear();
  marksheetPdf.mockClear();
  toast.mockClear();
  issueCertificate.mockClear();
  printFromTemplate.mockClear();
  saveCourseSubject.mockClear();
});

describe("exam workflow pages", () => {
  it("lists exam centres", async () => {
    const ExamCentres = await page("@/pages/exam/ExamCentres");
    render(<MemoryRouter><ExamCentres /></MemoryRouter>);
    expect((await screen.findAllByText("Main Hall")).length).toBeGreaterThan(0);
    expect(screen.getByText("Add exam centre")).toBeInTheDocument();
  });

  it("lists schedules with their centre, course and term", async () => {
    const ExamSchedule = await page("@/pages/exam/ExamSchedule");
    render(<MemoryRouter><ExamSchedule /></MemoryRouter>);
    const table = await screen.findByText("Schedules");
    expect(table).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("Begusarai Centre").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Full Course").length).toBeGreaterThan(0);
  });

  it("lists issued admit cards", async () => {
    const AdmitCards = await page("@/pages/exam/AdmitCards");
    render(<MemoryRouter><AdmitCards /></MemoryRouter>);
    expect((await screen.findAllByText("R1001")).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getAllByText("Ram Kumar").length).toBeGreaterThan(0));
  });

  it("issues admit cards to several ticked students at once", async () => {
    saveAdmitCard.mockClear();
    const AdmitCards = await page("@/pages/exam/AdmitCards");
    render(<MemoryRouter><AdmitCards /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Multiple students" }));
    const field = (label: string) => within(Array.from(document.querySelectorAll("label")).find((el) => el.textContent === label)!.parentElement!).getByRole("combobox");
    await waitFor(() => expect(field("Centre")).toBeTruthy());
    fireEvent.keyDown(field("Centre"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Begusarai Centre" }));
    fireEvent.keyDown(field("Course"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "ADCA" }));
    expect(screen.queryByPlaceholderText("Enter roll no.")).toBeNull();

    fireEvent.click(await screen.findByRole("checkbox", { name: "Select all students shown" }));
    fireEvent.click(screen.getByRole("button", { name: "Issue 1 admit card" }));
    await waitFor(() => expect(saveAdmitCard).toHaveBeenCalledTimes(1));
    // An issued card keeps its own roll number.
    expect(saveAdmitCard.mock.calls[0][0]).toEqual(expect.objectContaining({ studentId: "s1", rollNo: "R1001", scheduleId: "sch1" }));
    expect(screen.getByRole("button", { name: "Print all (1)" })).toBeEnabled();
  });

  it("shows a course's subjects", async () => {
    const CourseSubjects = await page("@/pages/exam/CourseSubjects");
    render(<MemoryRouter><CourseSubjects /></MemoryRouter>);
    const label = Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Course")!;
    await waitFor(() => expect(within(label.parentElement!).getByRole("combobox")).toBeInTheDocument());
    fireEvent.keyDown(within(label.parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: /ADCA/ }));
    // In the syllabus list and in the subjects table.
    expect((await screen.findAllByText("Web Design")).length).toBe(2);
    expect(screen.getByText("35 / 100")).toBeInTheDocument();
    expect(screen.getByText("20 / 50")).toBeInTheDocument();
  });

  it("shows the course's syllabus and adds its missing modules to the marksheet", async () => {
    const CourseSubjects = await page("@/pages/exam/CourseSubjects");
    render(<MemoryRouter><CourseSubjects /></MemoryRouter>);
    const label = Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Course")!;
    await waitFor(() => expect(within(label.parentElement!).getByRole("combobox")).toBeInTheDocument());
    fireEvent.keyDown(within(label.parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: /ADCA/ }));
    expect(await screen.findByText("ADCA syllabus")).toBeInTheDocument();
    expect(screen.getByText("3 modules · 1 on the Full Course marksheet")).toBeInTheDocument();
    expect(screen.getByText("On marksheet")).toBeInTheDocument();
    expect(screen.getAllByText("Not added")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Update syllabus/ })).toHaveAttribute("href", "/course/syllabus?course=c1");

    fireEvent.click(screen.getByRole("button", { name: "Add 2 modules to marksheet" }));
    fireEvent.change(await screen.findByLabelText("Theory max marks"), { target: { value: "80" } });
    fireEvent.click(screen.getByRole("button", { name: "Add 2 subjects" }));
    await waitFor(() => expect(saveCourseSubject).toHaveBeenCalledTimes(2));
    expect(saveCourseSubject.mock.calls.map(([s]) => s)).toEqual([
      expect.objectContaining({ courseId: "c1", term: 1, name: "MS Office", code: "M-01", theoryMax: 80, theoryMin: 35, sortOrder: 2 }),
      expect.objectContaining({ name: "Tally Prime", code: "M-02", sortOrder: 3 }),
    ]);
  });

  it("issues a certificate on the passed final result and prints it", async () => {
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates /></MemoryRouter>);
    const label = () => Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Student")!;
    await waitFor(() => expect(label()).toBeTruthy());
    fireEvent.keyDown(within(label().parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: /Ram Kumar.*eligible/ }));
    expect(await screen.findByText(/₹150 will be deducted/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Generate certificate" }));
    await waitFor(() => expect(issueCertificate).toHaveBeenCalledTimes(1));
    const [studentId, by, dates] = issueCertificate.mock.calls[0] as [string, string, Record<string, string>];
    expect(studentId).toBe("s1");
    expect(by).toBe("Head Office");
    expect(dates.examConductedDate).toBe("2026-11-20");
    await waitFor(() => expect(printFromTemplate).toHaveBeenCalledWith("certificate", expect.anything(), "org1", "b1", { certificate_no: "CERT-E001", certificate_id: "CERT-E001" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Certificate issued" })));
  });

  it("will not issue when the centre's wallet cannot cover the fee", async () => {
    walletBalance = 100;
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates /></MemoryRouter>);
    const label = () => Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Student")!;
    await waitFor(() => expect(label()).toBeTruthy());
    fireEvent.keyDown(within(label().parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: /Ram Kumar/ }));
    expect(await screen.findByText(/is less than the ₹150 certificate fee/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recharge the wallet" })).toHaveAttribute("href", "/branch/wallet");
    expect(screen.getByRole("button", { name: "Generate certificate" })).toBeDisabled();
  });

  it("issues certificates to several students at once and prints them as one run", async () => {
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Multiple students" }));
    expect(screen.getByText("Choose the centre to list its students who passed.")).toBeInTheDocument();
    const centre = Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Centre")!;
    fireEvent.keyDown(within(centre.parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Begusarai Centre" }));

    fireEvent.click(await screen.findByRole("checkbox", { name: "Select all students shown" }));
    expect(await screen.findByText(/₹150 will be deducted from Begusarai Centre's wallet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate 1 certificate" }));
    await waitFor(() => expect(issueCertificate).toHaveBeenCalledTimes(1));
    expect((issueCertificate.mock.calls[0] as unknown[])[0]).toBe("s1");
    await waitFor(() =>
      expect(printManyFromTemplate).toHaveBeenCalledWith("certificate", [expect.anything()], "org1", "b1", [{ certificate_no: "CERT-E001", certificate_id: "CERT-E001" }]),
    );
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "1 certificate(s) ready" })));
  });

  it("prints the chosen students' marksheets from the certificate form", async () => {
    printMarksheetsFromTemplate.mockClear();
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates /></MemoryRouter>);
    const label = () => Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Student")!;
    await waitFor(() => expect(label()).toBeTruthy());
    fireEvent.keyDown(within(label().parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: /Ram Kumar/ }));
    fireEvent.click(screen.getByRole("button", { name: "Print marksheet" }));
    await waitFor(() => expect(printFromTemplate).toHaveBeenCalledWith("marksheet", expect.anything(), "org1", "b1", expect.objectContaining({ marksheet_no: "MS-E001-1" })));

    fireEvent.click(screen.getByRole("button", { name: "Multiple students" }));
    const centre = Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Centre")!;
    fireEvent.keyDown(within(centre.parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Begusarai Centre" }));
    fireEvent.click(await screen.findByRole("checkbox", { name: "Select all students shown" }));
    fireEvent.click(screen.getByRole("button", { name: "Print 1 marksheet" }));
    await waitFor(() => expect(printMarksheetsFromTemplate).toHaveBeenCalledTimes(1));
    expect((printMarksheetsFromTemplate.mock.calls[0] as unknown[])[0]).toEqual([expect.objectContaining({ branchId: "b1", extra: expect.objectContaining({ marksheet_no: "MS-E001-1" }) })]);
  });

  it("prints the marksheet beside an issued certificate", async () => {
    issuedList = [{ id: "c1", studentId: "s1", branchId: "b1", certificateNo: "CERT-E001", issueDate: "2026-11-25", examConductedDate: "2026-11-20", amount: 150 }];
    printFromTemplate.mockResolvedValueOnce(false);
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText("Ram Kumar").length).toBeGreaterThan(0));
    const row = screen.getAllByText("CERT-E001").map((el) => el.closest("tr")).find(Boolean) as HTMLElement;
    fireEvent.keyDown(within(row).getByRole("button", { name: "Row actions" }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Print marksheet" }));
    await waitFor(() => expect(printFromTemplate).toHaveBeenCalledWith("marksheet", expect.anything(), "org1", "b1", expect.objectContaining({ marksheet_no: "MS-E001-1" })));
    await waitFor(() => expect(marksheetPdf).toHaveBeenCalledWith(expect.objectContaining({ rollNo: "R1001", examinationDate: "2026-11-20" })));
  });

  it("sends a centre's certificate to the head office instead of issuing it", async () => {
    view = "franchise";
    approvalsList = [];
    requestCertificateApproval.mockResolvedValueOnce("PENDING");
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates /></MemoryRouter>);
    const label = () => Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Student")!;
    await waitFor(() => expect(label()).toBeTruthy());
    fireEvent.keyDown(within(label().parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: /Ram Kumar/ }));
    expect(await screen.findByText(/when the head office approves/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send for approval" }));
    await waitFor(() => expect(requestCertificateApproval).toHaveBeenCalledWith("s1", "Centre Staff", { issueDate: expect.any(String), examConductedDate: "2026-11-20" }));
    expect(issueCertificate).not.toHaveBeenCalled();
    expect(printFromTemplate).not.toHaveBeenCalled();
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Sent for approval" })));
  });

  it("holds a centre's request until the head office decides, and shows a rejection's reason", async () => {
    view = "franchise";
    approvalsList = [
      { id: "p1", kind: "CERTIFICATE", studentId: "s1", branchId: "b1", marksheetId: "", status: "REJECTED", note: "Wrong exam date", requestedAt: "2026-11-21T10:00:00Z" },
      { id: "p2", kind: "MARKSHEET", studentId: "s1", branchId: "b1", marksheetId: "m1", status: "PENDING", note: "", requestedAt: "2026-11-20T10:00:00Z" },
    ];
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates /></MemoryRouter>);
    expect(await screen.findByText("Sent for approval")).toBeInTheDocument();
    expect(screen.getByText("Reason: Wrong exam date")).toBeInTheDocument();
    const label = () => Array.from(document.querySelectorAll("label")).find((el) => el.textContent === "Student")!;
    fireEvent.keyDown(within(label().parentElement!).getByRole("combobox"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: /Ram Kumar/ }));
    expect(screen.getByRole("button", { name: "Send for approval again" })).toBeEnabled();
    // The marksheet waits too.
    fireEvent.click(screen.getByRole("button", { name: "Print marksheet" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Could not print marksheet", description: expect.stringMatching(/waiting for the head office/) })));
    expect(printFromTemplate).not.toHaveBeenCalled();
  });

  it("lets the head office approve centres' requests", async () => {
    approvalsList = [
      { id: "p1", kind: "CERTIFICATE", studentId: "s1", branchId: "b1", marksheetId: "", status: "PENDING", note: "", requestedBy: "Centre Staff", requestedAt: "2026-11-21T10:00:00Z" },
    ];
    const PrintApprovals = await page("@/pages/exam/PrintApprovals");
    render(<MemoryRouter><PrintApprovals /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText("Ram Kumar").length).toBeGreaterThan(0));
    expect(screen.getAllByText("120/150 · 80% · A · PASS").length).toBeGreaterThan(0);
    const row = screen.getAllByText("Certificate").map((el) => el.closest("tr")).find(Boolean) as HTMLElement;
    fireEvent.keyDown(within(row).getByRole("button", { name: "Row actions" }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Approve" }));
    await waitFor(() => expect(reviewPrintApproval).toHaveBeenCalledWith("p1", true, null, "Head Office"));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "1 approved", description: expect.stringMatching(/₹150 charged/) })));
  });

  it("lists passout students", async () => {
    const Certificates = await page("@/pages/exam/Certificates");
    render(<MemoryRouter><Certificates passoutOnly /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Passout Students" })).toBeInTheDocument();
    expect(screen.queryByText("Generate certificate")).toBeNull();
  });
});
