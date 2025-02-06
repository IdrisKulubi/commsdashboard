"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { MetricsFilter } from "@/components/shared/MetricsFilter";
import { DateRangeSelector } from "@/components/shared/DateRangeSelector";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  PLATFORMS,
  BUSINESS_UNITS,
  SocialMetric,
  WebsiteMetric,
  NewsletterMetric,
} from "@/db/schema";
import { ComparisonChart } from "@/components/shared/ComparisonChart";
import { Button } from "@/components/ui/button";

type DashboardClientProps = {
  initialDateRange: { from: Date; to: Date };
  initialData: {
    socialMetrics: SocialMetric[];
    websiteMetrics: WebsiteMetric[];
    newsletterMetrics: NewsletterMetric[];
  };
};

export function DashboardClient({
  initialDateRange,
  initialData,
}: DashboardClientProps) {
  const [platform, setPlatform] = useState<keyof typeof PLATFORMS>(
    PLATFORMS.FACEBOOK
  );
  const [businessUnit, setBusinessUnit] = useState<keyof typeof BUSINESS_UNITS>(
    BUSINESS_UNITS.ASM
  );
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [metrics, setMetrics] = useState(initialData);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) setDateRange(range);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Link href="/add-metrics">
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Metrics
            </Button>
          </Link>
        </div>
        <div className="flex space-x-4">
          <MetricsFilter
            platform={platform}
            businessUnit={businessUnit}
            onPlatformChange={(value) =>
              setPlatform(value as keyof typeof PLATFORMS)
            }
            onBusinessUnitChange={(value) =>
              setBusinessUnit(value as keyof typeof BUSINESS_UNITS)
            }
          />
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Social Media Metrics */}
        <ComparisonChart
          title={`${platform} Metrics - ${businessUnit}`}
          data={metrics.socialMetrics.filter(
            (m) => m.platform === platform && m.businessUnit === businessUnit
          )}
          metrics={["impressions", "followers", "numberOfPosts"]}
          className="w-full"
        />

        {/* Website Metrics */}
        <ComparisonChart
          title={`Website Metrics - ${businessUnit}`}
          data={metrics.websiteMetrics.filter(
            (m) => m.businessUnit === businessUnit
          )}
          metrics={["users", "clicks", "sessions"]}
          className="w-full"
        />

        {/* Newsletter Metrics */}
        <ComparisonChart
          title={`Newsletter Metrics - ${businessUnit}`}
          data={metrics.newsletterMetrics.filter(
            (m) => m.businessUnit === businessUnit
          )}
          metrics={["recipients", "openRate", "numberOfEmails"]}
          className="w-full"
        />
      </div>
    </div>
  );
}
