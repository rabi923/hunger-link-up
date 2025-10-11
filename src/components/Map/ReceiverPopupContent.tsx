import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Navigation, Users, Clock, Leaf, Heart } from 'lucide-react';
import { MapDataItem } from '@/hooks/useMapData';
import { formatDistance } from '@/utils/distanceCalculator';

interface ReceiverPopupContentProps {
  data: MapDataItem;
  distance: number | null;
  onChatClick: () => void;
  openPhone: (phone: string) => void;
  openDirections: () => void;
}

export const ReceiverPopupContent = ({ data, distance, onChatClick, openPhone, openDirections }: ReceiverPopupContentProps) => (
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
      <Button onClick={onChatClick} className="w-full">
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
);
