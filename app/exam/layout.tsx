import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam · Career Optics",
  robots: { index: false },
};

/**
 * The runner's own root segment — no portal shell, no sidebar, no bottom
 * navigation, no breadcrumb. Style guide §11.5 via build plan §2.6: nothing on
 * screen during an attempt but the exam. This layout exists to make that
 * deliberate rather than an accident of nesting.
 */
export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-canvas min-h-dvh">{children}</div>;
}
