"use client";

import { useState } from "react";
import { MetricsFilter } from "@/components/shared/MetricsFilter";
import { DateRangeSelector } from "@/components/shared/DateRangeSelector";
import { PlusCircle, BarChart } from "lucide-react";
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
import { ColumnDef } from "@tanstack/react-table";
import { EditMetricDialog } from "@/components/shared/EditMetricDialog";
import { updateMetric } from "@/actions/metrics";
import { MetricsCard } from "@/components/shared/MetricsCard";
import { DateRange } from "react-day-picker";

type DashboardClientProps = {
  initialDateRange: DateRange;
  initialData: {
    socialMetrics: SocialMetric[];
    websiteMetrics: WebsiteMetric[];
    newsletterMetrics: NewsletterMetric[];
  };
  socialColumns: ColumnDef<SocialMetric>[];
  websiteColumns: ColumnDef<WebsiteMetric>[];
  newsletterColumns: ColumnDef<NewsletterMetric>[];
};

export function DashboardClient({
  initialDateRange,
  initialData,
}: DashboardClientProps) {
  const [filters, setFilters] = useState({
    platform: PLATFORMS.FACEBOOK as keyof typeof PLATFORMS,
    businessUnit: BUSINESS_UNITS.ASM as keyof typeof BUSINESS_UNITS,
    dateRange: initialDateRange
  });
  const [metrics, setMetrics] = useState(initialData);
  const [editingMetric, setEditingMetric] = useState<
    (SocialMetric | WebsiteMetric | NewsletterMetric) | null
  >(null);

  const handleEdit = async (updatedMetric: SocialMetric | WebsiteMetric | NewsletterMetric) => {
    try {
      setMetrics(prev => ({
        socialMetrics: prev.socialMetrics.map(m =>
          m.id === updatedMetric.id &&
          m.platform === filters.platform &&
          m.businessUnit === filters.businessUnit
            ? updatedMetric as SocialMetric
            : m
        ),
        websiteMetrics: prev.websiteMetrics.map(m =>
          m.id === updatedMetric.id &&
          m.businessUnit === filters.businessUnit
            ? updatedMetric as WebsiteMetric
            : m
        ),
        newsletterMetrics: prev.newsletterMetrics.map(m =>
          m.id === updatedMetric.id &&
          m.businessUnit === filters.businessUnit
            ? updatedMetric as NewsletterMetric
            : m
        )
      }));
      await updateMetric(updatedMetric);
      setEditingMetric(null);
    } catch (error) {
      console.error("Error updating metric:", error);
      setMetrics(prev => prev);
    }
  };

  const filteredSocialMetrics = metrics.socialMetrics.filter(m => 
    m.platform === filters.platform && 
    m.businessUnit === filters.businessUnit
  );

  const filteredWebsiteMetrics = metrics.websiteMetrics.filter(m => 
    m.businessUnit === filters.businessUnit
  );

  const filteredNewsletterMetrics = metrics.newsletterMetrics.filter(m => 
    m.businessUnit === filters.businessUnit
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/add-metrics">
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Metrics
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" size="sm">
                <BarChart className="h-4 w-4 mr-2" />
                Detailed Analytics
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex space-x-4">
          <MetricsFilter
            platform={filters.platform}
            businessUnit={filters.businessUnit}
            onPlatformChange={(p: string) => setFilters(prev => ({...prev, platform: p as keyof typeof PLATFORMS}))}
            onBusinessUnitChange={(bu: string) => setFilters(prev => ({...prev, businessUnit: bu as keyof typeof BUSINESS_UNITS}))}
          />
          <DateRangeSelector
            dateRange={filters.dateRange}
            onDateRangeChange={(range) => 
              setFilters(prev => ({ ...prev, dateRange: range || initialDateRange }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ComparisonChart
          title={`${filters.platform} Metrics`}
          data={filteredSocialMetrics}
          metrics={["impressions", "followers", "numberOfPosts"]}
        />
        <ComparisonChart
          title="Website Metrics"
          data={filteredWebsiteMetrics}
          metrics={["users", "clicks", "sessions"]}
        />
        <ComparisonChart
          title="Newsletter Metrics"
          data={filteredNewsletterMetrics}
          metrics={["recipients", "openRate", "numberOfEmails"]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricsCard
          title="Social Media"
          value={filteredSocialMetrics.length}
          onEdit={() => filteredSocialMetrics[0] && setEditingMetric(filteredSocialMetrics[0] as SocialMetric)}
        />
        <MetricsCard
          title="Website Traffic"
          value={filteredWebsiteMetrics.length}
          onEdit={() => filteredWebsiteMetrics[0] && setEditingMetric(filteredWebsiteMetrics[0] as WebsiteMetric)}
        />
        <MetricsCard
          title="Newsletter"
          value={filteredNewsletterMetrics.length}
          onEdit={() => filteredNewsletterMetrics[0] && setEditingMetric(filteredNewsletterMetrics[0] as NewsletterMetric)}
        />
      </div>

      <EditMetricDialog
        open={!!editingMetric}
        onOpenChange={(open) => !open && setEditingMetric(null)}
        data={editingMetric as SocialMetric | WebsiteMetric | NewsletterMetric | null}
        currentFilters={filters}
        onSave={handleEdit}
        
      />
    </div>
  );
}
