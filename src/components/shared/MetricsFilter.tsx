import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUSINESS_UNITS, PLATFORMS } from "@/db/schema";

interface MetricsFilterProps {
  platform: string;
  businessUnit: string;
  onPlatformChange: (value: string) => void;
  onBusinessUnitChange: (value: string) => void;
}

export function MetricsFilter({
  platform,
  businessUnit,
  onPlatformChange,
  onBusinessUnitChange,
}: MetricsFilterProps) {
  return (
    <div className="flex space-x-4">
      <Select value={platform} onValueChange={onPlatformChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PLATFORMS).map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={businessUnit} onValueChange={onBusinessUnitChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select business unit" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(BUSINESS_UNITS).map((bu) => (
            <SelectItem key={bu} value={bu}>
              {bu}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 