"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialMetric, WebsiteMetric, NewsletterMetric } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, MessageSquare, Globe, Mail } from "lucide-react";
import { getSocialMetrics, getWebsiteMetrics, getNewsletterMetrics } from "@/lib/actions/metrics";

// Define the columns for the social metrics table
const socialMetricsColumns: ColumnDef<SocialMetric>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.original.platform;
      return (
        <div className="flex items-center gap-2">
          {platform === "FACEBOOK" && <Facebook className="h-4 w-4 text-[#1877F2]" />}
          {platform === "INSTAGRAM" && <Instagram className="h-4 w-4 text-[#E4405F]" />}
          {platform === "LINKEDIN" && <Linkedin className="h-4 w-4 text-[#0A66C2]" />}
          {platform === "TIKTOK" && <MessageSquare className="h-4 w-4 text-black" />}
          <span>{platform}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "businessUnit",
    header: "Business Unit",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.businessUnit}</Badge>
    ),
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

// Define the columns for the website metrics table
const websiteMetricsColumns: ColumnDef<WebsiteMetric>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
  },
  {
    accessorKey: "businessUnit",
    header: "Business Unit",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.businessUnit}</Badge>
    ),
  },
  {
    accessorKey: "users",
    header: "Users",
    cell: ({ row }) => row.original.users?.toLocaleString() || "0",
  },
  {
    accessorKey: "sessions",
    header: "Sessions",
    cell: ({ row }) => row.original.sessions?.toLocaleString() || "0",
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
    cell: ({ row }) => row.original.clicks?.toLocaleString() || "0",
  },
];

// Define the columns for the newsletter metrics table
const newsletterMetricsColumns: ColumnDef<NewsletterMetric>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
  },
  {
    accessorKey: "businessUnit",
    header: "Business Unit",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.businessUnit}</Badge>
    ),
  },
  {
    accessorKey: "recipients",
    header: "Recipients",
    cell: ({ row }) => row.original.recipients?.toLocaleString() || "0",
  },
  {
    accessorKey: "openRate",
    header: "Open Rate",
    cell: ({ row }) => `${row.original.openRate || "0"}%`,
  },
  {
    accessorKey: "numberOfEmails",
    header: "Emails Sent",
    cell: ({ row }) => row.original.numberOfEmails?.toLocaleString() || "0",
  },
];

export function RecentMetrics() {
  const [socialMetrics, setSocialMetrics] = useState<SocialMetric[]>([]);
  const [websiteMetrics, setWebsiteMetrics] = useState<WebsiteMetric[]>([]);
  const [newsletterMetrics, setNewsletterMetrics] = useState<NewsletterMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentMetrics() {
      try {
        setIsLoading(true);
        
        // Get the date range for the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        // Use server actions instead of API routes
        const [socialData, websiteData, newsletterData] = await Promise.all([
          // Fetch social metrics for all platforms and business units
          Promise.all([
            getSocialMetrics("FACEBOOK", "ASM", startDate, endDate),
            getSocialMetrics("FACEBOOK", "IACL", startDate, endDate),
            getSocialMetrics("FACEBOOK", "EM", startDate, endDate),
            getSocialMetrics("INSTAGRAM", "ASM", startDate, endDate),
            getSocialMetrics("INSTAGRAM", "IACL", startDate, endDate),
            getSocialMetrics("INSTAGRAM", "EM", startDate, endDate),
            getSocialMetrics("LINKEDIN", "ASM", startDate, endDate),
            getSocialMetrics("LINKEDIN", "IACL", startDate, endDate),
            getSocialMetrics("LINKEDIN", "EM", startDate, endDate),
            getSocialMetrics("TIKTOK", "ASM", startDate, endDate),
            getSocialMetrics("TIKTOK", "IACL", startDate, endDate),
            getSocialMetrics("TIKTOK", "EM", startDate, endDate),
          ]).then(results => results.flat()),
          
          // Fetch website metrics for all business units
          Promise.all([
            getWebsiteMetrics("ASM", startDate, endDate),
            getWebsiteMetrics("IACL", startDate, endDate),
            getWebsiteMetrics("EM", startDate, endDate),
          ]).then(results => results.flat()),
          
          // Fetch newsletter metrics for all business units
          Promise.all([
            getNewsletterMetrics("ASM", startDate, endDate),
            getNewsletterMetrics("IACL", startDate, endDate),
            getNewsletterMetrics("EM", startDate, endDate),
          ]).then(results => results.flat()),
        ]);
        
        // Sort by date (most recent first)
        setSocialMetrics(socialData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 50));
        
        setWebsiteMetrics(websiteData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 50));
        
        setNewsletterMetrics(newsletterData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 50));
        
        console.log(`Fetched ${socialData.length} social metrics, ${websiteData.length} website metrics, and ${newsletterData.length} newsletter metrics`);
      } catch (error) {
        console.error("Error fetching recent metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecentMetrics();
  }, []);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Metrics</CardTitle>
        <CardDescription>
          Latest metrics from the past 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="social">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Loading social metrics...</p>
              </div>
            ) : socialMetrics.length > 0 ? (
              <DataTable 
                columns={socialMetricsColumns} 
                data={socialMetrics} 
              />
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">No recent social metrics found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="website" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Loading website metrics...</p>
              </div>
            ) : websiteMetrics.length > 0 ? (
              <DataTable 
                columns={websiteMetricsColumns} 
                data={websiteMetrics} 
              />
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">No recent website metrics found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="newsletter" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Loading newsletter metrics...</p>
              </div>
            ) : newsletterMetrics.length > 0 ? (
              <DataTable 
                columns={newsletterMetricsColumns} 
                data={newsletterMetrics} 
              />
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">No recent newsletter metrics found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}