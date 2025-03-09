import { NextResponse } from "next/server";
import  db  from "@/db/drizzle";
import { socialEngagementMetrics } from "@/db/schema";
import { and, between, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const businessUnit = searchParams.get("businessUnit");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!platform || !businessUnit || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const conditions = [
      eq(socialEngagementMetrics.platform, platform as "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK"),
      eq(socialEngagementMetrics.businessUnit, businessUnit as "ASM" | "IACL" | "EM"),
      between(socialEngagementMetrics.date, new Date(startDate), new Date(endDate))
    ];

    const metrics = await db.query.socialEngagementMetrics.findMany({
      where: and(...conditions),
      orderBy: [socialEngagementMetrics.date],
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching social engagement metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch social engagement metrics" },
      { status: 500 }
    );
  }
} 