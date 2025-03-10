import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TrendsClient } from "@/components/trends/trends-client";
import { PLATFORMS, BUSINESS_UNITS, SocialMetric } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// Import server action
import { getSocialMetrics } from "@/lib/actions/metrics";

export const metadata: Metadata = {
  title: "Trends",
  description: "Analyze trends in your communications metrics",
};

export default async function TrendsPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Get all platforms and business units
  const platforms = Object.values(PLATFORMS).filter(p => 
    p !== "WEBSITE" && p !== "NEWSLETTER"
  ) as ("FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK")[];
  
  const businessUnits = Object.values(BUSINESS_UNITS);
  
  // Initialize data container
  let allMetrics: SocialMetric[] = [];
  
  try {
    // Create promises for all combinations of platforms and business units
    const promises: Promise<SocialMetric[]>[] = [];
    
    for (const platform of platforms) {
      for (const businessUnit of businessUnits) {
        promises.push(getSocialMetrics(platform, businessUnit, startDate, endDate));
      }
    }
    
    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    
    // Flatten the results
    allMetrics = results.flat();
    
    console.log(`Fetched ${allMetrics.length} metrics for trends analysis`);
  } catch (error) {
    console.error("Error fetching data for trends analysis:", error);
    // Continue with empty data
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Trends Analysis"
        description="Compare metrics across platforms and business units"
      />
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <TrendsClient
          initialData={allMetrics}
          platforms={platforms}
          businessUnits={businessUnits}
          countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
        />
      </Suspense>
    </DashboardShell>
  );
} 