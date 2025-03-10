import { Metadata } from "next";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { EngagementTrends } from "@/components/dashboard/engagement-trends";
import { PlatformBreakdown } from "@/components/dashboard/platform-breakdown";
import { CountryDistribution } from "@/components/dashboard/country-distribution";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  // We'll let the client component handle the data fetching
  return (
    <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
      <MetricsOverview />
      <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <RecentActivity className="lg:col-span-1" />
        <PlatformBreakdown className="lg:col-span-1" />
        <EngagementTrends className="lg:col-span-1" />
      </div>
      <div className="grid gap-4 md:gap-8 grid-cols-1">
        <CountryDistribution />
      </div>
    </div>
  );
}
