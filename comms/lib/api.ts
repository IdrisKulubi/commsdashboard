import { and, eq, between, sql } from "drizzle-orm";
import { socialMetrics, websiteMetrics, newsletterMetrics, socialEngagementMetrics } from "@/db/schema";
import type {
  SocialMetric,
  WebsiteMetric,
  NewsletterMetric,
  SocialEngagementMetric,
} from "@/db/schema";
import db from "@/db/drizzle";

export async function getSocialMetrics(
  platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK",
  businessUnit: "ASM" | "IACL" | "EM",
  startDate: Date,
  endDate: Date,
  country?: string
): Promise<SocialMetric[]> {
  const conditions = [
    eq(socialMetrics.platform, platform),
    eq(socialMetrics.businessUnit, businessUnit),
    between(socialMetrics.date, startDate, endDate)
  ];
  
  if (country && country !== "GLOBAL") {
    conditions.push(eq(socialMetrics.country, country));
  }
  
  return db
    .select()
    .from(socialMetrics)
    .where(and(...conditions))
    .orderBy(socialMetrics.date);
}

export async function getWebsiteMetrics(
  businessUnit: "ASM" | "IACL" | "EM",
  startDate: Date,
  endDate: Date,
  country?: string
): Promise<WebsiteMetric[]> {
  const conditions = [
    eq(websiteMetrics.businessUnit, businessUnit),
    between(websiteMetrics.date, startDate, endDate)
  ];
  
  if (country && country !== "GLOBAL") {
    conditions.push(eq(websiteMetrics.country, country));
  }
  
  return db
    .select()
    .from(websiteMetrics)
    .where(and(...conditions))
    .orderBy(websiteMetrics.date);
}

export async function getNewsletterMetrics(
  businessUnit: "ASM" | "IACL" | "EM",
  startDate: Date,
  endDate: Date,
  country?: string
): Promise<NewsletterMetric[]> {
  const conditions = [
    eq(newsletterMetrics.businessUnit, businessUnit),
    between(newsletterMetrics.date, startDate, endDate)
  ];
  
  if (country && country !== "GLOBAL") {
    conditions.push(eq(newsletterMetrics.country, country));
  }
  
  return db
    .select()
    .from(newsletterMetrics)
    .where(and(...conditions))
    .orderBy(newsletterMetrics.date);
}

export async function getSocialEngagementMetrics(
  platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK",
  businessUnit: "ASM" | "IACL" | "EM",
  startDate: Date,
  endDate: Date
): Promise<SocialEngagementMetric[]> {
  return db
    .select()
    .from(socialEngagementMetrics)
    .where(
      and(
        eq(socialEngagementMetrics.platform, platform),
        eq(socialEngagementMetrics.businessUnit, businessUnit),
        between(socialEngagementMetrics.date, startDate, endDate)
      )
    )
    .orderBy(socialEngagementMetrics.date);
}

export async function getTotalMetrics() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  
  // Get total followers across all platforms
  const totalFollowersResult = await db
    .select({ 
      total: sql<number>`sum(${socialMetrics.followers})` 
    })
    .from(socialMetrics);
  
  // Get total impressions across all platforms
  const totalImpressionsResult = await db
    .select({ 
      total: sql<number>`sum(${socialMetrics.impressions})` 
    })
    .from(socialMetrics);
  
  // Get total website users
  const totalWebsiteUsersResult = await db
    .select({ 
      total: sql<number>`sum(${websiteMetrics.users})` 
    })
    .from(websiteMetrics);
  
  // Get total newsletter recipients
  const totalNewsletterRecipientsResult = await db
    .select({ 
      total: sql<number>`sum(${newsletterMetrics.recipients})` 
    })
    .from(newsletterMetrics);
  
  // Get total engagement (likes + comments + shares)
  const totalEngagementResult = await db
    .select({ 
      total: sql<number>`sum(${socialEngagementMetrics.likes} + ${socialEngagementMetrics.comments} + ${socialEngagementMetrics.shares})` 
    })
    .from(socialEngagementMetrics);
  
  // Get growth metrics (comparing last month to previous month)
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 2);
  const previousMonthStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
  const previousMonthEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0);
  
  // Get follower growth
  const lastMonthFollowers = await db
    .select({ 
      total: sql<number>`sum(${socialMetrics.followers})` 
    })
    .from(socialMetrics)
    .where(between(socialMetrics.date, lastMonthStart, lastMonthEnd));
  
  const previousMonthFollowers = await db
    .select({ 
      total: sql<number>`sum(${socialMetrics.followers})` 
    })
    .from(socialMetrics)
    .where(between(socialMetrics.date, previousMonthStart, previousMonthEnd));
  
  const followerGrowth = lastMonthFollowers[0].total && previousMonthFollowers[0].total
    ? ((lastMonthFollowers[0].total - previousMonthFollowers[0].total) / previousMonthFollowers[0].total) * 100
    : 0;
  
  return {
    totalFollowers: totalFollowersResult[0].total || 0,
    totalImpressions: totalImpressionsResult[0].total || 0,
    totalWebsiteUsers: totalWebsiteUsersResult[0].total || 0,
    totalNewsletterRecipients: totalNewsletterRecipientsResult[0].total || 0,
    totalEngagement: totalEngagementResult[0].total || 0,
    followerGrowth: followerGrowth || 0,
  };
}
