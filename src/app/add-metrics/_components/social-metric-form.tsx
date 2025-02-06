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
import { addSocialMetric } from "@/actions/metrics";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { socialMetricSchema, type SocialMetricFormData } from "@/lib/schemas";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";

interface SocialMetricFormProps {
  onSuccess: () => Promise<void>;
}

export function SocialMetricForm({ onSuccess }: SocialMetricFormProps) {
  const { toast } = useToast();
  const form = useForm<SocialMetricFormData>({
    resolver: zodResolver(socialMetricSchema),
    defaultValues: {
      date: new Date(),
      platform: "FACEBOOK",
      businessUnit: "ASM",
    },
  });

  async function onSubmit(data: SocialMetricFormData) {
    try {
      console.log("Submitting social metric form data:", data);
      await addSocialMetric(data);
      console.log("Social metric added successfully, calling onSuccess");
      await onSuccess();
      toast({
        title: "Social metrics added successfully",
      });
    } catch (error) {
      console.error("Form submission failed. Full error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast({
        title: "Failed to add social metrics",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            name="platform"
            onValueChange={(value) => form.setValue("platform", value)}
            defaultValue={form.watch("platform")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PLATFORMS).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            placeholder="Impressions"
            {...form.register("impressions", { valueAsNumber: true })}
          />

          <Input
            type="number"
            placeholder="Followers"
            {...form.register("followers", { valueAsNumber: true })}
          />

          <Input
            type="number"
            placeholder="Number of Posts"
            {...form.register("numberOfPosts", { valueAsNumber: true })}
          />
        </div>

        <Button type="submit" className="w-full">
          Add Social Metrics
        </Button>
      </form>
    </Form>
  );
}
