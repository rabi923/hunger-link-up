import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DistanceFilterProps {
  value: number;
  onChange: (value: number) => void;
  count: number;
}

const DistanceFilter = ({ value, onChange, count }: DistanceFilterProps) => {
  const quickFilters = [1, 5, 10, 25, 50];

  return (
    <Card className="absolute bottom-20 left-4 p-4 w-64 bg-background shadow-[var(--shadow-card)] z-[1000]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Distance</span>
          <span className="text-sm text-muted-foreground">{value} km</span>
        </div>
        
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
        
        <div className="flex gap-1 flex-wrap">
          {quickFilters.map((km) => (
            <Button
              key={km}
              variant={value === km ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(km)}
              className="text-xs"
            >
              {km}km
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Showing {count} {count === 1 ? 'listing' : 'listings'} within {value} km
        </p>
      </div>
    </Card>
  );
};

export default DistanceFilter;
