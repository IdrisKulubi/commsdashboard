"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/lib/constants";

interface CountryFilterProps {
  country: string;
  onCountryChange: (country: string) => void;
}

export function CountryFilter({ country, onCountryChange }: CountryFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select value={country} onValueChange={onCountryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(COUNTRIES).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 