"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";

interface PlatformBreakdownProps {
  className?: string;
}

interface PlatformData {
  name: string;
  value: number;
  color: string;
}

export function PlatformBreakdown({ className }: PlatformBreakdownProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<PlatformData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setMounted(true);
    
    async function fetchPlatformData() {
      try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/analytics/platform-breakdown`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch platform breakdown data');
        }
        
        const platformData = await response.json();
        setData(platformData);
      } catch (error) {
        console.error('Error fetching platform breakdown:', error);
        // Fallback data
        setData([
          { name: "Facebook", value: 40, color: "#1877F2" },
          { name: "Instagram", value: 30, color: "#E4405F" },
          { name: "LinkedIn", value: 20, color: "#0A66C2" },
          { name: "TikTok", value: 10, color: "#000000" }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlatformData();
  }, []);

  if (!mounted) {
    return null;
  }

  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Facebook":
        return <FaFacebook className="h-4 w-4 text-[#1877F2]" />;
      case "Instagram":
        return <FaInstagram className="h-4 w-4 text-[#E4405F]" />;
      case "LinkedIn":
        return <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />;
      case "TikTok":
        return <FaTiktok className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("col-span-3 transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Platform Breakdown</CardTitle>
        <CardDescription>
          Follower distribution across platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {data.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {renderPlatformIcon(platform.name)}
                    <span className="ml-2 text-sm font-medium">{platform.name}</span>
                  </div>
                  <div className="text-sm font-medium">{platform.value}%</div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 