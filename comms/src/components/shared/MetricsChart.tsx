"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsTable } from "@/components/shared/MetricsTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

interface MetricsChartProps {
  title: string;
  data: Array<{
    date: Date;
    [key: string]: number | Date;
  }>;
  metrics: string[];
  className?: string;
  formatValue?: (value: number | Date) => string;
}

export function MetricsChart({
  title,
  data,
  metrics,
  className,
  formatValue,
}: MetricsChartProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <ViewToggle view={view} onViewChange={setView} />
      </CardHeader>
      <CardContent>
        {view === "chart" ? (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) =>
                    format(new Date(date), "MMMM d, yyyy")
                  }
                />
                {metrics.map((metric, index) => (
                  <Area
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stackId="1"
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    fill={`hsl(${index * 60}, 70%, 50%)`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <MetricsTable
            data={data}
            metrics={metrics}
            formatValue={formatValue}
          />
        )}
      </CardContent>
    </Card>
  );
}
