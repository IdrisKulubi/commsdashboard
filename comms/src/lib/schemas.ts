import { z } from "zod";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";

const baseMetricSchema = z.object({
  date: z.date(),
  businessUnit: z.enum(Object.values(BUSINESS_UNITS) as [string, ...string[]]),
});

export const socialMetricSchema = baseMetricSchema.extend({
  platform: z.enum(Object.values(PLATFORMS) as [string, ...string[]]),
  country: z.string().default("GLOBAL"),
  impressions: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  numberOfPosts: z.number().int().nonnegative().optional(),
});

export const websiteMetricSchema = baseMetricSchema.extend({
  country: z.string().default("GLOBAL"),
  users: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative().optional(),
  sessions: z.number().int().nonnegative().optional(),
});

export const newsletterMetricSchema = baseMetricSchema.extend({
  country: z.string().default("GLOBAL"),
  recipients: z.number().int().nonnegative(),
  openRate: z.number().min(0).max(1),
  numberOfEmails: z.number().int().nonnegative(),
});

export type SocialMetricFormData = z.infer<typeof socialMetricSchema>;
export type WebsiteMetricFormData = z.infer<typeof websiteMetricSchema>;
export type NewsletterMetricFormData = z.infer<typeof newsletterMetricSchema>;
