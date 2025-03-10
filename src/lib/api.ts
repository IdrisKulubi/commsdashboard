import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric } from "@/db/schema";
import db from "@/db/drizzle";
import { desc, sql } from "drizzle-orm";
import { socialMetrics, websiteMetrics, newsletterMetrics } from "@/db/schema";

// Helper function to get the base URL
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  
  // Server should use absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback for local development
  return 'http://localhost:3000';
}

export async function getSocialMetrics(
  platform: string,
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<SocialMetric[]> {
  const params = new URLSearchParams({
    platform,
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/analytics/social-metrics?${params.toString()}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch social metrics");
  }
  
  return response.json();
}

export async function getWebsiteMetrics(
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<WebsiteMetric[]> {
  const params = new URLSearchParams({
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/analytics/website-metrics?${params.toString()}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch website metrics");
  }
  
  return response.json();
}

export async function getNewsletterMetrics(
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<NewsletterMetric[]> {
  const params = new URLSearchParams({
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/analytics/newsletter-metrics?${params.toString()}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch newsletter metrics");
  }
  
  return response.json();
}

export async function getSocialEngagementMetrics(
  platform: string,
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<SocialEngagementMetric[]> {
  const params = new URLSearchParams({
    platform,
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/analytics/social-engagement-metrics?${params.toString()}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch social engagement metrics");
  }
  
  return response.json();
}

// Direct database access for server components
export async function getTotalMetrics() {
  try {
    // Get the most recent date for which we have data
    const latestSocialMetric = await db.query.socialMetrics.findFirst({
      orderBy: [desc(socialMetrics.date)],
    });
    
    if (!latestSocialMetric) {
      return {
        totalFollowers: 0,
        totalWebsiteUsers: 0,
        totalNewsletterRecipients: 0,
        totalPosts: 0,
      };
    }
    
    // Get total followers across all platforms
    const totalFollowersResult = await db
      .select({ 
        total: sql`SUM(${socialMetrics.followers})` 
      })
      .from(socialMetrics)
      .where(sql`${socialMetrics.date} = ${latestSocialMetric.date}`);
    
    // Get total website users
    const latestWebsiteMetric = await db.query.websiteMetrics.findFirst({
      orderBy: [desc(websiteMetrics.date)],
    });
    
    const totalWebsiteUsersResult = latestWebsiteMetric 
      ? await db
          .select({ 
            total: sql`SUM(${websiteMetrics.users})` 
          })
          .from(websiteMetrics)
          .where(sql`${websiteMetrics.date} = ${latestWebsiteMetric.date}`)
      : [{ total: 0 }];
    
    // Get total newsletter recipients
    const latestNewsletterMetric = await db.query.newsletterMetrics.findFirst({
      orderBy: [desc(newsletterMetrics.date)],
    });
    
    const totalNewsletterRecipientsResult = latestNewsletterMetric
      ? await db
          .select({ 
            total: sql`SUM(${newsletterMetrics.recipients})` 
          })
          .from(newsletterMetrics)
          .where(sql`${newsletterMetrics.date} = ${latestNewsletterMetric.date}`)
      : [{ total: 0 }];
    
    // Get total posts across all platforms
    const totalPostsResult = await db
      .select({ 
        total: sql`SUM(${socialMetrics.numberOfPosts})` 
      })
      .from(socialMetrics)
      .where(sql`${socialMetrics.date} = ${latestSocialMetric.date}`);
    
    return {
      totalFollowers: Number(totalFollowersResult[0]?.total || 0),
      totalWebsiteUsers: Number(totalWebsiteUsersResult[0]?.total || 0),
      totalNewsletterRecipients: Number(totalNewsletterRecipientsResult[0]?.total || 0),
      totalPosts: Number(totalPostsResult[0]?.total || 0),
    };
  } catch (error) {
    console.error("Error fetching total metrics:", error);
    return {
      totalFollowers: 0,
      totalWebsiteUsers: 0,
      totalNewsletterRecipients: 0,
      totalPosts: 0,
    };
  }
} 