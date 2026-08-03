import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { LogoLockup } from "@/components/brand/logo";

/**
 * Public footer — style guide §7.3:
 * "Footer uses navy background, white logo variant, contact details, navigation
 * and legal links."
 *
 * The white logo variant does not exist yet, so the mark sits on its sanctioned
 * white protective surface (see components/brand/logo.tsx and
 * docs/02-open-conflicts.md, C2).
 */

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { label: "All courses", href: "/courses" },
      { label: "Find a centre", href: "/centres" },
      { label: "Admission enquiry", href: "/admissions/enquiry" },
      { label: "Notices", href: "/notices" },
    ],
  },
  {
    title: "Verify",
    links: [
      { label: "Verify a registration", href: "/verify/registration" },
      { label: "Verify a certificate", href: "/verify/certificate" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Open a centre", href: "/partner-with-us" },
      { label: "Centre login", href: "/sign-in/centre" },
      { label: "Student login", href: "/sign-in/student" },
    ],
  },
] as const;

export function PublicFooter() {
  return (
    <footer data-surface="navy" className="bg-navy-900 mt-auto text-white">
      <div className="container-public py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <LogoLockup size="md" surface="navy" showTagline />
            <p className="text-body mt-4 max-w-xs text-white/70">
              {BRAND.supportingPhrase}
            </p>

            <ul className="text-body mt-5 space-y-2.5 text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 size-[18px] shrink-0"
                  aria-hidden="true"
                />
                <span>Head office address to be confirmed</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone
                  className="mt-0.5 size-[18px] shrink-0"
                  aria-hidden="true"
                />
                <span>Contact number to be confirmed</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail
                  className="mt-0.5 size-[18px] shrink-0"
                  aria-hidden="true"
                />
                <span>Contact email to be confirmed</span>
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-label font-semibold text-white">
                {col.title}
              </h2>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-white/80 underline-offset-4 hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-meta text-white/60">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link
                href="/legal/privacy"
                className="text-meta text-white/70 hover:text-white"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href="/legal/terms"
                className="text-meta text-white/70 hover:text-white"
              >
                Terms of use
              </Link>
            </li>
            <li>
              <Link
                href="/legal/refund-policy"
                className="text-meta text-white/70 hover:text-white"
              >
                Refund policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
