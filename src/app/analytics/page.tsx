import { Metadata } from "next";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// Import server actions
import { 
  getSocialMetrics, 
  getWebsiteMetrics, 
  getNewsletterMetrics, 
  getSocialEngagementMetrics 
} from "@/lib/actions/metrics";
import { PLATFORMS, BUSINESS_UNITS, SocialMetric, NewsletterMetric, SocialEngagementMetric, WebsiteMetric } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Analytics",
  description: "View detailed analytics for your communications metrics",
};

export default async function AnalyticsPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Default platform and business unit
  const defaultPlatform = "FACEBOOK";
  const defaultBusinessUnit = "ASM";
  
  // Fetch initial data with error handling
  let socialMetrics: SocialMetric[] = [];
  let websiteMetrics: WebsiteMetric[] = [];
  let newsletterMetrics: NewsletterMetric[] = [];
  let socialEngagementMetrics: SocialEngagementMetric[] = [];
  
  try {
    // Use server actions instead of API calls
    [socialMetrics, websiteMetrics, newsletterMetrics, socialEngagementMetrics] = await Promise.all([
      getSocialMetrics(
        defaultPlatform, 
        defaultBusinessUnit, 
        startDate, 
        endDate
      ),
      getWebsiteMetrics(
        defaultBusinessUnit, 
        startDate, 
        endDate
      ),
      getNewsletterMetrics(
        defaultBusinessUnit, 
        startDate, 
        endDate
      ),
      getSocialEngagementMetrics(
        defaultPlatform, 
        defaultBusinessUnit, 
        startDate, 
        endDate
      ),
    ]);
    
    console.log(`Fetched initial data for analytics: ${socialMetrics.length} social metrics, ${websiteMetrics.length} website metrics, ${newsletterMetrics.length} newsletter metrics, ${socialEngagementMetrics.length} engagement metrics`);
  } catch (error) {
    console.error("Error fetching initial data for analytics:", error);
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
          countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
        />
      </Suspense>
    </DashboardShell>
  );
} 