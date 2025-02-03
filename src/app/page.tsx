import { Suspense } from "react";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { DashboardClient } from "@/components/DashboardClient";
import {
  getNewsletterMetrics,
  getSocialMetrics,
  getWebsiteMetrics,
} from "@/lib/api";

// This is a Server Component
export default async function DashboardPage() {
  const initialDateRange = {
    from: startOfMonth(addMonths(new Date(), -6)),
    to: endOfMonth(new Date()),
  };

  // Fetch initial data
  const initialData = {
    socialMetrics: await getSocialMetrics(
      "FACEBOOK",
      "ASM",
      initialDateRange.from,
      initialDateRange.to
    ),
    websiteMetrics: await getWebsiteMetrics(
      "ASM",
      initialDateRange.from,
      initialDateRange.to
    ),
    newsletterMetrics: await getNewsletterMetrics(
      "ASM",
      initialDateRange.from,
      initialDateRange.to
    ),
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient
        initialDateRange={initialDateRange}
        initialData={initialData}
      />
    </Suspense>
  );
}
