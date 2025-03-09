import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/drizzle';
import { and, between, eq } from 'drizzle-orm';
import { socialMetrics } from '@/db/schema';
import { BUSINESS_UNITS } from '@/db/schema';
import { PLATFORMS } from '@/db/schema';
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const businessUnit = searchParams.get('businessUnit');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const platform = searchParams.get('platform');
    const country = searchParams.get('country');

    // Validate required parameters
    if (!businessUnit || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: businessUnit, from, to' },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [
      eq(socialMetrics.businessUnit, businessUnit as keyof typeof BUSINESS_UNITS),
      between(socialMetrics.date, new Date(from), new Date(to))
    ];

    // Add platform filter if provided
    if (platform) {
      conditions.push(eq(socialMetrics.platform, platform as keyof typeof PLATFORMS));
    }

    // Add country filter if provided
    if (country) {
      conditions.push(eq(socialMetrics.country, country));
    }

    // Query the database
    const metrics = await db
      .select()
      .from(socialMetrics)
      .where(and(...conditions))
      .orderBy(socialMetrics.date);

    // Add debug logging
    console.log("Filtering by platform:", platform);
    console.log("Query conditions:", conditions);
    console.log("Returned metrics:", metrics.length);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching social metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social metrics' },
      { status: 500 }
    );
  }
}

// Define the request schema
const socialMetricSchema = z.object({
  platform: z.string(),
  businessUnit: z.string(),
  date: z.string().or(z.date()).transform(val => 
    typeof val === "string" ? new Date(val) : val
  ),
  country: z.string().default("GLOBAL"),
  followers: z.number().int().min(0).optional(),
  impressions: z.number().int().min(0).optional(),
  numberOfPosts: z.number().int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const validatedData = socialMetricSchema.parse(body);
    
    // Insert the data into the database
    const result = await db.insert(socialMetrics).values({
      platform: validatedData.platform,
      businessUnit: validatedData.businessUnit,
      date: validatedData.date,
      country: validatedData.country,
      followers: validatedData.followers,
      impressions: validatedData.impressions,
      numberOfPosts: validatedData.numberOfPosts,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // Revalidate the analytics page
    revalidatePath("/analytics");
    revalidatePath("/");
    
    // Return the result
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding social metric:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to add social metric" },
      { status: 500 }
    );
  }
} 