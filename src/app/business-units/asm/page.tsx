import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BusinessUnitClient } from "@/components/business-units/business-unit-client";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics, getSocialEngagementMetrics } from "@/lib/actions/metrics";
import { PLATFORMS, SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Building2 } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  // Initialize data containers
  let socialMetrics: SocialMetric[] = [];
  let engagementMetrics: SocialEngagementMetric[] = [];
  let websiteMetrics: WebsiteMetric[] = [];
  let newsletterMetrics: NewsletterMetric[] = [];
  
  try {
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
    const [socialMetricsResults, engagementMetricsResults, websiteMetricsResult, newsletterMetricsResult] = await Promise.all([
      Promise.all(socialMetricsPromises),
      Promise.all(engagementMetricsPromises),
      websiteMetricsPromise,
      newsletterMetricsPromise,
    ]);
    
    // Flatten the arrays
    socialMetrics = socialMetricsResults.flat();
    engagementMetrics = engagementMetricsResults.flat();
    websiteMetrics = websiteMetricsResult;
    newsletterMetrics = newsletterMetricsResult;
    
  } catch (error) {
    console.error("Error fetching data for ASM business unit:", error);
    // Continue with empty data
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="ASM Analytics"
        description="Detailed analytics for ASM business unit"
      >
        <Building2 className="h-6 w-6 text-blue-500" />
      </DashboardHeader>
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
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
      </Suspense>
    </DashboardShell>
  );
} 