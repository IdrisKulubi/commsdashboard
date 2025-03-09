"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the form schema
const formSchema = z.object({
  platform: z.string({
    required_error: "Please select a platform",
  }),
  businessUnit: z.string({
    required_error: "Please select a business unit",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  likes: z.coerce.number().int().min(0, {
    message: "Likes must be a positive number",
  }).default(0),
  comments: z.coerce.number().int().min(0, {
    message: "Comments must be a positive number",
  }).default(0),
  shares: z.coerce.number().int().min(0, {
    message: "Shares must be a positive number",
  }).default(0),
  saves: z.coerce.number().int().min(0, {
    message: "Saves must be a positive number",
  }).default(0),
  clicks: z.coerce.number().int().min(0, {
    message: "Clicks must be a positive number",
  }).default(0),
  engagementRate: z.coerce.number().min(0).max(100, {
    message: "Engagement rate must be between 0 and 100",
  }).optional().transform(val => val ? val / 100 : undefined),
});

type FormValues = z.infer<typeof formSchema>;

interface EngagementMetricFormProps {
  platforms: string[];
  businessUnits: string[];
}

export function EngagementMetricForm({
  platforms,
  businessUnits,
}: EngagementMetricFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: platforms[0],
      businessUnit: businessUnits[0],
      date: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: undefined,
    },
  });
  
  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    
    try {
      // Make API call to add engagement metric
      const response = await fetch("/api/metrics/engagement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add engagement metric");
      }
      
      toast({
        title: "Success",
        description: "Engagement metric added successfully",
      });
      
      // Reset form
      form.reset({
        platform: platforms[0],
        businessUnit: businessUnits[0],
        date: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        clicks: 0,
        engagementRate: undefined,
      });
      
      // Redirect to analytics page
      router.push("/analytics");
      router.refresh();
    } catch (error) {
      console.error("Error adding engagement metric:", error);
      
      toast({
        title: "Error",
        description: "Failed to add engagement metric",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="likes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Likes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of likes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of comments
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="shares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shares</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of shares
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="saves"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saves</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of saves
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="clicks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clicks</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of clicks
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="engagementRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engagement Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    {...field}
                    value={field.value !== undefined ? field.value * 100 : ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Engagement rate as a percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Add Engagement Metric"
          )}
        </Button>
      </form>
    </Form>
  );
} 