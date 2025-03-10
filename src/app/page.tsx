import { Metadata } from "next";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { EngagementTrends } from "@/components/dashboard/engagement-trends";
import { PlatformBreakdown } from "@/components/dashboard/platform-breakdown";
import { CountryDistribution } from "@/components/dashboard/country-distribution";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// Import server action for total metrics
import { getTotalMetrics } from "@/lib/actions/metrics";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  // Fetch total metrics with error handling
  let totalMetrics = {
    totalFollowers: 0,
    totalWebsiteUsers: 0,
    totalNewsletterRecipients: 0,
    totalPosts: 0
  };
  
  try {
    // Calculate total metrics from the database
    const metrics = await getTotalMetrics();
    totalMetrics = metrics;
    
    console.log("Fetched total metrics:", totalMetrics);
  } catch (error) {
    console.error("Error fetching total metrics:", error);
    // Continue with default values
  }
  
  return (
    <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
      <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <MetricsOverview 
            totalFollowers={totalMetrics.totalFollowers}
            totalWebsiteUsers={totalMetrics.totalWebsiteUsers}
            totalNewsletterRecipients={totalMetrics.totalNewsletterRecipients}
            totalPosts={totalMetrics.totalPosts}
          />
        </Suspense>
      </div>
      <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <RecentActivity className="lg:col-span-1" />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <PlatformBreakdown className="lg:col-span-1" />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <EngagementTrends className="lg:col-span-1" />
        </Suspense>
      </div>
      <div className="grid gap-4 md:gap-8 grid-cols-1">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <CountryDistribution />
        </Suspense>
      </div>
    </div>
  );
}
