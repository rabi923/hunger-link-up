import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControlsProps {
  onRecenter: () => void;
}

// This component hooks into the map context but doesn't render anything
// It just provides imperative control methods
const MapControls = ({ onRecenter }: MapControlsProps) => {
  const map = useMap();

  // Store map reference for external controls
  useEffect(() => {
    if (map) {
      (window as any).__leafletMap = map;
    }
  }, [map]);

  return null;
};

export default MapControls;
