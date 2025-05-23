import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";

// Platform enum values stored as a const for type safety
export const PLATFORMS = {
  FACEBOOK: "FACEBOOK",
  INSTAGRAM: "INSTAGRAM",
  LINKEDIN: "LINKEDIN",
  TIKTOK: "TIKTOK",
  WEBSITE: "WEBSITE",
  NEWSLETTER: "NEWSLETTER",
} as const;

// Business unit enum values
export const BUSINESS_UNITS = {
  ASM: "ASM",
  IACL: "IACL",
  EM: "EM",
  KCL: "KCL",
} as const;



// Social Media Metrics Table
export const socialMetrics = pgTable("social_metrics", {
  id: serial("id").primaryKey(),
  platform: text("platform", {
    enum: [
      "FACEBOOK",
      "INSTAGRAM",
      "LINKEDIN",
      "TIKTOK",
      "WEBSITE",
      "NEWSLETTER",
    ] as const,
  }).notNull(),
  businessUnit: text("business_unit", {
    enum: ["ASM", "IACL", "EM","KCL"] as const,
  }).notNull(),
  date: timestamp("date").notNull(),
  country: text("country").default("GLOBAL"), // Add country field with GLOBAL default
  impressions: integer("impressions"),
  followers: integer("followers"),
  numberOfPosts: integer("number_of_posts"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Website Metrics Table
export const websiteMetrics = pgTable("website_metrics", {
  id: serial("id").primaryKey(),
  businessUnit: text("business_unit", {
    enum: ["ASM", "IACL", "EM", "KCL"] as const,
  }).notNull(),
  date: timestamp("date").notNull(),
  country: text("country").default("GLOBAL"), // Add country field with GLOBAL default
  users: integer("users"),
  clicks: integer("clicks"),
  sessions: integer("sessions"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Newsletter Metrics Table
export const newsletterMetrics = pgTable("newsletter_metrics", {
  id: serial("id").primaryKey(),
  businessUnit: text("business_unit", {
    enum: ["ASM", "IACL", "EM", "KCL"] as const,
  }).notNull(),
  date: timestamp("date").notNull(),
  country: text("country").default("GLOBAL"), // Add country field with GLOBAL default
  recipients: integer("recipients"),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }), // Stores percentage as decimal
  numberOfEmails: integer("number_of_emails"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Social Media Engagement Metrics Table
export const socialEngagementMetrics = pgTable("social_engagement_metrics", {
  id: serial("id").primaryKey(),
  platform: text("platform", {
    enum: ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "TIKTOK"] as const,
  }).notNull(),
  businessUnit: text("business_unit", {
    enum: ["ASM", "IACL", "EM", "KCL"] as const,
  }).notNull(),
  date: timestamp("date").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  clicks: integer("clicks").default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }), // Stores percentage as decimal
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Types for TypeScript
export type SocialMetric = typeof socialMetrics.$inferSelect;
export type NewSocialMetric = typeof socialMetrics.$inferInsert;

export type WebsiteMetric = typeof websiteMetrics.$inferSelect;
export type NewWebsiteMetric = typeof websiteMetrics.$inferInsert;

export type NewsletterMetric = typeof newsletterMetrics.$inferSelect;
export type NewNewsletterMetric = typeof newsletterMetrics.$inferInsert;

export type SocialEngagementMetric =
  typeof socialEngagementMetrics.$inferSelect;
export type NewSocialEngagementMetric =
  typeof socialEngagementMetrics.$inferInsert;
