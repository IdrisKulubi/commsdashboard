"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, Mail, Share2 } from "lucide-react";

interface MetricsOverviewProps {
  totalFollowers: number;
  totalWebsiteUsers: number;
  totalNewsletterRecipients: number;
  totalPosts: number;
}

export function MetricsOverview({ 
  totalFollowers, 
  totalWebsiteUsers, 
  totalNewsletterRecipients, 
  totalPosts 
}: MetricsOverviewProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all platforms</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Website Users</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWebsiteUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Monthly active users</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNewsletterRecipients.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Active subscribers</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all platforms</p>
        </CardContent>
      </Card>
    </>
  );
} 