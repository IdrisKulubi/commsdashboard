import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
// Import server actions
import { 
  getSocialMetrics, 
  getWebsiteMetrics, 
  getNewsletterMetrics, 
  getSocialEngagementMetrics 
} from "@/lib/actions/metrics"; // Assuming actions are in @/lib/actions
import { PLATFORMS, BUSINESS_UNITS, SocialMetric, NewsletterMetric, SocialEngagementMetric, WebsiteMetric } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard - Analytics",
  description: "View detailed analytics for your communications metrics",
};

export default async function DashboardPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Default platform and business unit
  const defaultPlatform = "FACEBOOK";
  const defaultBusinessUnit = "ASM";
  
  // Fetch initial data for AnalyticsClient with error handling
  let socialMetrics: SocialMetric[] = [];
  let websiteMetrics: WebsiteMetric[] = [];
  let newsletterMetrics: NewsletterMetric[] = [];
  let socialEngagementMetrics: SocialEngagementMetric[] = [];
  
  try {
    [socialMetrics, websiteMetrics, newsletterMetrics, socialEngagementMetrics] = await Promise.all([
      getSocialMetrics(
        defaultPlatform,
        defaultBusinessUnit, 
        startDate, 
        endDate,
        "GLOBAL" // Always fetch GLOBAL data initially
      ),
      getWebsiteMetrics(
        defaultBusinessUnit, 
        startDate, 
        endDate,
        "GLOBAL"
      ),
      getNewsletterMetrics(
        defaultBusinessUnit, 
        startDate, 
        endDate,
        "GLOBAL"
      ),
      getSocialEngagementMetrics(
        defaultPlatform, 
        defaultBusinessUnit, 
        startDate, 
        endDate,
        "GLOBAL"
      ),
    ]);
    
  } catch (error) {
    console.error("Error fetching initial data for analytics dashboard:", error);
    // Continue with empty data
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Analytics Dashboard"
        description="View detailed analytics for your communications metrics"
      />
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <AnalyticsClient 
          initialData={{
            socialMetrics,
            websiteMetrics,
            newsletterMetrics,
            socialEngagementMetrics,
          }}
          platforms={Object.values(PLATFORMS).filter(p => 
            p !== "WEBSITE" && p !== "NEWSLETTER"
          )}
          businessUnits={Object.values(BUSINESS_UNITS)}
          // Countries prop is passed but not used in the component anymore
          countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
        />
      </Suspense>
    </DashboardShell>
  );
}
