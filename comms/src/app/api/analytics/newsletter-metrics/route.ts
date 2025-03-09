import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { newsletterMetrics } from "@/db/schema";
import { and, between, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUnit = searchParams.get("businessUnit");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const country = searchParams.get("country") || "GLOBAL";

    if (!businessUnit || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const conditions = [
      eq(newsletterMetrics.businessUnit, businessUnit),
      between(newsletterMetrics.date, new Date(startDate), new Date(endDate))
    ];

    // Add country filter if not GLOBAL
    if (country !== "GLOBAL") {
      conditions.push(eq(newsletterMetrics.country, country));
    }

    const metrics = await db.query.newsletterMetrics.findMany({
      where: and(...conditions),
      orderBy: [newsletterMetrics.date],
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching newsletter metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter metrics" },
      { status: 500 }
    );
  }
} 