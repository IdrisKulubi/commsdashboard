"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivityProps {
  className?: string;
}

interface Activity {
  id: number;
  platform: string;
  metric: string;
  value: number;
  change: "increase" | "decrease";
  date: string;
}

export function RecentActivity({ className }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        // Use window.location.origin to get the base URL
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/analytics/recent-activity`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent activity data');
        }
        
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Fallback data
        setActivities([
          {
            id: 1,
            platform: "FACEBOOK",
            metric: "Followers",
            value: 120,
            change: "increase",
            date: "2 days ago"
          },
          {
            id: 2,
            platform: "INSTAGRAM",
            metric: "Engagement",
            value: 45,
            change: "increase",
            date: "3 days ago"
          },
          {
            id: 3,
            platform: "LINKEDIN",
            metric: "Followers",
            value: 32,
            change: "decrease",
            date: "1 day ago"
          },
          {
            id: 4,
            platform: "TIKTOK",
            metric: "Engagement",
            value: 87,
            change: "increase",
            date: "5 days ago"
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentActivity();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "FACEBOOK":
        return <FaFacebook className="h-4 w-4 text-[#1877F2]" />;
      case "INSTAGRAM":
        return <FaInstagram className="h-4 w-4 text-[#E4405F]" />;
      case "LINKEDIN":
        return <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />;
      case "TIKTOK":
        return <FaTiktok className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("col-span-3 transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
        <CardDescription>Latest changes across platforms</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No recent activity found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 group">
                <Avatar className="h-9 w-9 border transition-all group-hover:scale-105">
                  <AvatarFallback className="bg-primary/10">
                    {getPlatformIcon(activity.platform)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.platform}</p>
                    <div className="flex items-center gap-1">
                      {activity.change === "increase" ? (
                        <ArrowUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        activity.change === "increase" ? "text-emerald-500" : "text-red-500"
                      )}>
                        {activity.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.metric} • {activity.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 