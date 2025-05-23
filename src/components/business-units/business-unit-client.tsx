/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, subDays, startOfYear } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics, getSocialEngagementMetrics } from "@/lib/api";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
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
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Add the PredefinedRange type and function to calculate date range
type PredefinedRange = '7d' | '30d' | '90d' | '6m' | 'ytd' | 'custom';

const predefinedRanges: { label: string; value: PredefinedRange }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 6 months", value: "6m" },
  { label: "Year to date", value: "ytd" },
  { label: "Custom Range", value: "custom" },
];

function calculateDateRange(rangeKey: PredefinedRange): DateRange | undefined {
  const endDate = new Date();
  switch (rangeKey) {
    case '7d':
      return { from: subDays(endDate, 6), to: endDate };
    case '30d':
      return { from: subDays(endDate, 29), to: endDate };
    case '90d':
      return { from: subDays(endDate, 89), to: endDate };
    case '6m':
      const sixMonthsAgo = new Date(endDate);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return { from: sixMonthsAgo, to: endDate };
    case 'ytd':
      return { from: startOfYear(endDate), to: endDate };
    default:
      return undefined;
  }
}

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
  
  // Update filter states with new date range approach
  const [activeRange, setActiveRange] = useState<PredefinedRange>('6m');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    calculateDateRange('6m')
  );
  const [platform, setPlatform] = useState(platforms[0]);
  const [country, setCountry] = useState("GLOBAL");
  
  // Edit states
  const [editingMetric, setEditingMetric] = useState<any>(null);
  const [editingMetricType, setEditingMetricType] = useState<'social' | 'website' | 'newsletter' | 'engagement' | null>(null);
  
  // Function to handle predefined range selection
  const handlePredefinedRangeSelect = (rangeKey: PredefinedRange) => {
    setActiveRange(rangeKey);
    if (rangeKey !== 'custom') {
      const newRange = calculateDateRange(rangeKey);
      setCustomDateRange(newRange);
      handleFilterChange(newRange); // Trigger data fetch with new range
    }
  };

  // Handle custom date range changes and trigger fetch
  const handleCustomDateChange = (date: DateRange | undefined) => {
    setCustomDateRange(date);
    if (date?.from && date?.to) {
      setActiveRange('custom'); // Set active range to custom
      handleFilterChange(date);
    }
  };
  
  // Handle metric deletion
  const handleMetricDeleted = (id: number, type: 'social' | 'website' | 'newsletter' | 'engagement') => {
    try {
      if (!id) {
        console.error("Cannot delete: Invalid ID provided");
        return;
      }
      
      // Update the UI state to remove the deleted metric
      setData(prevData => {
        const newData = { ...prevData };
        
        switch (type) {
          case 'social':
            newData.socialMetrics = newData.socialMetrics.filter(metric => metric.id !== id);
            break;
          case 'website':
            newData.websiteMetrics = newData.websiteMetrics.filter(metric => metric.id !== id);
            break;
          case 'newsletter':
            newData.newsletterMetrics = newData.newsletterMetrics.filter(metric => metric.id !== id);
            break;
          case 'engagement':
            newData.engagementMetrics = newData.engagementMetrics.filter(metric => metric.id !== id);
            break;
        }
        
        // Update chart data after removing the metric
        return newData;
      });
      
      // Recalculate the chart data
      setTimeout(() => {
        // This forces the charts to re-render with the updated data
        setData(currentData => ({ ...currentData }));
      }, 100);
    } catch (error) {
      console.error("Error updating state after deletion:", error);
      toast({
        title: "UI Update Error",
        description: "The metric was deleted but the UI couldn't be updated. Please refresh the page.",
        variant: "destructive",
      });
    }
  };
  
  // Handle metric update
  const handleMetricUpdated = (updatedMetric: any) => {
    setData(prevData => {
      const newData = { ...prevData };
      
      if ('platform' in updatedMetric && 'followers' in updatedMetric) {
        // Social metric
        newData.socialMetrics = newData.socialMetrics.map(metric => 
          metric.id === updatedMetric.id ? updatedMetric : metric
        );
      } else if ('users' in updatedMetric) {
        // Website metric
        newData.websiteMetrics = newData.websiteMetrics.map(metric => 
          metric.id === updatedMetric.id ? updatedMetric : metric
        );
      } else if ('recipients' in updatedMetric) {
        // Newsletter metric
        newData.newsletterMetrics = newData.newsletterMetrics.map(metric => 
          metric.id === updatedMetric.id ? updatedMetric : metric
        );
      } else if ('likes' in updatedMetric || 'engagementRate' in updatedMetric) {
        // Engagement metric
        newData.engagementMetrics = newData.engagementMetrics.map(metric => 
          metric.id === updatedMetric.id ? updatedMetric : metric
        );
      }
      
      return newData;
    });
  };
  
  // Update filter change handler to accept date range parameter
  const handleFilterChange = async (rangeToUse?: DateRange) => {
    const currentRange = rangeToUse || customDateRange;
    
    if (!currentRange?.from || !currentRange?.to) {
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
          currentRange.from,
          currentRange.to,
          country
        ),
        getWebsiteMetrics(
          businessUnit as any,
          currentRange.from,
          currentRange.to,
          country
        ),
        getNewsletterMetrics(
          businessUnit as any,
          currentRange.from,
          currentRange.to,
          country
        ),
        getSocialEngagementMetrics(
          platform as any,
          businessUnit as any,
          currentRange.from,
          currentRange.to
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
  
  // // Calculate totals
  // const totalFollowers = data.socialMetrics.reduce((sum, metric) => sum + (metric.followers || 0), 0);
  // const totalImpressions = data.socialMetrics.reduce((sum, metric) => sum + (metric.impressions || 0), 0);
  // const totalWebsiteUsers = data.websiteMetrics.reduce((sum, metric) => sum + (metric.users || 0), 0);
  // const totalNewsletterRecipients = data.newsletterMetrics.reduce((sum, metric) => sum + (metric.recipients || 0), 0);
  
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
          onDelete={(id) => handleMetricDeleted(id, 'social')}
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
          onDelete={(id) => handleMetricDeleted(id, 'website')}
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
          onDelete={(id) => handleMetricDeleted(id, 'newsletter')}
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
          onDelete={(id) => handleMetricDeleted(id, 'engagement')}
        />
      ),
    },
  ];
  
  // // Format number for display
  // const formatNumber = (num: number) => {
  //   if (num >= 1000000) {
  //     return (num / 1000000).toFixed(1) + 'M';
  //   } else if (num >= 1000) {
  //     return (num / 1000).toFixed(1) + 'K';
  //   }
  //   return num.toString();
  // };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your business unit data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-end">
            {/* Date Range Selection */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {predefinedRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={activeRange === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePredefinedRangeSelect(range.value)}
                    className="flex-grow sm:flex-grow-0"
                  >
                    {range.label}
                  </Button>
                ))}
                {activeRange === 'custom' && (
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button
                         id="date"
                         variant={"outline"}
                         size="sm"
                         className={cn(
                           "w-[240px] justify-start text-left font-normal",
                           !customDateRange && "text-muted-foreground"
                         )}
                       >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                         {customDateRange?.from ? (
                           customDateRange.to ? (
                             <>
                               {format(customDateRange.from, "LLL dd, y")} -{" "}
                               {format(customDateRange.to, "LLL dd, y")}
                             </>
                           ) : (
                             format(customDateRange.from, "LLL dd, y")
                           )
                         ) : (
                           <span>Pick a date range</span>
                         )}
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0" align="start">
                       <Calendar
                         initialFocus
                         mode="range"
                         defaultMonth={customDateRange?.from}
                         selected={customDateRange}
                         onSelect={handleCustomDateChange}
                         numberOfMonths={2}
                       />
                     </PopoverContent>
                   </Popover>
                )}
              </div>
            </div>
            
            {/* Platform Selection */}
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
            
            {/* Country Selection */}
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
          
          {/* Apply Filters Button */}
          <Button 
            onClick={() => handleFilterChange()} 
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
      
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div> */}
      
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
          onUpdate={handleMetricUpdated}
        />
      )}
    </div>
  );
} 