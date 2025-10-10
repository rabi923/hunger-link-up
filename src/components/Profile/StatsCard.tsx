import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: string;
}

const StatsCard = ({ icon: Icon, label, value, color = 'text-primary' }: StatsCardProps) => {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-2">
          <Icon className={cn('h-8 w-8', color)} />
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
