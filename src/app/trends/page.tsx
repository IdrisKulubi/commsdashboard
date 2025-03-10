import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TrendsClient } from "@/components/trends/trends-client";
import { getSocialMetrics } from "@/lib/api";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Trends",
  description: "Analyze trends in your communications metrics",
};

// Add a direct database query function as backup
import db from "@/db/drizzle";
import { socialMetrics } from "@/db/schema";
import { and, between, eq } from "drizzle-orm";

async function getMetricsDirectly(
  platform: string,
  businessUnit: string,
  startDate: Date,
  endDate: Date
) {
  try {
    return await db.query.socialMetrics.findMany({
      where: and(
        eq(socialMetrics.platform, platform as "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK" | "WEBSITE" | "NEWSLETTER"),
        eq(socialMetrics.businessUnit, businessUnit as "ASM" | "IACL" | "EM"),
        between(socialMetrics.date, startDate, endDate)
      ),
      orderBy: [socialMetrics.date],
    });
  } catch (error) {
    console.error("Error fetching directly from DB:", error);
    return [];
  }
}

export default async function TrendsPage() {
  // Default to last 12 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  // Default platform and business unit
  const defaultPlatform = "FACEBOOK";
  const defaultBusinessUnit = "ASM";
  
  // Try to fetch data using the API first
  let initialData = [];
  try {
    initialData = await getSocialMetrics(
      defaultPlatform, 
      defaultBusinessUnit, 
      startDate, 
      endDate
    );
    
    // If API call returned empty but didn't throw, try direct DB access
    if (initialData.length === 0) {
      console.log("API returned empty data, trying direct DB access");
      initialData = await getMetricsDirectly(
        defaultPlatform,
        defaultBusinessUnit,
        startDate,
        endDate
      );
    }
  } catch (error) {
    console.error("Error fetching initial data for trends:", error);
    // Try direct DB access as fallback
    initialData = await getMetricsDirectly(
      defaultPlatform,
      defaultBusinessUnit,
      startDate,
      endDate
    );
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Trends Analysis"
        description="Analyze growth trends and patterns across platforms and business units."
      />
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <TrendsClient 
          platforms={Object.values(PLATFORMS).filter(p => 
            p !== "WEBSITE" && p !== "NEWSLETTER"
          )}
          businessUnits={Object.values(BUSINESS_UNITS)}
          countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
          initialData={initialData}
        />
      </Suspense>
    </DashboardShell>
  );
} 