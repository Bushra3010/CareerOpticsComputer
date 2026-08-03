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
 * Never reachable in production — this is the one place synthetic demo content
 * lives, and PRD §18 forbids placeholder data on production paths.
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") notFound();

  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
