import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
  onEdit?: () => void;
}

export function MetricsCard({
  title,
  value,
  description,
  className,
  onEdit,
}: MetricsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
} 