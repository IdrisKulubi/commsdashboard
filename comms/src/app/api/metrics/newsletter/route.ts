import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db/drizzle";
import { newsletterMetrics } from "@/db/schema";
import { revalidatePath } from "next/cache";

// Define the request schema
const newsletterMetricSchema = z.object({
  businessUnit: z.string(),
  date: z.string().or(z.date()).transform(val => 
    typeof val === "string" ? new Date(val) : val
  ),
  country: z.string().default("GLOBAL"),
  recipients: z.number().int().min(0).optional(),
  openRate: z.number().min(0).max(1).optional(),
  numberOfEmails: z.number().int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const validatedData = newsletterMetricSchema.parse(body);
    
    // Insert the data into the database
    const result = await db.insert(newsletterMetrics).values({
      businessUnit: validatedData.businessUnit,
      date: validatedData.date,
      country: validatedData.country,
      recipients: validatedData.recipients,
      openRate: validatedData.openRate,
      numberOfEmails: validatedData.numberOfEmails,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // Revalidate the analytics page
    revalidatePath("/analytics");
    revalidatePath("/");
    
    // Return the result
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding newsletter metric:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to add newsletter metric" },
      { status: 500 }
    );
  }
} 