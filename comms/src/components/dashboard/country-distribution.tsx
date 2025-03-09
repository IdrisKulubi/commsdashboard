"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

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
        const response = await fetch('/api/analytics/country-distribution');
        
        if (!response.ok) {
          throw new Error('Failed to fetch country distribution data');
        }
        
        const countryData = await response.json();
        setData(countryData);
      } catch (error) {
        console.error('Error fetching country distribution:', error);
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
    <Card>
      <CardHeader>
        <CardTitle>Country Distribution</CardTitle>
        <CardDescription>
          Audience distribution by country
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </CardContent>
    </Card>
  );
} 