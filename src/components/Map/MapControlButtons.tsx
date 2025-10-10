import { ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlButtonsProps {
  onRecenter: () => void;
}

const MapControlButtons = ({ onRecenter }: MapControlButtonsProps) => {
  const handleZoomIn = () => {
    const map = (window as any).__leafletMap;
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    const map = (window as any).__leafletMap;
    if (map) map.zoomOut();
  };

  return (
    <div className="absolute top-20 right-4 flex flex-col gap-2 z-[1000]">
      <Button
        size="icon"
        variant="secondary"
        onClick={handleZoomIn}
        className="bg-background shadow-[var(--shadow-card)] hover:bg-accent"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={handleZoomOut}
        className="bg-background shadow-[var(--shadow-card)] hover:bg-accent"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={onRecenter}
        className="bg-background shadow-[var(--shadow-card)] hover:bg-accent"
      >
        <Crosshair className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControlButtons;
