"use server";

import db from "@/db/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { socialMetrics, websiteMetrics, newsletterMetrics, NewsletterMetric, WebsiteMetric, socialEngagementMetrics, SocialMetric, SocialEngagementMetric } from "@/db/schema";
import {
  type SocialMetricFormData,
  type WebsiteMetricFormData,
  type NewsletterMetricFormData,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { SocialMetric as SocialMetricType } from "@/lib/types";
import { COUNTRIES } from "@/lib/constants";
import { and as drizzleAnd, between } from "drizzle-orm";


async function checkExistingMetric(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  date: Date,
  businessUnit: string,
  platform?: string,
  country?: string
) {
  const conditions = [
    eq(table.date, date),
    eq(table.businessUnit, businessUnit as keyof typeof BUSINESS_UNITS),
  ];

  if (platform) {
    conditions.push(eq(table.platform, platform as keyof typeof PLATFORMS));
  }

  if (country) {
    conditions.push(eq(table.country, country as keyof typeof COUNTRIES));
  }

  const existing = await db
    .select()
    .from(table)
    .where(and(...conditions))
    .limit(1);

  return existing[0];
}

export async function addSocialMetric(data: SocialMetricFormData) {
  try {
    console.log("Attempting to add social metric:", data);
    const existing = await checkExistingMetric(
      socialMetrics,
      data.date,
      data.businessUnit,
      data.platform
    );
    console.log("Existing record:", existing);

    if (existing) {
      console.log("Updating existing social metric record");
      await db
        .update(socialMetrics)
        .set({
          impressions: data.impressions,
          followers: data.followers,
          numberOfPosts: data.numberOfPosts,
          country: data.country,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(socialMetrics.id, existing.id));
    } else {
      console.log("Inserting new social metric record");
      await db.insert(socialMetrics).values({
        platform: data.platform as keyof typeof PLATFORMS,
        businessUnit: data.businessUnit as keyof typeof BUSINESS_UNITS,
        date: data.date,
        impressions: data.impressions,
        followers: data.followers,
        numberOfPosts: data.numberOfPosts,
        country: data.country as keyof typeof COUNTRIES,
      });
    }
    console.log("Social metric added successfully");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to add social metrics. Full error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to save social metrics: ${error}`);
  }
}

export async function addWebsiteMetric(data: WebsiteMetricFormData) {
  try {
    console.log("Attempting to add website metric:", data);
    const existing = await checkExistingMetric(
      websiteMetrics,
      data.date,
      data.businessUnit
    );
    console.log("Existing record:", existing);

    if (existing) {
      console.log("Updating existing website metric record");
      await db
        .update(websiteMetrics)
        .set({
          users: data.users,
          clicks: data.clicks,
          sessions: data.sessions,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(websiteMetrics.id, existing.id));
    } else {
      console.log("Inserting new website metric record");
      await db.insert(websiteMetrics).values({
        businessUnit: data.businessUnit as keyof typeof BUSINESS_UNITS,
        date: data.date,
        users: data.users,
        clicks: data.clicks,
        sessions: data.sessions,
      });
    }
    console.log("Website metric added successfully");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add website metrics. Full error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save metrics",
    };
  }
}

export async function addNewsletterMetric(data: NewsletterMetricFormData) {
  try {
    console.log("Attempting to add newsletter metric:", data);
    const existing = await checkExistingMetric(
      newsletterMetrics,
      data.date,
      data.businessUnit
    );
    console.log("Existing record:", existing);

    if (existing) {
      console.log("Updating existing newsletter metric record");
      await db
        .update(newsletterMetrics)
        .set({
          recipients: data.recipients,
          openRate: data.openRate?.toString(),
          numberOfEmails: data.numberOfEmails,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(newsletterMetrics.id, existing.id));
    } else {
      console.log("Inserting new newsletter metric record");
      await db.insert(newsletterMetrics).values({
        businessUnit: data.businessUnit as keyof typeof BUSINESS_UNITS,
        date: data.date,
        recipients: data.recipients,
        openRate: data.openRate?.toString(),
        numberOfEmails: data.numberOfEmails,
      });
    }
    console.log("Newsletter metric added successfully");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to add newsletter metrics. Full error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to save newsletter metrics: ${error}`);
  }
}

export async function updateMetric(metric: SocialMetricType | WebsiteMetric | NewsletterMetric) {
  try {
    console.log("Updating metric:", metric);
    
    // Validate that the metric has an ID
    if (!metric || !metric.id) {
      console.error("Invalid metric data: Missing ID");
      throw new Error("Invalid metric data: Missing ID");
    }
    
    // Process the metric to ensure dates are properly formatted
    const processedMetric = {
      ...metric,
      // Convert date strings to Date objects if needed
      date: metric.date instanceof Date ? metric.date : new Date(metric.date),
    };
    
    let result;
    
    // Determine which type of metric we're updating
    if ('platform' in processedMetric) {
      // Extract only the fields that should be updated
      //@ts-expect-error - This is a workaround to avoid TypeScript errors
      const { impressions, followers, numberOfPosts, date, platform, businessUnit, country } = processedMetric;
      
      // Validate required fields
      if (impressions === undefined || followers === undefined) {
        console.error("Invalid social metric data: Missing required fields");
        throw new Error("Invalid social metric data: Missing required fields");
      }
      
      result = await db
        .update(socialMetrics)
        .set({
          impressions,
          followers,
          numberOfPosts,
          date,
          platform: platform as keyof typeof PLATFORMS,
          businessUnit: businessUnit as keyof typeof BUSINESS_UNITS,
          country: country as keyof typeof COUNTRIES,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(socialMetrics.id, Number(processedMetric.id)))
        .returning();
    } else if ('users' in processedMetric) {
      // Extract only the fields that should be updated
      const { users, clicks, sessions, date, businessUnit, country } = processedMetric;
      
      // Validate required fields
      if (users === undefined) {
        console.error("Invalid website metric data: Missing required fields");
        throw new Error("Invalid website metric data: Missing required fields");
      }
      
      result = await db
        .update(websiteMetrics)
        .set({
          users,
          clicks,
          sessions,
          date,
          businessUnit,
          country,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(websiteMetrics.id, processedMetric.id))
        .returning();
    } else if ('recipients' in processedMetric) {
      // Extract only the fields that should be updated
      const { recipients, openRate, numberOfEmails, date, businessUnit, country } = processedMetric;
      
      // Validate required fields
      if (recipients === undefined || openRate === undefined) {
        console.error("Invalid newsletter metric data: Missing required fields");
        throw new Error("Invalid newsletter metric data: Missing required fields");
      }
      
      result = await db
        .update(newsletterMetrics)
        .set({
          recipients,
          openRate,
          numberOfEmails,
          date,
          businessUnit,
          country,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(newsletterMetrics.id, processedMetric.id))
        .returning();
    } else {
      console.error("Unknown metric type:", processedMetric);
      throw new Error("Unknown metric type");
    }
    
    // Check if we got a result back
    if (!result || result.length === 0) {
      console.error("No rows updated");
      throw new Error("No rows updated");
    }
    
    console.log("Update successful, returning:", result[0]);
    revalidatePath('/');
    return result[0];
  } catch (error) {
    console.error("Error updating metric:", error);
    // Instead of throwing, return an error object that the client can handle
    return {
      error: true,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function getSocialMetrics(
  platform: string,
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<SocialMetricType[]> {
  try {
    const conditions = [
      eq(socialMetrics.platform, platform as any),
      eq(socialMetrics.businessUnit, businessUnit as any),
      between(socialMetrics.date, startDate, endDate)
    ];

    // Add country filter if not GLOBAL
    if (country !== "GLOBAL") {
      conditions.push(eq(socialMetrics.country, country));
    }

    const metrics = await db.query.socialMetrics.findMany({
      where: and(...conditions),
      orderBy: [socialMetrics.date],
    });

    return metrics;
  } catch (error) {
    console.error("Error fetching social metrics:", error);
    throw error;
  }
}
