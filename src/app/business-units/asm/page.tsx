import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BusinessUnitClient } from "@/components/business-units/business-unit-client";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics, getSocialEngagementMetrics } from "@/lib/api";
import { PLATFORMS } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "ASM Analytics",
  description: "Detailed analytics for ASM business unit",
};

export default async function ASMPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Business unit
  const businessUnit = "ASM";
  
  // Get data for all platforms
  const platforms = Object.values(PLATFORMS).filter(p => 
    p !== "WEBSITE" && p !== "NEWSLETTER"
  ) as ("FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK")[];
  
  // Fetch social metrics for all platforms
  const socialMetricsPromises = platforms.map(platform => 
    getSocialMetrics(platform, businessUnit, startDate, endDate)
  );
  
  // Fetch engagement metrics for all platforms
  const engagementMetricsPromises = platforms.map(platform => 
    getSocialEngagementMetrics(platform, businessUnit, startDate, endDate)
  );
  
  // Fetch website and newsletter metrics
  const websiteMetricsPromise = getWebsiteMetrics(businessUnit, startDate, endDate);
  const newsletterMetricsPromise = getNewsletterMetrics(businessUnit, startDate, endDate);
  
  // Wait for all promises to resolve
  const [socialMetricsResults, engagementMetricsResults, websiteMetrics, newsletterMetrics] = await Promise.all([
    Promise.all(socialMetricsPromises),
    Promise.all(engagementMetricsPromises),
    websiteMetricsPromise,
    newsletterMetricsPromise,
  ]);
  
  // Flatten the arrays
  const socialMetrics = socialMetricsResults.flat();
  const engagementMetrics = engagementMetricsResults.flat();
  
  return (
    <>
      <DashboardHeader
        heading="ASM Analytics"
        description="Detailed analytics for ASM business unit"
      >
        <Building2 className="h-6 w-6 text-blue-500" />
      </DashboardHeader>
      
      <BusinessUnitClient
        businessUnit={businessUnit}
        initialData={{
          socialMetrics,
          websiteMetrics,
          newsletterMetrics,
          engagementMetrics,
        }}
        platforms={platforms}
        countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
      />
    </>
  );
} 