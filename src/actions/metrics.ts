"use server";

import db from "@/db/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { socialMetrics, websiteMetrics, newsletterMetrics, NewsletterMetric, WebsiteMetric } from "@/db/schema";
import {
  type SocialMetricFormData,
  type WebsiteMetricFormData,
  type NewsletterMetricFormData,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { SocialMetric } from "@/lib/types";

async function checkExistingMetric(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  date: Date,
  businessUnit: string,
  platform?: string
) {
  const conditions = [
    eq(table.date, date),
    eq(table.businessUnit, businessUnit as keyof typeof BUSINESS_UNITS),
  ];

  if (platform) {
    conditions.push(eq(table.platform, platform as keyof typeof PLATFORMS));
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

export async function updateMetric(metric: SocialMetric | WebsiteMetric | NewsletterMetric) {
  try {
    let result;
    
    // Ensure date is a Date object
    const processedMetric = {
      ...metric,
      date: metric.date instanceof Date ? metric.date : new Date(metric.date)
    };
    
    // Determine metric type and update accordingly
    if ('platform' in processedMetric) {
      // Create update data object with only the date field initially
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {
        date: processedMetric.date,
        updatedAt: sql`CURRENT_TIMESTAMP`
      };
      
      // Only add properties if they exist in the processed metric
      if ('impressions' in processedMetric && processedMetric.impressions !== undefined) {
        updateData.impressions = processedMetric.impressions;
      }
      if ('followers' in processedMetric && processedMetric.followers !== undefined) {
        updateData.followers = processedMetric.followers;
      }
      if ('numberOfPosts' in processedMetric && processedMetric.numberOfPosts !== undefined) {
        updateData.numberOfPosts = processedMetric.numberOfPosts;
      }
      
      result = await db
        .update(socialMetrics)
        .set(updateData)
        .where(and(
          eq(socialMetrics.id, Number(processedMetric.id)),
          eq(socialMetrics.platform, processedMetric.platform as keyof typeof PLATFORMS),
          eq(socialMetrics.businessUnit, processedMetric.businessUnit as keyof typeof BUSINESS_UNITS)
        ))
        .returning();
    } else if ('users' in processedMetric) {
      // Extract only the fields that should be updated
      const { users, clicks, sessions, date } = processedMetric;
      
      result = await db
        .update(websiteMetrics)
        .set({
          users,
          clicks,
          sessions,
          date,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(websiteMetrics.id, processedMetric.id))
        .returning();
    } else {
      // Extract only the fields that should be updated
      const { recipients, openRate, numberOfEmails, date } = processedMetric;
      
      result = await db
        .update(newsletterMetrics)
        .set({
          recipients,
          openRate,
          numberOfEmails,
          date,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(newsletterMetrics.id, processedMetric.id))
        .returning();
    }

    revalidatePath('/');
    return result[0];
  } catch (error) {
    console.error("Error updating metric:", error);
    throw error;
  }
}
