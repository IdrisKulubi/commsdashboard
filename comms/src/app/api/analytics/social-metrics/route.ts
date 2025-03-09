import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { socialMetrics } from "@/db/schema";
import { and, between, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const businessUnit = searchParams.get("businessUnit");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const country = searchParams.get("country") || "GLOBAL";

    if (!platform || !businessUnit || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const conditions = [
      eq(socialMetrics.platform, platform),
      eq(socialMetrics.businessUnit, businessUnit),
      between(socialMetrics.date, new Date(startDate), new Date(endDate))
    ];

    // Add country filter if not GLOBAL
    if (country !== "GLOBAL") {
      conditions.push(eq(socialMetrics.country, country));
    }

    const metrics = await db.query.socialMetrics.findMany({
      where: and(...conditions),
      orderBy: [socialMetrics.date],
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching social metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch social metrics" },
      { status: 500 }
    );
  }
} 