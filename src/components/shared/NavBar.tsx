"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/themes/theme-toggle";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Button asChild variant="ghost">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">← Home</span>
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
} 