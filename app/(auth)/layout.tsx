import { LogoLockup } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <LogoLockup size="md" surface="light" />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
