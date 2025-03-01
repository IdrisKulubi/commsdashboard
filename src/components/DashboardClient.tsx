"use client";

import { useState, useEffect, useMemo } from "react";
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
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics } from "@/lib/api";
import { MetricsCard } from "@/components/shared/MetricsCard";
import { DateRange } from "react-day-picker";
import { CountryFilter } from "@/components/shared/CountryFilter";
import { COUNTRIES } from "@/lib/constants";

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
    country: "GLOBAL" as keyof typeof COUNTRIES,
    dateRange: initialDateRange
  });

  const [metrics, setMetrics] = useState(initialData);

  // Modify the platform change handler to use the API endpoint
  const handlePlatformChange = async (p: string) => {
    console.log("Changing platform to:", p);
    // Ensure the platform is correctly typed
    const typedPlatform = p as keyof typeof PLATFORMS;
    
    // Create a new filters object with the updated platform
    const newFilters = {
      ...filters,
      platform: typedPlatform
    };
    
    // Update state with the new filters
    setFilters(newFilters);
    
    // Immediately fetch data with the new platform value
    if (newFilters.dateRange.from && newFilters.dateRange.to) {
      try {
        // Use the API endpoint instead of the server action
        const response = await fetch(
          `/api/metrics/social?businessUnit=${newFilters.businessUnit}&from=${newFilters.dateRange.from.toISOString()}&to=${newFilters.dateRange.to.toISOString()}&platform=${typedPlatform}&country=${newFilters.country}`
        );
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const socialMetrics = await response.json();
        console.log(`Fetched ${socialMetrics.length} metrics for ${typedPlatform}`);
        
        // Update just the social metrics
        setMetrics(prev => ({
          ...prev,
          socialMetrics
        }));
      } catch (error) {
        console.error(`Error fetching ${typedPlatform} metrics:`, error);
      }
    }
  };
  
  // Similarly update the business unit change handler
  const handleBusinessUnitChange = async (bu: string) => {
    const typedBU = bu as keyof typeof BUSINESS_UNITS;
    
    // Create a new filters object with the updated business unit
    const newFilters = {
      ...filters,
      businessUnit: typedBU
    };
    
    // Update state with the new filters
    setFilters(newFilters);
    
    // Immediately fetch data with the new business unit
    if (newFilters.dateRange.from && newFilters.dateRange.to) {
      try {
        const [socialMetrics, websiteMetrics, newsletterMetrics] = await Promise.all([
          getSocialMetrics(
            newFilters.platform as "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK",
            typedBU,
            newFilters.dateRange.from,
            newFilters.dateRange.to
          ),
          getWebsiteMetrics(
            typedBU,
            newFilters.dateRange.from,
            newFilters.dateRange.to
          ),
          getNewsletterMetrics(
            typedBU,
            newFilters.dateRange.from,
            newFilters.dateRange.to
          )
        ]);
        
        setMetrics({
          socialMetrics,
          websiteMetrics,
          newsletterMetrics
        });
      } catch (error) {
        console.error(`Error fetching metrics for ${typedBU}:`, error);
      }
    }
  };

  // Use a more robust filtering approach
  const filteredSocialMetrics = useMemo(() => {
    return metrics.socialMetrics.filter(m => {
      // Case-insensitive platform comparison
      const platformMatch = String(m.platform).toUpperCase() === String(filters.platform).toUpperCase();
      const businessUnitMatch = m.businessUnit === filters.businessUnit;
      
      return platformMatch && businessUnitMatch;
    });
  }, [metrics.socialMetrics, filters.platform, filters.businessUnit]);

  // Add useEffect to fetch fresh data when filters change
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!filters.dateRange.from || !filters.dateRange.to) return;
      
      try {
        const [socialMetrics, websiteMetrics, newsletterMetrics] = await Promise.all([
          getSocialMetrics(filters.platform as "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK", filters.businessUnit as keyof typeof BUSINESS_UNITS, filters.dateRange.from, filters.dateRange.to),
          getWebsiteMetrics(filters.businessUnit as keyof typeof BUSINESS_UNITS, filters.dateRange.from, filters.dateRange.to),
          getNewsletterMetrics(filters.businessUnit as keyof typeof BUSINESS_UNITS, filters.dateRange.from, filters.dateRange.to)
        ]);

        setMetrics({
          socialMetrics,
          websiteMetrics,
          newsletterMetrics
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, [filters.platform, filters.businessUnit, filters.dateRange]);

  // Add debugging code after filteredSocialMetrics is defined
  useEffect(() => {
    console.log("Current filters:", filters);
    console.log("All social metrics:", metrics.socialMetrics);
    console.log("Filtered social metrics:", filteredSocialMetrics);
  }, [filters, metrics.socialMetrics, filteredSocialMetrics]);

  // Add this debugging function to check platform values
  useEffect(() => {
    // Log unique platforms in the database
    const uniquePlatforms = [...new Set(metrics.socialMetrics.map(m => m.platform))];
    console.log("Available platforms in data:", uniquePlatforms);
    
    // Check if Instagram data exists
    const instagramMetrics = metrics.socialMetrics.filter(m => 
      m.platform === "INSTAGRAM" && m.businessUnit === filters.businessUnit
    );
    console.log("Instagram metrics:", instagramMetrics);
    
    // Check exact string comparison
    if (filters.platform === "INSTAGRAM") {
      console.log("Current filter is INSTAGRAM");
      metrics.socialMetrics.forEach(m => {
        if (m.platform === "INSTAGRAM") {
          console.log("Match found:", m);
        } else {
          console.log("No match for:", m.platform, "vs INSTAGRAM");
        }
      });
    }
  }, [metrics.socialMetrics, filters]);

  const [editingMetric, setEditingMetric] = useState<
    (SocialMetric | WebsiteMetric | NewsletterMetric) | null
  >(null);

  const handleEdit = async (updatedMetric: SocialMetric | WebsiteMetric | NewsletterMetric) => {
    try {
      // Use type guards to determine the correct type
      let typedMetric: SocialMetric | WebsiteMetric | NewsletterMetric;
      
      if ('impressions' in updatedMetric) {
        typedMetric = updatedMetric as SocialMetric;
      } else if ('users' in updatedMetric) {
        typedMetric = updatedMetric as WebsiteMetric;
      } else {
        typedMetric = updatedMetric as NewsletterMetric;
      }
      
      // First update the server with properly typed metric
      //@ts-expect-error ignore type error for now  
      const result = await updateMetric(typedMetric);
      
      // Then update local state with the server response
      setMetrics(prev => {
        // Create a new object to avoid mutating the previous state
        const newState = { ...prev };
        
        // Update the appropriate metrics array based on the type of metric
        if ('platform' in result) {
          newState.socialMetrics = prev.socialMetrics.map(m => 
            m.id === result.id ? result as SocialMetric : m
          );
        } else if ('users' in result) {
          newState.websiteMetrics = prev.websiteMetrics.map(m => 
            m.id === result.id ? result as WebsiteMetric : m
          );
        } else if ('recipients' in result) {
          newState.newsletterMetrics = prev.newsletterMetrics.map(m => 
            m.id === result.id ? result as NewsletterMetric : m
          );
        }
        
        return newState;
      });

      setEditingMetric(null);
    } catch (error) {
      console.error("Error updating metric:", error);
    }
  };

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
            onPlatformChange={handlePlatformChange}
            onBusinessUnitChange={handleBusinessUnitChange}
          />
          <DateRangeSelector
            dateRange={filters.dateRange}
            onDateRangeChange={(range) => 
              setFilters(prev => ({ ...prev, dateRange: range || initialDateRange }))
            }
          />
          <CountryFilter
            country={filters.country}
            onCountryChange={(c: string) => {
              const typedCountry = c as keyof typeof COUNTRIES;
              
              // Create a new filters object with the updated country
              const newFilters = {
                ...filters,
                country: typedCountry
              };
              
              // Update state with the new filters
              setFilters(newFilters);
              
              // Fetch data with the new country filter
              if (newFilters.dateRange.from && newFilters.dateRange.to) {
                // Fetch data with country filter
              }
            }}
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
