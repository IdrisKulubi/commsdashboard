"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric, BUSINESS_UNITS, PLATFORMS } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, subDays, startOfYear } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics, getSocialEngagementMetrics } from "@/lib/api";
import { EngagementBreakdown } from "@/components/analytics/engagement-breakdown";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { MetricsChart } from "./metrics-chart";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AnalyticsClientProps {
  initialData: {
    socialMetrics: SocialMetric[];
    websiteMetrics: WebsiteMetric[];
    newsletterMetrics: NewsletterMetric[];
    socialEngagementMetrics: SocialEngagementMetric[];
  };
  platforms?: string[];
  businessUnits?: string[];
  countries?: { code: string; name: string }[];
}

type BusinessUnitType = keyof typeof BUSINESS_UNITS;
type SocialPlatformType = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK";

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

export function AnalyticsClient({ 
  initialData, 
  platforms = Object.values(PLATFORMS).filter(p => p !== "WEBSITE" && p !== "NEWSLETTER"),
  businessUnits = Object.values(BUSINESS_UNITS),
}: AnalyticsClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);
  
  // Filter states
  const [activeRange, setActiveRange] = useState<PredefinedRange>('6m');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    calculateDateRange('6m')
  );
  const [platform, setPlatform] = useState("FACEBOOK");
  const [businessUnit, setBusinessUnit] = useState("ASM");
  
  // Function to handle predefined range selection
  const handlePredefinedRangeSelect = (rangeKey: PredefinedRange) => {
    setActiveRange(rangeKey);
    if (rangeKey !== 'custom') {
      const newRange = calculateDateRange(rangeKey);
      setCustomDateRange(newRange);
      handleFilterChange(newRange); // Trigger data fetch with new range
    }
    // If 'custom', the DatePickerWithRange will handle setting customDateRange and triggering fetch
  };

  // Handle custom date range changes and trigger fetch
  const handleCustomDateChange = (date: DateRange | undefined) => {
    setCustomDateRange(date);
    if (date?.from && date?.to) {
      setActiveRange('custom'); // Set active range to custom
      handleFilterChange(date);
    }
  };

  // Handle filter changes (now accepts the date range directly)
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
      const countryValue = "GLOBAL";
      
      const [socialData, websiteData, newsletterData, engagementData] = await Promise.all([
        getSocialMetrics(
          platform as SocialPlatformType, 
          businessUnit as BusinessUnitType, 
          currentRange.from, 
          currentRange.to,
          countryValue
        ),
        getWebsiteMetrics(
          businessUnit as BusinessUnitType, 
          currentRange.from, 
          currentRange.to,
          countryValue
        ),
        getNewsletterMetrics(
          businessUnit as BusinessUnitType, 
          currentRange.from, 
          currentRange.to,
          countryValue
        ),
        getSocialEngagementMetrics(
          platform as SocialPlatformType, 
          businessUnit as BusinessUnitType, 
          currentRange.from, 
          currentRange.to,
          countryValue
        ),
      ]);
      
      setData({
        socialMetrics: socialData,
        websiteMetrics: websiteData,
        newsletterMetrics: newsletterData,
        socialEngagementMetrics: engagementData,
      });
      
      toast({
        title: "Data updated",
        description: "Analytics data has been refreshed",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error fetching data",
        description: "There was a problem updating the analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
      accessorKey: "businessUnit",
      header: "Business Unit",
    },
    {
      accessorKey: "followers",
      header: "Followers",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.followers || 0),
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.impressions || 0),
    },
    {
      accessorKey: "numberOfPosts",
      header: "Posts",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.numberOfPosts || 0),
    },
  ];
  
  const websiteColumns: ColumnDef<WebsiteMetric>[] = [
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
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.sessions || 0),
    },
  ];
  
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
      accessorKey: "businessUnit",
      header: "Business Unit",
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
      cell: ({ row }) => `${((Number(row.original.engagementRate) || 0) * 100).toFixed(1)}%`,
    },
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your analytics data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-end">
            {/* Date Range Selection */}
            <div className="space-y-2 xl:col-span-2">
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
            
            {/* Business Unit Selection */}
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
            
            {/* Apply Filters Button */}
            <Button 
              onClick={() => handleFilterChange()} // Manually trigger fetch when other filters change 
              disabled={isLoading}
              className="w-full lg:w-auto"
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
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <MetricsChart 
          data={data.socialMetrics} 
          title="Social Media Metrics" 
          dataKey="followers" 
          label="Followers"
        />
        <EngagementBreakdown data={data.socialEngagementMetrics} />
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
                data={data.socialEngagementMetrics} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 