import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function DashboardWidget({ 
  title, 
  children, 
  icon, 
  className,
  action 
}: DashboardWidgetProps) {
  return (
    <Card className={cn("glass-card hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}