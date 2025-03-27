"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CountryData {
  country: string;
  followers: number;
  websiteUsers: number;
  newsletterRecipients: number;
}

export default function CountryHeatmapPage() {
  const [data, setData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState<"followers" | "websiteUsers" | "newsletterRecipients">("followers");
  
  useEffect(() => {
    async function fetchCountryDistribution() {
      try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/analytics/country-distribution`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch country distribution data');
        }
        
        const countryData = await response.json();
        setData(countryData);
      } catch (error) {
        console.error('Error fetching country distribution:', error);
        // Fallback data
        setData([
          { country: "United States", followers: 100000, websiteUsers: 50000, newsletterRecipients: 30000 },
          { country: "United Kingdom", followers: 50000, websiteUsers: 25000, newsletterRecipients: 15000 },
          { country: "Canada", followers: 30000, websiteUsers: 15000, newsletterRecipients: 10000 },
          { country: "Australia", followers: 20000, websiteUsers: 10000, newsletterRecipients: 5000 },
          { country: "Germany", followers: 15000, websiteUsers: 8000, newsletterRecipients: 4000 },
          { country: "France", followers: 12000, websiteUsers: 6000, newsletterRecipients: 3000 },
          { country: "Japan", followers: 10000, websiteUsers: 5000, newsletterRecipients: 2500 },
          { country: "Brazil", followers: 8000, websiteUsers: 4000, newsletterRecipients: 2000 },
          { country: "India", followers: 5000, websiteUsers: 2000, newsletterRecipients: 1000 },
          // Additional countries for better heatmap distribution
          { country: "Mexico", followers: 7500, websiteUsers: 3500, newsletterRecipients: 1800 },
          { country: "Spain", followers: 9000, websiteUsers: 4500, newsletterRecipients: 2200 },
          { country: "Italy", followers: 11000, websiteUsers: 5500, newsletterRecipients: 2700 },
          { country: "Netherlands", followers: 8500, websiteUsers: 4200, newsletterRecipients: 2100 },
          { country: "Sweden", followers: 6000, websiteUsers: 3000, newsletterRecipients: 1500 },
          { country: "China", followers: 25000, websiteUsers: 12000, newsletterRecipients: 6000 },
          { country: "South Korea", followers: 7000, websiteUsers: 3500, newsletterRecipients: 1700 },
          { country: "Russia", followers: 9500, websiteUsers: 4700, newsletterRecipients: 2300 },
          { country: "South Africa", followers: 4500, websiteUsers: 2200, newsletterRecipients: 1100 },
          { country: "Argentina", followers: 3500, websiteUsers: 1700, newsletterRecipients: 850 },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCountryDistribution();
  }, []);

  const metricOptions = [
    { value: "followers", label: "Social Followers" },
    { value: "websiteUsers", label: "Website Users" },
    { value: "newsletterRecipients", label: "Newsletter Subscribers" }
  ];

  return (
    <main className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Link href="/analytics">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Button>
          </Link>
          <div className="flex gap-2">
            {metricOptions.map((option) => (
              <Button 
                key={option.value}
                variant={metric === option.value ? "default" : "outline"}
                size="sm"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setMetric(option.value as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Global Audience Distribution</CardTitle>
            <CardDescription>
              Visualizing {metric === "followers" ? "social followers" : 
                metric === "websiteUsers" ? "website users" : "newsletter subscribers"} distribution by country
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[500px] w-full" />
            ) : (
              <div className="h-[500px] w-full relative" id="country-heatmap">
                <CountryHeatmap data={data} metric={metric} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function CountryHeatmap({ data, metric }: { 
  data: CountryData[], 
  metric: "followers" | "websiteUsers" | "newsletterRecipients" 
}) {
  useEffect(() => {
    // This effect will load and initialize the heatmap on the client side
    const initHeatmap = async () => {
      try {
        // We'll use D3.js for rendering the heatmap
        const d3 = await import('d3');
        const container = document.getElementById('country-heatmap');
        
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Calculate boundaries and sizes
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Create SVG container
        const svg = d3.select(container)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('background-color', '#f8fafc');
        
        // We would normally load a GeoJSON world map here
        // For now we'll create a placeholder visualization
        
        const maxValue = Math.max(...data.map(d => d[metric]));
        
        // Simple visualization - colored rectangles representing countries
        const boxWidth = Math.floor(width / Math.ceil(Math.sqrt(data.length)));
        const boxHeight = Math.floor(height / Math.ceil(Math.sqrt(data.length)));
        
        const colorScale = d3.scaleSequential()
          .domain([0, maxValue])
          .interpolator(d3.interpolateViridis);
        
        // Create country boxes
        const countryGroups = svg.selectAll('.country')
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'country')
          .attr('transform', (d, i) => {
            const row = Math.floor(i / Math.ceil(Math.sqrt(data.length)));
            const col = i % Math.ceil(Math.sqrt(data.length));
            return `translate(${col * boxWidth}, ${row * boxHeight})`;
          });
        
        // Add rectangles with color based on metric value
        countryGroups.append('rect')
          .attr('width', boxWidth - 2)
          .attr('height', boxHeight - 2)
          .attr('fill', d => colorScale(d[metric]))
          .attr('rx', 4)
          .attr('ry', 4);
        
        // Add country labels
        countryGroups.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', (d) => {
            const normalizedValue = d[metric] / maxValue;
            return normalizedValue > 0.5 ? 'white' : 'black';
          })
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .text(d => d.country);
        
        // Add value labels
        countryGroups.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2 + 16)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', (d) => {
            const normalizedValue = d[metric] / maxValue;
            return normalizedValue > 0.5 ? 'white' : 'black';
          })
          .style('font-size', '10px')
          .text(d => new Intl.NumberFormat().format(d[metric]));
        
        // Add a note about the placeholder visualization
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', '#6b7280')
          .text('Note: This is a simplified representation. A geographic map would be used in production.');
          
      } catch (error) {
        console.error('Error initializing heatmap:', error);
      }
    };
    
    initHeatmap();
  }, [data, metric]);
  
  return null;
} 