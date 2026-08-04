import { Skeleton, TableSkeleton } from "@/components/states";

/**
 * Centre pages run several sequential queries before they can render (the
 * dashboard alone reads students, attendance, payments and instalments), so
 * without this the shell sat blank while they resolved.
 */
export default function CentreLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-6">
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}
