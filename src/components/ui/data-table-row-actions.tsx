"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Edit, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteMetric } from "@/lib/actions/metrics"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  metricType: 'social' | 'website' | 'newsletter' | 'engagement'
  onEdit?: (row: Row<TData>) => void
  onDelete?: (id: number) => void
}

export function DataTableRowActions<TData>({
  row,
  metricType,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      // Access the ID from the row's original data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (row.original as any).id

      if (!id) {
        throw new Error("Row has no ID")
      }

      const result = await deleteMetric(id, metricType)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete metric")
      }
      
      setIsDeleteDialogOpen(false)
      toast({
        title: "Metric deleted",
        description: "The metric has been successfully deleted.",
      })
      
      // Update the parent component's state if onDelete is provided
      if (onDelete) {
        onDelete(id);
      } else {
        // Fallback to reload if no handler provided
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting metric:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete the metric. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this metric? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 