import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BUSINESS_UNITS, NewsletterMetric } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Mail } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsletterClient } from "@/components/platforms/newsletter-client";
import { getNewsletterMetrics } from "@/lib/actions/metrics";

export const metadata: Metadata = {
  title: "Newsletter Analytics",
  description: "Detailed analytics for Newsletter communications",
};

export default async function NewsletterPage() {
  // Default to last 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  const businessUnits = Object.values(BUSINESS_UNITS);
  
  let newsletterMetrics: NewsletterMetric[] = [];
  
  try {
    const newsletterMetricsPromises = businessUnits.map(bu => 
      getNewsletterMetrics(bu, startDate, endDate)
    );
    
    // Wait for all promises to resolve
    const newsletterMetricsResults = await Promise.all(newsletterMetricsPromises);
    
    // Flatten the arrays
    newsletterMetrics = newsletterMetricsResults.flat();
    
    console.log(`Fetched ${newsletterMetrics.length} newsletter metrics`);
  } catch (error) {
    console.error("Error fetching data for Newsletter:", error);
    // Continue with empty data
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Newsletter Analytics"
        description="Detailed analytics for Newsletter communications"
      >
        <Mail className="h-6 w-6 text-primary" />
      </DashboardHeader>
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <NewsletterClient
          initialData={newsletterMetrics}
          businessUnits={businessUnits}
          countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
        />
      </Suspense>
    </DashboardShell>
  );
} 