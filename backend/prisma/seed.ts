import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const hash = (pw: string) => bcrypt.hash(pw, 12);

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);
const today = () => new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");

// ---------- helpers ----------
const indianNames = [
  "Aarav Sharma", "Ananya Verma", "Arjun Mehta", "Diya Roy", "Ishaan Gupta",
  "Kavya Nair", "Krish Patel", "Meera Singh", "Rohan Das", "Saanvi Bose",
  "Vihaan Kumar", "Zoya Khan", "Advik Joshi", "Ira Malhotra", "Reyansh Pillai",
];
const fatherNames = [
  "Rajesh Sharma", "Sunil Verma", "Sanjay Mehta", "Debashis Roy", "Rakesh Gupta",
  "Mohan Nair", "Bhavesh Patel", "Gurmeet Singh", "Tapan Das", "Amit Bose",
  "Deepak Kumar", "Farhan Khan", "Prakash Joshi", "Anil Malhotra", "Suresh Pillai",
];
const motherNames = [
  "Priya Sharma", "Neha Verma", "Meena Mehta", "Ritu Roy", "Kavita Gupta",
  "Lakshmi Nair", "Pooja Patel", "Simran Singh", "Riya Das", "Swati Bose",
  "Anjali Kumar", "Nadia Khan", "Deepika Joshi", "Ritu Malhotra", "Geetha Pillai",
];
const courses = [
  { name: "Advanced Diploma in Computer Applications", code: "ADCA-01", category: "COMPUTER", baseFee: 36000, regFee: 1000, examFee: 1500, duration: 12, desc: "Comprehensive course covering MS Office, programming, and web technologies." },
  { name: "Diploma in Financial Accounting", code: "DFA-01", category: "VOCATIONAL", baseFee: 28000, regFee: 800, examFee: 1200, duration: 6, desc: "Focus on Tally, GST, and practical accounting skills." },
  { name: "Web Designing & Development", code: "WDD-01", category: "SKILL_DEVELOPMENT", baseFee: 32000, regFee: 1000, examFee: 1500, duration: 8, desc: "HTML, CSS, JavaScript, React, and responsive design." },
  { name: "Digital Marketing", code: "DDM-01", category: "PROFESSIONAL", baseFee: 25000, regFee: 800, examFee: 1000, duration: 4, desc: "SEO, social media, Google Ads, and content marketing." },
  { name: "Desktop Publishing", code: "DTP-01", category: "COMPUTER", baseFee: 18000, regFee: 500, examFee: 800, duration: 3, desc: "Adobe InDesign, CorelDRAW, and layout design." },
  { name: "Data Science Fundamentals", code: "DSF-01", category: "PROFESSIONAL", baseFee: 40000, regFee: 1500, examFee: 2000, duration: 10, desc: "Python, statistics, machine learning basics, and data visualization." },
];
const batchNames = ["Morning A", "Afternoon B", "Evening C", "Morning D", "Morning E", "Afternoon F"];
const enquiries = [
  { name: "Neha Kapoor", phone: "9888800010", email: "neha.kapoor@example.com", purpose: "ADMISSION", meet: "Admission Counsellor", dept: "ADMINISTRATION", reason: "Interested in ADCA course, wants morning batch." },
  { name: "Rahul Sen", phone: "9888800011", email: "rahul.sen@example.com", purpose: "FEE", meet: "Accounts Manager", dept: "ACCOUNTS", reason: "Fee installment query for DFA course." },
  { name: "Pooja Shah", phone: "9888800012", email: "pooja.shah@example.com", purpose: "MEETING", meet: "Branch Director", dept: "ADMINISTRATION", reason: "Parent-teacher meeting request." },
  { name: "Amit Jain", phone: "9888800013", email: "amit.jain@example.com", purpose: "ADMISSION", meet: "Admission Counsellor", dept: "ADMINISTRATION", reason: "Enquiry about digital marketing course placement." },
  { name: "Nisha Rao", phone: "9888800014", email: "nisha.rao@example.com", purpose: "OTHER", meet: "Branch Director", dept: "ADMINISTRATION", reason: "Wants to know about upcoming workshops." },
  { name: "Samir Paul", phone: "9888800015", email: "samir.paul@example.com", purpose: "ADMISSION", meet: "Admission Counsellor", dept: "ADMINISTRATION", reason: "Looking for web designing course for his sister." },
  { name: "Tanya Ghosh", phone: "9888800016", email: "tanya.ghosh@example.com", purpose: "FEE", meet: "Accounts Manager", dept: "ACCOUNTS", reason: "Scholarship and fee concession query." },
  { name: "Karan Malhotra", phone: "9888800017", email: "karan.mal@example.com", purpose: "INTERVIEW", meet: "Branch Director", dept: "ADMINISTRATION", reason: "Came for faculty interview." },
];

async function main() {
  // ---- Users (must exist before Organization due to FK) ----
  const owner = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { userType: "ORGANIZATION", role: "ORGANIZATION_ADMIN", name: "Vikram Deshpande", email: "admin@careeroptics.in", phone: "+91 98765 43210", username: "admin", password: await hash("admin123") },
  });

  // ---- Organization ----
  const org = await prisma.organization.upsert({
    where: { code: "PEI-001" },
    update: {},
    create: {
      userId: owner.id,
      name: "Career Optics Computer Centre",
      code: "PEI-001",
      email: "info@careeroptics.in",
      phone: "+91 20 4004 1100",
      website: "https://careeroptics.in",
      description: "A leading computer and vocational training institute in Pune, offering industry-relevant courses since 2010.",
      streetAddress: "12, Kothrud Main Road",
      city: "Pune",
      state: "Maharashtra",
      district: "Pune",
      pincode: "411038",
      country: "India",
    },
  });

  const branchAdmin = await prisma.user.upsert({
    where: { username: "branch.admin" },
    update: {},
    create: { userType: "BRANCH", role: "BRANCH_ADMIN", name: "Sneha Kulkarni", email: "sneha.kulkarni@careeroptics.in", phone: "+91 87654 32109", username: "branch.admin", password: await hash("branch123") },
  });

  const accountant = await prisma.user.upsert({
    where: { username: "accountant" },
    update: {},
    create: { userType: "BRANCH", role: "ACCOUNTANT", name: "Rahul Patil", email: "rahul.patil@careeroptics.in", phone: "+91 76543 21098", username: "accountant", password: await hash("acct123") },
  });

  const teacher1 = await prisma.user.upsert({
    where: { username: "teacher.amit" },
    update: {},
    create: { userType: "BRANCH", role: "TEACHER", name: "Prof. Amit Kulkarni", email: "amit.kulkarni@careeroptics.in", phone: "+91 65432 10987", username: "teacher.amit", password: await hash("teacher123") },
  });

  const teacher2 = await prisma.user.upsert({
    where: { username: "teacher.priya" },
    update: {},
    create: { userType: "BRANCH", role: "TEACHER", name: "Prof. Priya Shinde", email: "priya.shinde@careeroptics.in", phone: "+91 54321 09876", username: "teacher.priya", password: await hash("teacher456") },
  });

  const receptionist = await prisma.user.upsert({
    where: { username: "reception" },
    update: {},
    create: { userType: "BRANCH", role: "RECEPTIONIST", name: "Kiran Pawar", email: "kiran.pawar@careeroptics.in", phone: "+91 43210 98765", username: "reception", password: await hash("recep123") },
  });

  // ---- Branch ----
  const branch = await prisma.branch.upsert({
    where: { code: "PEI-KD-01" },
    update: {},
    create: {
      organizationId: org.id,
      userId: branchAdmin.id,
      name: "Kothrud Main Campus",
      code: "PEI-KD-01",
      branchType: "MAIN",
      instituteType: "COMPUTER",
      academicYear: "2025-26",
      establishedYear: 2010,
      phone: "+91 20 4004 1100",
      email: "kothrud@careeroptics.in",
      altPhone: "+91 20 4004 1101",
      whatsappNumber: "+91 98888 00010",
      numComputers: 60,
      numFaculty: 18,
      numRooms: 12,
      onlineEnrollment: true,
      smsNotifications: true,
      emailNotifications: true,
    },
  });

  // ---- Branch Address ----
  await prisma.branchAddress.upsert({
    where: { branchId: branch.id },
    update: {},
    create: {
      branchId: branch.id,
      streetAddress: "12, Kothrud Main Road, Near Karve Statue",
      state: "Maharashtra",
      district: "Pune",
      block: "Kothrud",
      city: "Pune",
      pincode: "411038",
      latitude: 18.5039,
      longitude: 73.8209,
      country: "India",
    },
  });

  // ---- Branch Director ----
  await prisma.branchDirector.upsert({
    where: { branchId: branch.id },
    update: {},
    create: {
      branchId: branch.id,
      name: "Dr. Meenal Shah",
      gender: "FEMALE",
      dob: new Date("1978-05-15"),
      bloodGroup: "B+",
    },
  });

  // ---- Branch License ----
  await prisma.branchLicense.upsert({
    where: { branchId: branch.id },
    update: {},
    create: {
      branchId: branch.id,
      registrationDate: new Date("2010-06-01"),
      expiryDate: new Date("2030-05-31"),
      validDate: new Date("2010-06-01"),
    },
  });

  // ---- Branch Wallet ----
  await prisma.branchWallet.upsert({
    where: { branchId: branch.id },
    update: {},
    create: { branchId: branch.id, balance: 125000, lastRechargeAmount: 50000, lastRechargeDate: daysAgo(15) },
  });

  // ---- Branch Settings ----
  await prisma.branchSettings.upsert({
    where: { branchId: branch.id },
    update: {},
    create: {
      branchId: branch.id,
      siteName: "Career Optics Main Branch",
      tagline: "Learn Today, Lead Tomorrow",
      primaryDomain: "kothrud.careeroptics.in",
      subdomain: "kothrud",
      enableSsl: true,
    },
  });

  // ---- Courses ----
  const courseRecords: { id: string; name: string }[] = [];
  for (const c of courses) {
    const rec = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: {
        organizationId: org.id,
        name: c.name,
        code: c.code,
        category: c.category as any,
        description: c.desc,
        durationValue: c.duration,
        durationUnit: "MONTHS",
        baseFee: c.baseFee,
        registrationFee: c.regFee,
        examFee: c.examFee,
        eligibility: "10th Pass or equivalent",
        certification: "Diploma / Certificate",
      },
    });
    courseRecords.push({ id: rec.id, name: rec.name });

    await prisma.branchCourse.upsert({
      where: { branchId_courseId: { branchId: branch.id, courseId: rec.id } },
      update: {},
      create: { branchId: branch.id, courseId: rec.id, branchFee: c.baseFee + c.regFee, isOffered: true },
    });
  }

  // ---- Batches ----
  const batchRecords: { id: string }[] = [];
  for (let i = 0; i < courses.length; i++) {
    const existing = await prisma.batch.findFirst({ where: { branchId: branch.id, courseId: courseRecords[i].id } });
    const rec = existing
      ? await prisma.batch.update({ where: { id: existing.id }, data: { name: batchNames[i], code: `B-${courses[i].code}-2025`, maxSeats: 30, startDate: daysAgo(30 - i * 5), endDate: new Date(Date.now() + (90 + i * 20) * 86400000), status: "ACTIVE" } })
      : await prisma.batch.create({ data: { branchId: branch.id, courseId: courseRecords[i].id, name: batchNames[i], code: `B-${courses[i].code}-2025`, maxSeats: 30, startDate: daysAgo(30 - i * 5), endDate: new Date(Date.now() + (90 + i * 20) * 86400000), status: "ACTIVE" } });
    batchRecords.push({ id: rec.id });

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;
    for (let d = 0; d < 4; d++) {
      await prisma.batchTiming.create({
        data: {
          batchId: rec.id,
          day: days[d],
          startTime: `${8 + (i % 3) * 3}:00`,
          endTime: `${10 + (i % 3) * 3}:00`,
          roomNo: `Room ${String.fromCharCode(65 + (i % 5))}${d + 1}`,
        },
      });
    }
  }

  // ---- Students ----
  const studentRecords: { id: string }[] = [];
  for (let i = 0; i < indianNames.length; i++) {
    const [firstName, ...lastParts] = indianNames[i].split(" ");
    const lastName = lastParts.join(" ");
    const enrollmentNo = `PEI-2025-${String(i + 1).padStart(4, "0")}`;
    const appNo = `APP-2025-${String(i + 1).padStart(4, "0")}`;

    const user = await prisma.user.upsert({
      where: { email: `student.${i + 1}@careeroptics.in` },
      update: {},
      create: {
        userType: "STUDENT",
        role: "STUDENT",
        name: indianNames[i],
        email: `student.${i + 1}@careeroptics.in`,
        phone: `+91 90000${String(1000 + i).slice(-4)}`,
        username: `stu.${enrollmentNo.toLowerCase()}`,
        password: await hash("student123"),
      },
    });

    const student = await prisma.student.upsert({
      where: { enrollmentNo },
      update: {},
      create: {
        branchId: branch.id,
        userId: user.id,
        enrollmentNo,
        applicationNo: appNo,
        firstName,
        lastName,
        dateOfBirth: new Date(2000 + (i % 6), (i % 12), (i % 25) + 1),
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        bloodGroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"][i % 8],
        phone: `+91 90000${String(1000 + i).slice(-4)}`,
        email: `student.${i + 1}@careeroptics.in`,
        streetAddress: `${21 + i}, Sahakar Nagar, Kothrud`,
        city: "Pune",
        state: "Maharashtra",
        district: "Pune",
        pincode: "411038",
        country: "India",
        fatherName: fatherNames[i],
        motherName: motherNames[i],
        fatherPhone: `+91 90000${String(2000 + i).slice(-4)}`,
        motherPhone: `+91 90000${String(3000 + i).slice(-4)}`,
        academicYear: "2025-26",
        courseId: courseRecords[i % courseRecords.length].id,
        batchId: batchRecords[i % batchRecords.length].id,
        admissionStatus: i < 12 ? "APPROVED" : "PENDING_PAYMENT",
        admissionDate: daysAgo(40 - i),
        category: i % 3 === 0 ? "OBC" : i % 3 === 1 ? "SC" : "GENERAL",
        religion: i % 4 === 0 ? "Hindu" : i % 4 === 1 ? "Muslim" : i % 4 === 2 ? "Christian" : "Sikh",
        nationality: "Indian",
        apaarNumber: `APAAR${100000 + i}`,
        tenthSchoolName: "Saraswati Vidyalaya",
        tenthBoard: "Maharashtra State Board",
        tenthYearOfPassing: 2018 + (i % 3),
        tenthPercentage: `${65 + (i % 20)}`,
        twelfthSchoolName: "Modern College",
        twelfthBoard: "Maharashtra State Board",
        twelfthYearOfPassing: 2020 + (i % 3),
        twelfthPercentage: `${60 + (i % 20)}`,
      },
    });
    studentRecords.push({ id: student.id });
  }

  // ---- Fee Invoices & Payments ----
  const receiverId = owner.id;
  for (let i = 0; i < studentRecords.length; i++) {
    const course = courses[i % courses.length];
    const totalFee = course.baseFee + course.regFee + course.examFee;
    const statuses: any[] = ["PAID", "PAID", "PAID", "PAID", "PARTIAL", "DUE", "PAID", "PAID", "PARTIAL", "DUE", "PAID", "PAID", "DUE", "DUE", "DUE"];
    const status = statuses[i];
    const paidAmount = status === "PAID" ? totalFee : status === "PARTIAL" ? Math.round(totalFee * 0.5) : 0;
    const dueDate = daysAgo(-10 - i);

    const invoice = await prisma.feeInvoice.upsert({
      where: { invoiceNo: `INV-PEI-${String(i + 1).padStart(5, "0")}` },
      create: {
        studentId: studentRecords[i].id,
        branchId: branch.id,
        invoiceNo: `INV-PEI-${String(i + 1).padStart(5, "0")}`,
        description: `${course.name} - Full Course Fee`,
        amount: totalFee,
        dueDate,
        status: status as any,
      },
      update: {
        amount: totalFee,
        dueDate,
        status: status as any,
      },
    });

    if (paidAmount > 0) {
      await prisma.feePayment.upsert({
        where: { receiptNo: `RCT-PEI-${String(i + 1).padStart(5, "0")}` },
        create: {
          invoiceId: invoice.id,
          receiptNo: `RCT-PEI-${String(i + 1).padStart(5, "0")}`,
          amount: paidAmount,
          method: i % 2 === 0 ? "CASH" : "UPI",
          referenceNo: i % 2 === 0 ? undefined : `UPI${Date.now()}${i}`,
          receivedById: receiverId,
          paidAt: daysAgo(-20 + i),
        },
        update: {},
      });
    }
  }

  // ---- Attendance Records ----
  for (let day = 0; day < 14; day++) {
    const date = new Date(today().getTime() - day * 86400000);
    if (date.getDay() === 0) continue; // skip Sundays
    for (let i = 0; i < studentRecords.length; i++) {
      const attStatus =
        (i + day) % 13 === 0 ? "ABSENT" :
        (i + day) % 9 === 0 ? "LATE" :
        (i + day) % 7 === 0 ? "EXCUSED" :
        "PRESENT";
      await prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId: studentRecords[i].id, date } },
        update: {},
        create: {
          studentId: studentRecords[i].id,
          branchId: branch.id,
          batchId: batchRecords[i % batchRecords.length].id,
          date,
          status: attStatus as any,
          markedById: receiverId,
        },
      });
    }
  }

  // ---- Exams & Results ----
  const examSubjects = [
    "Fundamentals of Computers",
    "Office Automation & MS Office",
    "Internet & Email",
    "Financial Accounting",
    "Tally Prime with GST",
    "HTML5 & CSS3",
    "JavaScript Programming",
    "React.js Basics",
    "SEO & Analytics",
    "Social Media Marketing",
  ];
  for (let i = 0; i < courses.length; i++) {
    const exam = await prisma.exam.create({
      data: {
        branchId: branch.id,
        courseId: courseRecords[i].id,
        batchId: batchRecords[i].id,
        name: "Mid-Term Assessment 2025",
        subject: examSubjects[i],
        examDate: daysAgo(-7 - i),
        maxMarks: 100,
        passMarks: 40,
        status: "PUBLISHED",
      },
    });

    const enrolled = studentRecords.filter((_, idx) => idx % courses.length === i);
    for (const stu of enrolled) {
      const j = enrolled.indexOf(stu);
      const marks = 55 + ((i * 13 + j * 7) % 36);
      await prisma.examResult.create({
        data: {
          examId: exam.id,
          studentId: stu.id,
          marks: Math.min(marks, 100),
          remarks: marks >= 75 ? "Excellent performance" : marks >= 60 ? "Good work" : "Needs improvement",
        },
      });
    }
  }

  // ---- Visit Enquiries ----
  for (let i = 0; i < enquiries.length; i++) {
    await prisma.visitEnquiry.create({
      data: {
        branchId: branch.id,
        visitorName: enquiries[i].name,
        phone: enquiries[i].phone,
        email: enquiries[i].email,
        purpose: enquiries[i].purpose as any,
        personToMeet: enquiries[i].meet,
        department: enquiries[i].dept as any,
        enquiryReason: enquiries[i].reason,
        visitDate: daysAgo(-(i % 5)),
        visitTime: `${9 + (i % 8)}:${String(i * 3 % 60).padStart(2, "0")}`,
        followUpDate: i % 2 === 0 ? daysAgo(2 + i) : undefined,
      },
    });
  }

  // ---- Notices ----
  await prisma.branchNotice.createMany({
    data: [
      { branchId: branch.id, title: "Admission Open for 2025-26", content: "Admissions are now open for all courses. Apply before seats fill up. Contact the admission desk for details.", type: "BRANCH", priority: "HIGH", isPinned: true },
      { branchId: branch.id, title: "Mid-term Examination Schedule", content: "Mid-term exams will begin from next month. Check the exam schedule on the student portal.", type: "BRANCH", priority: "HIGH" },
      { branchId: branch.id, title: "Workshop on Digital Marketing", content: "Join our free 2-day workshop on digital marketing fundamentals. Register at the reception.", type: "BRANCH", priority: "MEDIUM" },
      { branchId: branch.id, title: "Library Extended Hours", content: "During exam season, the library will remain open until 8 PM on weekdays.", type: "BRANCH", priority: "LOW" },
    ],
    skipDuplicates: true,
  });

  // ---- Transactions ----
  await prisma.branchTransaction.createMany({
    data: [
      { branchId: branch.id, amount: 50000, type: "CREDIT", category: "Fee Collection", description: "Monthly fee collection", paymentMethod: "UPI", balanceAfter: 175000 },
      { branchId: branch.id, amount: 15000, type: "CREDIT", category: "Fee Collection", description: "Cash fee collection", paymentMethod: "CASH", balanceAfter: 190000 },
      { branchId: branch.id, amount: 8000, type: "DEBIT", category: "Salary", description: "Teaching staff salary", paymentMethod: "NET_BANKING", balanceAfter: 182000 },
      { branchId: branch.id, amount: 3000, type: "DEBIT", category: "Utilities", description: "Internet and electricity bill", paymentMethod: "UPI", balanceAfter: 179000 },
      { branchId: branch.id, amount: 4000, type: "CREDIT", category: "Fee Collection", description: "Late fee collection", paymentMethod: "CASH", balanceAfter: 183000 },
    ],
    skipDuplicates: true,
  });

  // ---- Update wallet balance to match last transaction ----
  await prisma.branchWallet.update({ where: { branchId: branch.id }, data: { balance: 183000 } });

  console.log(JSON.stringify({
    message: "Seed completed successfully",
    organization: org.name,
    branch: branch.name,
    courses: courseRecords.length,
    batches: batchRecords.length,
    students: studentRecords.length,
    enquiries: enquiries.length,
    notices: 4,
    transactions: 5,
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
