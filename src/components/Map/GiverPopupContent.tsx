import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Navigation, MapPin, Clock } from 'lucide-react';
import { MapDataItem } from '@/hooks/useMapData';
import { formatDistance } from '@/utils/distanceCalculator';

interface GiverPopupContentProps {
  data: MapDataItem;
  distance: number | null;
  onChatClick: () => void;
  openPhone: (phone: string) => void;
  openDirections: () => void;
}

export const GiverPopupContent = ({ data, distance, onChatClick, openPhone, openDirections }: GiverPopupContentProps) => (
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
      <Button onClick={onChatClick} className="w-full">
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
);
