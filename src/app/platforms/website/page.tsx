import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BUSINESS_UNITS, WebsiteMetric } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Globe } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { WebsiteClient } from "@/components/platforms/website-client";
// Import server actions
import { getWebsiteMetrics } from "@/lib/actions/metrics";

export const metadata: Metadata = {
  title: "Website Analytics",
  description: "Detailed analytics for Website traffic",
};

export default async function WebsitePage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Get data for all business units
  const businessUnits = Object.values(BUSINESS_UNITS);
  
  // Fetch website metrics for all business units with error handling
  let websiteMetrics: WebsiteMetric[] = [];
  
  try {
    // Use Promise.all to fetch data for all business units in parallel
    const websiteMetricsPromises = businessUnits.map(bu => 
      getWebsiteMetrics(bu, startDate, endDate)
    );
    
    // Wait for all promises to resolve
    const websiteMetricsResults = await Promise.all(websiteMetricsPromises);
    
    // Flatten the arrays
    websiteMetrics = websiteMetricsResults.flat();
    
    console.log(`Fetched ${websiteMetrics.length} website metrics`);
  } catch (error) {
    console.error("Error fetching data for Website:", error);
    // Continue with empty data
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Website Analytics"
        description="Detailed analytics for Website traffic"
      >
        <Globe className="h-6 w-6 text-primary" />
      </DashboardHeader>
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <WebsiteClient
          initialData={websiteMetrics}
          businessUnits={businessUnits}
          countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
        />
      </Suspense>
    </DashboardShell>
  );
} 