import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Navigation, Users, Clock, MapPin, Heart, Leaf } from 'lucide-react';
import { MapDataItem } from '@/hooks/useMapData';
import { calculateDistance, formatDistance } from '@/utils/distanceCalculator';
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

  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-popup" maxWidth={350}>
        {userRole === 'food_receiver' ? (
          <div className="p-2">
            {data.image_urls?.[0] && (
              <img
                src={data.image_urls[0]}
                alt={data.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            
            <h3 className="font-bold text-lg mb-1">{data.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {data.giver?.full_name}
              {data.giver?.organization_name && ` • ${data.giver.organization_name}`}
            </p>
            
            {data.description && (
              <p className="text-sm mb-3 line-clamp-2">{data.description}</p>
            )}
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{data.quantity}</Badge>
                {data.food_type && <Badge variant="outline">{data.food_type}</Badge>}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{data.location}</span>
              </div>
              
              {data.pickup_time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(data.pickup_time).toLocaleString()}</span>
                </div>
              )}
              
              {distance && (
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Navigation className="h-4 w-4" />
                  <span>{formatDistance(distance)}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => onChatClick(data.giver_id, data.giver?.full_name || 'User')} 
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              {data.giver?.phone && (
                <Button 
                  variant="secondary" 
                  onClick={() => openPhone(data.giver.phone)}
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              onClick={openDirections} 
              className="w-full mt-2"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
        ) : (
          <div className="p-2">
            <div className="flex items-start gap-3 mb-3">
              {data.receiver?.profile_picture_url ? (
                <img
                  src={data.receiver.profile_picture_url}
                  alt={data.receiver.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-bold text-lg">{data.receiver?.full_name}</h3>
                {data.receiver?.organization_name && (
                  <p className="text-sm text-muted-foreground">{data.receiver.organization_name}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{data.people_count} people</span>
                </div>
                <Badge 
                  className={`${
                    data.urgency_level === 'low' ? 'bg-green-500' :
                    data.urgency_level === 'medium' ? 'bg-yellow-500' :
                    data.urgency_level === 'high' ? 'bg-orange-500' :
                    'bg-red-500'
                  } text-white`}
                >
                  {data.urgency_level}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4" />
                <span>{data.food_preference}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Needed by {new Date(data.needed_by).toLocaleString()}</span>
              </div>
              
              {distance && (
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Navigation className="h-4 w-4" />
                  <span>{formatDistance(distance)}</span>
                </div>
              )}
            </div>
            
            {data.notes && (
              <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded">
                {data.notes}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => onChatClick(data.receiver_id, data.receiver?.full_name || 'User')} 
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                I Can Help
              </Button>
              {data.receiver?.phone && (
                <Button 
                  variant="secondary" 
                  onClick={() => openPhone(data.receiver.phone)}
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              onClick={openDirections} 
              className="w-full mt-2"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
        )}
      </Popup>
    </Marker>
  );
};

export default MapMarker;
