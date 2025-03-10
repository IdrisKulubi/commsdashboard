import { NextResponse } from "next/server";
import  db  from "@/db/drizzle";
import { websiteMetrics } from "@/db/schema";
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
      eq(websiteMetrics.businessUnit, businessUnit as "ASM" | "IACL" | "EM"),
      between(websiteMetrics.date, new Date(startDate), new Date(endDate))
    ];

    // Add country filter if not GLOBAL
    if (country !== "GLOBAL") {
      conditions.push(eq(websiteMetrics.country, country));
    }

    const metrics = await db.query.websiteMetrics.findMany({
      where: and(...conditions),
      orderBy: [websiteMetrics.date],
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching website metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch website metrics" },
      { status: 500 }
    );
  }
} 