"use client";

import { AnalyticsSection } from "@/components/analytics-section";
import { SocialMetric, WebsiteMetric, NewsletterMetric } from "@/db/schema";
import {  AccessorColumnDef, ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateMetric } from "@/actions/metrics";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics } from "@/lib/api";

interface AnalyticsClientProps {
  initialData: {
    socialMetrics: SocialMetric[];
    websiteMetrics: WebsiteMetric[];
    newsletterMetrics: NewsletterMetric[];
  };
}

export function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [metrics, setMetrics] = useState(initialData);
  const toast = useToast();

  const handleEdit = async (updatedMetric: SocialMetric | WebsiteMetric | NewsletterMetric) => {
    try {
      // Optimistically update the UI
      setMetrics(prev => {
        return {
          socialMetrics: 
            'platform' in updatedMetric ? prev.socialMetrics.map(m =>
              m.id === updatedMetric.id ? updatedMetric as SocialMetric : m
            ) : prev.socialMetrics,
          websiteMetrics:
            'users' in updatedMetric ? prev.websiteMetrics.map(m =>
              m.id === updatedMetric.id ? updatedMetric as WebsiteMetric : m
            ) : prev.websiteMetrics,
          newsletterMetrics:
            'recipients' in updatedMetric ? prev.newsletterMetrics.map(m =>
              m.id === updatedMetric.id ? updatedMetric as NewsletterMetric : m
            ) : prev.newsletterMetrics,
        };
      });
      
      // Send API request
      //@ts-expect-error - updatedMetric is a NewsletterMetric
      await updateMetric(updatedMetric);
      
      // Optional: Re-fetch to confirm
      const fetchMetrics = async () => {
        const socialMetrics = await getSocialMetrics("FACEBOOK", "ASM", new Date('2023-01-01'), new Date()); // Adjust params as needed
        const websiteMetrics = await getWebsiteMetrics("ASM", new Date('2023-01-01'), new Date()); // Adjust params as needed
        const newsletterMetrics = await getNewsletterMetrics("ASM", new Date('2023-01-01'), new Date()); // Adjust params as needed
        return { socialMetrics, websiteMetrics, newsletterMetrics };
      };
      const freshData = await fetchMetrics();
      setMetrics(freshData);
    } catch (error) {
      console.error("Error updating metric:", error);
      // Rollback on error
      setMetrics(prev => prev);
      toast.toast({
        description: "Failed to update metric",
        variant: "destructive",
      });
    }
  };

  const socialColumns: ColumnDef<SocialMetric>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy")
    },
    {
      accessorKey: "platform",
      header: "Platform",
    },
    {
      accessorKey: "followers",
      header: "Followers",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.followers ?? 0)
    },
    { 
      id: "impressions", 
      header: "Impressions",
      accessorKey: "impressions",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.impressions ?? 0)
    },
    { 
      id: "numberOfPosts", 
      header: "Posts",
      accessorKey: "numberOfPosts",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.numberOfPosts ?? 0)
    }
  ];

  const websiteColumns = [
    { 
      id: "date",
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy")
    },
    { 
      id: "users", 
      header: "Users",
      accessorKey: "users",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.users ?? 0)
    },
    { 
      id: "clicks", 
      header: "Clicks",
      accessorKey: "clicks",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.clicks ?? 0)
    },
    { 
      id: "sessions", 
      header: "Sessions",
      accessorKey: "sessions",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.sessions ?? 0)
    }
  ] satisfies AccessorColumnDef<WebsiteMetric>[];

  const newsletterColumns = [
    { 
      id: "date",
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy")
    },
    { 
      id: "recipients", 
      header: "Recipients",
      accessorKey: "recipients",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.recipients ?? 0)
    },
    { 
      id: "openRate", 
      header: "Open Rate (%)",
      accessorKey: "openRate",
      cell: ({ row }) => 
        `${((Number(row.original.openRate) || 0) * 100).toFixed(1)}%`
    },
    { 
      id: "numberOfEmails", 
      header: "Emails Sent",
      accessorKey: "numberOfEmails",
      cell: ({ row }) => 
        new Intl.NumberFormat().format(row.original.numberOfEmails || 0)
    }
  ] satisfies AccessorColumnDef<NewsletterMetric>[];

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 gap-8">
        <AnalyticsSection
          title="Social Media Analytics"
          data={metrics.socialMetrics}
          columns={socialColumns}
          onEdit={handleEdit}
        />

        <AnalyticsSection
          title="Website Analytics"
          data={metrics.websiteMetrics}
          columns={websiteColumns}
          onEdit={handleEdit}
        />

        <AnalyticsSection
          title="Newsletter Analytics"
          data={metrics.newsletterMetrics}
          columns={newsletterColumns}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
} 