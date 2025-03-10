"use client";

import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, Mail, FileText } from "lucide-react";

interface OverviewProps {
  metrics: {
    totalFollowers: number;
    totalWebsiteUsers: number;
    totalNewsletterRecipients: number;
    totalPosts: number;
  };
}

export function Overview({ metrics }: OverviewProps) {
  return (
    <Tabs defaultValue="summary" className="space-y-4">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalFollowers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all social platforms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Website Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalWebsiteUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total website visitors
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Newsletter Recipients</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalNewsletterRecipients.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total newsletter subscribers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalPosts.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Content published across platforms
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((metrics.totalFollowers > 0 ? 
                  (metrics.totalPosts / metrics.totalFollowers) * 100 : 0) || 0).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Posts per follower ratio
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Frequency</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.totalPosts / 6) || 0} / month
              </div>
              <p className="text-xs text-muted-foreground">
                Average monthly content
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audience Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.totalFollowers + metrics.totalWebsiteUsers + metrics.totalNewsletterRecipients).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total potential reach
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Channel Distribution</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(metrics).filter(v => v > 0).length} channels
              </div>
              <p className="text-xs text-muted-foreground">
                Active communication channels
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
} 