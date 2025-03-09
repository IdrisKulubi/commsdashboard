import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { socialMetrics, websiteMetrics, newsletterMetrics } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get the most recent date for each metric type
    const latestSocialMetric = await db.query.socialMetrics.findFirst({
      orderBy: [desc(socialMetrics.date)],
    });
    
    const latestWebsiteMetric = await db.query.websiteMetrics.findFirst({
      orderBy: [desc(websiteMetrics.date)],
    });
    
    const latestNewsletterMetric = await db.query.newsletterMetrics.findFirst({
      orderBy: [desc(newsletterMetrics.date)],
    });
    
    if (!latestSocialMetric) {
      return NextResponse.json([]);
    }
    
    // Get all countries from social metrics
    const countriesResult = await db
      .select({ country: socialMetrics.country })
      .from(socialMetrics)
      .where(sql`${socialMetrics.date} = ${latestSocialMetric.date}`)
      .groupBy(socialMetrics.country);
    
    const countries = countriesResult
      .map(row => row.country)
      .filter(country => country !== "GLOBAL");
    
    // Get metrics for each country
    const countryData = await Promise.all(
      countries.map(async (country) => {
        // Get social followers for this country
        const socialResult = await db
          .select({ 
            total: sql`SUM(${socialMetrics.followers})` 
          })
          .from(socialMetrics)
          .where(sql`${socialMetrics.date} = ${latestSocialMetric.date} AND ${socialMetrics.country} = ${country}`);
        
        // Get website users for this country
        const websiteResult = latestWebsiteMetric 
          ? await db
              .select({ 
                total: sql`SUM(${websiteMetrics.users})` 
              })
              .from(websiteMetrics)
              .where(sql`${websiteMetrics.date} = ${latestWebsiteMetric.date} AND ${websiteMetrics.country} = ${country}`)
          : [{ total: 0 }];
        
        // Get newsletter recipients for this country
        const newsletterResult = latestNewsletterMetric
          ? await db
              .select({ 
                total: sql`SUM(${newsletterMetrics.recipients})` 
              })
              .from(newsletterMetrics)
              .where(sql`${newsletterMetrics.date} = ${latestNewsletterMetric.date} AND ${newsletterMetrics.country} = ${country}`)
          : [{ total: 0 }];
        
        return {
          country,
          followers: Number(socialResult[0]?.total || 0),
          websiteUsers: Number(websiteResult[0]?.total || 0),
          newsletterRecipients: Number(newsletterResult[0]?.total || 0),
        };
      })
    );
    
    // Add global totals
    const globalSocialResult = await db
      .select({ 
        total: sql`SUM(${socialMetrics.followers})` 
      })
      .from(socialMetrics)
      .where(sql`${socialMetrics.date} = ${latestSocialMetric.date}`);
    
    const globalWebsiteResult = latestWebsiteMetric 
      ? await db
          .select({ 
            total: sql`SUM(${websiteMetrics.users})` 
          })
          .from(websiteMetrics)
          .where(sql`${websiteMetrics.date} = ${latestWebsiteMetric.date}`)
      : [{ total: 0 }];
    
    const globalNewsletterResult = latestNewsletterMetric
      ? await db
          .select({ 
            total: sql`SUM(${newsletterMetrics.recipients})` 
          })
          .from(newsletterMetrics)
          .where(sql`${newsletterMetrics.date} = ${latestNewsletterMetric.date}`)
      : [{ total: 0 }];
    
    countryData.unshift({
      country: "Global",
      followers: Number(globalSocialResult[0]?.total || 0),
      websiteUsers: Number(globalWebsiteResult[0]?.total || 0),
      newsletterRecipients: Number(globalNewsletterResult[0]?.total || 0),
    });
    
    return NextResponse.json(countryData);
  } catch (error) {
    console.error("Error fetching country distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch country distribution" },
      { status: 500 }
    );
  }
} 