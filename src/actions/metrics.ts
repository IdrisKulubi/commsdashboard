"use server";

import db from "@/db/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { socialMetrics, websiteMetrics, newsletterMetrics } from "@/db/schema";
import {
  type SocialMetricFormData,
  type WebsiteMetricFormData,
  type NewsletterMetricFormData,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateMetric(metric: any) {
  try {
    let result;
    switch (metric.type) {
      case "social":
        result = await db
          .update(socialMetrics)
          .set(metric)
          .where(eq(socialMetrics.id, metric.id))
          .returning();
        break;
      case "website":
        result = await db
          .update(websiteMetrics)
          .set(metric)
          .where(eq(websiteMetrics.id, metric.id))
          .returning();
        break;
      case "newsletter":
        result = await db
          .update(newsletterMetrics)
          .set(metric)
          .where(eq(newsletterMetrics.id, metric.id))
          .returning();
        break;
      default:
        throw new Error("Invalid metric type");
    }
    return result[0];
  } catch (error) {
    console.error("Error updating metric:", error);
    throw error;
  }
}
