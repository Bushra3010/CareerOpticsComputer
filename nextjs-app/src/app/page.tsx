import dynamic from "next/dynamic";

const DashboardInner = dynamic(
  () =>
    import("@/components/dashboard-inner").then((m) => m.DashboardInner),
  { ssr: false }
);

export default function Page() {
  return <DashboardInner />;
}
