import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/drizzle';
import { and, between, eq } from 'drizzle-orm';
import { socialMetrics } from '@/db/schema';
import { BUSINESS_UNITS } from '@/db/schema';
import { PLATFORMS } from '@/db/schema';

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

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching social metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social metrics' },
      { status: 500 }
    );
  }
} 