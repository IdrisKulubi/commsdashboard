import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TrendsClient } from "@/components/trends/trends-client";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics } from "@/lib/api";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";

export const metadata: Metadata = {
  title: "Trends",
  description: "Long-term trends in your communications metrics",
};

export default async function TrendsPage() {
  // Get data for the last 12 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  // Get data for all platforms and business units
  const platforms = Object.values(PLATFORMS).filter(p => 
    p !== "WEBSITE" && p !== "NEWSLETTER"
  ) as ("FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK")[];
  
  const businessUnits = Object.values(BUSINESS_UNITS) as ("ASM" | "IACL" | "EM")[];
  
  // Fetch data for all combinations
  const socialMetricsPromises = [];
  const websiteMetricsPromises = [];
  const newsletterMetricsPromises = [];
  
  // Get social metrics for all platforms and business units
  for (const platform of platforms) {
    for (const businessUnit of businessUnits) {
      socialMetricsPromises.push(
        getSocialMetrics(platform, businessUnit, startDate, endDate)
      );
    }
  }
  
  // Get website metrics for all business units
  for (const businessUnit of businessUnits) {
    websiteMetricsPromises.push(
      getWebsiteMetrics(businessUnit, startDate, endDate)
    );
  }
  
  // Get newsletter metrics for all business units
  for (const businessUnit of businessUnits) {
    newsletterMetricsPromises.push(
      getNewsletterMetrics(businessUnit, startDate, endDate)
    );
  }
  
  // Wait for all promises to resolve
  const [socialMetricsResults, websiteMetricsResults, newsletterMetricsResults] = await Promise.all([
    Promise.all(socialMetricsPromises),
    Promise.all(websiteMetricsPromises),
    Promise.all(newsletterMetricsPromises),
  ]);
  
  // Flatten the arrays
  const socialMetrics = socialMetricsResults.flat();
  const websiteMetrics = websiteMetricsResults.flat();
  const newsletterMetrics = newsletterMetricsResults.flat();
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Trends"
        description="Long-term trends in your communications metrics across all platforms."
      />
      
      <TrendsClient 
        socialMetrics={socialMetrics}
        websiteMetrics={websiteMetrics}
        newsletterMetrics={newsletterMetrics}
        platforms={platforms}
        businessUnits={businessUnits}
      />
    </DashboardShell>
  );
} 