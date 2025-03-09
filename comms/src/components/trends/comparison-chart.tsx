"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialMetric } from "@/db/schema";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
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

interface ComparisonChartProps {
  platforms: string[];
  businessUnits: string[];
  socialMetrics: SocialMetric[];
}

export function ComparisonChart({
  platforms,
  businessUnits,
  socialMetrics,
}: ComparisonChartProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  // Process data for comparison chart
  const processComparisonData = () => {
    // Group by platform and sum followers
    const platformData = platforms.map(platform => {
      const platformMetrics = socialMetrics.filter(item => item.platform === platform);
      const totalFollowers = platformMetrics.reduce((sum, item) => sum + (item.followers || 0), 0);
      
      return {
        platform,
        followers: totalFollowers,
      };
    });
    
    return platformData;
  };
  
  const comparisonData = processComparisonData();
  
  // Define colors for each platform
  const platformColors = {
    FACEBOOK: "#1877F2",
    INSTAGRAM: "#E4405F",
    LINKEDIN: "#0A66C2",
    TIKTOK: "#000000",
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Comparison</CardTitle>
        <CardDescription>Total followers by platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat().format(value as number),
                  "Followers"
                ]}
              />
              <Legend />
              <Bar 
                dataKey="followers" 
                name="Followers" 
                fill="#8884d8"
                // Use different colors for each platform
                isAnimationActive={true}
                animationDuration={1000}
              >
                {comparisonData.map((entry, index) => (
                  <rect
                    key={`rect-${index}`}
                    fill={platformColors[entry.platform as keyof typeof platformColors] || "#8884d8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 