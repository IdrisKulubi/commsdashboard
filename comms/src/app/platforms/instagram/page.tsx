import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PlatformClient } from "@/components/platforms/platform-client";
import { getSocialMetrics, getSocialEngagementMetrics } from "@/lib/api";
import { BUSINESS_UNITS } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Instagram } from "lucide-react";

export const metadata: Metadata = {
  title: "Instagram Analytics",
  description: "Detailed analytics for Instagram platform",
};

export default async function InstagramPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Fetch initial data for all business units
  const businessUnits = Object.values(BUSINESS_UNITS) as ("ASM" | "IACL" | "EM")[];
  
  const socialMetricsPromises = businessUnits.map(businessUnit => 
    getSocialMetrics("INSTAGRAM", businessUnit, startDate, endDate)
  );
  
  const engagementMetricsPromises = businessUnits.map(businessUnit => 
    getSocialEngagementMetrics("INSTAGRAM", businessUnit, startDate, endDate)
  );
  
  const [socialMetricsResults, engagementMetricsResults] = await Promise.all([
    Promise.all(socialMetricsPromises),
    Promise.all(engagementMetricsPromises),
  ]);
  
  // Flatten the arrays
  const socialMetrics = socialMetricsResults.flat();
  const engagementMetrics = engagementMetricsResults.flat();
  
  return (
    <>
      <DashboardHeader
        heading="Instagram Analytics"
        description="Detailed analytics for Instagram platform"
      >
        <Instagram className="h-6 w-6 text-[#E4405F]" />
      </DashboardHeader>
      
      <PlatformClient
        platform="INSTAGRAM"
        platformColor="#E4405F"
        initialData={{
          socialMetrics,
          engagementMetrics,
        }}
        businessUnits={Object.values(BUSINESS_UNITS)}
        countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
      />
    </>
  );
} 