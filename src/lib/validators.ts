import { z } from "zod"

 export const socialMetricSchema = z.object({
    id: z.number(),
    date: z.date(),
    platform: z.string(),
    businessUnit: z.string(),
    country: z.string().default("GLOBAL"),
    impressions: z.number().int().nonnegative(),
    followers: z.number().int().nonnegative(),
    numberOfPosts: z.number().int().nonnegative().optional(),
  })
  
 export  const websiteMetricSchema = z.object({
    id: z.number(),
    date: z.date(),
    businessUnit: z.string(),
    country: z.string().default("GLOBAL"),
    users: z.number().int().nonnegative(),
    clicks: z.number().int().nonnegative().optional(),
    sessions: z.number().int().nonnegative().optional(),
  })
  
 export  const newsletterMetricSchema = z.object({
    id: z.number(),
    date: z.date(),
    businessUnit: z.string(),
    country: z.string().default("GLOBAL"),
    recipients: z.number().int().nonnegative(),
    openRate: z.number().min(0).max(100),
    numberOfEmails: z.number().int().nonnegative(),
  })
  
 export  const engagementMetricSchema = z.object({
    id: z.number(),
    date: z.date(),
    platform: z.string(),
    businessUnit: z.string(),
    likes: z.number().int().nonnegative().default(0),
    comments: z.number().int().nonnegative().default(0),
    shares: z.number().int().nonnegative().default(0),
    saves: z.number().int().nonnegative().default(0),
    clicks: z.number().int().nonnegative().default(0),
    engagementRate: z.number().min(0).max(100),
  })
  