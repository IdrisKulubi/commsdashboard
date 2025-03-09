"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NewsletterMetric } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getNewsletterMetrics } from "@/lib/api";
import { Loader2 } from "lucide-react";
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
  AreaChart,
  Area,
} from "recharts";

interface NewsletterPlatformClientProps {
  initialData: {
    newsletterMetrics: NewsletterMetric[];
  };
  businessUnits: string[];
  countries: { code: string; name: string }[];
}

export function NewsletterPlatformClient({
  initialData,
  businessUnits,
  countries,
}: NewsletterPlatformClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });
  const [businessUnit, setBusinessUnit] = useState(businessUnits[0]);
  const [country, setCountry] = useState("GLOBAL");
  
  // Handle filter changes
  const handleFilterChange = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Date range required",
        description: "Please select a valid date range",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newsletterData = await getNewsletterMetrics(
        businessUnit as any,
        dateRange.from,
        dateRange.to,
        country
      );
      
      setData({
        newsletterMetrics: newsletterData,
      });
      
      toast({
        title: "Data updated",
        description: "Newsletter data has been refreshed",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error fetching data",
        description: "There was a problem updating the newsletter data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process data for charts
  const processMonthlyData = (metrics: NewsletterMetric[], dataKey: keyof NewsletterMetric) => {
    const monthlyData: Record<string, number> = {};
    
    metrics.forEach(metric => {
      const date = new Date(metric.date);
      const monthYear = format(date, "MMM yyyy");
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      if (metric[dataKey] !== null && metric[dataKey] !== undefined) {
        monthlyData[monthYear] += Number(metric[dataKey]);
      }
    });
    
    return Object.entries(monthlyData).map(([month, value]) => ({
      month,
      [dataKey]: value,
    }));
  };
  
  // Process open rate data
  const processOpenRateData = (metrics: NewsletterMetric[]) => {
    const monthlyData: Record<string, { total: number; count: number }> = {};
    
    metrics.forEach(metric => {
      const date = new Date(metric.date);
      const monthYear = format(date, "MMM yyyy");
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { total: 0, count: 0 };
      }
      
      if (metric.openRate !== null && metric.openRate !== undefined) {
        monthlyData[monthYear].total += Number(metric.openRate);
        monthlyData[monthYear].count += 1;
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      openRate: data.count > 0 ? (data.total / data.count) * 100 : 0,
    }));
  };
  
  // Prepare chart data
  const recipientsData = processMonthlyData(data.newsletterMetrics, "recipients");
  const emailsData = processMonthlyData(data.newsletterMetrics, "numberOfEmails");
  const openRateData = processOpenRateData(data.newsletterMetrics);
  
  // Define table columns
  const newsletterColumns: ColumnDef<NewsletterMetric>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
    },
    {
      accessorKey: "businessUnit",
      header: "Business Unit",
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "recipients",
      header: "Recipients",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.recipients || 0),
    },
    {
      accessorKey: "openRate",
      header: "Open Rate",
      cell: ({ row }) => `${((Number(row.original.openRate) || 0) * 100).toFixed(1)}%`,
    },
    {
      accessorKey: "numberOfEmails",
      header: "Emails Sent",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.numberOfEmails || 0),
    },
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your newsletter data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange 
                date={dateRange} 
                setDate={(date) => {
                  if (date?.from && date?.to) {
                    setDateRange({ from: date.from, to: date.to });
                  }
                }} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Unit</label>
              <Select 
                value={businessUnit} 
                onValueChange={setBusinessUnit}
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select 
                value={country} 
                onValueChange={setCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleFilterChange} 
            className="mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Apply Filters"
            )}
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recipients Trend</CardTitle>
            <CardDescription>Monthly recipients trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recipientsData}>
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
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Open Rate Trend</CardTitle>
            <CardDescription>Monthly open rate trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={openRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [
                    `${(value as number).toFixed(1)}%`,
                    "Open Rate"
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="openRate" 
                  name="Open Rate" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Emails Sent</CardTitle>
          <CardDescription>Monthly emails sent</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emailsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat().format(value as number),
                  "Emails Sent"
                ]}
              />
              <Legend />
              <Bar 
                dataKey="numberOfEmails" 
                name="Emails Sent" 
                fill="#ffc658" 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Metrics</CardTitle>
          <CardDescription>Detailed breakdown of newsletter performance</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={newsletterColumns} 
            data={data.newsletterMetrics} 
          />
        </CardContent>
      </Card>
    </div>
  );
} 