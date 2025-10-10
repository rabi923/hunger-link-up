import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { MapDataItem } from '@/hooks/useMapData';
import MapPopup from './MapPopup';
import type { LocationCoords } from '@/utils/geolocation';

interface MapMarkerProps {
  data: MapDataItem;
  userRole: 'food_giver' | 'food_receiver';
  userLocation: LocationCoords | null;
  onChatClick: (userId: string, userName: string) => void;
}

// Custom marker icons
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 20px;
        ">${emoji}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const foodGiverIcon = createCustomIcon('#10b981', '🍽️');
const foodReceiverIcon = createCustomIcon('#ef4444', '🤝');

const MapMarker = ({ data, userRole, userLocation, onChatClick }: MapMarkerProps) => {
  const icon = userRole === 'food_receiver' ? foodGiverIcon : foodReceiverIcon;
  const position: [number, number] = [data.latitude, data.longitude];

  return (
    <Marker position={position} icon={icon}>
      <MapPopup 
        data={data} 
        userRole={userRole} 
        userLocation={userLocation}
        onChatClick={onChatClick}
      />
    </Marker>
  );
};

export default MapMarker;
