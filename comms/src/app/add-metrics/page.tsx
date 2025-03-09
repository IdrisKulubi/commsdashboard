import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialMetricForm } from "./_components/social-metric-form";
import { WebsiteMetricForm } from "./_components/website-metric-form";
import { NewsletterMetricForm } from "./_components/newsletter-metric-form";
import Link from "next/link";

export default async function AddMetricsPage() {
  async function handleSuccess() {
    "use server";
    try {
      redirect("/");
    } catch (error) {
      console.error("Redirect failed:", error);
      console.log("redirect failed", error);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Add Weekly Metrics</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid grid-cols-3 w-1/2">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <SocialMetricForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle>Website Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <WebsiteMetricForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <NewsletterMetricForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
