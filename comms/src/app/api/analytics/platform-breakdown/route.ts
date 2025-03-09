import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { socialMetrics } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get the most recent date for which we have data
    const latestMetric = await db.query.socialMetrics.findFirst({
      orderBy: [desc(socialMetrics.date)],
    });
    
    if (!latestMetric) {
      return NextResponse.json([]);
    }
    
    // Get the latest metrics for each platform
    const platforms = ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "TIKTOK"];
    const latestMetrics = await Promise.all(
      platforms.map(async (platform) => {
        return await db.query.socialMetrics.findFirst({
          where: sql`${socialMetrics.platform} = ${platform} AND ${socialMetrics.date} = ${latestMetric.date}`,
        });
      })
    );
    
    // Filter out null values and calculate total followers
    const validMetrics = latestMetrics.filter(Boolean);
    const totalFollowers = validMetrics.reduce((sum, metric) => sum + (metric?.followers || 0), 0);
    
    // Calculate percentage for each platform
    const platformData = validMetrics.map((metric) => {
      const percentage = totalFollowers > 0 
        ? Math.round((metric?.followers || 0) / totalFollowers * 100) 
        : 0;
      
      // Map platform names to display format and assign colors
      const platformColors: Record<string, string> = {
        "FACEBOOK": "#1877F2",
        "INSTAGRAM": "#E4405F",
        "LINKEDIN": "#0A66C2",
        "TIKTOK": "#000000"
      };
      
      const displayNames: Record<string, string> = {
        "FACEBOOK": "Facebook",
        "INSTAGRAM": "Instagram",
        "LINKEDIN": "LinkedIn",
        "TIKTOK": "TikTok"
      };
      
      return {
        name: displayNames[metric?.platform || ""],
        value: percentage,
        color: platformColors[metric?.platform || ""]
      };
    });
    
    return NextResponse.json(platformData);
  } catch (error) {
    console.error("Error fetching platform breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform breakdown" },
      { status: 500 }
    );
  }
} 