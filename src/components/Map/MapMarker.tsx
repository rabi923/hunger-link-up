import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { MapDataItem } from '@/hooks/useMapData';
import { calculateDistance } from '@/utils/distanceCalculator';
import type { LocationCoords } from '@/utils/geolocation';
import { GiverPopupContent } from './GiverPopupContent';
import { ReceiverPopupContent } from './ReceiverPopupContent';

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
  
  const distance = userLocation
    ? calculateDistance(userLocation, { lat: data.latitude, lng: data.longitude })
    : null;

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;
    window.open(url, '_blank');
  };

  const openPhone = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleChatClick = () => {
    onChatClick(
      userRole === 'food_receiver' ? data.giver_id : data.receiver_id,
      userRole === 'food_receiver' ? (data.giver?.full_name || 'User') : (data.receiver?.full_name || 'User')
    );
  };

  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-popup" maxWidth={350}>
        {userRole === 'food_receiver' ? (
          <GiverPopupContent
            data={data}
            distance={distance}
            onChatClick={handleChatClick}
            openPhone={openPhone}
            openDirections={openDirections}
          />
        ) : (
          <ReceiverPopupContent
            data={data}
            distance={distance}
            onChatClick={handleChatClick}
            openPhone={openPhone}
            openDirections={openDirections}
          />
        )}
      </Popup>
    </Marker>
  );
};

export default MapMarker;
