import { Skeleton, TableSkeleton } from "@/components/states";

export default function QuestionBanksLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-8">
        <TableSkeleton rows={4} />
      </div>
    </div>
  );
}
