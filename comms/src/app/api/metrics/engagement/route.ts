import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db/drizzle";
import { socialEngagementMetrics } from "@/db/schema";
import { revalidatePath } from "next/cache";

// Define the request schema
const engagementMetricSchema = z.object({
  platform: z.string(),
  businessUnit: z.string(),
  date: z.string().or(z.date()).transform(val => 
    typeof val === "string" ? new Date(val) : val
  ),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),
  saves: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  engagementRate: z.number().min(0).max(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const validatedData = engagementMetricSchema.parse(body);
    
    // Insert the data into the database
    const result = await db.insert(socialEngagementMetrics).values({
      platform: validatedData.platform,
      businessUnit: validatedData.businessUnit,
      date: validatedData.date,
      likes: validatedData.likes,
      comments: validatedData.comments,
      shares: validatedData.shares,
      saves: validatedData.saves,
      clicks: validatedData.clicks,
      engagementRate: validatedData.engagementRate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // Revalidate the analytics page
    revalidatePath("/analytics");
    revalidatePath("/");
    
    // Return the result
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding engagement metric:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to add engagement metric" },
      { status: 500 }
    );
  }
} 