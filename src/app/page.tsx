import { Suspense } from "react";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { DashboardClient } from "@/components/DashboardClient";
import {
  getNewsletterMetrics,
  getSocialMetrics,
  getWebsiteMetrics,
} from "@/lib/api";


// This is a Server Component
export default async function DashboardPage() {
  const initialDateRange = {
    from: startOfMonth(addMonths(new Date(), -6)),
    to: endOfMonth(new Date()),
  };

  // Fetch initial data
  const initialData = {
    socialMetrics: await getSocialMetrics(
      "FACEBOOK",
      "ASM",
      initialDateRange.from,
      initialDateRange.to
    ),
    websiteMetrics: await getWebsiteMetrics(
      "ASM",
      initialDateRange.from,
      initialDateRange.to
    ),
    newsletterMetrics: await getNewsletterMetrics(
      "ASM",
      initialDateRange.from,
      initialDateRange.to
    ),
  };

  // Define columns configuration
  const socialColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Followers', accessor: 'followers' },
    { header: 'Likes', accessor: 'likes' },
    { header: 'Shares', accessor: 'shares' },
    { header: 'Comments', accessor: 'comments' }
  ];

  const websiteColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Page Views', accessor: 'pageViews' },
    { header: 'Unique Visitors', accessor: 'uniqueVisitors' },
    { header: 'Bounce Rate', accessor: 'bounceRate' }
  ];

  const newsletterColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Subscribers', accessor: 'subscribers' },
    { header: 'Open Rate', accessor: 'openRate' },
    { header: 'Click Through', accessor: 'clickThrough' }
  ];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient
        initialDateRange={initialDateRange}
        initialData={initialData}
        socialColumns={socialColumns}
        websiteColumns={websiteColumns}
        newsletterColumns={newsletterColumns}
      />
    </Suspense>
  );
}
