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
import { addNewsletterMetric } from "@/actions/metrics";
import { BUSINESS_UNITS } from "@/db/schema";
import {
  newsletterMetricSchema,
  type NewsletterMetricFormData,
} from "@/lib/schemas";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";

interface NewsletterMetricFormProps {
  onSuccess: () => Promise<void>;
}

export function NewsletterMetricForm({ onSuccess }: NewsletterMetricFormProps) {
  const { toast } = useToast();
  const form = useForm<NewsletterMetricFormData>({
    resolver: zodResolver(newsletterMetricSchema),
    defaultValues: {
      date: new Date(),
      businessUnit: "ASM",
    },
  });

  async function onSubmit(data: NewsletterMetricFormData) {
    try {
      await addNewsletterMetric(data);
      await onSuccess();
      toast({
        title: "Newsletter metrics added successfully",
      });
    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        title: "Failed to add newsletter metrics",
      });
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
            placeholder="Recipients"
            {...form.register("recipients", { valueAsNumber: true })}
          />

          <Input
            type="number"
            placeholder="Open Rate (%)"
            {...form.register("openRate", {
              valueAsNumber: true,
              setValueAs: (v) => (v ? Number(v) / 100 : undefined),
            })}
          />

          <Input
            type="number"
            placeholder="Number of Emails"
            {...form.register("numberOfEmails", { valueAsNumber: true })}
          />
        </div>

        <Button type="submit" className="w-full">
          Add Newsletter Metrics
        </Button>
      </form>
    </Form>
  );
}
