import { NextResponse } from "next/server";
import { getCountryDistribution } from "@/app/actions/analytics";

export async function GET() {
  try {
    const countryData = await getCountryDistribution();
    return NextResponse.json(countryData);
  } catch (error) {
    console.error("Error in country-distribution API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch country distribution" },
      { status: 500 }
    );
  }
} 