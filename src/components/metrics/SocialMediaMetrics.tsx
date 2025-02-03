import { getSocialMetrics } from "@/lib/api";
import { ComparisonChart } from "@/components/shared/ComparisonChart";

interface SocialMediaMetricsProps {
  platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK";
  businessUnit: "ASM" | "IACL" | "EM";
  startDate: Date;
  endDate: Date;
  className?: string;
}

export async function SocialMediaMetrics({
  platform,
  businessUnit,
  startDate,
  endDate,
  className,
}: SocialMediaMetricsProps) {
  const metrics = await getSocialMetrics(
    platform,
    businessUnit,
    startDate,
    endDate
  );

  return (
    <ComparisonChart
      title={`${platform} Metrics - ${businessUnit}`}
      data={metrics}
      metrics={["impressions", "followers", "numberOfPosts"]}
      className={className}
    />
  );
}
