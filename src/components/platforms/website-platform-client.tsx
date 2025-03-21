"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BUSINESS_UNITS, WebsiteMetric } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getWebsiteMetrics } from "@/lib/api";
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
} from "recharts";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { EditMetricDialog } from "@/components/ui/edit-metric-dialog";

interface WebsitePlatformClientProps {
  initialData: {
    websiteMetrics: WebsiteMetric[];
  };
  businessUnits: string[];
  countries: { code: string; name: string }[];
}

export function WebsitePlatformClient({
  initialData,
  businessUnits,
  countries,
}: WebsitePlatformClientProps) {
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
  
  // Edit state
  const [editingMetric, setEditingMetric] = useState<WebsiteMetric | null>(null);
  
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
      const websiteData = await getWebsiteMetrics(
        businessUnit as keyof typeof BUSINESS_UNITS,
        dateRange.from,
        dateRange.to,
        country
      );
      
      setData({
        websiteMetrics: websiteData,
      });
      
      toast({
        title: "Data updated",
        description: "Website data has been refreshed",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error fetching data",
        description: "There was a problem updating the website data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process data for charts
  const processMonthlyData = (metrics: WebsiteMetric[], dataKey: keyof WebsiteMetric) => {
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
  
  // Prepare chart data
  const usersData = processMonthlyData(data.websiteMetrics, "users");
  const clicksData = processMonthlyData(data.websiteMetrics, "clicks");
  const sessionsData = processMonthlyData(data.websiteMetrics, "sessions");
  
  // Calculate totals for the pie chart
  const totalUsers = data.websiteMetrics.reduce((sum, metric) => sum + (metric.users || 0), 0);
  const totalClicks = data.websiteMetrics.reduce((sum, metric) => sum + (metric.clicks || 0), 0);
  const totalSessions = data.websiteMetrics.reduce((sum, metric) => sum + (metric.sessions || 0), 0);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const metricsDistribution = [
    { name: "Users", value: totalUsers, color: "#8884d8" },
    { name: "Clicks", value: totalClicks, color: "#82ca9d" },
    { name: "Sessions", value: totalSessions, color: "#ffc658" },
  ];
  
  // Define columns for the data table
  const websiteMetricsColumns: ColumnDef<WebsiteMetric>[] = [
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
      accessorKey: "users",
      header: "Users",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.users || 0),
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.clicks || 0),
    },
    {
      accessorKey: "sessions",
      header: "Sessions",
      cell: ({ row }) => row.original.sessions?.toLocaleString() || "0",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          metricType="website"
          onEdit={(row) => {
            setEditingMetric(row.original);
          }}
        />
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your website data</CardDescription>
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
            <CardTitle>Users Trend</CardTitle>
            <CardDescription>Monthly users trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usersData}>
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
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  name="Users" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sessions Trend</CardTitle>
            <CardDescription>Monthly sessions trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [
                    new Intl.NumberFormat().format(value as number),
                    "Sessions"
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  name="Sessions" 
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
          <CardTitle>Clicks Trend</CardTitle>
          <CardDescription>Monthly clicks trend</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clicksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat().format(value as number),
                  "Clicks"
                ]}
              />
              <Legend />
              <Bar 
                dataKey="clicks" 
                name="Clicks" 
                fill="#ffc658" 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Website Metrics</CardTitle>
          <CardDescription>Detailed breakdown of website performance</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={websiteMetricsColumns} 
            data={data.websiteMetrics} 
          />
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      {editingMetric && (
        <EditMetricDialog
          isOpen={Boolean(editingMetric)}
          onClose={() => setEditingMetric(null)}
          metric={editingMetric}
          metricType="website"
        />
      )}
    </div>
  );
} 