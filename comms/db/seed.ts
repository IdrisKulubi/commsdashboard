import { cwd } from "node:process";
import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import { socialMetrics, websiteMetrics, newsletterMetrics } from "./schema";
import type {
  NewSocialMetric,
  NewWebsiteMetric,
  NewNewsletterMetric,
} from "./schema";

// Load environment variables
loadEnvConfig(cwd());

const monthMap: { [key: string]: number } = {
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
};

const businessUnit = {
  ASM: "ASM",
  IACL: "IACL",
  EM: "EM",
} as const;

// Data validation function
function validateData(
  socialMetricsData: NewSocialMetric[],
  websiteMetricsData: NewWebsiteMetric[],
  newsletterMetricsData: NewNewsletterMetric[]
) {
  // Check for duplicate entries
  const socialKeys = new Set();
  const websiteKeys = new Set();
  const newsletterKeys = new Set();

  for (const metric of socialMetricsData) {
    const key = `${metric.platform}-${
      metric.businessUnit
    }-${metric.date.toISOString()}`;
    if (socialKeys.has(key)) {
      console.warn(`Warning: Duplicate social media entry found for ${key}`);
    }
    socialKeys.add(key);
  }

  for (const metric of websiteMetricsData) {
    const key = `${metric.businessUnit}-${metric.date.toISOString()}`;
    if (websiteKeys.has(key)) {
      console.warn(`Warning: Duplicate website entry found for ${key}`);
    }
    websiteKeys.add(key);
  }

  for (const metric of newsletterMetricsData) {
    const key = `${metric.businessUnit}-${metric.date.toISOString()}`;
    if (newsletterKeys.has(key)) {
      console.warn(`Warning: Duplicate newsletter entry found for ${key}`);
    }
    newsletterKeys.add(key);
  }

  // Validate date ranges
  const now = new Date();
  for (const metric of [
    ...socialMetricsData,
    ...websiteMetricsData,
    ...newsletterMetricsData,
  ]) {
    if (metric.date > now) {
      console.warn(`Warning: Future date found: ${metric.date.toISOString()}`);
    }
  }
}

function parsePercentage(value: string | null): string | null {
  if (!value) return null;
  return (parseFloat(value.replace("%", "")) / 100).toString();
}

const main = async () => {
  try {
    // Connect to database
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();
    const db = drizzle(client);

    // Clear existing data
    await db.delete(socialMetrics);
    await db.delete(websiteMetrics);
    await db.delete(newsletterMetrics);

    // Define metrics data
    const socialMetricsData: NewSocialMetric[] = [
      // Facebook ASM
      ...Object.entries(monthMap).map(([month, monthIndex]) => ({
        platform: "FACEBOOK" as const,
        businessUnit: businessUnit.ASM,
        date: new Date(2024, monthIndex, 1),
        impressions:
          month === "JANUARY"
            ? 1800
            : month === "FEBRUARY"
            ? 96000
            : month === "MARCH"
            ? 834900
            : month === "APRIL"
            ? 312000
            : month === "MAY"
            ? 498500
            : month === "JUNE"
            ? 1000
            : month === "JULY"
            ? 619
            : month === "AUGUST"
            ? 597
            : month === "SEPTEMBER"
            ? 592
            : month === "OCTOBER"
            ? 161000
            : null,
        followers:
          month === "JANUARY"
            ? 4
            : month === "FEBRUARY"
            ? 10
            : month === "MARCH"
            ? 183
            : month === "APRIL"
            ? 19
            : month === "MAY"
            ? 68
            : month === "JUNE"
            ? 8
            : month === "JULY"
            ? 7
            : month === "AUGUST"
            ? 8
            : month === "SEPTEMBER"
            ? 6
            : month === "OCTOBER"
            ? 79
            : null,
        numberOfPosts: null, // Add actual numbers if available
      })),

      // Facebook IACL
      ...Object.entries(monthMap).map(([month, monthIndex]) => ({
        platform: "FACEBOOK" as const,
        businessUnit: businessUnit.IACL,
        date: new Date(2024, monthIndex, 1),
        impressions:
          month === "JANUARY"
            ? 903
            : month === "FEBRUARY"
            ? 187000
            : month === "MARCH"
            ? 124700
            : month === "APRIL"
            ? 125400
            : month === "MAY"
            ? 51500
            : month === "JUNE"
            ? 1200
            : month === "JULY"
            ? 438
            : month === "AUGUST"
            ? 352
            : month === "SEPTEMBER"
            ? 273
            : month === "OCTOBER"
            ? 109400
            : null,
        followers:
          month === "JANUARY"
            ? 102
            : month === "FEBRUARY"
            ? 2100
            : month === "MARCH"
            ? 88
            : month === "APRIL"
            ? 11
            : month === "MAY"
            ? 60
            : month === "JUNE"
            ? 8
            : month === "JULY"
            ? 5
            : month === "AUGUST"
            ? 1
            : month === "SEPTEMBER"
            ? 5
            : month === "OCTOBER"
            ? 38
            : null,
        numberOfPosts:
          month === "SEPTEMBER" ? 42 : month === "OCTOBER" ? 46 : null,
      })),

      // Facebook EM
      ...Object.entries(monthMap)
        .slice(0, 8)
        .map(([month, monthIndex]) => ({
          platform: "FACEBOOK" as const,
          businessUnit: businessUnit.EM,
          date: new Date(2024, monthIndex, 1),
          impressions:
            month === "JANUARY"
              ? 41309
              : month === "FEBRUARY"
              ? 32391
              : month === "MARCH"
              ? 23843
              : month === "APRIL"
              ? 7728
              : month === "MAY"
              ? 5038
              : month === "JUNE"
              ? 4046
              : month === "JULY"
              ? 3560
              : month === "AUGUST"
              ? 1659
              : null,
          followers:
            month === "JANUARY"
              ? 10
              : month === "FEBRUARY"
              ? 13
              : month === "MARCH"
              ? 10
              : month === "APRIL"
              ? 14
              : month === "MAY"
              ? 7
              : month === "JUNE"
              ? 4
              : month === "JULY"
              ? 2
              : month === "AUGUST"
              ? 4
              : null,
          numberOfPosts: null,
        })),

      // Instagram IACL
      ...Object.entries(monthMap)
        .slice(4, 11)
        .map(([month, monthIndex]) => ({
          platform: "INSTAGRAM" as const,
          businessUnit: businessUnit.IACL,
          date: new Date(2024, monthIndex, 1),
          impressions:
            month === "MAY"
              ? 142
              : month === "JUNE"
              ? 37
              : month === "JULY"
              ? 83
              : month === "AUGUST"
              ? 20
              : month === "SEPTEMBER"
              ? 70
              : month === "OCTOBER"
              ? 2500
              : null,
          followers:
            month === "MAY"
              ? 5
              : month === "JUNE"
              ? 1
              : month === "JULY"
              ? 8
              : month === "AUGUST"
              ? 6
              : month === "SEPTEMBER"
              ? 6
              : month === "OCTOBER"
              ? 2
              : null,
          numberOfPosts: null,
        })),

      // Instagram EM
      ...Object.entries(monthMap)
        .slice(3, 6)
        .map(([month, monthIndex]) => ({
          platform: "INSTAGRAM" as const,
          businessUnit: businessUnit.EM,
          date: new Date(2024, monthIndex, 1),
          impressions:
            month === "APRIL"
              ? 67
              : month === "MAY"
              ? 810
              : month === "JUNE"
              ? 389
              : null,
          followers:
            month === "APRIL"
              ? 0
              : month === "MAY"
              ? 0
              : month === "JUNE"
              ? 1
              : null,
          numberOfPosts:
            month === "APRIL"
              ? 0
              : month === "MAY"
              ? 4
              : month === "JUNE"
              ? 5
              : null,
        })),

      // LinkedIn ASM
      ...Object.entries(monthMap)
        .slice(0, 10)
        .map(([month, monthIndex]) => ({
          platform: "LINKEDIN" as const,
          businessUnit: businessUnit.ASM,
          date: new Date(2024, monthIndex, 1),
          impressions:
            month === "JANUARY"
              ? 1649
              : month === "FEBRUARY"
              ? 1358
              : month === "MARCH"
              ? 4578
              : month === "APRIL"
              ? 9840
              : month === "MAY"
              ? 7266
              : month === "JUNE"
              ? 5424
              : month === "JULY"
              ? 8940
              : month === "AUGUST"
              ? 4521
              : month === "SEPTEMBER"
              ? 7641
              : month === "OCTOBER"
              ? 3536
              : null,
          followers:
            month === "JANUARY"
              ? 55
              : month === "FEBRUARY"
              ? 23
              : month === "MARCH"
              ? 280
              : month === "APRIL"
              ? 328
              : month === "MAY"
              ? 109
              : month === "JUNE"
              ? 128
              : month === "JULY"
              ? 167
              : month === "AUGUST"
              ? 61
              : month === "SEPTEMBER"
              ? 165
              : month === "OCTOBER"
              ? 47
              : null,
          numberOfPosts:
            month === "JANUARY"
              ? 20
              : month === "FEBRUARY"
              ? 23
              : month === "MARCH"
              ? 40
              : month === "APRIL"
              ? 36
              : month === "MAY"
              ? 20
              : month === "JUNE"
              ? 29
              : month === "JULY"
              ? 34
              : month === "AUGUST"
              ? 43
              : month === "SEPTEMBER"
              ? 42
              : month === "OCTOBER"
              ? 42
              : null,
        })),

      // LinkedIn IACL
      ...Object.entries(monthMap)
        .slice(0, 10)
        .map(([month, monthIndex]) => ({
          platform: "LINKEDIN" as const,
          businessUnit: businessUnit.IACL,
          date: new Date(2024, monthIndex, 1),
          impressions:
            month === "JANUARY"
              ? 36376
              : month === "FEBRUARY"
              ? 124120
              : month === "MARCH"
              ? 58920
              : month === "APRIL"
              ? 67864
              : month === "MAY"
              ? 93177
              : month === "JUNE"
              ? 41096
              : month === "JULY"
              ? 70098
              : month === "AUGUST"
              ? 43627
              : month === "SEPTEMBER"
              ? 38932
              : month === "OCTOBER"
              ? 54984
              : null,
          followers:
            month === "JANUARY"
              ? 943
              : month === "FEBRUARY"
              ? 477
              : month === "MARCH"
              ? 384
              : month === "APRIL"
              ? 850
              : month === "MAY"
              ? 659
              : month === "JUNE"
              ? 316
              : month === "JULY"
              ? 1001
              : month === "AUGUST"
              ? 552
              : month === "SEPTEMBER"
              ? 256
              : month === "OCTOBER"
              ? 346
              : null,
          numberOfPosts:
            month === "JANUARY"
              ? 60
              : month === "FEBRUARY"
              ? 55
              : month === "MARCH"
              ? 73
              : month === "APRIL"
              ? 65
              : month === "MAY"
              ? 52
              : month === "JUNE"
              ? 53
              : month === "JULY"
              ? 58
              : month === "AUGUST"
              ? 58
              : month === "SEPTEMBER"
              ? 53
              : month === "OCTOBER"
              ? 48
              : null,
        })),

      // LinkedIn EM
      ...Object.entries(monthMap)
        .slice(5, 10)
        .map(([month, monthIndex]) => ({
          platform: "LINKEDIN" as const,
          businessUnit: businessUnit.EM,
          date: new Date(2024, monthIndex, 1),
          impressions:
            month === "JUNE"
              ? 72268
              : month === "JULY"
              ? 66112
              : month === "AUGUST"
              ? 51953
              : month === "SEPTEMBER"
              ? 58224
              : month === "OCTOBER"
              ? 38766
              : null,
          followers:
            month === "JUNE"
              ? 53
              : month === "JULY"
              ? 135
              : month === "AUGUST"
              ? 130
              : month === "SEPTEMBER"
              ? 133
              : month === "OCTOBER"
              ? 196
              : null,
          numberOfPosts: null,
        })),

      // TikTok IACL
      ...Object.entries(monthMap)
        .slice(0, 7)
        .map(([month, monthIndex]) => ({
          platform: "TIKTOK" as const,
          businessUnit: businessUnit.IACL,
          date: new Date(2024, monthIndex, 1),
          impressions:
            month === "JANUARY"
              ? 4966
              : month === "FEBRUARY"
              ? 5194
              : month === "MARCH"
              ? 2794
              : month === "APRIL"
              ? 29
              : month === "MAY"
              ? 3
              : month === "JUNE"
              ? 3
              : month === "JULY"
              ? 138
              : null,
          followers:
            month === "JANUARY"
              ? 7
              : month === "FEBRUARY"
              ? 5
              : month === "MARCH"
              ? 5
              : month === "APRIL"
              ? 2
              : month === "MAY"
              ? 0
              : month === "JUNE"
              ? 0
              : month === "JULY"
              ? 3
              : null,
          numberOfPosts:
            month === "JANUARY"
              ? 9
              : month === "FEBRUARY"
              ? 5
              : month === "MARCH"
              ? 9
              : month === "APRIL"
              ? 0
              : month === "MAY"
              ? 10
              : month === "JUNE"
              ? 1
              : month === "JULY"
              ? 0
              : null,
        })),
    ];

    const websiteMetricsData: NewWebsiteMetric[] = [
      // ASM Website
      ...Object.entries(monthMap).map(([month, monthIndex]) => ({
        businessUnit: businessUnit.ASM,
        date: new Date(2024, monthIndex, 1),
        users:
          month === "JANUARY"
            ? 2500
            : month === "FEBRUARY"
            ? 2600
            : month === "MARCH"
            ? 444
            : month === "APRIL"
            ? 259
            : month === "MAY"
            ? 338
            : month === "JUNE"
            ? 351
            : month === "JULY"
            ? 317
            : month === "AUGUST"
            ? 188
            : month === "SEPTEMBER"
            ? 227
            : month === "OCTOBER"
            ? 532
            : null,
        clicks:
          month === "JANUARY"
            ? 10000
            : month === "FEBRUARY"
            ? 14000
            : month === "MARCH"
            ? 2400
            : month === "APRIL"
            ? 1300
            : month === "MAY"
            ? 1800
            : month === "JUNE"
            ? 6100
            : month === "JULY"
            ? 4300
            : month === "SEPTEMBER"
            ? 1489
            : month === "OCTOBER"
            ? 1594
            : null,
        sessions: month === "AUGUST" ? 308 : month === "SEPTEMBER" ? 360 : null,
      })),

      // IACL Website
      ...Object.entries(monthMap).map(([month, monthIndex]) => ({
        businessUnit: businessUnit.IACL,
        date: new Date(2024, monthIndex, 1),
        users:
          month === "JANUARY"
            ? 505
            : month === "FEBRUARY"
            ? 779
            : month === "MARCH"
            ? 3700
            : month === "APRIL"
            ? 1900
            : month === "MAY"
            ? 1500
            : month === "JUNE"
            ? 1200
            : month === "JULY"
            ? 3884
            : month === "AUGUST"
            ? 948
            : month === "SEPTEMBER"
            ? 1862
            : month === "OCTOBER"
            ? 3553
            : null,
        clicks:
          month === "JANUARY"
            ? 3900
            : month === "FEBRUARY"
            ? 5300
            : month === "MARCH"
            ? 21000
            : month === "APRIL"
            ? 10000
            : month === "MAY"
            ? 11000
            : month === "JUNE"
            ? 8100
            : month === "JULY"
            ? 10268
            : month === "SEPTEMBER"
            ? 4951
            : month === "OCTOBER"
            ? 10040
            : null,
        sessions:
          month === "AUGUST" ? 1557 : month === "SEPTEMBER" ? 1132 : null,
      })),

      // EM Website
      ...Object.entries(monthMap)
        .slice(0, 6)
        .map(([month, monthIndex]) => ({
          businessUnit: businessUnit.EM,
          date: new Date(2024, monthIndex, 1),
          users:
            month === "JANUARY"
              ? 17051
              : month === "FEBRUARY"
              ? 14592
              : month === "MARCH"
              ? 14470
              : month === "APRIL"
              ? 14763
              : month === "MAY"
              ? 18794
              : month === "JUNE"
              ? 420
              : null,
          clicks: null, // No click data available
          sessions: month === "JULY" ? 508 : null,
        })),
    ];

    const newsletterMetricsData: NewNewsletterMetric[] = [
      // ASM Newsletter
      ...Object.entries(monthMap)
        .slice(0, 8)
        .map(([_, monthIndex]) => ({
          businessUnit: businessUnit.ASM,
          date: new Date(2024, monthIndex, 1),
          recipients:
            monthIndex === 0
              ? 26496
              : monthIndex === 1
              ? 25274
              : monthIndex === 2
              ? 25000
              : monthIndex === 3
              ? 24864
              : monthIndex === 4
              ? 24683
              : monthIndex === 5
              ? 24462
              : monthIndex === 6
              ? 24299
              : monthIndex === 7
              ? 24122
              : null,
          openRate:
            monthIndex === 0
              ? "0.25"
              : monthIndex === 1
              ? "0.20"
              : monthIndex === 2
              ? "0.25"
              : monthIndex === 3
              ? "0.24864"
              : monthIndex === 4
              ? "0.24683"
              : monthIndex === 5
              ? "0.24462"
              : monthIndex === 6
              ? "0.24299"
              : monthIndex === 7
              ? "0.24122"
              : null,
          numberOfEmails:
            monthIndex === 0
              ? 6
              : monthIndex === 1
              ? 3
              : monthIndex === 2
              ? 8
              : monthIndex === 3
              ? 4
              : monthIndex === 4
              ? 4
              : monthIndex === 5
              ? 5
              : monthIndex === 6
              ? 4
              : monthIndex === 7
              ? 4
              : null,
        })),

      // IACL Newsletter
      ...Object.entries(monthMap)
        .slice(0, 8)
        .map(([_, monthIndex]) => ({
          businessUnit: businessUnit.IACL,
          date: new Date(2024, monthIndex, 1),
          recipients:
            monthIndex === 0
              ? 766
              : monthIndex === 1
              ? 825
              : monthIndex === 2
              ? 1157
              : monthIndex === 3
              ? 1153
              : monthIndex === 4
              ? 1153
              : monthIndex === 5
              ? 1153
              : monthIndex === 6
              ? 1153
              : monthIndex === 7
              ? 1153
              : null,
          openRate:
            monthIndex === 0
              ? "0.4"
              : monthIndex === 1
              ? "0.17"
              : monthIndex === 2
              ? "0.598"
              : monthIndex === 3
              ? "0.17"
              : monthIndex === 4
              ? "0.17"
              : monthIndex === 5
              ? "0.17"
              : monthIndex === 6
              ? "0.17"
              : monthIndex === 7
              ? "0.17"
              : null,
          numberOfEmails:
            monthIndex === 0
              ? 1
              : monthIndex === 1
              ? 1
              : monthIndex === 2
              ? 2
              : monthIndex === 3
              ? 1
              : monthIndex === 4
              ? 1
              : monthIndex === 5
              ? 1
              : monthIndex === 6
              ? 1
              : monthIndex === 7
              ? 1
              : null,
        })),

      // EM Newsletter - No data available but including structure for future
      ...Object.entries(monthMap)
        .slice(0, 1)
        .map(([_, monthIndex]) => ({
          businessUnit: businessUnit.EM,
          date: new Date(2024, monthIndex, 1),
          recipients: null,
          openRate: null,
          numberOfEmails: null,
        })),
    ];

    // Validate the data before insertion
    validateData(socialMetricsData, websiteMetricsData, newsletterMetricsData);

    // Insert data
    await db.insert(socialMetrics).values(socialMetricsData);
    await db.insert(websiteMetrics).values(websiteMetricsData);
    await db.insert(newsletterMetrics).values(newsletterMetricsData);

    console.log("Seed completed successfully");
    console.log(`Inserted ${socialMetricsData.length} social media records`);
    console.log(`Inserted ${websiteMetricsData.length} website records`);
    console.log(`Inserted ${newsletterMetricsData.length} newsletter records`);

    // Close database connection
    await client.end();
  } catch (error) {
    console.error("Error seeding database:", error);
    throw new Error("Failed to seed database");
  }
};

// Run the seed function
main();
