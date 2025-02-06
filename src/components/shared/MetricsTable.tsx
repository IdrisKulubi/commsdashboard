"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface MetricsTableProps {
  data: Array<{
    date: Date;
    [key: string]: number | Date;
  }>;
  metrics: string[];
  formatValue?: (value: number | Date) => string;

}

export function MetricsTable({
  data,
  metrics,
  formatValue,
}: MetricsTableProps) {
  const defaultFormatValue = (value: number | Date) => {
    if (typeof value === "number") {
      return value.toLocaleString();

    }
    if (value instanceof Date) {
      return format(value, "MMM d, yyyy");
    }
    return String(value);
  };

  const formatter = formatValue || defaultFormatValue;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {metrics.map((metric) => (
              <TableHead key={metric} className="capitalize">
                {metric.replace(/([A-Z])/g, " $1").trim()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{format(row.date, "MMM d, yyyy")}</TableCell>
              {metrics.map((metric) => (
                <TableCell key={metric}>{formatter(row[metric])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
