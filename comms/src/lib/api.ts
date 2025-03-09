import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric } from "@/db/schema";

export async function getSocialMetrics(
  platform: string,
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<SocialMetric[]> {
  const params = new URLSearchParams({
    platform,
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const response = await fetch(`/api/analytics/social-metrics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch social metrics");
  }
  
  return response.json();
}

export async function getWebsiteMetrics(
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<WebsiteMetric[]> {
  const params = new URLSearchParams({
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const response = await fetch(`/api/analytics/website-metrics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch website metrics");
  }
  
  return response.json();
}

export async function getNewsletterMetrics(
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<NewsletterMetric[]> {
  const params = new URLSearchParams({
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const response = await fetch(`/api/analytics/newsletter-metrics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch newsletter metrics");
  }
  
  return response.json();
}

export async function getSocialEngagementMetrics(
  platform: string,
  businessUnit: string,
  startDate: Date,
  endDate: Date,
  country: string = "GLOBAL"
): Promise<SocialEngagementMetric[]> {
  const params = new URLSearchParams({
    platform,
    businessUnit,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    country,
  });

  const response = await fetch(`/api/analytics/social-engagement-metrics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch social engagement metrics");
  }
  
  return response.json();
}

export async function getTotalMetrics() {
  const response = await fetch('/api/analytics/total-metrics');
  
  if (!response.ok) {
    throw new Error("Failed to fetch total metrics");
  }
  
  return response.json();
} 