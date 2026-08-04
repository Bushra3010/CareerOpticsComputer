import { notFound } from "next/navigation";
import { Toaster } from "sonner";

export const metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Internal component showcase (style guide §15: "Create Storybook or an
 * equivalent internal component showcase if the project workflow supports it").
 *
 * This is the one place synthetic demo content lives, and PRD §18 forbids
 * placeholder data on a production path.
 *
 * The guard fails **closed**. It previously hid these routes only when
 * NEXT_PUBLIC_APP_ENV was exactly "production", which meant an unset variable —
 * the normal state of a freshly configured host — published a synthetic-data
 * showcase on a public site. A missing environment variable must never be the
 * thing standing between demo content and the open internet.
 *
 * So: visible when running locally, visible on a preview deployment that opts in
 * explicitly, and hidden everywhere else including when nothing is configured.
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  const isLocalDevelopment = process.env.NODE_ENV !== "production";
  const isOptedInPreview = process.env.NEXT_PUBLIC_APP_ENV === "preview";

  if (!isLocalDevelopment && !isOptedInPreview) notFound();

  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
