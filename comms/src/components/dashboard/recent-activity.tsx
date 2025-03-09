"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";

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
        // Fetch the most recent social metrics and engagement data
        const response = await fetch('/api/analytics/recent-activity');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent activity data');
        }
        
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
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
    <Card className={cn("col-span-3", className)}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest changes across platforms</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recent activity found</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
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