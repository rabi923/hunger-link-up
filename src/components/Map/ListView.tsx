import { MapDataItem } from '@/hooks/useMapData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Heart, Leaf } from 'lucide-react';
import { formatDistance } from '@/utils/distanceCalculator';
import { calculateDistance } from '@/utils/distanceCalculator';
import type { LocationCoords } from '@/utils/geolocation';

interface ListViewProps {
  items: MapDataItem[];
  userLocation: LocationCoords | null;
  userRole: 'food_giver' | 'food_receiver';
  onItemClick: (item: MapDataItem) => void;
}

const ListView = ({ items, userLocation, userRole, onItemClick }: ListViewProps) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-6xl mb-4">📍</div>
        <h3 className="text-lg font-semibold mb-2">No listings found</h3>
        <p className="text-muted-foreground">
          Try adjusting your distance filter or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="p-4 space-y-3">
        {items.map((item) => {
          const distance = userLocation
            ? calculateDistance(userLocation, { lat: item.latitude, lng: item.longitude })
            : null;

          if (userRole === 'food_receiver') {
            return (
              <FoodListingCard
                key={item.id}
                listing={item}
                distance={distance}
                onClick={() => onItemClick(item)}
              />
            );
          } else {
            return (
              <FoodRequestCard
                key={item.id}
                request={item}
                distance={distance}
                onClick={() => onItemClick(item)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

const FoodListingCard = ({ listing, distance, onClick }: any) => {
  return (
    <Card className="cursor-pointer hover:shadow-[var(--shadow-elegant)] transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {listing.image_urls?.[0] ? (
            <img
              src={listing.image_urls[0]}
              alt={listing.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Leaf className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{listing.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{listing.giver?.full_name}</p>
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {listing.quantity}
              </Badge>
              {listing.food_type && (
                <Badge variant="outline" className="text-xs">
                  {listing.food_type}
                </Badge>
              )}
            </div>
            
            {distance && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <MapPin className="h-3 w-3" />
                {formatDistance(distance)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FoodRequestCard = ({ request, distance, onClick }: any) => {
  const urgencyColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    emergency: 'bg-red-500'
  };

  return (
    <Card className="cursor-pointer hover:shadow-[var(--shadow-elegant)] transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className={`w-1 rounded-full ${urgencyColors[request.urgency_level as keyof typeof urgencyColors]}`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold">{request.receiver?.full_name}</h3>
                {request.receiver?.organization_name && (
                  <p className="text-sm text-muted-foreground">{request.receiver.organization_name}</p>
                )}
              </div>
              <Badge variant="secondary" className="flex-shrink-0">
                {request.urgency_level}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{request.people_count} people</span>
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Needed by {new Date(request.needed_by).toLocaleString()}</span>
            </div>
            
            {distance && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <MapPin className="h-3 w-3" />
                {formatDistance(distance)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListView;
