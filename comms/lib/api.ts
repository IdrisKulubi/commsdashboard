import { and, eq, between } from "drizzle-orm";
import { socialMetrics, websiteMetrics, newsletterMetrics } from "@/db/schema";
import type {
  SocialMetric,
  WebsiteMetric,
  NewsletterMetric,
} from "@/db/schema";
import db from "@/db/drizzle";

export async function getSocialMetrics(
  platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TIKTOK",
  businessUnit: "ASM" | "IACL" | "EM",
  startDate: Date,
  endDate: Date
): Promise<SocialMetric[]> {
  return db
    .select()
    .from(socialMetrics)
    .where(
      and(
        eq(socialMetrics.platform, platform),
        eq(socialMetrics.businessUnit, businessUnit),
        between(socialMetrics.date, startDate, endDate)
      )
    );
}

export async function getWebsiteMetrics(
  businessUnit: "ASM" | "IACL" | "EM",
  startDate: Date,
  endDate: Date
): Promise<WebsiteMetric[]> {
  return db
    .select()
    .from(websiteMetrics)
    .where(
      and(
        eq(websiteMetrics.businessUnit, businessUnit),
        between(websiteMetrics.date, startDate, endDate)
      )
    );
}

export async function getNewsletterMetrics(
  businessUnit: "ASM" | "IACL" | "EM",
  startDate: Date,
  endDate: Date
): Promise<NewsletterMetric[]> {
  return db
    .select()
    .from(newsletterMetrics)
    .where(
      and(
        eq(newsletterMetrics.businessUnit, businessUnit),
        between(newsletterMetrics.date, startDate, endDate)
      )
    );
}
