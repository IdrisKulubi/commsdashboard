"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialMetric } from "@/db/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface MetricsChartProps {
  data: SocialMetric[];
  title: string;
  dataKey: keyof SocialMetric;
  label: string;
}

export function MetricsChart({ data, title, dataKey, label }: MetricsChartProps) {
  const [mounted, setMounted] = useState(false);
  
  // Process data for the chart
  const chartData = data.map(item => ({
    date: format(new Date(item.date), "MMM d"),
    [dataKey]: item[dataKey],
  }));
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Trend over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat().format(value as number),
                  label
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey as string}
                name={label}
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 