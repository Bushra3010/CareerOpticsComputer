import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { viewForRole } from "@/lib/roles";
import { lazy, Suspense } from "react";

// Pages
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Franchise / branch
const FranchiseDashboard = lazy(() => import("./pages/franchise/FranchiseDashboard"));

// Student portal
const StudentDashboard = lazy(() => import("./pages/portal/StudentDashboard"));
const MyAttendance = lazy(() => import("./pages/portal/MyAttendance"));
const MyFees = lazy(() => import("./pages/portal/MyFees"));
const MyResults = lazy(() => import("./pages/portal/MyResults"));
const MyClasses = lazy(() => import("./pages/portal/MyClasses"));
const MyCourses = lazy(() => import("./pages/portal/MyCourses"));
const MyDocuments = lazy(() => import("./pages/portal/MyDocuments"));
const MyProfile = lazy(() => import("./pages/portal/MyProfile"));
const MyExams = lazy(() => import("./pages/portal/MyExams"));
const TakeExam = lazy(() => import("./pages/portal/TakeExam"));

// Reception
const EnquiriesWorkspace = lazy(() => import("./pages/reception/EnquiriesWorkspace"));
const ItemMovementWorkspace = lazy(() => import("./pages/reception/ItemMovementWorkspace"));

// Branch Management
const CreateBranch = lazy(() => import("./pages/branch/CreateBranch"));
const ViewBranch = lazy(() => import("./pages/branch/ViewBranch"));
const WalletRecharge = lazy(() => import("./pages/branch/WalletRecharge"));
const BranchTransactions = lazy(() => import("./pages/branch/BranchTransactions"));
const BranchNoticeBoard = lazy(() => import("./pages/branch/BranchNoticeBoard"));
const BranchWebsiteSettings = lazy(() => import("./pages/branch/BranchWebsiteSettings"));
const CentreDocuments = lazy(() => import("./pages/branch/CentreDocuments"));
const WebsiteView = lazy(() => import("./pages/branch/WebsiteView"));
const FranchiseLeads = lazy(() => import("./pages/branch/FranchiseLeads"));

// Enquiry Management
const BranchEnquiry = lazy(() => import("./pages/enquiry/BranchEnquiry"));
const AdmissionLeads = lazy(() => import("./pages/enquiry/AdmissionLeads"));
const OnlineBranchEnquiry = lazy(() => import("./pages/enquiry/OnlineBranchEnquiry"));
const OnlineStudentEnquiry = lazy(() => import("./pages/enquiry/OnlineStudentEnquiry"));

// Student Management
const ViewStudents = lazy(() => import("./pages/student/ViewStudents"));
const OnlineAdmissionList = lazy(() => import("./pages/student/OnlineAdmissionList"));
const AdmissionsWorkspace = lazy(() => import("./pages/student/AdmissionsWorkspace"));

// Fee Management
const FeeCollection = lazy(() => import("./pages/fee/FeeCollection"));
const FeeTypes = lazy(() => import("./pages/fee/FeeTypes"));
const FeeGroups = lazy(() => import("./pages/fee/FeeGroups"));
const FeeAllocation = lazy(() => import("./pages/fee/FeeAllocation"));
const DueFeeCollection = lazy(() => import("./pages/fee/DueFeeCollection"));

// Course Management
const BatchTiming = lazy(() => import("./pages/course/BatchTiming"));
const AssignCourseToBatch = lazy(() => import("./pages/course/AssignCourseToBatch"));
const AssignStudentsToBatch = lazy(() => import("./pages/course/AssignStudentsToBatch"));
const CourseSyllabus = lazy(() => import("./pages/course/CourseSyllabus"));
const AcademicsWorkspace = lazy(() => import("./pages/course/AcademicsWorkspace"));

// Exam Management
const AssessmentsWorkspace = lazy(() => import("./pages/exam/AssessmentsWorkspace"));
const CourseSubjects = lazy(() => import("./pages/exam/CourseSubjects"));
const ExamCentres = lazy(() => import("./pages/exam/ExamCentres"));
const ExamGuide = lazy(() => import("./pages/exam/ExamGuide"));
const ExamSchedule = lazy(() => import("./pages/exam/ExamSchedule"));
const AdmitCards = lazy(() => import("./pages/exam/AdmitCards"));
const Results = lazy(() => import("./pages/exam/Results"));
const Certificates = lazy(() => import("./pages/exam/Certificates"));
// Public: a student applies with documents, without a login.
const OnlineAdmission = lazy(() => import("./pages/public/OnlineAdmission"));
const PrintApprovals = lazy(() => import("./pages/exam/PrintApprovals"));
const CentreCharges = lazy(() => import("./pages/branch/CentreCharges"));

// Online Exam
const CreateOnlineExam = lazy(() => import("./pages/online-exam/CreateOnlineExam"));
const QuestionPaperBuilder = lazy(() => import("./pages/online-exam/QuestionPaperBuilder"));
const AddQuestions = lazy(() => import("./pages/online-exam/AddQuestions"));
const AssignExam = lazy(() => import("./pages/online-exam/AssignExam"));
const OnlineExamMarks = lazy(() => import("./pages/online-exam/OnlineExamMarks"));

// Live Class
const ViewLiveClasses = lazy(() => import("./pages/live-class/ViewLiveClasses"));
const LiveClassSetup = lazy(() => import("./pages/live-class/LiveClassSetup"));
// Both embed a large third-party editor, so they load only when opened.
const CodeLab = lazy(() => import("./pages/tools/CodeLab"));
const Whiteboard = lazy(() => import("./pages/tools/Whiteboard"));

// Cards
const IDCardTemplate = lazy(() => import("./pages/cards/IDCardTemplate"));
const GenerateIDCards = lazy(() => import("./pages/cards/GenerateIDCards"));
const AdmitCardTemplate = lazy(() => import("./pages/cards/AdmitCardTemplate"));
const DocumentDesigner = lazy(() => import("./pages/documents/DocumentDesigner"));

// Settings
const GeneralSettings = lazy(() => import("./pages/settings/GeneralSettings"));
const WebsiteContent = lazy(() => import("./pages/website/WebsiteContent"));
const PaymentGateway = lazy(() => import("./pages/settings/PaymentGateway"));
const PaymentQRCode = lazy(() => import("./pages/settings/PaymentQRCode"));
const BatchPaymentQR = lazy(() => import("./pages/settings/BatchPaymentQR"));

// Partner Management
const AddPartner = lazy(() => import("./pages/partners/AddPartner"));
const AllPartners = lazy(() => import("./pages/partners/AllPartners"));
const PartnerTransactions = lazy(() => import("./pages/partners/PartnerTransactions"));

// Expense Management
const VoucherHead = lazy(() => import("./pages/expense/VoucherHead"));
const VoucherHeads = lazy(() => import("./pages/expense/VoucherHeads"));
const DepositVoucher = lazy(() => import("./pages/expense/DepositVoucher"));
const ExpenseVoucher = lazy(() => import("./pages/expense/ExpenseVoucher"));

// Attendance Management
const Attendance = lazy(() => import("./pages/attendance/Attendance"));
const AttendanceQr = lazy(() => import("./pages/attendance/AttendanceQr"));
const AttendanceReport = lazy(() => import("./pages/attendance/AttendanceReport"));
const AttendanceLogs = lazy(() => import("./pages/attendance/AttendanceLogs"));
const HolidayApply = lazy(() => import("./pages/attendance/HolidayApply"));

// User Management
const AllUsers = lazy(() => import("./pages/user/AllUsers"));
const UserRoles = lazy(() => import("./pages/user/UserRoles"));
const AccessControl = lazy(() => import("./pages/user/AccessControl"));

// Session Year Management
const AddSessionYear = lazy(() => import("./pages/session/AddSessionYear"));
const AllSessionYears = lazy(() => import("./pages/session/AllSessionYears"));

const queryClient = new QueryClient();

function LoadingFallback() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontSize: "14px",
      color: "#888",
    }}>
      Loading…
    </div>
  );
}

/** The root path belongs to whichever workspace the signed-in authorisation
 *  owns: the organisation roll-up, one branch, or the student's own portal. */
function Dashboard() {
  const { user } = useAuth();
  const view = viewForRole(user?.role);
  if (view === "student") return <Navigate to="/me" replace />;
  return view === "franchise" ? <FranchiseDashboard /> : <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider><ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="erp-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<OnlineAdmission />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Student portal */}
          <Route path="/me" element={<StudentDashboard />} />
          <Route path="/me/courses" element={<MyCourses />} />
          <Route path="/me/classes" element={<MyClasses />} />
          <Route path="/me/attendance" element={<MyAttendance />} />
          <Route path="/me/fees" element={<MyFees />} />
          <Route path="/me/results" element={<MyResults />} />
          <Route path="/me/documents" element={<MyDocuments />} />
          <Route path="/me/profile" element={<MyProfile />} />
          <Route path="/me/exams" element={<MyExams />} />
          <Route path="/me/exams/:examId" element={<TakeExam />} />

          {/* Reception Management */}
          <Route path="/reception/enquiry" element={<EnquiriesWorkspace />} />
          <Route path="/reception/visitors" element={<EnquiriesWorkspace />} />
          <Route path="/reception/dispatch" element={<ItemMovementWorkspace />} />
          <Route path="/reception/receive" element={<ItemMovementWorkspace />} />

          {/* Branch Management */}
          <Route path="/branch/create" element={<CreateBranch />} />
          <Route path="/branch/view" element={<ViewBranch />} />
          <Route path="/branch/wallet" element={<WalletRecharge />} />
          <Route path="/branch/charges" element={<CentreCharges />} />
          <Route path="/branch/transactions" element={<BranchTransactions />} />
          <Route path="/branch/notice-board" element={<BranchNoticeBoard />} />
          <Route path="/branch/website-settings" element={<BranchWebsiteSettings />} />
          <Route path="/branch/website-view" element={<WebsiteView />} />
          <Route path="/branch/leads" element={<FranchiseLeads />} />

          {/* Enquiry Management */}
          <Route path="/enquiry/branch" element={<BranchEnquiry />} />
          <Route path="/enquiry/admission-leads" element={<AdmissionLeads />} />
          <Route path="/enquiry/online-branch" element={<OnlineBranchEnquiry />} />
          <Route path="/enquiry/online-student" element={<OnlineStudentEnquiry />} />

          {/* Student Management */}
          <Route path="/student/view" element={<ViewStudents />} />
          <Route path="/student/add" element={<AdmissionsWorkspace />} />
          <Route path="/student/online-admissions" element={<OnlineAdmissionList />} />
          <Route path="/student/admission-form" element={<AdmissionsWorkspace />} />

          {/* Fee Management */}
          <Route path="/fee/types" element={<FeeTypes />} />
          <Route path="/fee/groups" element={<FeeGroups />} />
          <Route path="/fee/allocation" element={<FeeAllocation />} />
          <Route path="/fee/collection" element={<FeeCollection />} />
          <Route path="/fee/due-collection" element={<DueFeeCollection />} />

          {/* Course Management */}
          <Route path="/course/create" element={<AcademicsWorkspace />} />
          <Route path="/course/view" element={<AcademicsWorkspace />} />
          <Route path="/course/batch/create" element={<AcademicsWorkspace />} />
          <Route path="/course/batch/timing" element={<BatchTiming />} />
          <Route path="/course/batch/assign" element={<AssignCourseToBatch />} />
          <Route path="/course/batch/assign-students" element={<AssignStudentsToBatch />} />
          <Route path="/course/syllabus" element={<CourseSyllabus />} />
          <Route path="/course/subjects" element={<CourseSubjects />} />

          {/* Exam Management */}
          <Route path="/exam/guide" element={<ExamGuide />} />
          <Route path="/exam/create" element={<AssessmentsWorkspace />} />
          <Route path="/exam/schedule" element={<ExamSchedule />} />
          <Route path="/exam/centres" element={<ExamCentres />} />
          <Route path="/exam/admit-cards" element={<AdmitCards />} />
          <Route path="/exam/results" element={<Results />} />
          <Route path="/exam/assign-marks" element={<AssessmentsWorkspace />} />
          <Route path="/exam/marks-list" element={<AssessmentsWorkspace />} />
          <Route path="/exam/grade-management" element={<AssessmentsWorkspace />} />

          {/* Online Exam */}
          <Route path="/online-exam/create" element={<CreateOnlineExam />} />
          <Route path="/online-exam/question-paper-builder" element={<QuestionPaperBuilder />} />
          <Route path="/online-exam/add-questions" element={<AddQuestions />} />
          <Route path="/online-exam/assign" element={<AssignExam />} />
          <Route path="/online-exam/marks" element={<OnlineExamMarks />} />

          {/* Live Class */}
          <Route path="/live-class/view" element={<ViewLiveClasses />} />
          <Route path="/live-class/setup" element={<LiveClassSetup />} />
          <Route path="/tools/code-lab" element={<CodeLab />} />
          <Route path="/tools/whiteboard" element={<Whiteboard />} />

          {/* Cards */}
          <Route path="/cards/id-template" element={<IDCardTemplate />} />
          <Route path="/cards/generate-id" element={<GenerateIDCards />} />
          <Route path="/cards/admit-template" element={<AdmitCardTemplate />} />
          <Route path="/documents/designer" element={<DocumentDesigner />} />
          {/* Admit cards are issued from the exam schedule now; the old bulk page redirects there. */}
          <Route path="/cards/generate-admit" element={<Navigate to="/exam/admit-cards" replace />} />

          {/* Certificates */}
          <Route path="/certificate/template" element={<DocumentDesigner />} />
          <Route path="/certificate/generate" element={<AssessmentsWorkspace />} />
          <Route path="/certificate/issue" element={<Certificates />} />
          <Route path="/certificate/approvals" element={<PrintApprovals />} />
          <Route path="/student/passout" element={<Certificates passoutOnly />} />
          <Route path="/certificate/centre" element={<CentreDocuments />} />

          {/* Marksheets */}
          <Route path="/marksheet/template" element={<DocumentDesigner />} />
          <Route path="/marksheet/generate" element={<AssessmentsWorkspace />} />

          {/* Settings */}
          <Route path="/settings/general" element={<GeneralSettings />} />
          <Route path="/website/content" element={<WebsiteContent />} />
          <Route path="/settings/payment-gateway" element={<PaymentGateway />} />
          <Route path="/settings/payment-qr" element={<PaymentQRCode />} />
          <Route path="/settings/batch-qr" element={<BatchPaymentQR />} />

          {/* Partner Management */}
          <Route path="/partners/add" element={<AddPartner />} />
          <Route path="/partners/all" element={<AllPartners />} />
          <Route path="/partners/transactions" element={<PartnerTransactions />} />

          {/* Expense Management */}
          <Route path="/expense/voucher-head" element={<VoucherHead />} />
          <Route path="/expense/voucher-heads" element={<VoucherHeads />} />
          <Route path="/expense/deposit-voucher" element={<DepositVoucher />} />
          <Route path="/expense/expense-voucher" element={<ExpenseVoucher />} />

          {/* Attendance Management */}
          <Route path="/attendance/mark" element={<Attendance />} />
          <Route path="/attendance/qr" element={<AttendanceQr />} />
          <Route path="/attendance/report" element={<AttendanceReport />} />
          <Route path="/attendance/logs" element={<AttendanceLogs />} />
          <Route path="/attendance/holiday-apply" element={<HolidayApply />} />

          {/* User Management */}
          <Route path="/user/all" element={<AllUsers />} />
          <Route path="/user/roles" element={<UserRoles />} />
          <Route path="/user/access-control" element={<AccessControl />} />

          {/* Session Year Management */}
          <Route path="/session/add" element={<AddSessionYear />} />
          <Route path="/session/all" element={<AllSessionYears />} />

          </Route>
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider></AuthProvider>
  </QueryClientProvider>
);

export default App;
