import { DateRange } from "react-day-picker";
import { SocialMediaMetrics } from "./SocialMediaMetrics";
import { WebsiteMetrics } from "./WebsiteMetrics";
import { NewsletterMetrics } from "./NewsletterMetrics";
import { PLATFORMS } from "@/db/schema";

interface MetricsContainerProps {
  platform: keyof typeof PLATFORMS;
  businessUnit: "ASM" | "IACL" | "EM";
  dateRange: DateRange;
}

export async function MetricsContainer({
  platform,
  businessUnit,
  dateRange,
}: MetricsContainerProps) {
  if (!dateRange.from || !dateRange.to) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SocialMediaMetrics
          platform={platform}
          businessUnit={businessUnit}
          startDate={dateRange.from}
          endDate={dateRange.to}
          className="w-full"
        />
        <WebsiteMetrics
          businessUnit={businessUnit}
          startDate={dateRange.from}
          endDate={dateRange.to}
          className="w-full"
        />
        <NewsletterMetrics
          businessUnit={businessUnit}
          startDate={dateRange.from}
          endDate={dateRange.to}
          className="w-full"
        />
      </div>
    </>
  );
}
