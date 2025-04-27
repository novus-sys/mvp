
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  total?: number;
  icon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const StatCard = ({ title, value, total, icon, className, iconClassName }: StatCardProps) => {
  let percentage: number | null = null;
  
  if (typeof value === 'number' && total) {
    percentage = Math.round((value / total) * 100);
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold">{value}</h3>
              {total && <span className="text-sm text-muted-foreground">/{total}</span>}
            </div>
            {percentage !== null && (
              <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-orange rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            )}
          </div>
          <div className={cn("p-2 rounded-full", iconClassName)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
