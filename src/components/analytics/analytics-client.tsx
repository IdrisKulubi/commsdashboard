"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric, BUSINESS_UNITS } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics, getSocialEngagementMetrics } from "@/lib/api";
import { EngagementBreakdown } from "@/components/analytics/engagement-breakdown";
import { Loader2 } from "lucide-react";
import { MetricsChart } from "./metrics-chart";

interface AnalyticsClientProps {
  initialData: {
    socialMetrics: SocialMetric[];
    websiteMetrics: WebsiteMetric[];
    newsletterMetrics: NewsletterMetric[];
    socialEngagementMetrics: SocialEngagementMetric[];
  };
  platforms: string[];
  businessUnits: string[];
  countries: { code: string; name: string }[];
}

// Define platform and business unit types using the imported constants
type BusinessUnitType = keyof typeof BUSINESS_UNITS;
type SocialPlatformType = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK";

export function AnalyticsClient({ 
  initialData, 
  platforms, 
  businessUnits, 
  countries 
}: AnalyticsClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });
  const [platform, setPlatform] = useState("FACEBOOK");
  const [businessUnit, setBusinessUnit] = useState("ASM");
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
      const [socialData, websiteData, newsletterData, engagementData] = await Promise.all([
        getSocialMetrics(
          platform as SocialPlatformType, 
          businessUnit as BusinessUnitType, 
          dateRange.from, 
          dateRange.to,
          country
        ),
        getWebsiteMetrics(
          businessUnit as BusinessUnitType, 
          dateRange.from, 
          dateRange.to,
          country
        ),
        getNewsletterMetrics(
          businessUnit as BusinessUnitType, 
          dateRange.from, 
          dateRange.to,
          country
        ),
        getSocialEngagementMetrics(
          platform as SocialPlatformType, 
          businessUnit as BusinessUnitType, 
          dateRange.from, 
          dateRange.to,
          country
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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