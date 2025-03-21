import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PlatformClient } from "@/components/platforms/platform-client";
import { BUSINESS_UNITS, SocialMetric, SocialEngagementMetric } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { FaLinkedin } from "react-icons/fa";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// Import server actions instead of API functions
import { getSocialMetrics, getSocialEngagementMetrics } from "@/lib/actions/metrics";

export const metadata: Metadata = {
  title: "LinkedIn Analytics",
  description: "Detailed analytics for LinkedIn platform",
};

export default async function LinkedInPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Platform
  const platform = "LINKEDIN";
  
  // Get data for all business units
  const businessUnits = Object.values(BUSINESS_UNITS);
  
  // Fetch social metrics for all business units with error handling
  let socialMetrics: SocialMetric[] = [];
  let engagementMetrics: SocialEngagementMetric[] = [];
  
  try {
    // Use Promise.all to fetch data for all business units in parallel
    const socialMetricsPromises = businessUnits.map(bu => 
      getSocialMetrics(platform, bu, startDate, endDate)
    );
    
    const engagementMetricsPromises = businessUnits.map(bu => 
      getSocialEngagementMetrics(platform, bu, startDate, endDate)
    );
    
    // Wait for all promises to resolve
    const [socialMetricsResults, engagementMetricsResults] = await Promise.all([
      Promise.all(socialMetricsPromises),
      Promise.all(engagementMetricsPromises),
    ]);
    
    // Flatten the arrays
    socialMetrics = socialMetricsResults.flat();
    engagementMetrics = engagementMetricsResults.flat();
    
    console.log(`Fetched ${socialMetrics.length} social metrics and ${engagementMetrics.length} engagement metrics`);
  } catch (error) {
    console.error("Error fetching data for LinkedIn platform:", error);
    // Continue with empty data
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="LinkedIn Analytics"
        description="Detailed analytics for LinkedIn platform"
      >
          <FaLinkedin className="h-6 w-6 text-[#0A66C2]" />
      </DashboardHeader>
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <PlatformClient
          platformColor="#0A66C2"
          platform={platform}
          initialData={{
            socialMetrics,
            engagementMetrics,
          }}
          businessUnits={businessUnits}
          countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
        />
      </Suspense>
    </DashboardShell>
  );
} 