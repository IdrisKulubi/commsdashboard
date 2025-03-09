"use server";

import db from "@/db/drizzle";
import { socialMetrics, PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function seedTestData() {
  try {
    // Create test data for all platforms
    const platforms = Object.values(PLATFORMS);
    const businessUnits = Object.values(BUSINESS_UNITS);
    
    const today = new Date();
    
    for (const platform of platforms) {
      for (const bu of businessUnits) {
        // Check if data already exists
        const existing = await db
          .select()
          .from(socialMetrics)
          .where(sql`platform = ${platform} AND business_unit = ${bu}`)
          .limit(1);
          
        if (existing.length === 0) {
          // Add test data for this platform and business unit
          await db.insert(socialMetrics).values({
            platform: platform,
            businessUnit: bu,
            date: today,
            country: "GLOBAL",
            impressions: Math.floor(Math.random() * 10000),
            followers: Math.floor(Math.random() * 5000),
            numberOfPosts: Math.floor(Math.random() * 50)
          });
          
          console.log(`Added test data for ${platform} - ${bu}`);
        }
      }
    }
    
    return { success: true, message: "Test data added successfully" };
  } catch (error) {
    console.error("Error seeding test data:", error);
    return { success: false, error: String(error) };
  }
} 