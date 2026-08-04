import Link from "next/link";

import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";

/**
 * notFound() is called from several routes (course detail, fee detail, result
 * detail) and until now landed on Next's unstyled default page, which does not
 * look like this product at all.
 */
export default function NotFound() {
  return (
    <div className="container-public py-16">
      <EmptyState
        title="Page not found"
        description="That link may be out of date, or the record may have been removed."
        action={
          <Button asChild>
            <Link href="/">Go to the home page</Link>
          </Button>
        }
      />
    </div>
  );
}
