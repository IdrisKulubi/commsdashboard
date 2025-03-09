"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface OverviewChartsProps {
  className?: string;
}

export function OverviewCharts({ className }: OverviewChartsProps) {
  const [mounted, setMounted] = useState(false);
  
  // Sample data - in a real app, this would come from an API
  const data = [
    { month: "Jan", followers: 2500, impressions: 45000, engagement: 1200 },
    { month: "Feb", followers: 3000, impressions: 52000, engagement: 1600 },
    { month: "Mar", followers: 3200, impressions: 55000, engagement: 1800 },
    { month: "Apr", followers: 3800, impressions: 61000, engagement: 2100 },
    { month: "May", followers: 4200, impressions: 72000, engagement: 2400 },
    { month: "Jun", followers: 4500, impressions: 78000, engagement: 2700 },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className={cn("col-span-4", className)}>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          Track key metrics across all platforms over time
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <Tabs defaultValue="followers">
          <TabsList>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="impressions">Impressions</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#8884d8"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="impressions" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="engagement" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="engagement" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 