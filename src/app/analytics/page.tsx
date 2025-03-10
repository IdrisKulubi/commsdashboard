import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics, getSocialEngagementMetrics } from "@/lib/api";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Detailed analytics for your communications metrics",
};

export default async function AnalyticsPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Default platform and business unit
  const defaultPlatform = "FACEBOOK";
  const defaultBusinessUnit = "ASM";
  
  // Fetch initial data
  const initialData = {
    socialMetrics: await getSocialMetrics(
      defaultPlatform as keyof typeof PLATFORMS, 
      defaultBusinessUnit as keyof typeof BUSINESS_UNITS, 
      startDate, 
      endDate
    ),
    websiteMetrics: await getWebsiteMetrics(
      defaultBusinessUnit as keyof typeof BUSINESS_UNITS, 
      startDate, 
      endDate
    ),
    newsletterMetrics: await getNewsletterMetrics(
      defaultBusinessUnit as keyof typeof BUSINESS_UNITS, 
      startDate, 
      endDate
    ),
    socialEngagementMetrics: await getSocialEngagementMetrics(
      defaultPlatform as keyof typeof PLATFORMS, 
      defaultBusinessUnit as keyof typeof BUSINESS_UNITS, 
      startDate, 
      endDate
    ),
  };
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Analytics"
        description="Detailed analysis of your communications metrics across all platforms."
      />
      
      <AnalyticsClient 
        initialData={initialData}
        platforms={Object.values(PLATFORMS)}
        businessUnits={Object.values(BUSINESS_UNITS)}
        countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
      />
    </DashboardShell>
  );
} 