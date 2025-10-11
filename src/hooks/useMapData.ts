import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LocationCoords } from '@/utils/geolocation';

export type MapDataItem = {
  id: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
};

export const useMapData = (
  userRole: 'food_giver' | 'food_receiver',
  userLocation: LocationCoords | null
) => {
  const [data, setData] = useState<MapDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [userRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (userRole === 'food_receiver') {
        // Fetch food listings for receivers
        const { data: listings, error: listingsError } = await supabase
          .from('food_listings')
          .select(`
            *,
            giver:profiles!giver_id (
              id,
              full_name,
              phone,
              profile_picture_url,
              organization_name
            )
          `)
          .eq('is_available', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;
        setData(Array.isArray(listings) ? listings : []);
      } else {
        // Fetch food requests for givers
        const { data: requests, error: requestsError } = await supabase
          .from('food_requests')
          .select(`
            *,
            receiver:profiles!receiver_id (
              id,
              full_name,
              phone,
              profile_picture_url,
              organization_name
            )
          `)
          .eq('status', 'active')
          .gte('needed_by', new Date().toISOString())
          .order('urgency_level', { ascending: false });

        if (requestsError) throw requestsError;
        setData(Array.isArray(requests) ? requests : []);
      }
    } catch (err: any) {
      console.error('Error fetching map data:', err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};
