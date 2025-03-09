"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface GrowthChartProps {
  data: any[];
  title: string;
  description: string;
  dataKey: string;
}

export function GrowthChart({
  data,
  title,
  description,
  dataKey,
}: GrowthChartProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  // Calculate month-over-month growth rates
  const calculateGrowthRates = () => {
    return data.map((item, index) => {
      if (index === 0) {
        return {
          month: item.month,
          growth: 0,
        };
      }
      
      const currentValue = item[dataKey];
      const previousValue = data[index - 1][dataKey];
      
      // Calculate growth rate as percentage
      const growthRate = previousValue === 0 
        ? 0 
        : ((currentValue - previousValue) / previousValue) * 100;
      
      return {
        month: item.month,
        growth: growthRate,
      };
    });
  };
  
  const growthData = calculateGrowthRates();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  `${(value as number).toFixed(1)}%`,
                  "Growth"
                ]}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Bar 
                dataKey="growth" 
                name="Growth Rate" 
                fill={(data) => (data.growth >= 0 ? "#82ca9d" : "#ff7675")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 