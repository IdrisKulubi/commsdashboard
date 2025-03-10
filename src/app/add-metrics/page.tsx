import { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialMetricForm } from "@/components/forms/social-metric-form";
import { WebsiteMetricForm } from "@/components/forms/website-metric-form";
import { NewsletterMetricForm } from "@/components/forms/newsletter-metric-form";
import { EngagementMetricForm } from "@/components/forms/engagement-metric-form";
import { PLATFORMS, BUSINESS_UNITS } from "@/db/schema";
import { COUNTRIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Add Metrics",
  description: "Add new metrics to the dashboard",
};

export default function AddMetricsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add Metrics"
        description="Add new metrics data to the dashboard"
      />
      
      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="social" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Metrics</CardTitle>
              <CardDescription>
                Add followers, impressions, and post metrics for social platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialMetricForm 
                platforms={Object.values(PLATFORMS).filter(p => 
                  p !== "WEBSITE" && p !== "NEWSLETTER"
                )}
                businessUnits={Object.values(BUSINESS_UNITS)}
                countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="website" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Metrics</CardTitle>
              <CardDescription>
                Add users, clicks, and session metrics for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebsiteMetricForm 
                businessUnits={Object.values(BUSINESS_UNITS)}
                countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="newsletter" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Metrics</CardTitle>
              <CardDescription>
                Add recipients, open rates, and email metrics for your newsletters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewsletterMetricForm 
                businessUnits={Object.values(BUSINESS_UNITS)}
                countries={Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Add likes, comments, shares, and other engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EngagementMetricForm 
                platforms={Object.values(PLATFORMS).filter(p => 
                  p !== "WEBSITE" && p !== "NEWSLETTER"
                )}
                businessUnits={Object.values(BUSINESS_UNITS)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
