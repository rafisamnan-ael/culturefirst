"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Intentionally minimal: no sensitive details are surfaced to the user.
    console.error("Application error", error.digest ?? "");
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-semibold text-charcoal">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We could not complete that request. Please try again.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
