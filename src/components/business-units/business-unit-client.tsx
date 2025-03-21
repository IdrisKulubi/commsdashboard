/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics, getSocialEngagementMetrics } from "@/lib/api";
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
  AreaChart,
  Area,
} from "recharts";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { EditMetricDialog } from "@/components/ui/edit-metric-dialog";

interface BusinessUnitClientProps {
  businessUnit: string;
  initialData: {
    socialMetrics: SocialMetric[];
    websiteMetrics: WebsiteMetric[];
    newsletterMetrics: NewsletterMetric[];
    engagementMetrics: SocialEngagementMetric[];
  };
  platforms: string[];
  countries: { code: string; name: string }[];
}

export function BusinessUnitClient({
  businessUnit,
  initialData,
  platforms,
  countries,
}: BusinessUnitClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });
  const [platform, setPlatform] = useState(platforms[0]);
  const [country, setCountry] = useState("GLOBAL");
  
  // Edit states
  const [editingMetric, setEditingMetric] = useState<any>(null);
  const [editingMetricType, setEditingMetricType] = useState<'social' | 'website' | 'newsletter' | 'engagement' | null>(null);
  
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
      // Fetch data for the selected platform
      const [socialData, websiteData, newsletterData, engagementData] = await Promise.all([
        getSocialMetrics(
          platform as any,
          businessUnit as any,
          dateRange.from,
          dateRange.to,
          country
        ),
        getWebsiteMetrics(
          businessUnit as any,
          dateRange.from,
          dateRange.to,
          country
        ),
        getNewsletterMetrics(
          businessUnit as any,
          dateRange.from,
          dateRange.to,
          country
        ),
        getSocialEngagementMetrics(
          platform as any,
          businessUnit as any,
          dateRange.from,
          dateRange.to
        ),
      ]);
      
      setData({
        socialMetrics: socialData,
        websiteMetrics: websiteData,
        newsletterMetrics: newsletterData,
        engagementMetrics: engagementData,
      });
      
      toast({
        title: "Data updated",
        description: "Business unit data has been refreshed",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error fetching data",
        description: "There was a problem updating the business unit data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process data for charts
  const processMonthlyData = (metrics: any[], dataKey: string) => {
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
  
  // Process platform distribution data
  const processPlatformDistribution = (metrics: SocialMetric[]) => {
    const platformData: Record<string, number> = {};
    
    metrics.forEach(metric => {
      if (!platformData[metric.platform]) {
        platformData[metric.platform] = 0;
      }
      
      if (metric.followers !== null && metric.followers !== undefined) {
        platformData[metric.platform] += metric.followers;
      }
    });
    
    return Object.entries(platformData).map(([platform, followers]) => ({
      name: platform,
      value: followers,
      color: getPlatformColor(platform),
    }));
  };
  
  // Get platform color
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "FACEBOOK":
        return "#1877F2";
      case "INSTAGRAM":
        return "#E4405F";
      case "LINKEDIN":
        return "#0A66C2";
      case "TIKTOK":
        return "#000000";
      default:
        return "#8884d8";
    }
  };
  
  // Prepare chart data
  const followersData = processMonthlyData(data.socialMetrics, "followers");
  const websiteUsersData = processMonthlyData(data.websiteMetrics, "users");
  const newsletterRecipientsData = processMonthlyData(data.newsletterMetrics, "recipients");
  const platformDistribution = processPlatformDistribution(data.socialMetrics);
  
  // Calculate totals
  const totalFollowers = data.socialMetrics.reduce((sum, metric) => sum + (metric.followers || 0), 0);
  const totalImpressions = data.socialMetrics.reduce((sum, metric) => sum + (metric.impressions || 0), 0);
  const totalWebsiteUsers = data.websiteMetrics.reduce((sum, metric) => sum + (metric.users || 0), 0);
  const totalNewsletterRecipients = data.newsletterMetrics.reduce((sum, metric) => sum + (metric.recipients || 0), 0);
  
  // Define table columns
  const socialColumns: ColumnDef<SocialMetric>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
    },
    {
      accessorKey: "platform",
      header: "Platform",
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "followers",
      header: "Followers",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.followers || 0),
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }) => row.original.impressions?.toLocaleString() || "0",
    },
    {
      accessorKey: "numberOfPosts",
      header: "Posts",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.numberOfPosts || 0),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          metricType="social"
          onEdit={(row) => {
            setEditingMetric(row.original);
            setEditingMetricType('social');
          }}
        />
      ),
    },
  ];
  
  const websiteColumns: ColumnDef<WebsiteMetric>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
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
            setEditingMetricType('website');
          }}
        />
      ),
    },
  ];
  
  const newsletterColumns: ColumnDef<NewsletterMetric>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
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
      cell: ({ row }) => `${(Number(row.original.openRate || 0) * 100).toFixed(2)}%`,
    },
    {
      accessorKey: "numberOfEmails",
      header: "Emails Sent",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.numberOfEmails || 0),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          metricType="newsletter"
          onEdit={(row) => {
            setEditingMetric(row.original);
            setEditingMetricType('newsletter');
          }}
        />
      ),
    },
  ];
  
  const engagementColumns: ColumnDef<SocialEngagementMetric>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
    },
    {
      accessorKey: "platform",
      header: "Platform",
    },
    {
      accessorKey: "likes",
      header: "Likes",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.likes || 0),
    },
    {
      accessorKey: "comments",
      header: "Comments",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.comments || 0),
    },
    {
      accessorKey: "shares",
      header: "Shares",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.shares || 0),
    },
    {
      accessorKey: "engagementRate",
      header: "Engagement Rate",
      cell: ({ row }) => `${Number(row.original.engagementRate || 0).toFixed(2)}%`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          metricType="engagement"
          onEdit={(row) => {
            setEditingMetric(row.original);
            setEditingMetricType('engagement');
          }}
        />
      ),
    },
  ];
  
  // Format number for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your business unit data</CardDescription>
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
              <label className="text-sm font-medium">Platform</label>
              <Select 
                value={platform} 
                onValueChange={setPlatform}
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalFollowers)}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalImpressions)}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalWebsiteUsers)}</div>
            <p className="text-xs text-muted-foreground">Total unique visitors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalNewsletterRecipients)}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Followers Growth</CardTitle>
            <CardDescription>Monthly followers trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={followersData}>
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Followers by platform</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDistribution}
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
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [
                    new Intl.NumberFormat().format(value as number),
                    "Followers"
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Website Users</CardTitle>
            <CardDescription>Monthly website users trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={websiteUsersData}>
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
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Recipients</CardTitle>
            <CardDescription>Monthly newsletter recipients trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newsletterRecipientsData}>
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
                <Line 
                  type="monotone" 
                  dataKey="recipients" 
                  name="Recipients" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="social">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="social" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of social media performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={socialColumns} 
                data={data.socialMetrics} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="website" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of website performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={websiteColumns} 
                data={data.websiteMetrics} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="newsletter" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of newsletter performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={newsletterColumns} 
                data={data.newsletterMetrics} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of social media engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={engagementColumns} 
                data={data.engagementMetrics} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Dialog */}
      {editingMetric && editingMetricType && (
        <EditMetricDialog
          isOpen={Boolean(editingMetric)}
          onClose={() => {
            setEditingMetric(null);
            setEditingMetricType(null);
          }}
          metric={editingMetric}
          metricType={editingMetricType}
        />
      )}
    </div>
  );
} 