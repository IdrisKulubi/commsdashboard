import { getNewsletterMetrics } from "@/lib/api";
import { ComparisonChart } from "@/components/shared/ComparisonChart";
import { startOfYear, endOfYear } from "date-fns";

interface NewsletterMetricsProps {
  businessUnit: "ASM" | "IACL" | "EM";
  className?: string;
  startDate: Date;
  endDate: Date;
}

export async function NewsletterMetrics({
  businessUnit,
  className,
}: NewsletterMetricsProps) {
  // Get data for the current year
  const startDate = startOfYear(new Date());
  const endDate = endOfYear(new Date());

  const metrics = await getNewsletterMetrics(businessUnit, startDate, endDate);

  // Convert openRate from decimal to percentage for display
  const formattedMetrics = metrics.map((metric) => ({
    ...metric,
    openRate: metric.openRate ? Number(metric.openRate) * 100 : null,
  }));

  return (
    <ComparisonChart
      title={`Newsletter Metrics - ${businessUnit}`}
      data={formattedMetrics}
      metrics={["recipients", "openRate", "numberOfEmails"]}
      className={className}
    />
  );
}
