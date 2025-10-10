import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Edit, Package, Users, TrendingUp, Heart, 
  Calendar, MapPin, Settings as SettingsIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import StatsCard from '@/components/Profile/StatsCard';
import HistoryList from '@/components/Profile/HistoryList';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalShared: 0,
    totalReceived: 0,
    peopleHelped: 0,
    activeListings: 0,
    activeRequests: 0,
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error('Failed to load profile');
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch listings count
    const { count: listingsCount } = await supabase
      .from('food_listings')
      .select('*', { count: 'exact', head: true })
      .eq('giver_id', user.id);

    // Fetch active listings count
    const { count: activeListingsCount } = await supabase
      .from('food_listings')
      .select('*', { count: 'exact', head: true })
      .eq('giver_id', user.id)
      .eq('is_available', true);

    // Fetch requests count
    const { count: requestsCount } = await supabase
      .from('food_requests')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id);

    // Fetch active requests count
    const { count: activeRequestsCount } = await supabase
      .from('food_requests')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'active');

    // Calculate total people helped (sum of people_count from fulfilled requests)
    const { data: fulfilledRequests } = await supabase
      .from('food_requests')
      .select('people_count')
      .eq('receiver_id', user.id)
      .eq('status', 'fulfilled');

    const peopleHelped = fulfilledRequests?.reduce((sum, req) => sum + req.people_count, 0) || 0;

    setStats({
      totalShared: listingsCount || 0,
      totalReceived: requestsCount || 0,
      peopleHelped,
      activeListings: activeListingsCount || 0,
      activeRequests: activeRequestsCount || 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isGiver = profile?.role === 'food_giver';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.profile_picture_url} />
              <AvatarFallback className="text-2xl">
                {profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                <Badge variant={isGiver ? 'default' : 'secondary'}>
                  {isGiver ? 'Food Giver' : 'Food Receiver'}
                </Badge>
              </div>
              
              {profile?.organization_name && (
                <p className="text-muted-foreground mb-2">{profile.organization_name}</p>
              )}
              
              {profile?.bio && (
                <p className="text-sm">{profile.bio}</p>
              )}
              
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {isGiver ? (
            <>
              <StatsCard
                icon={Package}
                label="Food Shared"
                value={stats.totalShared}
                color="text-primary"
              />
              <StatsCard
                icon={Users}
                label="People Helped"
                value={stats.peopleHelped}
                color="text-green-500"
              />
              <StatsCard
                icon={TrendingUp}
                label="Active Listings"
                value={stats.activeListings}
                color="text-blue-500"
              />
              <StatsCard
                icon={Heart}
                label="Impact Score"
                value={stats.totalShared + stats.peopleHelped}
                color="text-rose-500"
              />
            </>
          ) : (
            <>
              <StatsCard
                icon={Package}
                label="Food Received"
                value={stats.totalReceived}
                color="text-primary"
              />
              <StatsCard
                icon={Users}
                label="People Fed"
                value={stats.peopleHelped}
                color="text-green-500"
              />
              <StatsCard
                icon={TrendingUp}
                label="Active Requests"
                value={stats.activeRequests}
                color="text-blue-500"
              />
              <StatsCard
                icon={Heart}
                label="Requests Made"
                value={stats.totalReceived}
                color="text-rose-500"
              />
            </>
          )}
        </div>

        {/* History Section */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent">
              <TabsList className="w-full">
                <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent">
                <HistoryList type={isGiver ? 'listings' : 'requests'} status="active" />
              </TabsContent>
              
              <TabsContent value="completed">
                <HistoryList type={isGiver ? 'listings' : 'requests'} status="completed" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
