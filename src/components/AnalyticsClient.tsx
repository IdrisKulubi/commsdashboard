"use client";

import { AnalyticsSection } from "@/components/analytics-section";
import { SocialMetric, WebsiteMetric, NewsletterMetric } from "@/db/schema";
import {  AccessorColumnDef, ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

interface AnalyticsClientProps {
  initialData: {
    socialMetrics: SocialMetric[];
    websiteMetrics: WebsiteMetric[];
    newsletterMetrics: NewsletterMetric[];
  };
}

export function AnalyticsClient({ initialData }: AnalyticsClientProps) {
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
          data={initialData.socialMetrics}
          columns={socialColumns}
        />

        <AnalyticsSection
          title="Website Analytics"
          data={initialData.websiteMetrics}
          columns={websiteColumns}
        />

        <AnalyticsSection
          title="Newsletter Analytics"
          data={initialData.newsletterMetrics}
          columns={newsletterColumns}
        />
      </div>
    </div>
  );
} 