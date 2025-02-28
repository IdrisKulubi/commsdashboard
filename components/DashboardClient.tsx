import { AnalyticsSection } from "@/components/analytics-section"
import { NewsletterMetric, SocialMetric, WebsiteMetric } from "@/db/schema"
import { ColumnDef } from "@tanstack/react-table"

const socialColumns: ColumnDef<SocialMetric>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "platform", header: "Platform" },
  { accessorKey: "followers", header: "Followers" },
  { accessorKey: "impressions", header: "Impressions" },
  { accessorKey: "numberOfPosts", header: "Posts" },
]

const websiteColumns: ColumnDef<WebsiteMetric>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "users", header: "Users" },
  { accessorKey: "clicks", header: "Clicks" },
  { accessorKey: "sessions", header: "Sessions" },
]

const newsletterColumns: ColumnDef<NewsletterMetric>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "recipients", header: "Recipients" },
  { accessorKey: "openRate", header: "Open Rate (%)", 
    cell: ({ row }) => (row.original.openRate ? (row.original.openRate * 100).toFixed(1) : "N/A") },
  { accessorKey: "numberOfEmails", header: "Emails Sent" },
]

return (
  <div className="container mx-auto py-10">
    {/* Existing header and filters */}

    <div className="space-y-8">
      {/* Existing charts */}

      <AnalyticsSection
        title="Social Media Analytics"
        data={metrics.socialMetrics}
        columns={socialColumns}
      />

      <AnalyticsSection
        title="Website Analytics"
        data={metrics.websiteMetrics}
        columns={websiteColumns}
      />

      <AnalyticsSection
        title="Newsletter Analytics"
        data={metrics.newsletterMetrics}
        columns={newsletterColumns}
      />
    </div>
  </div>
) 