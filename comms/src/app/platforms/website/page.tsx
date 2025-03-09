import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { WebsitePlatformClient } from "@/components/platforms/website-platform-client";
import { getWebsiteMetrics } from "@/lib/api";
import { BUSINESS_UNITS } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Website Analytics",
  description: "Detailed analytics for Website traffic",
};

export default async function WebsitePage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Fetch initial data for all business units
  const businessUnits = Object.values(BUSINESS_UNITS) as ("ASM" | "IACL" | "EM")[];
  
  const websiteMetricsPromises = businessUnits.map(businessUnit => 
    getWebsiteMetrics(businessUnit, startDate, endDate)
  );
  
  const websiteMetricsResults = await Promise.all(websiteMetricsPromises);
  
  // Flatten the arrays
  const websiteMetrics = websiteMetricsResults.flat();
  
  return (
    <>
      <DashboardHeader
        heading="Website Analytics"
        description="Detailed analytics for Website traffic"
      >
        <Globe className="h-6 w-6 text-blue-500" />
      </DashboardHeader>
      
      <WebsitePlatformClient
        initialData={{
          websiteMetrics,
        }}
        businessUnits={Object.values(BUSINESS_UNITS)}
        countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
      />
    </>
  );
} 