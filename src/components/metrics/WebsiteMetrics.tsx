import { getWebsiteMetrics } from "@/lib/api";
import { ComparisonChart } from "@/components/shared/ComparisonChart";
import { startOfYear, endOfYear } from "date-fns";

interface WebsiteMetricsProps {
  businessUnit: "ASM" | "IACL" | "EM";
  className?: string;
}

export async function WebsiteMetrics({
  businessUnit,
  className,
}: WebsiteMetricsProps) {
  // Get data for the current year
  const startDate = startOfYear(new Date());
  const endDate = endOfYear(new Date());

  const metrics = await getWebsiteMetrics(businessUnit, startDate, endDate);

  return (
    <ComparisonChart
      title={`Website Metrics - ${businessUnit}`}
      data={metrics}
      metrics={["users", "clicks", "sessions"]}
      className={className}
    />
  );
}
