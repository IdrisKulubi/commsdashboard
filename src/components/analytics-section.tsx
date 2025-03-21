/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonChart, MetricData } from "@/components/shared/ComparisonChart";
import { MetricsTable } from "@/components/shared/MetricsTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useState } from "react";
import { ColumnDef, AccessorColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsSectionProps<T extends MetricData> {
  title: string;
  data: T[];
  columns: (ColumnDef<T> | AccessorColumnDef<T>)[];
  className?: string;
  onEdit: (metric: T) => Promise<void>;
}

export function AnalyticsSection<T extends MetricData>({
  title,
  data,
  columns,
  className,
  onEdit,
}: AnalyticsSectionProps<T>) {
  const [view, setView] = useState<"table" | "chart">("table");
  const toast = useToast();
  const handleEdit = async (updatedData: T) => {
    try {
      const response = await fetch("/api/metrics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update metric");

      toast.toast({
        title: "Success",
        description: "Metric updated successfully",
      });
    } catch (error) {
      console.error("Error updating metric:", error);
      toast.toast({
        description: "Failed to update metric",
        variant: "destructive",
      });
    }
  };

 

  const hasNumericData = data.some(item =>
    Object.values(item).some(value => typeof value === 'number')
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <ViewToggle view={view} onViewChange={setView} />
      </CardHeader>
      <CardContent>
        {view === "table" ? (
          <MetricsTable data={data} columns={columns} onEdit={onEdit} />
        ) : (
          <ComparisonChart
            title={title}
            data={data}
            metrics={columns
              .reduce<string[]>((acc, col) => {
                if ('accessorKey' in col && col.accessorKey !== 'date' && col.accessorKey != null) {
                  acc.push(col.accessorKey as string); // Explicitly assert as string
                }
                return acc;
              }, [])}
          />
        )}
      </CardContent>
    </Card>
  );
} 