"use client";

import { 
  Users, 
  Eye, 
  MousePointerClick, 
  Mail, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricsCardsProps {
  metrics: {
    totalFollowers: number;
    totalImpressions: number;
    totalWebsiteUsers: number;
    totalNewsletterRecipients: number;
    totalEngagement: number;
    followerGrowth: number;
  };
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalFollowers)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {metrics.followerGrowth > 0 ? (
              <>
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">{metrics.followerGrowth.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">{Math.abs(metrics.followerGrowth).toFixed(1)}%</span>
              </>
            )}
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalImpressions)}</div>
          <p className="text-xs text-muted-foreground">Across all platforms</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Website Users</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalWebsiteUsers)}</div>
          <p className="text-xs text-muted-foreground">Total unique visitors</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalNewsletterRecipients)}</div>
          <p className="text-xs text-muted-foreground">Active subscribers</p>
        </CardContent>
      </Card>
    </>
  );
} 