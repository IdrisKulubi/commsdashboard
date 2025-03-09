"use server";

import { db } from "@/db/drizzle";
import { socialMetrics, websiteMetrics, newsletterMetrics, socialEngagementMetrics } from "@/db/schema";
import { BUSINESS_UNITS } from "@/lib/constants";

export async function seedTestData() {
  const today = new Date();
  const platforms = ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "TIKTOK"];
  const businessUnits = Object.keys(BUSINESS_UNITS);
  const countries = ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR", "IN"];

  // Generate social metrics
  for (const platform of platforms) {
    for (const businessUnit of businessUnits) {
      for (const country of countries) {
        await db.insert(socialMetrics).values({
          platform: platform as any,
          businessUnit: businessUnit as any,
          country,
          date: today,
          followers: Math.floor(Math.random() * 100000) + 10000,
          numberOfPosts: Math.floor(Math.random() * 100) + 10,
          createdAt: today,
          updatedAt: today,
        });
      }
    }
  }

  // Generate website metrics
  for (const businessUnit of businessUnits) {
    for (const country of countries) {
      await db.insert(websiteMetrics).values({
        businessUnit: businessUnit as any,
        country,
        date: today,
        users: Math.floor(Math.random() * 50000) + 5000,
        pageViews: Math.floor(Math.random() * 200000) + 20000,
        sessions: Math.floor(Math.random() * 100000) + 10000,
        bounceRate: (Math.random() * 50 + 20).toFixed(2),
        avgSessionDuration: (Math.random() * 300 + 60).toFixed(2),
        createdAt: today,
        updatedAt: today,
      });
    }
  }

  // Generate newsletter metrics
  for (const businessUnit of businessUnits) {
    for (const country of countries) {
      await db.insert(newsletterMetrics).values({
        businessUnit: businessUnit as any,
        country,
        date: today,
        recipients: Math.floor(Math.random() * 20000) + 2000,
        opens: Math.floor(Math.random() * 15000) + 1000,
        clicks: Math.floor(Math.random() * 5000) + 500,
        unsubscribes: Math.floor(Math.random() * 100) + 10,
        createdAt: today,
        updatedAt: today,
      });
    }
  }

  return { success: true };
} 