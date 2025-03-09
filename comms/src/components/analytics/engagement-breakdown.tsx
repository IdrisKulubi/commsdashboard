"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialEngagementMetric } from "@/db/schema";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface EngagementBreakdownProps {
  data: SocialEngagementMetric[];
}

export function EngagementBreakdown({ data }: EngagementBreakdownProps) {
  const [mounted, setMounted] = useState(false);
  
  // Calculate totals
  const totalLikes = data.reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalComments = data.reduce((sum, item) => sum + (item.comments || 0), 0);
  const totalShares = data.reduce((sum, item) => sum + (item.shares || 0), 0);
  const totalSaves = data.reduce((sum, item) => sum + (item.saves || 0), 0);
  const totalClicks = data.reduce((sum, item) => sum + (item.clicks || 0), 0);
  
  // Prepare chart data
  const chartData = [
    { name: "Likes", value: totalLikes, color: "#8884d8" },
    { name: "Comments", value: totalComments, color: "#82ca9d" },
    { name: "Shares", value: totalShares, color: "#ffc658" },
    { name: "Saves", value: totalSaves, color: "#ff8042" },
    { name: "Clicks", value: totalClicks, color: "#0088fe" },
  ].filter(item => item.value > 0); // Only include non-zero values
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Breakdown</CardTitle>
        <CardDescription>
          Distribution of engagement types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat().format(value as number),
                  "Count"
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm font-medium">
                {new Intl.NumberFormat().format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 