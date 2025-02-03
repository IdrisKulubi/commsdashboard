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
    enum: ["ASM", "IACL", "EM"] as const,
  }).notNull(),
  date: timestamp("date").notNull(),
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
    enum: ["ASM", "IACL", "EM"] as const,
  }).notNull(),
  date: timestamp("date").notNull(),
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
    enum: ["ASM", "IACL", "EM"] as const,
  }).notNull(),
  date: timestamp("date").notNull(),
  recipients: integer("recipients"),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }), // Stores percentage as decimal
  numberOfEmails: integer("number_of_emails"),

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
