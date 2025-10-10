import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Package, Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HistoryListProps {
  type: 'listings' | 'requests';
  status: 'active' | 'completed';
}

const HistoryList = ({ type, status }: HistoryListProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [type, status]);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (type === 'listings') {
      const { data } = await supabase
        .from('food_listings')
        .select('*')
        .eq('giver_id', user.id)
        .eq('is_available', status === 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      setItems(data || []);
    } else {
      const { data } = await supabase
        .from('food_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', status === 'active' ? 'active' : 'fulfilled')
        .order('created_at', { ascending: false })
        .limit(10);

      setItems(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No {status} {type} found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex-shrink-0 mt-1">
            <Package className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">
              {type === 'listings' ? item.title : `Food for ${item.people_count} people`}
            </h4>
            
            <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(item.created_at), 'MMM d, yyyy')}
              </div>
              
              {type === 'listings' && item.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{item.location}</span>
                </div>
              )}
              
              {type === 'requests' && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {item.people_count} people
                </div>
              )}
            </div>
          </div>
          
          <Badge variant={status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
            {status === 'active' ? 'Active' : 'Completed'}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
