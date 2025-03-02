import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { socialMetrics, PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    const results = [];
    const platforms = Object.values(PLATFORMS);
    const businessUnits = Object.values(BUSINESS_UNITS);
    const today = new Date();
    
    // Create test data for each platform and business unit
    for (const platform of platforms) {
      for (const bu of businessUnits) {
        // Skip WEBSITE and NEWSLETTER platforms as they're not social platforms
        if (platform === "WEBSITE" || platform === "NEWSLETTER") continue;
        
        // Check if data already exists
        const existing = await db
          .select({ count: sql`count(*)` })
          .from(socialMetrics)
          .where(sql`platform = ${platform} AND business_unit = ${bu}`)
          .limit(1);
          
        const count = Number(existing[0]?.count || 0);
        
        if (count === 0) {
          // Add test data for this platform and business unit
          const result = await db.insert(socialMetrics).values({
            platform: platform,
            businessUnit: bu,
            date: today,
            country: "GLOBAL",
            impressions: Math.floor(Math.random() * 10000),
            followers: Math.floor(Math.random() * 5000),
            numberOfPosts: Math.floor(Math.random() * 50)
          }).returning();
          
          results.push({
            platform,
            businessUnit: bu,
            added: true,
            data: result[0]
          });
        } else {
          results.push({
            platform,
            businessUnit: bu,
            added: false,
            reason: "Data already exists"
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Test data seeded successfully",
      results
    });
  } catch (error) {
    console.error("Error seeding test data:", error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
} 