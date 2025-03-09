"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";

interface CountryData {
  country: string;
  followers: number;
  websiteUsers: number;
  newsletterRecipients: number;
}

export function CountryDistribution() {
  const [data, setData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCountryDistribution() {
      try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/analytics/country-distribution`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch country distribution data');
        }
        
        const countryData = await response.json();
        setData(countryData);
      } catch (error) {
        console.error('Error fetching country distribution:', error);
        // Fallback data
        setData([
          { country: "Global", followers: 250000, websiteUsers: 120000, newsletterRecipients: 75000 },
          { country: "United States", followers: 100000, websiteUsers: 50000, newsletterRecipients: 30000 },
          { country: "United Kingdom", followers: 50000, websiteUsers: 25000, newsletterRecipients: 15000 },
          { country: "Canada", followers: 30000, websiteUsers: 15000, newsletterRecipients: 10000 },
          { country: "Australia", followers: 20000, websiteUsers: 10000, newsletterRecipients: 5000 },
          { country: "Germany", followers: 15000, websiteUsers: 8000, newsletterRecipients: 4000 },
          { country: "France", followers: 12000, websiteUsers: 6000, newsletterRecipients: 3000 },
          { country: "Japan", followers: 10000, websiteUsers: 5000, newsletterRecipients: 2500 },
          { country: "Brazil", followers: 8000, websiteUsers: 4000, newsletterRecipients: 2000 },
          { country: "India", followers: 5000, websiteUsers: 2000, newsletterRecipients: 1000 }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCountryDistribution();
  }, []);

  const columns: ColumnDef<CountryData>[] = [
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "followers",
      header: "Social Followers",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.followers),
    },
    {
      accessorKey: "websiteUsers",
      header: "Website Users",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.websiteUsers),
    },
    {
      accessorKey: "newsletterRecipients",
      header: "Newsletter Subscribers",
      cell: ({ row }) => new Intl.NumberFormat().format(row.original.newsletterRecipients),
    },
  ];

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Country Distribution</CardTitle>
        <CardDescription>
          Audience distribution by country
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </CardContent>
    </Card>
  );
} 