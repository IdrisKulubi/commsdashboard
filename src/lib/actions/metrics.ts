"use server";

import db from "@/db/drizzle";
import { and, eq, sql, desc, between } from "drizzle-orm";
import { 
  socialMetrics, 
  websiteMetrics, 
  newsletterMetrics, 
  socialEngagementMetrics,
  NewsletterMetric, 
  WebsiteMetric,
  SocialEngagementMetric,
  PLATFORMS,
  BUSINESS_UNITS
} from "@/db/schema";
import {
  type SocialMetricFormData,
  type WebsiteMetricFormData,
  type NewsletterMetricFormData,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { COUNTRIES } from "@/lib/constants";
import { InferSelectModel } from "drizzle-orm";

type SocialMetricType = InferSelectModel<typeof socialMetrics>;

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

export async function deleteMetric(id: number, type: 'social' | 'website' | 'newsletter' | 'engagement') {
  try {
    console.log(`Deleting ${type} metric with ID: ${id}`);
    
    // Validate that the ID is present and is a valid number
    if (!id || isNaN(Number(id))) {
      console.error(`Invalid delete request: ID is invalid or missing: ${id}`);
      throw new Error(`Invalid delete request: ID is invalid or missing: ${id}`);
    }
    
    // Convert ID to number to ensure consistency
    const numericId = Number(id);
    let result;
    
    // Determine which type of metric to delete
    switch (type) {
      case 'social':
        result = await db
          .delete(socialMetrics)
          .where(eq(socialMetrics.id, numericId))
          .returning();
        break;
        
      case 'website':
        result = await db
          .delete(websiteMetrics)
          .where(eq(websiteMetrics.id, numericId))
          .returning();
        break;
        
      case 'newsletter':
        result = await db
          .delete(newsletterMetrics)
          .where(eq(newsletterMetrics.id, numericId))
          .returning();
        break;
        
      case 'engagement':
        result = await db
          .delete(socialEngagementMetrics)
          .where(eq(socialEngagementMetrics.id, numericId))
          .returning();
        break;
        
      default:
        throw new Error(`Unknown metric type: ${type}`);
    }
    
    // Verify that rows were affected
    if (!result || result.length === 0) {
      console.error(`No rows deleted for ${type} metric with ID: ${numericId}`);
      throw new Error(`No rows deleted for ${type} metric with ID: ${numericId}`);
    }
    
    console.log(`Successfully deleted ${type} metric:`, result);
    
    // Revalidate all potential paths that might show this data
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    revalidatePath(`/business-units`);
    
    return {
      success: true,
      deletedRecord: result[0]
    };
  } catch (error) {
    console.error(`Failed to delete ${type} metric:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get social metrics for a specific platform, business unit, and date range
 */
export async function getSocialMetrics(
  platform: string,
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<SocialMetricType[]> {
  try {
    console.log(`Fetching social metrics for ${platform}, ${businessUnit}, ${startDate.toISOString()} to ${endDate.toISOString()}, country: ${country}`);
    
    // Build the query conditions
    const conditions = [
      eq(socialMetrics.platform, platform as keyof typeof PLATFORMS),
      eq(socialMetrics.businessUnit, businessUnit as keyof typeof BUSINESS_UNITS),
      between(socialMetrics.date, startDate, endDate)
    ];
    
    // Add country filter if not GLOBAL
    if (country !== "GLOBAL") {
      conditions.push(eq(socialMetrics.country, country));
    }
    
    // Execute the query with direct database access
    const results = await db.query.socialMetrics.findMany({
      where: and(...conditions),
      orderBy: [desc(socialMetrics.date)],
    });
    
    console.log(`Retrieved ${results.length} social metrics records`);
    return results;
  } catch (error) {
    console.error(`Error fetching social metrics for ${platform}, ${businessUnit}:`, error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get website metrics for a specific business unit and date range
 */
export async function getWebsiteMetrics(
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<WebsiteMetric[]> {
  try {
    console.log(`Fetching website metrics for ${businessUnit}, ${startDate.toISOString()} to ${endDate.toISOString()}, country: ${country}`);
    
    // Build the query conditions
    const conditions = [
      eq(websiteMetrics.businessUnit, businessUnit as keyof typeof BUSINESS_UNITS),
      between(websiteMetrics.date, startDate, endDate)
    ];
    
    // Add country filter if not GLOBAL
    if (country !== "GLOBAL") {
      conditions.push(eq(websiteMetrics.country, country));
    }
    
    // Execute the query with direct database access
    const results = await db.query.websiteMetrics.findMany({
      where: and(...conditions),
      orderBy: [desc(websiteMetrics.date)],
    });
    
    console.log(`Retrieved ${results.length} website metrics records`);
    return results;
  } catch (error) {
    console.error(`Error fetching website metrics for ${businessUnit}:`, error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get newsletter metrics for a specific business unit and date range
 */
export async function getNewsletterMetrics(
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<NewsletterMetric[]> {
  try {
    console.log(`Fetching newsletter metrics for ${businessUnit}, ${startDate.toISOString()} to ${endDate.toISOString()}, country: ${country}`);
    
    // Build the query conditions
    const conditions = [
      eq(newsletterMetrics.businessUnit, businessUnit as keyof typeof BUSINESS_UNITS),
      between(newsletterMetrics.date, startDate, endDate)
    ];
    
    // Add country filter if not GLOBAL
    if (country !== "GLOBAL") {
      conditions.push(eq(newsletterMetrics.country, country));
    }
    
    // Execute the query with direct database access
    const results = await db.query.newsletterMetrics.findMany({
      where: and(...conditions),
      orderBy: [desc(newsletterMetrics.date)],
    });
    
    console.log(`Retrieved ${results.length} newsletter metrics records`);
    return results;
  } catch (error) {
    console.error(`Error fetching newsletter metrics for ${businessUnit}:`, error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get social engagement metrics for a specific platform, business unit, and date range
 */
export async function getSocialEngagementMetrics(
  platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK",
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  country: string = "GLOBAL" // Note: This parameter is kept for API consistency but not used since the table doesn't have a country field
): Promise<SocialEngagementMetric[]> {
  try {
    console.log(`Fetching social engagement metrics for ${platform}, ${businessUnit}, ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Build the query conditions
    const conditions = [
      eq(socialEngagementMetrics.platform, platform),
      eq(socialEngagementMetrics.businessUnit, businessUnit as keyof typeof BUSINESS_UNITS),
      between(socialEngagementMetrics.date, startDate, endDate)
    ];
    
    // Execute the query with direct database access
    const results = await db.query.socialEngagementMetrics.findMany({
      where: and(...conditions),
      orderBy: [desc(socialEngagementMetrics.date)],
    });
    
    console.log(`Retrieved ${results.length} social engagement metrics records`);
    return results;
  } catch (error) {
    console.error(`Error fetching social engagement metrics for ${platform}, ${businessUnit}:`, error);
    // Return empty array on error
    return [];
  }
}
