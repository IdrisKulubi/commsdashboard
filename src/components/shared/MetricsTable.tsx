"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { EditMetricDialog } from "./EditMetricDialog";
import { SocialMetric, WebsiteMetric, NewsletterMetric } from "@/db/schema";

interface MetricsTableProps<T> {
  data: T[];
  columns?: ColumnDef<T>[];
  className?: string;
  onEdit?: (row: T) => Promise<void>;
  metrics?: string[];
  formatValue?: (value: number | Date) => string;
}

export function MetricsTable<T>({
  data,
  columns: propColumns,
  className,
  onEdit,
  metrics,
  formatValue,
}: MetricsTableProps<T>) {
  const [editingRow, setEditingRow] = useState<T | null>(null);

  const generatedColumns: ColumnDef<T>[] = metrics ? metrics.map(metric => ({
    accessorKey: metric,
    header: metric.replace(/([A-Z])/g, ' $1').trim(),
    cell: ({ row }) => {
      const value = row.original[metric as keyof T];
      return formatValue ? formatValue(value as number | Date) : String(value);
    }
  })) : propColumns || [];

  const allColumns = [
    ...generatedColumns,
    {
      id: "actions",
      cell: ({ row }: { row: { original: T } }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingRow(row.original)}
          className="hover:bg-accent"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className={className}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="capitalize">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditMetricDialog
        open={!!editingRow}
        onOpenChange={(open) => !open && setEditingRow(null)}
        data={editingRow as SocialMetric | WebsiteMetric | NewsletterMetric | null}
        onSave={async (updatedData) => {
          if (onEdit) {
            await onEdit(updatedData as T);
          }
          setEditingRow(null);
        } } currentFilters={{
          platform: undefined,
          businessUnit: "ASM"
        }}      />
    </>
  );
}
