"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addWebsiteMetric } from "@/actions/metrics";
import { BUSINESS_UNITS } from "@/db/schema";
import { websiteMetricSchema, type WebsiteMetricFormData } from "@/lib/schemas";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { COUNTRIES } from "@/lib/constants";

interface WebsiteMetricFormProps {
  onSuccess: () => Promise<void>;
}

export function WebsiteMetricForm({ onSuccess }: WebsiteMetricFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<WebsiteMetricFormData>({
    resolver: zodResolver(websiteMetricSchema),
    defaultValues: {
      date: new Date(),
      businessUnit: "ASM",
    },
  });

  async function onSubmit(data: WebsiteMetricFormData) {
    try {
      setIsSubmitting(true);
      console.log("Submitting website metric form data:", data);
      const result = await addWebsiteMetric(data);

      if (result.success) {
        console.log("Website metric added successfully, calling onSuccess");
        toast({
          title: "Website metrics added successfully",
        });
        await onSuccess();
      } else {
        console.error("Failed to add metrics:", result.error);
        toast({
          title: "Failed to add website metrics",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission failed. Full error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast({
        title: "Failed to add website metrics",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            name="businessUnit"
            onValueChange={(value) => form.setValue("businessUnit", value)}
            defaultValue={form.watch("businessUnit")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Business Unit" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BUSINESS_UNITS).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePicker
            label="Week Start Date"
            selected={form.watch("date")}
            onSelect={(date) => form.setValue("date", date)}
          />

          <Input
            type="number"
            placeholder="Users"
            {...form.register("users", { valueAsNumber: true })}
          />

          <Input
            type="number"
            placeholder="Clicks"
            {...form.register("clicks", { valueAsNumber: true })}
          />

          <Input
            type="number"
            placeholder="Sessions"
            {...form.register("sessions", { valueAsNumber: true })}
          />

          <Select
            name="country"
            onValueChange={(value) => form.setValue("country", value)}
            defaultValue={form.watch("country") || "GLOBAL"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COUNTRIES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
              Adding...
            </>
          ) : (
            "Add Website Metrics"
          )}
        </Button>
      </form>
    </Form>
  );
}
