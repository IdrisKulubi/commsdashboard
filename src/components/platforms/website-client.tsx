"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WebsiteMetric } from "@/db/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { EditMetricDialog } from "@/components/ui/edit-metric-dialog";

// Chart data type
interface ChartDataItem {
  date: string;
  users: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
}

interface WebsiteClientProps {
  initialData: WebsiteMetric[];
  businessUnits: string[];
  countries: { code: string; name: string }[];
}

export function WebsiteClient({
  initialData,
  businessUnits,
  countries,
}: WebsiteClientProps) {
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>("ASM");
  const [selectedCountry, setSelectedCountry] = useState<string>("GLOBAL");
  const [isLoading] = useState(false);
  const [data] = useState<WebsiteMetric[]>(initialData);
  const [editingMetric, setEditingMetric] = useState<WebsiteMetric | null>(null);

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
          users: 0,
          pageViews: 0,
          sessions: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
          count: 0,
        };
      }
      
      acc[date].users += metric.users || 0;
      // These properties don't exist in the schema, so we'll use clicks for pageViews
      acc[date].pageViews += metric.clicks || 0;
      acc[date].sessions += metric.sessions || 0;
      // These properties don't exist in the schema, so we'll use 0
      acc[date].bounceRate += 0;
      acc[date].avgSessionDuration += 0;
      acc[date].count += 1;
      
      return acc;
    }, {} as Record<string, { 
      date: string; 
      users: number; 
      pageViews: number; 
      sessions: number; 
      bounceRate: number; 
      avgSessionDuration: number; 
      count: number; 
    }>);
    
    // Convert to array and calculate averages
    return Object.values(groupedByDate)
      .map((item) => ({
        date: item.date,
        users: item.users,
        pageViews: item.pageViews,
        sessions: item.sessions,
        bounceRate: item.count > 0 ? item.bounceRate / item.count : 0,
        avgSessionDuration: item.count > 0 ? item.avgSessionDuration / item.count : 0,
        pagesPerSession: item.sessions > 0 ? item.pageViews / item.sessions : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = processChartData();

  // Calculate summary metrics
  const calculateSummary = () => {
    if (filteredData.length === 0) return {
      totalUsers: 0,
      totalPageViews: 0,
      totalSessions: 0,
      avgBounceRate: 0,
      avgSessionDuration: 0,
      pagesPerSession: 0,
    };
    
    const totalUsers = filteredData.reduce((sum, metric) => sum + (metric.users || 0), 0);
    // Use clicks as pageViews since pageViews doesn't exist in the schema
    const totalPageViews = filteredData.reduce((sum, metric) => sum + (metric.clicks || 0), 0);
    const totalSessions = filteredData.reduce((sum, metric) => sum + (metric.sessions || 0), 0);
    
    // These properties don't exist in the schema, so we'll use default values
    const avgBounceRate = 0;
    const avgSessionDuration = 0;
    const pagesPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0;
    
    return {
      totalUsers,
      totalPageViews,
      totalSessions,
      avgBounceRate,
      avgSessionDuration,
      pagesPerSession,
    };
  };

  const summary = calculateSummary();

  // Define columns for the data table
  const columns: ColumnDef<WebsiteMetric>[] = [
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
      accessorKey: "users",
      header: "Users",
      cell: ({ row }) => row.original.users?.toLocaleString() || "0",
    },
    {
      accessorKey: "pageViews",
      header: "Page Views",
      cell: ({ row }) => row.original.clicks?.toLocaleString() || "0", // Using clicks as pageViews
    },
    {
      accessorKey: "sessions",
      header: "Sessions",
      cell: ({ row }) => row.original.sessions?.toLocaleString() || "0",
    },
    {
      accessorKey: "bounceRate",
      header: "Bounce Rate",
      cell: () => "0%", // This property doesn't exist in the schema
    },
    {
      accessorKey: "avgSessionDuration",
      header: "Avg. Session Duration",
      cell: () => {
        // This property doesn't exist in the schema
        return "0m 0s";
      },
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
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalUsers.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalPageViews.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalSessions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.avgBounceRate.toFixed(2)}%</div>
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
                  <CardTitle>Website Traffic Over Time</CardTitle>
                  <CardDescription>
                    Users, page views, and sessions by date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
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
                          formatter={(value) => [Number(value).toLocaleString(), ""]}
                          labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                        <Area
                          type="monotone"
                          dataKey="pageViews"
                          stackId="2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                        <Area
                          type="monotone"
                          dataKey="sessions"
                          stackId="3"
                          stroke="#ffc658"
                          fill="#ffc658"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="engagement">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Bounce Rate</CardTitle>
                    <CardDescription>
                      Percentage of single-page sessions
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
                            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Bounce Rate"]}
                            labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="bounceRate"
                            stroke="#FF8042"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Session Duration</CardTitle>
                    <CardDescription>
                      Average time spent on the website
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
                            formatter={(value) => {
                              const seconds = Number(value);
                              const minutes = Math.floor(seconds / 60);
                              const remainingSeconds = Math.round(seconds % 60);
                              return [`${minutes}m ${remainingSeconds}s`, "Avg. Session Duration"];
                            }}
                            labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="avgSessionDuration"
                            stroke="#0088FE"
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
                  <CardTitle>Website Metrics Data</CardTitle>
                  <CardDescription>
                    Raw data for website metrics
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