import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { socialMetrics, websiteMetrics, newsletterMetrics } from "@/db/schema";
import { and, between, desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "social";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    
    // Parse dates or use defaults (last 30 days)
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date parameters" },
        { status: 400 }
      );
    }
    
    let data = [];
    
    // Fetch data based on type
    switch (type) {
      case "social":
        data = await db.query.socialMetrics.findMany({
          where: between(socialMetrics.date, startDate, endDate),
          orderBy: [desc(socialMetrics.date)],
          limit: 50,
        });
        break;
        
      case "website":
        data = await db.query.websiteMetrics.findMany({
          where: between(websiteMetrics.date, startDate, endDate),
          orderBy: [desc(websiteMetrics.date)],
          limit: 50,
        });
        break;
        
      case "newsletter":
        data = await db.query.newsletterMetrics.findMany({
          where: between(newsletterMetrics.date, startDate, endDate),
          orderBy: [desc(newsletterMetrics.date)],
          limit: 50,
        });
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid type parameter. Must be 'social', 'website', or 'newsletter'" },
          { status: 400 }
        );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recent metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent metrics" },
      { status: 500 }
    );
  }
} 