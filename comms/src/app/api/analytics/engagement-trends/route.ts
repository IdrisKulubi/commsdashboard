import { NextResponse } from "next/server";
import  db  from "@/db/drizzle";
import { socialEngagementMetrics } from "@/db/schema";
import { between } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get engagement metrics for the specified date range
    const metrics = await db.query.socialEngagementMetrics.findMany({
      where: between(
        socialEngagementMetrics.date,
        new Date(startDate),
        new Date(endDate)
      ),
      orderBy: [socialEngagementMetrics.date],
    });

    // Group metrics by date
    const groupedByDate = metrics.reduce((acc, metric) => {
      const dateStr = format(new Date(metric.date), "yyyy-MM-dd");
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          likes: 0,
          comments: 0,
          shares: 0,
        };
      }
      
      acc[dateStr].likes += metric.likes || 0;
      acc[dateStr].comments += metric.comments || 0;
      acc[dateStr].shares += metric.shares || 0;
      
      return acc;
    }, {} as Record<string, { date: string; likes: number; comments: number; shares: number }>);

    // Convert to array and sort by date
    const trendsData = Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json(trendsData);
  } catch (error) {
    console.error("Error fetching engagement trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch engagement trends" },
      { status: 500 }
    );
  }
} 