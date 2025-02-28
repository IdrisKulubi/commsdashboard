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
    businessUnit: "ASM" | "IACL" | "EM";


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
    SocialMetric | WebsiteMetric | NewsletterMetric
  >(data!);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        platform: currentFilters.platform || (data as SocialMetric).platform,
        businessUnit: currentFilters.businessUnit
      });
    }
  }, [data, currentFilters]);

  if (!data) {
    onOpenChange(false);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsLoading(true);
    try {
      await onSave(formData as SocialMetric | WebsiteMetric | NewsletterMetric);
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
            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {Object.entries(data || {}).map(([key, value]) => {
              if (key === "id") return null;
              
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
                      setFormData((prev: SocialMetric | WebsiteMetric | NewsletterMetric) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
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