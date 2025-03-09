import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { socialMetrics, websiteMetrics, newsletterMetrics } from "@/db/schema";
import { desc, sql, count, sum } from "drizzle-orm";

export async function GET() {
  try {
    // Get the most recent date for which we have data
    const latestSocialMetric = await db.query.socialMetrics.findFirst({
      orderBy: [desc(socialMetrics.date)],
    });
    
    if (!latestSocialMetric) {
      return NextResponse.json({
        totalFollowers: 0,
        totalWebsiteUsers: 0,
        totalNewsletterRecipients: 0,
        totalPosts: 0,
      });
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
    
    // Format the response
    return NextResponse.json({
      totalFollowers: Number(totalFollowersResult[0]?.total || 0),
      totalWebsiteUsers: Number(totalWebsiteUsersResult[0]?.total || 0),
      totalNewsletterRecipients: Number(totalNewsletterRecipientsResult[0]?.total || 0),
      totalPosts: Number(totalPostsResult[0]?.total || 0),
    });
  } catch (error) {
    console.error("Error fetching total metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch total metrics" },
      { status: 500 }
    );
  }
} 