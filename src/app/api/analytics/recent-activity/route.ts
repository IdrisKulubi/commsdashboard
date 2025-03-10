import { NextResponse } from "next/server";
import  db  from "@/db/drizzle";
import { socialMetrics, socialEngagementMetrics } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";

export async function GET() {
  try {
    // Get the most recent social metrics (last 5 entries)
    const recentSocialMetrics = await db.query.socialMetrics.findMany({
      orderBy: [desc(socialMetrics.date)],
      limit: 5,
    });

    // Get the most recent engagement metrics (last 5 entries)
    const recentEngagementMetrics = await db.query.socialEngagementMetrics.findMany({
      orderBy: [desc(socialEngagementMetrics.date)],
      limit: 5,
    });

    // Get previous day metrics for comparison to determine increase/decrease
    const previousDayMetrics = await Promise.all(
      recentSocialMetrics.map(async (metric) => {
        const prevDate = new Date(metric.date);
        prevDate.setDate(prevDate.getDate() - 7); // Compare with data from a week ago
        
        return await db.query.socialMetrics.findFirst({
          where: sql`${socialMetrics.platform} = ${metric.platform} AND 
                    ${socialMetrics.businessUnit} = ${metric.businessUnit} AND
                    ${socialMetrics.date} < ${metric.date} AND
                    ${socialMetrics.date} >= ${prevDate.toISOString()}`,
          orderBy: [desc(socialMetrics.date)],
        });
      })
    );

    // Format the data for the frontend
    const activities = recentSocialMetrics.map((metric, index) => {
      const prevMetric = previousDayMetrics[index];
      
      // Determine if followers increased or decreased
      const change = !prevMetric || metric.followers !== null && metric.followers >= (prevMetric?.followers || 0) 
        ? "increase" 
        : "decrease";
      
      // Calculate the difference in followers
      const value = prevMetric 
        ? Math.abs((metric.followers || 0) - (prevMetric.followers || 0)) 
        : metric.followers || 0;
      
      return {
        id: index + 1,
        platform: metric.platform,
        metric: "Followers",
        value,
        change,
        date: formatDistanceToNow(new Date(metric.date), { addSuffix: true }),
      };
    });

    // Add engagement metrics to activities
    recentEngagementMetrics.forEach((metric, index) => {
      activities.push({
        id: recentSocialMetrics.length + index + 1,
        platform: metric.platform,
        metric: "Engagement",
        value: (metric.likes || 0) + (metric.comments || 0) + (metric.shares || 0),
        change: "increase", // Simplified for this example
        date: formatDistanceToNow(new Date(metric.date), { addSuffix: true }),
      });
    });

    // Sort by date (most recent first) and limit to 5 items
    const sortedActivities = activities
      .sort((a, b) => {
        const dateA = new Date(a.date.replace(" ago", ""));
        const dateB = new Date(b.date.replace(" ago", ""));
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
} 