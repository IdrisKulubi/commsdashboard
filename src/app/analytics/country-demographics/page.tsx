"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountryDistribution } from "@/app/actions/analytics";
import type { CountryData } from "@/app/actions/analytics";

export default function CountryDemographicsPage() {
  const [data, setData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState<"followers" | "websiteUsers" | "newsletterRecipients">("followers");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const countryData = await getCountryDistribution();
        
        if (!countryData || countryData.length === 0) {
          setError("No data available. Please try again later.");
          setData([]);
          return;
        }
        
        // Remove global data for this view if it exists
        const filteredData = countryData.filter(item => item.country !== "Global");
        
        if (filteredData.length === 0) {
          setError("No country-specific data available. Please try again later.");
          setData([]);
        } else {
          setData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching country distribution:', error);
        setError("An error occurred while fetching data. Please try again later.");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const metricOptions = [
    { value: "followers", label: "Followers" },
    { value: "websiteUsers", label: "Website Users" },
    { value: "newsletterRecipients", label: "Newsletter Subscribers" }
  ];

  // Calculate total for percentage (only if we have data)
  const totalValue = data.length > 0 
    ? data.reduce((sum, item) => sum + item[metric], 0)
    : 0;
  
  // Sort data by the selected metric in descending order
  const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);

  return (
    <main className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Link href="/analytics">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Button>
          </Link>
          <div className="flex gap-2">
            {metricOptions.map((option) => (
              <Button 
                key={option.value}
                variant={metric === option.value ? "default" : "outline"}
                size="sm"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setMetric(option.value as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold mb-1">Follower demographics</CardTitle>
                <div className="flex items-center">
                  <Select defaultValue="location">
                    <SelectTrigger className="w-[180px] h-8 text-sm border-dashed">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                      <SelectItem value="gender">Gender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded-full bg-primary mr-1"></span> 
                {metric === "followers" ? "Followers" : 
                 metric === "websiteUsers" ? "Website Users" : "Newsletter Subscribers"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-8 text-center text-muted-foreground">
                {error}
              </div>
            ) : sortedData.length > 0 ? (
              <div className="space-y-3">
                {sortedData.map((item) => {
                  const percentage = totalValue > 0 ? (item[metric] / totalValue) * 100 : 0;
                  return (
                    <div key={item.country} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.country}</span>
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% ({new Intl.NumberFormat().format(item[metric])})
                        </span>
                      </div>
                      <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No country data available. Please try again later.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 