"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewsletterMetric } from "@/db/schema";
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
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

// Chart data type
interface ChartDataItem {
  date: string;
  recipients: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  openRate: number;
  clickRate: number;
}

interface NewsletterClientProps {
  initialData: NewsletterMetric[];
  businessUnits: string[];
  countries: { code: string; name: string }[];
}

export function NewsletterClient({
  initialData,
  businessUnits,
  countries,
}: NewsletterClientProps) {
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>("ASM");
  const [selectedCountry, setSelectedCountry] = useState<string>("GLOBAL");
  // We're keeping isLoading state for future use, but marking it as unused for now
  const [isLoading] = useState(false);
  const [data] = useState<NewsletterMetric[]>(initialData);

  // Filter data based on selected business unit and country
  const filteredData = data.filter((metric) => {
    const matchesBusinessUnit = selectedBusinessUnit === "ALL" || metric.businessUnit === selectedBusinessUnit;
    const matchesCountry = selectedCountry === "GLOBAL" || metric.country === selectedCountry;
    return matchesBusinessUnit && matchesCountry;
  });

  // Process data for charts
  const processChartData = (): ChartDataItem[] => {
    // Group by date and calculate averages
    const groupedByDate = filteredData.reduce((acc, metric) => {
      const date = format(new Date(metric.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = {
          date,
          recipients: 0,
          opens: 0,
          clicks: 0,
          unsubscribes: 0,
          count: 0,
        };
      }
      
      acc[date].recipients += metric.recipients || 0;
      // Convert openRate from string to number before adding
      acc[date].opens += metric.openRate ? parseFloat(metric.openRate) : 0;
      // We don't have clickRate in the schema, so we'll use 0 as a fallback
      acc[date].clicks += 0; // No clickRate in schema
      acc[date].count += 1;
      
      return acc;
    }, {} as Record<string, { 
      date: string; 
      recipients: number; 
      opens: number; 
      clicks: number; 
      unsubscribes: number; 
      count: number; 
    }>);
    
    // Convert to array and calculate averages
    return Object.values(groupedByDate)
      .map((item) => ({
        date: item.date,
        recipients: item.recipients,
        opens: item.opens,
        clicks: item.clicks,
        unsubscribes: item.unsubscribes,
        openRate: item.recipients > 0 ? (item.opens / item.recipients) * 100 : 0,
        clickRate: item.opens > 0 ? (item.clicks / item.opens) * 100 : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = processChartData();

  // Calculate summary metrics
  const calculateSummary = () => {
    if (filteredData.length === 0) return {
      totalRecipients: 0,
      totalOpens: 0,
      totalClicks: 0,
      totalUnsubscribes: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
    };
    
    const totalRecipients = filteredData.reduce((sum, metric) => sum + (metric.recipients || 0), 0);
    // Convert openRate from string to number
    const totalOpens = filteredData.reduce((sum, metric) => 
      sum + (metric.openRate ? parseFloat(metric.openRate) : 0), 0);
    // We don't have these properties in the schema, so we'll use 0
    const totalClicks = 0;
    const totalUnsubscribes = 0;
    
    return {
      totalRecipients,
      totalOpens,
      totalClicks,
      totalUnsubscribes,
      avgOpenRate: totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0,
      avgClickRate: totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0,
    };
  };

  const summary = calculateSummary();

  // Define columns for the data table
  const columns: ColumnDef<NewsletterMetric>[] = [
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
      cell: ({ row }) => {
        const country = countries.find(c => c.code === row.original.country);
        return country ? country.name : row.original.country;
      },
    },
    {
      accessorKey: "recipients",
      header: "Recipients",
      cell: ({ row }) => row.original.recipients?.toLocaleString() || "0",
    },
    {
      accessorKey: "opens",
      header: "Opens",
      cell: ({ row }) => row.original.openRate?.toString() || "0",
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: () => "0", // No clickRate in schema
    },
    {
      accessorKey: "numberOfEmails",
      header: "Number of Emails",
      cell: ({ row }) => row.original.numberOfEmails?.toLocaleString() || "0",
    },
    {
      accessorKey: "openRate",
      header: "Open Rate",
      cell: ({ row }) => {
        const openRateNum = row.original.openRate ? parseFloat(row.original.openRate) : 0;
        const recipients = row.original.recipients || 0;
        return recipients > 0 
          ? ((openRateNum / recipients) * 100).toFixed(2) + "%" 
          : "0%";
      },
    },
    {
      accessorKey: "clickRate",
      header: "Click Rate",
      cell: () => "0%", // No clickRate or opens in schema
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Select
          value={selectedBusinessUnit}
          onValueChange={setSelectedBusinessUnit}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select Business Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Business Units</SelectItem>
            {businessUnits.map((bu) => (
              <SelectItem key={bu} value={bu}>
                {bu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedCountry}
          onValueChange={setSelectedCountry}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GLOBAL">Global</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalRecipients.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Opens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalOpens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.avgOpenRate.toFixed(2)}% open rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalClicks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.avgClickRate.toFixed(2)}% click rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unsubscribes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalUnsubscribes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalRecipients > 0 
                    ? (summary.totalUnsubscribes / summary.totalRecipients * 100).toFixed(2) 
                    : "0"}% unsubscribe rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="data">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Recipients Over Time</CardTitle>
                  <CardDescription>
                    Total number of newsletter recipients by date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), "MMM d")}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [Number(value).toLocaleString(), "Recipients"]}
                          labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="recipients"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="engagement">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Rate</CardTitle>
                    <CardDescription>
                      Percentage of recipients who opened the newsletter
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => format(new Date(value), "MMM d")}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Open Rate"]}
                            labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="openRate"
                            stroke="#00C49F"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Click Rate</CardTitle>
                    <CardDescription>
                      Percentage of opens that resulted in clicks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => format(new Date(value), "MMM d")}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Click Rate"]}
                            labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="clickRate"
                            stroke="#FFBB28"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Metrics Data</CardTitle>
                  <CardDescription>
                    Raw data for newsletter metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable columns={columns} data={filteredData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 