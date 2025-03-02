"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSeedData = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/admin/seed", {
        method: "POST"
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="space-y-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Seed Test Data</h2>
          <p className="mb-4">
            This will create test data for all platforms and business units.
          </p>
          
          <Button 
            onClick={handleSeedData} 
            disabled={isLoading}
          >
            {isLoading ? "Seeding..." : "Seed Test Data"}
          </Button>
          
          {result && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              {result}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
} 