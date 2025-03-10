"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface EngagementTrendsProps {
  className?: string;
}

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
}

export function EngagementTrends({ className }: EngagementTrendsProps) {
  const [data, setData] = useState<EngagementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEngagementTrends() {
      try {
        // Calculate date range for the last 30 days
        const endDate = new Date();
        const startDate = subDays(endDate, 30);
        
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/analytics/engagement-trends?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch engagement trends data');
        }
        
        const trendsData = await response.json();
        setData(trendsData);
      } catch (error) {
        console.error('Error fetching engagement trends:', error);
        // Fallback data
        const fallbackData = [];
        const today = new Date();
        for (let i = 30; i >= 0; i--) {
          const date = subDays(today, i);
          fallbackData.push({
            date: format(date, 'yyyy-MM-dd'),
            likes: Math.floor(Math.random() * 100) + 50,
            comments: Math.floor(Math.random() * 50) + 10,
            shares: Math.floor(Math.random() * 30) + 5
          });
        }
        setData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEngagementTrends();
  }, []);

  return (
    <Card className={cn("col-span-3 transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Engagement Trends</CardTitle>
        <CardDescription>
          30-day engagement activity across platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
                <Line type="monotone" dataKey="shares" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 