import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Define metric types based on your database schema
type MetricData = {
  date: Date;
  [key: string]: number | Date | string | null;
};

interface ComparisonChartProps {
  title: string;
  data: MetricData[];
  metrics: string[];
  xAxisKey?: string;
  className?: string;
  dateFormat?: string;
}

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

export function ComparisonChart({
  title,
  data,
  metrics,
  xAxisKey = "date",
  className,
  dateFormat = "MMM yyyy",
}: ComparisonChartProps) {
  // Format the data for the chart
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), dateFormat),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                width={80}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US").format(value)
                }
              />
              <Legend />
              {metrics.map((metric, index) => (
                <Bar
                  key={metric}
                  dataKey={metric}
                  fill={colors[index % colors.length]}
                  name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
