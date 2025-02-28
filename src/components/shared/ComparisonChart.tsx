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
import { useTheme } from "next-themes";

// Export the MetricData type
export type MetricData = {
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
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const gridColor = theme === "dark" ? "#374151" : "#e5e7eb";

  // Format the data for the chart
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), dateFormat),
  }));

 

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value;
  };

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
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fill: textColor }}
                stroke={textColor}
              />
              <YAxis
                tick={{ fill: textColor }}
                stroke={textColor}
                tickFormatter={(value) => formatValue(Number(value)) as string}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  borderColor: gridColor,
                  borderRadius: "8px",
                }}
                formatter={(value: number) => new Intl.NumberFormat().format(value)}
              />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span style={{ color: textColor }}>
                    {value.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                )}
              />
              {metrics.map((metric, index) => (
                <Bar
                  key={`${metric}-${index}`}
                  dataKey={metric}
                  fill={colors[index % colors.length]}
                  name={typeof metric === 'string' ? metric.replace(/([A-Z])/g, ' $1').trim() : String(metric)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
