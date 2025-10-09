import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useMapData } from '@/hooks/useMapData';
import { filterByDistance } from '@/utils/distanceCalculator';
import MapControls from './MapControls';
import DistanceFilter from './DistanceFilter';
import MapSearch from './MapSearch';
import MapMarker from './MapMarker';
import BottomNavigation from './BottomNavigation';
import ListView from './ListView';
import { Loader2 } from 'lucide-react';

interface MapViewProps {
  userRole: 'food_giver' | 'food_receiver';
  onTabChange: (tab: string) => void;
}

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// User location icon
const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2); animation: pulse 2s infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const MapView = ({ userRole, onTabChange }: MapViewProps) => {
  const { location: userLocation, loading: locationLoading, recenter } = useUserLocation();
  const { data, loading: dataLoading } = useMapData(userRole, userLocation);
  const [radiusKm, setRadiusKm] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const filteredData = useMemo(() => {
    if (!userLocation || !data) return [];
    
    let filtered = filterByDistance(data, userLocation, radiusKm);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (userRole === 'food_receiver') {
          return item.title?.toLowerCase().includes(query) ||
                 item.description?.toLowerCase().includes(query) ||
                 item.location?.toLowerCase().includes(query);
        } else {
          return item.receiver?.full_name?.toLowerCase().includes(query) ||
                 item.notes?.toLowerCase().includes(query);
        }
      });
    }
    
    return filtered;
  }, [data, userLocation, radiusKm, searchQuery, userRole]);

  if (locationLoading || dataLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : [13.0827, 80.2707]; // Chennai

  return (
    <div className="relative h-screen w-full">
      {viewMode === 'map' ? (
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-full w-full"
          style={{ height: '100vh', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {filteredData.map(item => (
            <MapMarker
              key={item.id}
              data={item}
              userRole={userRole}
              userLocation={userLocation}
            />
          ))}

          <MapControls onRecenter={recenter} />
        </MapContainer>
      ) : (
        <ListView
          items={filteredData}
          userLocation={userLocation}
          userRole={userRole}
          onItemClick={(item) => {
            setViewMode('map');
          }}
        />
      )}

      <MapSearch
        onSearch={setSearchQuery}
        placeholder={userRole === 'food_receiver' ? 'Search food...' : 'Search requests...'}
      />
      
      <DistanceFilter
        value={radiusKm}
        onChange={setRadiusKm}
        count={filteredData.length}
      />

      <BottomNavigation
        currentTab="map"
        onTabChange={(tab: any) => {
          if (tab === 'browse') {
            setViewMode(viewMode === 'map' ? 'list' : 'map');
          } else {
            onTabChange(tab);
          }
        }}
        userRole={userRole}
      />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  );
};

export default MapView;
