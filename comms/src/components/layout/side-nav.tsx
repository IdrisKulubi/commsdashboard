"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Home, 
  PlusCircle, 
  LineChart, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Globe, 
  Mail 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BUSINESS_UNITS } from "@/db/schema";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant={isActive ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start"
        >
          <Link href={href} className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-6 w-6" />
            <span className="text-lg">Comms Dashboard</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-2 py-2 lg:px-4">
          <div className="space-y-2">
            <NavItem
              href="/"
              icon={<Home className="h-4 w-4" />}
              label="Overview"
              isActive={pathname === "/"}
            />
            <NavItem
              href="/analytics"
              icon={<BarChart3 className="h-4 w-4" />}
              label="Analytics"
              isActive={pathname === "/analytics"}
            />
            <NavItem
              href="/add-metrics"
              icon={<PlusCircle className="h-4 w-4" />}
              label="Add Metrics"
              isActive={pathname === "/add-metrics"}
            />
            <NavItem
              href="/trends"
              icon={<LineChart className="h-4 w-4" />}
              label="Trends"
              isActive={pathname === "/trends"}
            />
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-1">
            <h4 className="px-2 text-xs font-semibold">Platforms</h4>
            <NavItem
              href="/platforms/facebook"
              icon={<Facebook className="h-4 w-4" />}
              label="Facebook"
              isActive={pathname === "/platforms/facebook"}
            />
            <NavItem
              href="/platforms/instagram"
              icon={<Instagram className="h-4 w-4" />}
              label="Instagram"
              isActive={pathname === "/platforms/instagram"}
            />
            <NavItem
              href="/platforms/linkedin"
              icon={<Linkedin className="h-4 w-4" />}
              label="LinkedIn"
              isActive={pathname === "/platforms/linkedin"}
            />
            <NavItem
              href="/platforms/website"
              icon={<Globe className="h-4 w-4" />}
              label="Website"
              isActive={pathname === "/platforms/website"}
            />
            <NavItem
              href="/platforms/newsletter"
              icon={<Mail className="h-4 w-4" />}
              label="Newsletter"
              isActive={pathname === "/platforms/newsletter"}
            />
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-1">
            <h4 className="px-2 text-xs font-semibold">Business Units</h4>
            {Object.entries(BUSINESS_UNITS).map(([key, value]) => (
              <NavItem
                key={key}
                href={`/business-units/${value.toLowerCase()}`}
                icon={<BarChart3 className="h-4 w-4" />}
                label={value}
                isActive={pathname === `/business-units/${value.toLowerCase()}`}
              />
            ))}
          </div>

         
        </ScrollArea>
      </div>
    </div>
  );
} 