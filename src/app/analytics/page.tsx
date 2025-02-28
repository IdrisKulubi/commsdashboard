import { AnalyticsClient } from "@/components/AnalyticsClient";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics } from "@/lib/api";
import { NavBar } from "@/components/shared/NavBar";


export default async function AnalyticsPage() {
  const initialData = {
    socialMetrics: await getSocialMetrics("FACEBOOK", "ASM", new Date('2023-01-01'), new Date()),
    websiteMetrics: await getWebsiteMetrics("ASM", new Date('2023-01-01'), new Date()),
    newsletterMetrics: await getNewsletterMetrics("ASM", new Date('2023-01-01'), new Date()),
  };

  return (
    <div className="container mx-auto py-10">
      <NavBar />
      <AnalyticsClient
        initialData={initialData}
      />
    </div>
  );
} 