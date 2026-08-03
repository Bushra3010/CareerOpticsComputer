import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card } from "@/components/ui/card";

/**
 * Public site shell preview — style guide §7.1 header and §7.3 footer.
 * The home page itself is built in Phase 1; this route exists so the chrome can
 * be approved before feature pages depend on it.
 */
export default function PublicShellPreview() {
  return (
    <>
      <PublicHeader />
      <main className="container-public flex-1 py-10">
        <h1 className="text-page-title text-navy-900">Public site shell</h1>
        <p className="text-body text-text-secondary mt-2 max-w-2xl">
          Sticky header with a slight height reduction after scroll, and the
          navy footer with contact, navigation and legal links. Scroll to see
          the sticky behaviour; narrow below 1024px to see the full-height
          navigation sheet.
        </p>

        <div className="mt-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-6">
              <p className="text-card-title text-text">Scroll region {i + 1}</p>
              <p className="text-body text-text-secondary mt-1">
                Placeholder block so the sticky header state can be reviewed.
                Real sections — hero, courses, centres, statistics, testimonials
                and gallery — land in Phase 1.
              </p>
            </Card>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
