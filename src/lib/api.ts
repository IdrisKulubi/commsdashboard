import { SocialMetric, WebsiteMetric, NewsletterMetric, SocialEngagementMetric } from "@/db/schema";


// Helper function to get the base URL
function getBaseUrl() {
  // For server-side rendering
  if (typeof window === 'undefined') {
    // Log environment variables to understand what we're working with
    console.log("VERCEL_URL:", process.env.VERCEL_URL);
    console.log("VERCEL_ENV:", process.env.VERCEL_ENV);
    
    // In production on Vercel
    if (process.env.VERCEL_URL) {
      const url = `https://${process.env.VERCEL_URL}`;
      console.log("Using Vercel URL:", url);
      return url;
    }
    
    // For preview deployments
    if (process.env.VERCEL_ENV === 'preview') {
      const url = `https://${process.env.VERCEL_URL}`;
      console.log("Using preview URL:", url);
      return url;
    }
    
    // Fallback for development
    console.log("Using localhost URL");
    return 'http://localhost:3000';
  }
  
  // For client-side rendering, use relative URLs
  console.log("Using client-side relative URL");
  return '';
}

// Helper function to handle API requests with error handling and fallbacks
async function fetchWithFallback<T>(url: string, options = {}, fallbackData: T): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    
    // Ensure URL doesn't have double slashes when joining
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${normalizedBaseUrl}${normalizedPath}`;
    
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