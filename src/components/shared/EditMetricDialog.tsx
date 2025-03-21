/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { SocialMetric, WebsiteMetric, NewsletterMetric } from "@/db/schema";

interface EditMetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SocialMetric | WebsiteMetric | NewsletterMetric | null;
  currentFilters: {
    platform?: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK" | "WEBSITE" | "NEWSLETTER";
    businessUnit: "ASM" | "IACL" | "EM" | "KCL" ;


  };

  onSave: (data: SocialMetric | WebsiteMetric | NewsletterMetric) => Promise<void>;
}

export function EditMetricDialog({
  open,
  onOpenChange,
  data,
  currentFilters,
  onSave,
}: EditMetricDialogProps) {
  const [formData, setFormData] = useState<
    SocialMetric | WebsiteMetric | NewsletterMetric | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        platform: 'platform' in data ? data.platform : currentFilters.platform || "FACEBOOK",
        businessUnit: currentFilters.businessUnit
      });
    } else {
      setFormData(null);
    }
  }, [data, currentFilters]);

  useEffect(() => {
    if (!data && open) {
      onOpenChange(false);
    }
  }, [data, open, onOpenChange]);

  if (!data || !formData) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    // Create a copy of the form data to avoid modifying the original
    const processedData = { ...formData } as any; // Use 'any' to allow adding the type property
    
    // Ensure date is a Date object
    if (typeof processedData.date === 'string') {
      processedData.date = new Date(processedData.date);
    }
    
    // Add type property to help with type discrimination in the server action
    if ('platform' in processedData) {
      processedData.type = 'social';
    } else if ('users' in processedData) {
      processedData.type = 'website';
    } else if ('recipients' in processedData) {
      processedData.type = 'newsletter';
    }
    
    setIsLoading(true);
    try {
      // Use the processed data with the type field
      await onSave(processedData as any);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateValue = () => {
    if ('date' in formData) {
      return format(new Date(formData.date), "yyyy-MM-dd");
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Metric</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {Object.entries(formData).map(([key]) => {
              if (key === "id" || key === "createdAt" || key === "updatedAt") return null;
              
              return (
                <div key={key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={key} className="text-right capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Input
                    id={key}
                    className="col-span-3"
                    value={
                      key === "date" ? getDateValue() : (formData[key as keyof typeof formData] as string) || ""
                    }
                    type={key === "date" ? "date" : "text"}
                    onChange={(e) =>
                      setFormData((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          [key]: e.target.value,
                        };
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 