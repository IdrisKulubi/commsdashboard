"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { getCountryDistribution } from "@/app/actions/analytics";
import type { CountryData } from "@/app/actions/analytics";

export function CountryDistribution() {
  const [data, setData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const countryData = await getCountryDistribution();
        
        if (!countryData || countryData.length === 0) {
          setError("No data available");
          setData([]);
        } else {
          setData(countryData);
        }
      } catch (err) {
        console.error('Error fetching country distribution:', err);
        setError("Error loading data");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Country Distribution</CardTitle>
            <CardDescription>
              Audience distribution by country
            </CardDescription>
          </div>
          <Link href="/analytics/country-demographics">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              View Demographics
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-muted-foreground">
            {error}
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </CardContent>
    </Card>
  );
} 