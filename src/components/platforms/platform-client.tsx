"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SocialMetric, SocialEngagementMetric, PLATFORMS } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSocialMetrics, getSocialEngagementMetrics } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
 
} from "recharts";
import { BUSINESS_UNITS } from "@/lib/constants";

interface PlatformClientProps {
  platform: string;
  platformColor: string;
  initialData: {
    socialMetrics: SocialMetric[];
    engagementMetrics: SocialEngagementMetric[];
  };
  businessUnits: string[];
  countries: { code: string; name: string }[];
}

export function PlatformClient({
  platform,
  platformColor,
  initialData,
  businessUnits,
  countries,
}: PlatformClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>("ASM");
  const [selectedCountry, setSelectedCountry] = useState<string>("GLOBAL");
  
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
      const [socialData, engagementData] = await Promise.all([
        getSocialMetrics(
          platform as keyof typeof PLATFORMS,
          selectedBusinessUnit as keyof typeof BUSINESS_UNITS,
          dateRange.from,
          dateRange.to,
          selectedCountry
        ),
        getSocialEngagementMetrics(
          platform as keyof typeof PLATFORMS,
          selectedBusinessUnit as keyof typeof BUSINESS_UNITS,
          dateRange.from,
          dateRange.to
        ),
      ]);
      
      setData({
        socialMetrics: socialData,
        engagementMetrics: engagementData,
      });
      
      toast({
        title: "Data updated",
        description: "Platform data has been refreshed",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error fetching data",
        description: "There was a problem updating the platform data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process data for charts
  const processEngagementData = (metrics: SocialEngagementMetric[]) => {
    const totalLikes = metrics.reduce((sum, metric) => sum + (metric.likes || 0), 0);
    const totalComments = metrics.reduce((sum, metric) => sum + (metric.comments || 0), 0);
    const totalShares = metrics.reduce((sum, metric) => sum + (metric.shares || 0), 0);
    const totalSaves = metrics.reduce((sum, metric) => sum + (metric.saves || 0), 0);
    
    return [
      { name: "Likes", value: totalLikes, color: "#8884d8" },
      { name: "Comments", value: totalComments, color: "#82ca9d" },
      { name: "Shares", value: totalShares, color: "#ffc658" },
      { name: "Saves", value: totalSaves, color: "#ff8042" },
    ].filter(item => item.value > 0);
  };
  
  // Prepare chart data
  const filteredSocialMetrics = data.socialMetrics.filter((metric) => {
    const matchesBusinessUnit = selectedBusinessUnit === "ALL" || metric.businessUnit === selectedBusinessUnit;
    const matchesCountry = selectedCountry === "GLOBAL" || metric.country === selectedCountry;
    return matchesBusinessUnit && matchesCountry;
  });

  const filteredEngagementMetrics = data.engagementMetrics.filter((metric) => {
    const matchesBusinessUnit = selectedBusinessUnit === "ALL" || metric.businessUnit === selectedBusinessUnit;
    return matchesBusinessUnit;
  });

  const processFollowerData = () => {
    // Group by date and calculate totals
    const groupedByDate = filteredSocialMetrics.reduce((acc, metric) => {
      const date = format(new Date(metric.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = {
          date,
          followers: 0,
          posts: 0,
        };
      }
      
      acc[date].followers += metric.followers || 0;
      acc[date].posts += metric.numberOfPosts || 0;
      
      return acc;
    }, {} as Record<string, { date: string; followers: number; posts: number }>);
    
    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Process data for charts
  const followerData = processFollowerData();
  const engagementData = processEngagementData(filteredEngagementMetrics);

  // Define columns for the data tables
  const socialMetricsColumns: ColumnDef<SocialMetric>[] = [
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
      accessorKey: "followers",
      header: "Followers",
      cell: ({ row }) => row.original.followers?.toLocaleString() || "0",
    },
    {
      accessorKey: "numberOfPosts",
      header: "Posts",
      cell: ({ row }) => row.original.numberOfPosts?.toLocaleString() || "0",
    },
  ];
  
  const engagementMetricsColumns: ColumnDef<SocialEngagementMetric>[] = [
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
      accessorKey: "likes",
      header: "Likes",
      cell: ({ row }) => row.original.likes?.toLocaleString() || "0",
    },
    {
      accessorKey: "comments",
      header: "Comments",
      cell: ({ row }) => row.original.comments?.toLocaleString() || "0",
    },
    {
      accessorKey: "shares",
      header: "Shares",
      cell: ({ row }) => row.original.shares?.toLocaleString() || "0",
    },
    {
      accessorKey: "engagementRate",
      header: "Engagement Rate",
      cell: ({ row }) => `${row.original.engagementRate || "0"}%`,
    },
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your platform data</CardDescription>
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
                value={selectedBusinessUnit} 
                onValueChange={setSelectedBusinessUnit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business unit" />
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
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select 
                value={selectedCountry} 
                onValueChange={setSelectedCountry}
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
            <CardTitle>Followers Growth</CardTitle>
            <CardDescription>Monthly followers trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={followerData}>
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
                <Line 
                  type="monotone" 
                  dataKey="followers" 
                  name="Followers" 
                  stroke={platformColor} 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Engagement Breakdown</CardTitle>
          <CardDescription>Distribution of engagement types</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementData}
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
                  {engagementData.map((entry, index) => (
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
            
            <div className="flex flex-col justify-center">
              <div className="space-y-4">
                {engagementData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 mr-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat().format(item.value)}
                    </span>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Engagement</span>
                    <span>
                      {new Intl.NumberFormat().format(
                        engagementData.reduce((sum, item) => sum + item.value, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      
      <Tabs defaultValue="metrics">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{platform} Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of {platform} performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={socialMetricsColumns} 
                data={filteredSocialMetrics} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{platform} Engagement</CardTitle>
              <CardDescription>
                Detailed breakdown of {platform} engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={engagementMetricsColumns} 
                data={filteredEngagementMetrics} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 