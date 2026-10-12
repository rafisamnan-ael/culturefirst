import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-jade">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-charcoal">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page or organization you are looking for does not exist or is no longer public.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/organizations">Browse organizations</Link>
        </Button>
      </div>
    </div>
  );
}
