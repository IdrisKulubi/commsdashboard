"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="mb-4">
            We apologize for the inconvenience. Please try again later.
            {process.env.NODE_ENV !== "production" && (
              <span className="block mt-2 text-red-500">
                Error: {error.message}
              </span>
            )}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
} 