"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="mb-6 text-muted-foreground">
        We apologize for the inconvenience. Please try again later.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => {
            if (resetErrorBoundary) {
              resetErrorBoundary();
            } else {
              router.refresh();
            }
          }}
        >
          Try again
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
} 