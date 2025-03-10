import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Overview } from "@/components/dashboard/overview";
import { RecentMetrics } from "@/components/dashboard/recent-metrics";
import { getTotalMetrics } from "@/lib/actions/metrics";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Communications metrics dashboard",
};

export default async function DashboardPage() {
  // Fetch total metrics with error handling
  let totalMetrics = {
    totalFollowers: 0,
    totalWebsiteUsers: 0,
    totalNewsletterRecipients: 0,
    totalPosts: 0,
  };
  
  try {
    totalMetrics = await getTotalMetrics();
    console.log("Fetched total metrics for dashboard:", totalMetrics);
  } catch (error) {
    console.error("Error fetching total metrics for dashboard:", error);
    // Continue with default values
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        description="Overview of your communications metrics"
      />
      
      <div className="grid gap-4 md:gap-8">
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <Overview metrics={totalMetrics} />
        </Suspense>
        
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecentMetrics />
          </Suspense>
        </div>
      </div>
    </DashboardShell>
  );
}
