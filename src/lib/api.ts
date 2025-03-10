import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric } from "@/db/schema";


// Helper function to get the base URL
function getBaseUrl() {
  // For server-side rendering
  if (typeof window === 'undefined') {
    // In production on Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // For preview deployments
    if (process.env.VERCEL_ENV === 'preview') {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Fallback for development
    return 'http://localhost:3000';
  }
  
  // For client-side rendering, use relative URLs
  return '';
}

// Helper function to handle API requests with error handling and fallbacks
async function fetchWithFallback<T>(url: string, options = {}, fallbackData: T): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}${url}`;
    
    console.log(`Fetching from: ${fullUrl}`); // Debug log
    
    const response = await fetch(fullUrl, {
      ...options,
      cache: 'no-store', // Disable caching
      next: { revalidate: 0 }, // Don't revalidate
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} for ${fullUrl}`);
      return fallbackData;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return fallbackData;
  }
}

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

  return fetchWithFallback<SocialMetric[]>(
    `/api/analytics/social-metrics?${params.toString()}`,
    {},
    [] // Fallback to empty array
  );
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

  return fetchWithFallback<WebsiteMetric[]>(
    `/api/analytics/website-metrics?${params.toString()}`,
    {},
    [] // Fallback to empty array
  );
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

  return fetchWithFallback<NewsletterMetric[]>(
    `/api/analytics/newsletter-metrics?${params.toString()}`,
    {},
    [] // Fallback to empty array
  );
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

  return fetchWithFallback<SocialEngagementMetric[]>(
    `/api/analytics/social-engagement-metrics?${params.toString()}`,
    {},
    [] // Fallback to empty array
  );
}

// Direct database access for server components
export async function getTotalMetrics() {
  return fetchWithFallback(
    '/api/analytics/total-metrics',
    {},
    {
      totalFollowers: 0,
      totalWebsiteUsers: 0,
      totalNewsletterRecipients: 0,
      totalPosts: 0,
    }
  );
} 