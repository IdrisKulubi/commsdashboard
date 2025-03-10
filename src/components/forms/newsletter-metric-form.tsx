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
  businessUnit: z.string({
    required_error: "Please select a business unit",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  country: z.string().default("GLOBAL"),
  recipients: z.coerce.number().int().min(0, {
    message: "Recipients must be a positive number",
  }).optional(),
  openRate: z.coerce.number().min(0).max(100, {
    message: "Open rate must be between 0 and 100",
  }).optional().transform(val => val ? val / 100 : undefined),
  numberOfEmails: z.coerce.number().int().min(0, {
    message: "Number of emails must be a positive number",
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewsletterMetricFormProps {
  businessUnits: string[];
  countries: { code: string; name: string }[];
}

export function NewsletterMetricForm({
  businessUnits,
  countries,
}: NewsletterMetricFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessUnit: businessUnits[0],
      date: new Date(),
      country: "GLOBAL",
      recipients: undefined,
      openRate: undefined,
      numberOfEmails: undefined,
    },
  });
  
  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    
    try {
      // Make API call to add newsletter metric
      const response = await fetch("/api/metrics/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add newsletter metric");
      }
      
      toast({
        title: "Success",
        description: "Newsletter metric added successfully",
      });
      
      // Reset form
      form.reset({
        businessUnit: businessUnits[0],
        date: new Date(),
        country: "GLOBAL",
        recipients: undefined,
        openRate: undefined,
        numberOfEmails: undefined,
      });
      
      // Redirect to analytics page
      router.push("/analytics");
      router.refresh();
    } catch (error) {
      console.error("Error adding newsletter metric:", error);
      
      toast({
        title: "Error",
        description: "Failed to add newsletter metric",
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
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select &quot;Global&quot; for worldwide metrics
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="recipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipients</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Total number of recipients
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="openRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Open Rate (%)</FormLabel>
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
                  Email open rate as a percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="numberOfEmails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Emails</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Total number of emails sent
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
            "Add Newsletter Metric"
          )}
        </Button>
      </form>
    </Form>
  );
} 