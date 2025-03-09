"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SocialMetric, WebsiteMetric, NewsletterMetric } from "@/db/schema";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ComparisonChart } from "./comparison-chart";
import { GrowthChart } from "./growth-chart";

interface TrendsClientProps {
  socialMetrics: SocialMetric[];
  websiteMetrics: WebsiteMetric[];
  newsletterMetrics: NewsletterMetric[];
  platforms: string[];
  businessUnits: string[];
}

export function TrendsClient({
  socialMetrics,
  websiteMetrics,
  newsletterMetrics,
  platforms,
  businessUnits,
}: TrendsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(businessUnits[0]);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  // Process data for charts
  const processMonthlyData = (data: any[], metric: string) => {
    // Get date range
    const dates = data.map(item => new Date(item.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Create array of all months in range
    const months = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    });
    
    // Group data by month
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthData = data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
      });
      
      // Sum the metric for the month
      const sum = monthData.reduce((acc, item) => acc + (item[metric] || 0), 0);
      
      return {
        month: format(month, "MMM yyyy"),
        [metric]: sum,
        date: month,
      };
    });
    
    return monthlyData;
  };
  
  // Filter data by selected platform and business unit
  const filteredSocialMetrics = socialMetrics.filter(
    item => item.platform === selectedPlatform && item.businessUnit === selectedBusinessUnit
  );
  
  const filteredWebsiteMetrics = websiteMetrics.filter(
    item => item.businessUnit === selectedBusinessUnit
  );
  
  const filteredNewsletterMetrics = newsletterMetrics.filter(
    item => item.businessUnit === selectedBusinessUnit
  );
  
  // Process monthly data
  const monthlyFollowers = processMonthlyData(filteredSocialMetrics, "followers");
  const monthlyImpressions = processMonthlyData(filteredSocialMetrics, "impressions");
  const monthlyWebsiteUsers = processMonthlyData(filteredWebsiteMetrics, "users");
  const monthlyNewsletterRecipients = processMonthlyData(filteredNewsletterMetrics, "recipients");
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select platform and business unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select 
                value={selectedPlatform} 
                onValueChange={setSelectedPlatform}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Unit</label>
              <Select 
                value={selectedBusinessUnit} 
                onValueChange={setSelectedBusinessUnit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business unit" />
                </SelectTrigger>
                <SelectContent>
                  {businessUnits.map((bu) => (
                    <SelectItem key={bu} value={bu}>
                      {bu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Followers Growth</CardTitle>
            <CardDescription>Monthly followers trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFollowers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat().format(value as number),
                      "Followers"
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="followers" 
                    name="Followers" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Impressions Trend</CardTitle>
            <CardDescription>Monthly impressions trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyImpressions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat().format(value as number),
                      "Impressions"
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="impressions" 
                    name="Impressions" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Website Users</CardTitle>
            <CardDescription>Monthly website users trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyWebsiteUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat().format(value as number),
                      "Users"
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    name="Users" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Recipients</CardTitle>
            <CardDescription>Monthly newsletter recipients trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyNewsletterRecipients}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat().format(value as number),
                      "Recipients"
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="recipients" 
                    name="Recipients" 
                    stroke="#ff8042" 
                    fill="#ff8042" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ComparisonChart 
          platforms={platforms}
          businessUnits={businessUnits}
          socialMetrics={socialMetrics}
        />
        
        <GrowthChart 
          data={monthlyFollowers}
          title="Month-over-Month Growth"
          description="Percentage growth in followers"
          dataKey="followers"
        />
      </div>
    </div>
  );
} 