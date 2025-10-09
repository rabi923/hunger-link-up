import { ZoomIn, ZoomOut, Crosshair, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMap } from 'react-leaflet';

interface MapControlsProps {
  onRecenter: () => void;
}

const MapControls = ({ onRecenter }: MapControlsProps) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleRecenter = () => {
    onRecenter();
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
        onClick={handleRecenter}
        className="bg-background shadow-[var(--shadow-card)] hover:bg-accent"
      >
        <Crosshair className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControls;
