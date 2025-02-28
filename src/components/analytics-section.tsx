"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonChart } from "@/components/shared/ComparisonChart";
import { MetricsTable } from "@/components/shared/MetricsTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";

interface AnalyticsSectionProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
}

export function AnalyticsSection<T>({
  title,
  data,
  columns,
  className,
}: AnalyticsSectionProps<T>) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <ViewToggle view={view} onViewChange={setView} />
      </CardHeader>
      <CardContent>
        {view === "chart" ? (
          <div className="h-[400px]">
            <ComparisonChart
              title=""
              data={data}
              metrics={columns.filter(c => c.id !== 'date').map(c => c.id as string)}
            />
          </div>
        ) : (
          <MetricsTable
            data={data}
            columns={columns}
            className="border-none shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
} 