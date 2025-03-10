import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NewsletterPlatformClient } from "@/components/platforms/newsletter-platform-client";
import { getNewsletterMetrics } from "@/lib/api";
import { BUSINESS_UNITS } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Newsletter Analytics",
  description: "Detailed analytics for Newsletter campaigns",
};

export default async function NewsletterPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Fetch initial data for all business units
  const businessUnits = Object.values(BUSINESS_UNITS) as ("ASM" | "IACL" | "EM")[];
  
  const newsletterMetricsPromises = businessUnits.map(businessUnit => 
    getNewsletterMetrics(businessUnit, startDate, endDate)
  );
  
  const newsletterMetricsResults = await Promise.all(newsletterMetricsPromises);
  
  // Flatten the arrays
  const newsletterMetrics = newsletterMetricsResults.flat();
  
  return (
    <>
      <DashboardHeader
        heading="Newsletter Analytics"
        description="Detailed analytics for Newsletter campaigns"
      >
        <Mail className="h-6 w-6 text-purple-500" />
      </DashboardHeader>
      
      <NewsletterPlatformClient
        initialData={{
          newsletterMetrics,
        }}
        businessUnits={Object.values(BUSINESS_UNITS)}
        countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
      />
    </>
  );
} 